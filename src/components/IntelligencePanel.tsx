'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertTriangle,
  Users,
  Smile,
  ShieldAlert,
  FileText,
  FileCode2,
  CheckCircle2,
  Send,
  Edit3,
  Cpu,
} from 'lucide-react';
import { Conversation, KnowledgeArticle, AuditEvent } from '@/types';

interface IntelligencePanelProps {
  conversation: Conversation;
  timeline: AuditEvent[];
  knowledgeArticles: KnowledgeArticle[];
  onOpenKnowledgeArticle: (article: KnowledgeArticle) => void;
  onOpenDecisionReceipt: () => void;
  onOpenCorrection: () => void;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({
  conversation,
  timeline,
  knowledgeArticles,
  onOpenKnowledgeArticle,
  onOpenDecisionReceipt,
  onOpenCorrection,
}) => {
  const [whyOpen, setWhyOpen] = useState(true);
  const cls = conversation.classification;

  // Dynamically find cited or relevant articles based on cited IDs or topic keywords
  const citedIds = conversation.draft?.cited_knowledge_ids || [];
  let displayDocs: KnowledgeArticle[] = [];
  if (citedIds.length > 0) {
    displayDocs = knowledgeArticles.filter((k) => citedIds.includes(k.id));
  }
  if (displayDocs.length === 0) {
    const contextText = `${conversation.subject} ${cls?.topic || ''}`.toLowerCase();
    displayDocs = knowledgeArticles.filter((k) =>
      k.title
        .toLowerCase()
        .split(' ')
        .some((word) => word.length > 3 && contextText.includes(word))
    );
  }
  if (displayDocs.length === 0) {
    displayDocs = knowledgeArticles.slice(0, 3);
  }

  // Dynamic audit timeline fallback
  const displayTimeline: AuditEvent[] =
    timeline.length > 0
      ? timeline
      : [
          {
            id: 'ev-rec',
            conversation_id: conversation.id,
            event_type: 'email_received' as const,
            description: `Email received from ${conversation.sender_name}`,
            actor: conversation.sender_name,
            timestamp: conversation.received_at || 'Recently',
          },
          ...(cls
            ? [
                {
                  id: 'ev-cls',
                  conversation_id: conversation.id,
                  event_type: 'classified' as const,
                  description: `Classified as ${cls.topic} (${cls.urgency} urgency)`,
                  actor:
                    cls.provider === 'nvidia'
                      ? `NVIDIA NIM (${cls.model ? cls.model.replace('meta/', '') : 'Llama 3.2'})`
                      : cls.provider === 'openrouter'
                      ? 'OpenRouter'
                      : 'Simulated AI Engine',
                  timestamp: 'Completed',
                },
              ]
            : []),
          ...(conversation.draft
            ? [
                {
                  id: 'ev-drf',
                  conversation_id: conversation.id,
                  event_type: 'draft_generated' as const,
                  description: `Draft v${conversation.draft.version} generated (${conversation.draft.tone} tone)`,
                  actor:
                    conversation.draft.provider === 'nvidia'
                      ? `NVIDIA NIM (${conversation.draft.model ? conversation.draft.model.replace('meta/', '') : 'Llama 3.2'})`
                      : 'Simulated AI Engine',
                  timestamp: 'Completed',
                },
              ]
            : []),
        ];

  const getUrgencyBadge = (urgency?: string) => {
    switch (urgency?.toLowerCase()) {
      case 'critical':
      case 'high':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEECEB] text-[#B42318] border border-[#FECDCA]">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF6EE] text-[#B54708] border border-[#F9DBAF]">
            Medium
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]">
            Low
          </span>
        );
    }
  };

  return (
    <div className="w-80 shrink-0 flex flex-col border-l border-[#E7E3DA]/80 bg-[#FAF9F5]/40 select-none overflow-y-auto p-4 space-y-4">
      {/* 1. AI Assessment Card */}
      <div className="bg-white/80 rounded-2xl p-4 border border-[#E7E3DA]/80 shadow-xs space-y-3">
        {/* Header: Title + Confidence Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#292B27]" />
            <h3 className="text-xs font-bold text-[#292B27]">AI Assessment</h3>
          </div>
          {cls ? (
            <span className="text-[10px] font-medium text-[#777970] bg-[#F2EFE9] px-2 py-0.5 rounded-full border border-[#E7E3DA]">
              Confidence <span className="font-bold text-[#292B27]">{Math.round((cls.confidence || 0.94) * 100)}%</span>
            </span>
          ) : (
            <span className="text-[10px] font-medium text-[#B54708] bg-[#FEF6EE] px-2 py-0.5 rounded-full border border-[#F9DBAF]">
              Pending
            </span>
          )}
        </div>

        {/* AI Provider Indicator */}
        {cls && (
          <div className="flex items-center justify-between text-[10px] text-[#777970] bg-[#FAF9F5] px-2.5 py-1 rounded-lg border border-[#E7E3DA]/60">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#4F46E5]" />
              <span>Inference:</span>
            </span>
            <span className="font-semibold text-[#292B27]">
              {cls.provider === 'nvidia'
                ? `⚡ NVIDIA NIM (${cls.model ? cls.model.replace('meta/', '') : 'Llama 3.2 11B'})`
                : cls.provider === 'openrouter'
                ? `🌐 OpenRouter (${cls.model || 'Llama 3.1'})`
                : '🤖 Simulated AI Engine'}
            </span>
          </div>
        )}

        {/* Structured Assessment Rows */}
        <div className="space-y-2 text-xs pt-1">
          {/* Topic */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#777970]">
              <Tag className="w-3.5 h-3.5" />
              <span>Topic</span>
            </div>
            <span className="font-medium text-[#292B27]">{cls?.topic || 'General Inquiry'}</span>
          </div>

          {/* Urgency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#777970]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Urgency</span>
            </div>
            {getUrgencyBadge(cls?.urgency || conversation.priority || 'medium')}
          </div>

          {/* Assigned Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#777970]">
              <Users className="w-3.5 h-3.5" />
              <span>Assigned Team</span>
            </div>
            <span className="font-medium text-[#292B27]">{cls?.assigned_team || 'Customer Support'}</span>
          </div>

          {/* Sentiment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#777970]">
              <Smile className="w-3.5 h-3.5" />
              <span>Sentiment</span>
            </div>
            <span className="font-medium text-[#292B27] capitalize">{cls?.sentiment || 'Neutral'}</span>
          </div>

          {/* Risk Flag */}
          {cls?.risk_flag && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#777970]">
                <ShieldAlert className="w-3.5 h-3.5 text-[#B42318]" />
                <span>Risk Flag</span>
              </div>
              <span className="font-medium text-[#B42318] text-right truncate max-w-[140px]" title={cls.risk_flag}>
                {cls.risk_flag}
              </span>
            </div>
          )}
        </div>

        {/* Collapsible: Why this assessment? */}
        <div className="pt-2 border-t border-[#E7E3DA]/60">
          <button
            onClick={() => setWhyOpen(!whyOpen)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-[#292B27] hover:text-black py-1"
          >
            <span>Why this assessment?</span>
            {whyOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#777970]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#777970]" />}
          </button>

          {whyOpen && (
            <div className="text-[11px] text-[#777970] leading-relaxed pt-1">
              {cls?.explanation ||
                `The AI reviewed "${conversation.subject}" from ${conversation.sender_name} and classified it dynamically based on keywords and sentiment.`}
            </div>
          )}
        </div>

        {/* Human Feedback Button */}
        <button
          onClick={onOpenCorrection}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition border border-[#E7E3DA]/80"
        >
          <Edit3 className="w-3 h-3" />
          <span>Correct Classification</span>
        </button>
      </div>

      {/* 2. Relevant Knowledge Card */}
      <div className="bg-white/80 rounded-2xl p-4 border border-[#E7E3DA]/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#292B27]" />
            <h3 className="text-xs font-bold text-[#292B27]">Relevant Knowledge</h3>
          </div>
          <button
            onClick={() => onOpenKnowledgeArticle(displayDocs[0])}
            className="text-[11px] font-medium text-[#4F46E5] hover:underline"
          >
            View all
          </button>
        </div>

        {/* Document list */}
        <div className="space-y-1.5">
          {displayDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onOpenKnowledgeArticle(doc)}
              className="flex items-center justify-between p-2 rounded-xl bg-white/70 hover:bg-white border border-[#E7E3DA]/60 hover:border-[#D7D2C5] cursor-pointer transition shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3.5 h-3.5 text-[#B54708] shrink-0" />
                <span className="text-xs font-medium text-[#292B27] truncate">
                  {doc.title}
                </span>
              </div>
              <span className="text-[10px] text-[#777970] shrink-0 ml-1">
                {doc.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Conversation Timeline Card */}
      <div className="bg-white/80 rounded-2xl p-4 border border-[#E7E3DA]/80 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#292B27]" />
          <h3 className="text-xs font-bold text-[#292B27]">Conversation Timeline</h3>
        </div>

        {/* Dynamic vertical connector line & dots */}
        <div className="relative pl-5 space-y-3.5 pt-1">
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-[#E7E3DA]" />

          {displayTimeline.map((item, idx) => {
            const isSend = item.event_type.includes('send');
            const isApproved = item.event_type.includes('approved');
            const isDraft = item.event_type.includes('draft');
            const isCorrection = item.event_type.includes('correction');

            return (
              <div key={item.id || idx} className="relative">
                <div
                  className={`w-2 h-2 rounded-full absolute -left-4 top-1 ring-2 ring-white ${
                    isSend
                      ? 'bg-[#027A48]'
                      : isApproved
                      ? 'bg-[#12B76A]'
                      : isDraft
                      ? 'bg-[#4F46E5]'
                      : isCorrection
                      ? 'bg-[#B54708]'
                      : 'bg-[#292B27]'
                  }`}
                />
                <div className="text-xs font-medium text-[#292B27] leading-tight">
                  {item.description || item.event_type}
                </div>
                <div className="text-[10px] text-[#A4A69D] mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>{item.timestamp}</span>
                  {item.actor && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[150px] font-medium text-[#777970]">{item.actor}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Decision Receipt Button */}
      <button
        onClick={onOpenDecisionReceipt}
        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/60 hover:bg-white text-xs font-medium text-[#292B27] border border-[#E7E3DA] transition shadow-xs"
      >
        <FileCode2 className="w-3.5 h-3.5 text-[#777970]" />
        <span>View AI Decision Receipt</span>
      </button>
    </div>
  );
};
