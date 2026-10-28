'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [selectedId, setSelectedId] = useState<string>('');
  const selectedIdRef = useRef<string>('');
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

  // Keep selectedIdRef synchronized with selectedId
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load Initial Data
  const loadWorkspace = useCallback(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.workspace) {
          setWorkspace(data.workspace);
          if (data.workspace.mode === 'real' && data.workspace.gmail_connected) {
            if (selectedIdRef.current.startsWith('conv-') || selectedIdRef.current.startsWith('demo-')) {
              setSelectedId('');
              selectedIdRef.current = '';
              setSelectedConversation(null);
            }
          } else if (data.workspace.mode === 'demo') {
            if (selectedIdRef.current.startsWith('gmail-')) {
              setSelectedId('');
              selectedIdRef.current = '';
              setSelectedConversation(null);
            }
          }
        }
      });
  }, []);

  const loadConversationDetails = useCallback((id: string, refresh = false) => {
    if (!id) return;
    if (refresh) setIsReanalyzing(true);
    fetch(`/api/conversations/${id}${refresh ? '?refresh=true' : ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.conversation) {
          setSelectedConversation(data.conversation);
          setTimeline(data.timeline || []);
          if (refresh) {
            setConversations((prev) =>
              prev.map((c) => (c.id === id ? data.conversation : c))
            );
          }
        }
      })
      .finally(() => {
        if (refresh) setIsReanalyzing(false);
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
          const currentId = selectedIdRef.current;
          const isCurrentValid = data.conversations.some((c: Conversation) => c.id === currentId);
          // Only switch selectedId if nothing selected, or current selection is missing in the active mode
          if (!isCurrentValid && data.conversations.length > 0) {
            const firstId = data.conversations[0].id;
            setSelectedId(firstId);
            selectedIdRef.current = firstId;
          } else if (data.conversations.length === 0) {
            setSelectedId('');
            selectedIdRef.current = '';
            setSelectedConversation(null);
          }
        }
      });
  }, [currentFilter, priorityFilter, searchQuery, selectedTeamId]);

  // Sync latest emails from Gmail (first 25 fast)
  const handleSyncInbox = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 25 }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsReconnect) {
          console.warn('[Gmail Sync] Token expired. Reconnect needed.');
        }
      } else {
        if (data.nextPageToken !== undefined) {
          setNextPageToken(data.nextPageToken || null);
        }
        loadConversations();
        loadWorkspace();
        const activeId = selectedIdRef.current;
        if (activeId && !activeId.startsWith('conv-') && !activeId.startsWith('demo-')) {
          loadConversationDetails(activeId);
        }
      }
    } catch (err) {
      console.error('Failed to sync inbox:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [loadConversations, loadWorkspace, loadConversationDetails]);

  // Dynamically load the next 25 emails on scroll down
  const handleLoadMoreEmails = useCallback(async () => {
    if (!nextPageToken || isLoadingMore || isSyncing) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 25, pageToken: nextPageToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setNextPageToken(data.nextPageToken || null);
        loadConversations();
      }
    } catch (err) {
      console.error('Failed to load more emails:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, isLoadingMore, isSyncing, loadConversations]);

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

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('onboarding') === 'true') {
      setOnboardingOpen(true);
    }

    if (urlParams.get('gmail_connected') === 'true') {
      window.history.replaceState({}, '', window.location.pathname);
      loadWorkspace();
      loadConversations();
      // Smoothly trigger first sync in background
      handleSyncInbox();
    }

    const oauthErr = urlParams.get('oauth_error');
    if (oauthErr) {
      window.history.replaceState({}, '', window.location.pathname);
      alert(`Google Sign-in failed: ${decodeURIComponent(oauthErr)}`);
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

  // Periodic background email sync every 45 seconds when Gmail is connected
  useEffect(() => {
    if (workspace.mode === 'real' && workspace.gmail_connected) {
      const timer = setInterval(() => {
        handleSyncInbox();
      }, 45000);
      return () => clearInterval(timer);
    }
  }, [workspace.mode, workspace.gmail_connected, handleSyncInbox]);

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
    setSelectedId('');
    selectedIdRef.current = '';
    setSelectedConversation(null);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceMode: mode }),
    });
    loadWorkspace();
    loadConversations();
  };

  const handleToggleMode = async () => {
    if (workspace.mode === 'real' && workspace.gmail_connected) {
      await handleSelectMode('demo');
    } else if (workspace.gmail_connected) {
      await handleSelectMode('real');
    } else {
      setOnboardingOpen(true);
    }
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
    needsReview: conversations.filter((c) => c.tags.includes('Needs Review') || c.status === 'needs_review').length,
    assigned: conversations.filter((c) => c.status === 'assigned').length,
    drafts: conversations.filter((c) => c.status === 'drafts' || (c.draft && !c.draft.is_approved)).length,
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
          onToggleMode={handleToggleMode}
          currentView={currentView}
          onViewChange={setCurrentView}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onSyncInbox={handleSyncInbox}
          isSyncing={isSyncing}
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
                onSync={handleSyncInbox}
                isSyncing={isSyncing}
                onLoadMore={handleLoadMoreEmails}
                isLoadingMore={isLoadingMore}
                hasMore={Boolean(nextPageToken && workspace.gmail_connected)}
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
                  onReanalyze={() => loadConversationDetails(selectedId, true)}
                  isReanalyzing={isReanalyzing}
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
