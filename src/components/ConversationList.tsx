'use client';

import React from 'react';
import { SlidersHorizontal, RotateCw } from 'lucide-react';
import { Conversation, Priority } from '@/types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (p: string) => void;
  title?: string;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  priorityFilter,
  onPriorityFilterChange,
  title = 'Inbox',
  onSync,
  isSyncing,
}) => {
  // Compute counts for priority tabs
  const allCount = conversations.length;
  const highCount = conversations.filter((c) => c.priority === 'high' || c.priority === 'critical').length;
  const mediumCount = conversations.filter((c) => c.priority === 'medium').length;
  const lowCount = conversations.filter((c) => c.priority === 'low').length;

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
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
      case 'low':
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]">
            Low
          </span>
        );
    }
  };

  return (
    <div className="w-80 shrink-0 flex flex-col border-r border-[#E7E3DA]/80 bg-[#FAF9F5]/40 select-none">
      {/* List Header */}
      <div className="p-4 pb-3 border-b border-[#E7E3DA]/60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#292B27] tracking-tight">{title}</h2>
          <div className="flex items-center gap-1">
            {onSync && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="p-1.5 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition disabled:opacity-50"
                title="Sync and check for new emails"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#4F46E5]' : ''}`} />
              </button>
            )}
            <button
              className="p-1.5 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition"
              title="Filter Options"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPriorityFilterChange('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
              priorityFilter === 'all'
                ? 'bg-[#292B27] text-white shadow-xs'
                : 'bg-white/70 text-[#777970] hover:bg-white hover:text-[#292B27] border border-[#E7E3DA]'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1 rounded-full ${
                priorityFilter === 'all' ? 'bg-white/20 text-white' : 'text-[#777970]'
              }`}
            >
              {allCount}
            </span>
          </button>

          <button
            onClick={() => onPriorityFilterChange('high')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
              priorityFilter === 'high'
                ? 'bg-[#292B27] text-white shadow-xs'
                : 'bg-white/70 text-[#777970] hover:bg-white hover:text-[#292B27] border border-[#E7E3DA]'
            }`}
          >
            <span>High</span>
            <span
              className={`text-[10px] px-1 rounded-full ${
                priorityFilter === 'high' ? 'bg-white/20 text-white' : 'text-[#777970]'
              }`}
            >
              {highCount}
            </span>
          </button>

          <button
            onClick={() => onPriorityFilterChange('medium')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
              priorityFilter === 'medium'
                ? 'bg-[#292B27] text-white shadow-xs'
                : 'bg-white/70 text-[#777970] hover:bg-white hover:text-[#292B27] border border-[#E7E3DA]'
            }`}
          >
            <span>Medium</span>
            <span
              className={`text-[10px] px-1 rounded-full ${
                priorityFilter === 'medium' ? 'bg-white/20 text-white' : 'text-[#777970]'
              }`}
            >
              {mediumCount}
            </span>
          </button>

          <button
            onClick={() => onPriorityFilterChange('low')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
              priorityFilter === 'low'
                ? 'bg-[#292B27] text-white shadow-xs'
                : 'bg-white/70 text-[#777970] hover:bg-white hover:text-[#292B27] border border-[#E7E3DA]'
            }`}
          >
            <span>Low</span>
            <span
              className={`text-[10px] px-1 rounded-full ${
                priorityFilter === 'low' ? 'bg-white/20 text-white' : 'text-[#777970]'
              }`}
            >
              {lowCount}
            </span>
          </button>
        </div>
      </div>

      {/* Conversation Cards Scroll List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#777970]">
            No conversations match this filter.
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = selectedId === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`p-3 rounded-2xl cursor-pointer transition relative ${
                  isSelected
                    ? 'bg-white border border-[#E1DCD2] shadow-sm'
                    : 'hover:bg-white/60 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Sender Initials Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 border border-black/5 shadow-xs"
                    style={{ backgroundColor: conv.avatar_color || '#E0E7FF' }}
                  >
                    <span className="text-[#292B27]">{conv.sender_initials}</span>
                  </div>

                  {/* Header: Sender Name, Timestamp & Priority Badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`text-xs truncate ${
                          conv.unread ? 'font-bold text-[#292B27]' : 'font-medium text-[#292B27]'
                        }`}
                      >
                        {conv.sender_name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-[#A4A69D]">{conv.received_at}</span>
                        {getPriorityBadge(conv.priority)}
                      </div>
                    </div>

                    {/* Subject line */}
                    <h3
                      className={`text-xs truncate ${
                        conv.unread ? 'font-semibold text-[#292B27]' : 'text-[#50524B]'
                      }`}
                    >
                      {conv.subject}
                    </h3>

                    {/* Snippet preview */}
                    <p className="text-[11px] text-[#777970] truncate mt-0.5">
                      {conv.snippet}
                    </p>
                  </div>
                </div>

                {/* Unread dot */}
                {conv.unread && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#803D46] absolute left-1.5 top-1/2 -translate-y-1/2" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
