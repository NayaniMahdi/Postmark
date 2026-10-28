'use client';

import React from 'react';
import {
  Inbox,
  AlertCircle,
  UserCheck,
  Star,
  FileEdit,
  Send,
  CheckCircle2,
  Wrench,
  CreditCard,
  TrendingUp,
  HeartHandshake,
  Shield,
  Mail,
  Sparkles,
} from 'lucide-react';
import { Team } from '@/types';

interface SidebarProps {
  currentFilter: string;
  onFilterSelect: (filter: string) => void;
  selectedTeamId?: string;
  onTeamSelect: (teamId?: string) => void;
  teams: Team[];
  counts: {
    inbox: number;
    needsReview: number;
    assigned: number;
    drafts: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onFilterSelect,
  selectedTeamId,
  onTeamSelect,
  teams,
  counts,
}) => {
  const navItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: counts.inbox },
    { id: 'needs_review', label: 'Needs Review', icon: AlertCircle, count: counts.needsReview },
    { id: 'assigned', label: 'Assigned to Me', icon: UserCheck, count: counts.assigned },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'drafts', label: 'Drafts', icon: FileEdit, count: counts.drafts },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'resolved', label: 'Resolved', icon: CheckCircle2 },
  ];

  const getTeamIcon = (slug: string) => {
    switch (slug) {
      case 'billing':
        return CreditCard;
      case 'tech':
        return Wrench;
      case 'sales':
        return TrendingUp;
      case 'cs':
        return HeartHandshake;
      case 'security':
        return Shield;
      default:
        return Mail;
    }
  };

  return (
    <aside className="w-56 shrink-0 flex flex-col justify-between py-5 px-3 border-r border-[#E7E3DA]/80 bg-[#FAF9F5]/60 select-none">
      {/* Top: Branding and Navigation */}
      <div className="space-y-6">
        {/* Postmark Brand */}
        <div className="flex items-start gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#292B27] text-white flex items-center justify-center shadow-sm">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#292B27]">Postmark</h1>
            <p className="text-[10px] text-[#777970] leading-none mt-0.5">
              Intelligent Support Workspace
            </p>
          </div>
        </div>

        {/* Primary Inbox Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentFilter === item.id && !selectedTeamId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTeamSelect(undefined);
                  onFilterSelect(item.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#292B27] text-white shadow-xs'
                    : 'text-[#777970] hover:text-[#292B27] hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#777970]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'text-[#777970]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Team Spaces */}
        <div className="pt-2">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-[#A4A69D] uppercase">
            Team Spaces
          </div>
          <div className="space-y-1">
            {teams.map((t) => {
              const Icon = getTeamIcon(t.slug);
              const isTeamActive = selectedTeamId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onFilterSelect('inbox');
                    onTeamSelect(isTeamActive ? undefined : t.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isTeamActive
                      ? 'bg-[#292B27] text-white shadow-xs'
                      : 'text-[#777970] hover:text-[#292B27] hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-3.5 h-3.5 ${isTeamActive ? 'text-white' : 'text-[#777970]'}`}
                    />
                    <span className="truncate">{t.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Frosted Card: Human care. AI speed. */}
      <div className="mt-6 px-1">
        <div className="rounded-2xl p-4 bg-white/60 border border-white/80 shadow-xs backdrop-blur-md">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#803D46]" />
            <h4 className="text-xs font-bold text-[#292B27]">Human care. AI speed.</h4>
          </div>
          <p className="text-[11px] text-[#777970] leading-snug">
            Smarter support for happier customers.
          </p>
        </div>
      </div>
    </aside>
  );
};
