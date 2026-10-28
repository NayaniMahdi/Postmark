'use client';

import React, { useState } from 'react';
import { X, Edit3, CheckCircle } from 'lucide-react';
import { Conversation, Priority } from '@/types';

interface CorrectionModalProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (correction: { topic: string; urgency: Priority; assigned_team: string }) => Promise<void>;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  conversation,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const cls = conversation.classification;
  const [topic, setTopic] = useState(cls?.topic || 'Billing & Payments');
  const [urgency, setUrgency] = useState<Priority>((cls?.urgency as Priority) || 'medium');
  const [assignedTeam, setAssignedTeam] = useState(cls?.assigned_team || 'Billing Team');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ topic, urgency, assigned_team: assignedTeam });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#E7E3DA] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#E7E3DA] flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#292B27] text-white flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#292B27]">Correct AI Classification</h2>
              <p className="text-xs text-[#777970]">Submit human feedback to refine future evaluation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[#50524B] font-semibold mb-1">Support Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white p-2.5 rounded-xl border border-[#E7E3DA] text-[#292B27] focus:outline-none focus:border-[#292B27]"
            >
              <option value="Billing & Payments">Billing & Payments</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Security">Security</option>
              <option value="Sales">Sales</option>
              <option value="Customer Success">Customer Success</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block text-[#50524B] font-semibold mb-1">Urgency Level</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Priority)}
              className="w-full bg-white p-2.5 rounded-xl border border-[#E7E3DA] text-[#292B27] focus:outline-none focus:border-[#292B27]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-[#50524B] font-semibold mb-1">Assigned Team Space</label>
            <select
              value={assignedTeam}
              onChange={(e) => setAssignedTeam(e.target.value)}
              className="w-full bg-white p-2.5 rounded-xl border border-[#E7E3DA] text-[#292B27] focus:outline-none focus:border-[#292B27]"
            >
              <option value="Billing Team">Billing Team</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Security">Security</option>
              <option value="Sales">Sales</option>
              <option value="Customer Success">Customer Success</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-[#F2EFE9] text-[11px] text-[#777970] leading-snug">
            Your correction will immediately update this ticket's routing rules and save an audit event in the database.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-[#777970] hover:bg-black/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#292B27] text-white hover:bg-black transition shadow-xs disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Apply Correction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
