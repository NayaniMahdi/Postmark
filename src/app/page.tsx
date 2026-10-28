'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HeaderBar } from '@/components/HeaderBar';
import { Sidebar } from '@/components/Sidebar';
import { ConversationList } from '@/components/ConversationList';
import { ConversationView } from '@/components/ConversationView';
import { IntelligencePanel } from '@/components/IntelligencePanel';
import { KnowledgeDrawer } from '@/components/KnowledgeDrawer';
import { DecisionReceiptModal } from '@/components/DecisionReceiptModal';
import { CorrectionModal } from '@/components/CorrectionModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AnalyticsView } from '@/components/AnalyticsView';
import { KnowledgeBaseView } from '@/components/KnowledgeBaseView';
import { Conversation, KnowledgeArticle, AuditEvent, Workspace, Team, DraftTone, Priority } from '@/types';

export default function WorkspacePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string>('conv-1');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [timeline, setTimeline] = useState<AuditEvent[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [workspace, setWorkspace] = useState<Workspace>({
    id: 'ws-default',
    name: 'Postmark Intelligent Support',
    mode: 'demo',
    gmail_connected: false,
    created_at: '2026-10-01T00:00:00Z',
  });

  // Navigation and Filter States
  const [currentView, setCurrentView] = useState<'inbox' | 'knowledge' | 'templates' | 'analytics' | 'teams'>('inbox');
  const [currentFilter, setCurrentFilter] = useState('inbox');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals & Drawers
  const [inspectArticle, setInspectArticle] = useState<KnowledgeArticle | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Action status
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load Initial Data
  const loadWorkspace = useCallback(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.workspace) setWorkspace(data.workspace);
      });
  }, []);

  const loadConversations = useCallback(() => {
    const params = new URLSearchParams();
    if (currentFilter && currentFilter !== 'inbox') params.set('status', currentFilter);
    if (priorityFilter && priorityFilter !== 'all') params.set('priority', priorityFilter);
    if (searchQuery) params.set('search', searchQuery);
    if (selectedTeamId) params.set('teamId', selectedTeamId);

    fetch(`/api/conversations?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations) {
          setConversations(data.conversations);
          // If current selection is invalid, select first available
          if (!data.conversations.some((c: Conversation) => c.id === selectedId) && data.conversations.length > 0) {
            setSelectedId(data.conversations[0].id);
          }
        }
      });
  }, [currentFilter, priorityFilter, searchQuery, selectedTeamId, selectedId]);

  const loadConversationDetails = useCallback((id: string) => {
    fetch(`/api/conversations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.conversation) {
          setSelectedConversation(data.conversation);
          setTimeline(data.timeline || []);
        }
      });
  }, []);

  const loadKnowledge = useCallback(() => {
    fetch('/api/knowledge')
      .then((res) => res.json())
      .then((data) => {
        if (data.articles) setKnowledgeArticles(data.articles);
      });
  }, []);

  useEffect(() => {
    loadWorkspace();
    loadKnowledge();

    // Check for first-time launch query or flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('onboarding') === 'true') {
      setOnboardingOpen(true);
    }
  }, [loadWorkspace, loadKnowledge]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedId) {
      loadConversationDetails(selectedId);
    }
  }, [selectedId, loadConversationDetails]);

  // Draft operations
  const handleUpdateDraft = (newContent: string, tone?: DraftTone) => {
    if (!selectedId || !selectedConversation) return;
    fetch(`/api/conversations/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draft: {
          ...(selectedConversation.draft || {}),
          content: newContent,
          is_approved: false,
          approved_at: undefined,
          version: (selectedConversation.draft?.version || 1) + 1,
          tone: tone || selectedConversation.draft?.tone || 'professional',
        },
      }),
    }).then(() => loadConversationDetails(selectedId));
  };

  const handleApproveDraft = async () => {
    if (!selectedId) return;
    await fetch(`/api/conversations/${selectedId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy: 'Aanya (Support Team)' }),
    });
    loadConversationDetails(selectedId);
    loadConversations();
  };

  const handleSendReply = async () => {
    if (!selectedId || !selectedConversation?.draft) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedDraftVersion: selectedConversation.draft.version,
          actor: 'Aanya (Support Team)',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Send rejected: ${data.error}`);
      } else {
        loadConversationDetails(selectedId);
        loadConversations();
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleRegenerateDraft = async (tone?: DraftTone) => {
    if (!selectedId) return;
    setIsGenerating(true);
    try {
      await fetch(`/api/conversations/${selectedId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone: tone || selectedConversation?.draft?.tone }),
      });
      loadConversationDetails(selectedId);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineDraft = async (
    instruction: 'shorter' | 'details' | 'friendly' | 'professional' | 'concise' | 'empathetic'
  ) => {
    if (!selectedId) return;
    setIsGenerating(true);
    try {
      await fetch(`/api/conversations/${selectedId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction }),
      });
      loadConversationDetails(selectedId);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleStar = async () => {
    if (!selectedId || !selectedConversation) return;
    const newStar = !selectedConversation.starred;
    await fetch(`/api/conversations/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred: newStar }),
    });
    loadConversationDetails(selectedId);
    loadConversations();
  };

  const handleArchive = async () => {
    if (!selectedId) return;
    await fetch(`/api/conversations/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    });
    loadConversations();
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    await fetch(`/api/conversations/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    });
    loadConversations();
  };

  const handleCorrectClassification = async (correction: {
    topic: string;
    urgency: Priority;
    assigned_team: string;
  }) => {
    if (!selectedId) return;
    await fetch(`/api/conversations/${selectedId}/correct-classification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(correction),
    });
    loadConversationDetails(selectedId);
    loadConversations();
  };

  const handleSelectMode = async (mode: 'demo' | 'real') => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceMode: mode }),
    });
    loadWorkspace();
  };

  // Nav helpers
  const currentIndex = conversations.findIndex((c) => c.id === selectedId);
  const handlePrev = () => {
    if (currentIndex > 0) setSelectedId(conversations[currentIndex - 1].id);
  };
  const handleNext = () => {
    if (currentIndex < conversations.length - 1) setSelectedId(conversations[currentIndex + 1].id);
  };

  const counts = {
    inbox: conversations.length,
    needsReview: conversations.filter((c) => c.tags.includes('Needs Review')).length,
    assigned: 3,
    drafts: conversations.filter((c) => c.draft && !c.draft.is_approved).length,
  };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/backdrop.jpg')" }}
    >
      {/* Warm ambient diffuse glow */}
      <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />

      {/* Floating Apple macOS Desktop Window Shell */}
      <div className="w-full max-w-[1480px] h-[92vh] glass-window rounded-3xl flex flex-col shadow-2xl relative overflow-hidden z-10 border border-white/70">
        {/* Window Top Header Bar */}
        <HeaderBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          workspace={workspace}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenOnboarding={() => setOnboardingOpen(true)}
          currentView={currentView}
          onViewChange={setCurrentView}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Multi-Column Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Left Navigation Sidebar */}
          <Sidebar
            currentFilter={currentFilter}
            onFilterSelect={(f) => {
              setCurrentView('inbox');
              setCurrentFilter(f);
            }}
            selectedTeamId={selectedTeamId}
            onTeamSelect={(tId) => {
              setCurrentView('inbox');
              setSelectedTeamId(tId);
            }}
            teams={[
              { id: 'team-tech', name: 'Technical Support', slug: 'tech', member_count: 6, description: '' },
              { id: 'team-billing', name: 'Billing & Payments', slug: 'billing', member_count: 4, description: '' },
              { id: 'team-sales', name: 'Sales', slug: 'sales', member_count: 4, description: '' },
              { id: 'team-cs', name: 'Customer Success', slug: 'cs', member_count: 5, description: '' },
              { id: 'team-security', name: 'Security', slug: 'security', member_count: 3, description: '' },
            ]}
            counts={counts}
            isCollapsed={isSidebarCollapsed}
          />

          {/* Conditional View Rendering */}
          {currentView === 'knowledge' ? (
            <KnowledgeBaseView />
          ) : currentView === 'analytics' ? (
            <AnalyticsView />
          ) : (
            <>
              {/* Column 2: Conversation List */}
              <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id)}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                title={selectedTeamId ? 'Team Space' : currentFilter === 'needs_review' ? 'Needs Review' : 'Inbox'}
              />

              {/* Column 3: Selected Conversation Details & AI Draft Editor */}
              {selectedConversation ? (
                <ConversationView
                  conversation={selectedConversation}
                  onUpdateDraft={handleUpdateDraft}
                  onApproveDraft={handleApproveDraft}
                  onSendReply={handleSendReply}
                  onRegenerateDraft={handleRegenerateDraft}
                  onRefineDraft={handleRefineDraft}
                  onToggleStar={handleToggleStar}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isSending={isSending}
                  isGenerating={isGenerating}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-[#777970]">
                  Select a conversation from the inbox list
                </div>
              )}

              {/* Column 4: Right Intelligence Panel */}
              {selectedConversation && (
                <IntelligencePanel
                  conversation={selectedConversation}
                  timeline={timeline}
                  knowledgeArticles={knowledgeArticles}
                  onOpenKnowledgeArticle={(art) => setInspectArticle(art)}
                  onOpenDecisionReceipt={() => setReceiptOpen(true)}
                  onOpenCorrection={() => setCorrectionOpen(true)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Grounded Knowledge Article Evidence Drawer */}
      <KnowledgeDrawer
        article={inspectArticle}
        onClose={() => setInspectArticle(null)}
      />

      {/* AI Decision Receipt Modal */}
      {selectedConversation && (
        <DecisionReceiptModal
          conversation={selectedConversation}
          isOpen={receiptOpen}
          onClose={() => setReceiptOpen(false)}
        />
      )}

      {/* Human Classification Correction Modal */}
      {selectedConversation && (
        <CorrectionModal
          conversation={selectedConversation}
          isOpen={correctionOpen}
          onClose={() => setCorrectionOpen(false)}
          onSubmit={handleCorrectClassification}
        />
      )}

      {/* First-Launch Onboarding Choice Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        workspace={workspace}
        onSelectMode={handleSelectMode}
      />

      {/* Settings & Model Configuration Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        workspace={workspace}
        onRefreshWorkspace={loadWorkspace}
      />
    </main>
  );
}
