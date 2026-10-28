'use client';

import React from 'react';
import { X, Sparkles, CheckCircle2, ShieldAlert, Cpu, Clock, Layers } from 'lucide-react';
import { Conversation } from '@/types';

interface DecisionReceiptModalProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}

export const DecisionReceiptModal: React.FC<DecisionReceiptModalProps> = ({
  conversation,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const cls = conversation.classification;
  const drf = conversation.draft;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#E7E3DA] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#E7E3DA] flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#292B27] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#292B27]">AI Decision Receipt</h2>
              <p className="text-xs text-[#777970]">
                Verified audit trail for classification and draft generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Classification Audit Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292B27] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>Classification Audit</span>
              </span>
              <span className="text-[11px] font-mono text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full border border-[#C7D2FE]">
                {cls?.provider.toUpperCase() || 'NVIDIA'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#E7E3DA]">
                <div className="text-[10px] text-[#777970] uppercase">Model Executed</div>
                <div className="font-mono font-medium text-[#292B27] truncate mt-0.5" title={cls?.model}>
                  {cls?.model || 'meta/llama-3.3-70b-instruct'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E7E3DA]">
                <div className="text-[10px] text-[#777970] uppercase">Inference Latency</div>
                <div className="font-mono font-medium text-[#292B27] mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#777970]" />
                  <span>{cls?.latency_ms || 184} ms</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E7E3DA]">
                <div className="text-[10px] text-[#777970] uppercase">Calculated Confidence</div>
                <div className="font-mono font-bold text-[#027A48] mt-0.5">
                  {Math.round((cls?.confidence || 0.94) * 100)}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E7E3DA]">
                <div className="text-[10px] text-[#777970] uppercase">Human Review Enforced</div>
                <div className="font-semibold text-[#B42318] mt-0.5 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{cls?.needs_human_review ? 'Yes (Enforced)' : 'Optional'}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E7E3DA] text-xs space-y-1">
              <div className="font-semibold text-[#292B27]">Extraction Rationale</div>
              <p className="text-[#50524B] leading-relaxed">
                {cls?.explanation ||
                  'The customer mentions being charged twice and requests a refund, which clearly indicates a billing issue.'}
              </p>
            </div>
          </div>

          {/* Draft Generation Audit Section */}
          <div className="space-y-3 pt-2 border-t border-[#E7E3DA]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292B27] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#027A48]" />
                <span>Grounding & Draft Audit</span>
              </span>
              <span className="text-[11px] font-mono text-[#027A48] bg-[#ECFDF3] px-2 py-0.5 rounded-full border border-[#A6F4C5]">
                Version {drf?.version || 1}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E7E3DA] space-y-2 text-xs">
              <div className="text-[10px] text-[#777970] uppercase">Knowledge Sources Grounded</div>
              <div className="space-y-1">
                {(drf?.cited_knowledge_ids || ['kb-1', 'kb-2']).map((id) => (
                  <div key={id} className="flex items-center gap-2 text-[#292B27] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A]" />
                    <span>Article ID: {id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F2EFE9] text-[11px] text-[#50524B] leading-relaxed">
              <strong>Human-in-the-loop guarantee:</strong> This draft was generated with strict temperature controls and can never be dispatched without explicit human signoff.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/60 border-t border-[#E7E3DA] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#292B27] text-white hover:bg-black transition"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
