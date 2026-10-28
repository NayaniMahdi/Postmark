'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Archive,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  RotateCw,
  Send,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  CornerUpLeft,
} from 'lucide-react';
import { Conversation, DraftTone } from '@/types';

interface ConversationViewProps {
  conversation: Conversation;
  onUpdateDraft: (content: string, tone?: DraftTone) => void;
  onApproveDraft: () => Promise<void>;
  onSendReply: () => Promise<void>;
  onRegenerateDraft: (tone?: DraftTone) => Promise<void>;
  onRefineDraft: (instruction: 'shorter' | 'details' | 'friendly' | 'professional' | 'concise' | 'empathetic') => Promise<void>;
  onToggleStar: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  isSending?: boolean;
  isGenerating?: boolean;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  onUpdateDraft,
  onApproveDraft,
  onSendReply,
  onRegenerateDraft,
  onRefineDraft,
  onToggleStar,
  onArchive,
  onDelete,
  onPrev,
  onNext,
  isSending = false,
  isGenerating = false,
}) => {
  const [draftText, setDraftText] = useState(conversation.draft?.content || '');
  const [toneMenuOpen, setToneMenuOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraftText(conversation.draft?.content || '');
  }, [conversation.draft?.content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDraftText(val);
    onUpdateDraft(val);
  };

  const handleToneSelect = async (tone: DraftTone) => {
    setToneMenuOpen(false);
    await onRegenerateDraft(tone);
  };

  const handleApprove = async () => {
    await onApproveDraft();
    setStatusMessage('Draft approved. Ready for dispatch.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleApproveAndSend = async () => {
    if (!conversation.draft?.is_approved) {
      await onApproveDraft();
    }
    await onSendReply();
    setStatusMessage(
      conversation.is_demo
        ? 'Simulated Send (Demo Mode): Message logged in audit history.'
        : 'Dispatched successfully via Gmail API!'
    );
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const primaryMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <div className="flex-1 flex flex-col bg-white/50 overflow-y-auto select-none">
      {/* Top Action Toolbar */}
      <div className="h-12 border-b border-[#E7E3DA]/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {}}
            className="p-1.5 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition"
            title="Mark as unread"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={onArchive}
            className="p-1.5 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-[#777970] hover:text-[#B42318] hover:bg-black/5 transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition"
            title="More actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            className="p-1.5 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition"
            title="Previous conversation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNext}
            className="p-1.5 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition"
            title="Next conversation"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Conversation Body */}
      <div className="p-8 space-y-6 max-w-3xl">
        {/* Subject Header & Star */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#292B27] tracking-tight">
              {conversation.subject}
            </h1>
            <button
              onClick={onToggleStar}
              className="text-[#F59E0B] hover:scale-110 transition p-0.5"
              title={conversation.starred ? 'Unstar' : 'Star'}
            >
              <Star
                className="w-4 h-4"
                fill={conversation.starred ? '#F59E0B' : 'transparent'}
                stroke={conversation.starred ? '#F59E0B' : '#777970'}
              />
            </button>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap">
            {conversation.tags.map((tag) => {
              const isHigh = tag.includes('High') || tag.includes('Urgent');
              return (
                <span
                  key={tag}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    isHigh
                      ? 'bg-[#FEECEB] text-[#B42318] border-[#FECDCA]'
                      : 'bg-[#F2EFE9] text-[#50524B] border-[#E7E3DA]'
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* Sender details and message */}
        <div className="bg-white/80 rounded-2xl p-6 border border-[#E7E3DA]/80 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border border-black/5 shadow-xs"
                style={{ backgroundColor: conversation.avatar_color || '#E0E7FF' }}
              >
                <span className="text-[#292B27]">{conversation.sender_initials}</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#292B27] flex items-center gap-2">
                  <span>{conversation.sender_name}</span>
                  <span className="text-[11px] font-normal text-[#777970]">
                    {conversation.sender_email}
                  </span>
                </div>
                <div className="text-[11px] text-[#A4A69D] mt-0.5">
                  {conversation.received_at}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition border border-[#E7E3DA]"
                title="Reply directly"
              >
                <CornerUpLeft className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
              <button
                className="p-1 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition"
                title="More"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Email Body content */}
          <div className="text-xs text-[#292B27] leading-relaxed whitespace-pre-wrap font-normal pt-1">
            {primaryMessage?.body_text || conversation.snippet}
          </div>
        </div>

        {/* AI Draft Response Card (Light Periwinkle / Lavender Frosted Panel) */}
        <div className="glass-ai-draft rounded-2xl p-6 border border-[#D7E0F8] space-y-4 relative">
          {/* Card Header: AI Sparkle + Regenerate Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#1E1B4B]">AI Draft Response</h3>
              {conversation.draft && (
                <span className="text-[10px] font-mono text-[#6366F1] bg-white/70 px-1.5 py-0.5 rounded border border-[#C7D2FE]">
                  v{conversation.draft.version}
                </span>
              )}
            </div>

            <button
              onClick={() => onRegenerateDraft(conversation.draft?.tone)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#4338CA] hover:bg-white/80 transition border border-[#C7D2FE] bg-white/40 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Drafting...' : 'Regenerate'}</span>
            </button>
          </div>

          {/* Draft text editor */}
          <div className="relative">
            <textarea
              value={draftText}
              onChange={handleTextChange}
              rows={8}
              placeholder="AI draft is being prepared..."
              className="w-full text-xs text-[#1E1B4B] bg-white/70 focus:bg-white p-3.5 rounded-xl border border-[#CBD5E1] focus:border-[#6366F1] focus:outline-none transition leading-relaxed resize-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
            />

            {/* Approval status banner */}
            <div className="flex items-center justify-between pt-1">
              {conversation.draft?.is_approved ? (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#027A48]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#12B76A]" />
                  <span>Approved for sending (v{conversation.draft.version})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-[#B54708]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F79009]" />
                  <span>Review required before dispatch</span>
                </div>
              )}

              {conversation.is_demo && (
                <span className="text-[10px] font-mono text-[#777970] bg-white/50 px-2 py-0.5 rounded">
                  Simulation Active (Demo)
                </span>
              )}
            </div>
          </div>

          {/* Tone & Refinement Chips */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <div className="flex items-center gap-2 relative">
              {/* Tone Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setToneMenuOpen(!toneMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#334155] bg-white/80 hover:bg-white border border-[#CBD5E1] transition shadow-xs"
                >
                  <span className="capitalize">{conversation.draft?.tone || 'Professional'}</span>
                  <ChevronDown className="w-3 h-3 text-[#64748B]" />
                </button>

                {toneMenuOpen && (
                  <div className="absolute left-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1 z-20 text-xs">
                    {(['professional', 'friendly', 'concise', 'empathetic'] as DraftTone[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => handleToneSelect(t)}
                        className={`w-full text-left px-3 py-1.5 capitalize hover:bg-[#F1F5F9] transition ${
                          conversation.draft?.tone === t ? 'font-bold text-[#4338CA]' : 'text-[#334155]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick refinement chips */}
              <button
                onClick={() => onRefineDraft('shorter')}
                className="px-3 py-1 rounded-full text-xs font-medium text-[#334155] bg-white/80 hover:bg-white border border-[#CBD5E1] transition shadow-xs"
              >
                Make shorter
              </button>

              <button
                onClick={() => onRefineDraft('details')}
                className="px-3 py-1 rounded-full text-xs font-medium text-[#334155] bg-white/80 hover:bg-white border border-[#CBD5E1] transition shadow-xs"
              >
                Add details
              </button>

              <button
                onClick={() => onRefineDraft('empathetic')}
                className="px-2.5 py-1 rounded-full text-xs font-medium text-[#334155] bg-white/80 hover:bg-white border border-[#CBD5E1] transition shadow-xs"
                title="More tones"
              >
                ...
              </button>
            </div>

            {/* Bottom Actions: Send for Approval & Approve & Send */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleApprove}
                disabled={conversation.draft?.is_approved}
                className="px-4 py-1.5 rounded-full text-xs font-medium text-[#334155] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] transition shadow-xs disabled:opacity-50"
              >
                {conversation.draft?.is_approved ? 'Approved' : 'Send for Approval'}
              </button>

              <button
                onClick={handleApproveAndSend}
                disabled={isSending}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#292B27] hover:bg-black transition shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Approve & Send'}</span>
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {statusMessage && (
            <div className="p-2.5 rounded-xl bg-white border border-[#C7D2FE] text-xs font-medium text-[#1E1B4B] shadow-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#12B76A]" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
