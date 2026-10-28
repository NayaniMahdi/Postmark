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
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onFilterSelect,
  selectedTeamId,
  onTeamSelect,
  teams,
  counts,
  isCollapsed = false,
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
    <aside
      className={`shrink-0 flex flex-col justify-between py-4 px-2 border-r border-[#E7E3DA]/80 bg-[#FAF9F5]/60 select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16 items-center' : 'w-56'
      }`}
    >
      {/* Primary Navigation & Team Spaces */}
      <div className={`space-y-5 w-full ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {/* Primary Inbox Navigation */}
        <nav className="space-y-1 w-full">
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
                title={item.label}
                className={`relative flex items-center rounded-xl text-xs font-medium transition group ${
                  isCollapsed
                    ? 'w-10 h-10 mx-auto justify-center'
                    : 'w-full justify-between px-3 py-2'
                } ${
                  isActive
                    ? 'bg-[#292B27] text-white shadow-xs'
                    : 'text-[#777970] hover:text-[#292B27] hover:bg-black/5'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#777970] group-hover:text-[#292B27]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {/* Badge count */}
                {item.count !== undefined && item.count > 0 && (
                  <>
                    {!isCollapsed ? (
                      <span
                        className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'text-[#777970]'
                        }`}
                      >
                        {item.count}
                      </span>
                    ) : (
                      <span
                        className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border border-white ${
                          isActive ? 'bg-[#803D46] text-white' : 'bg-[#292B27] text-white'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Separator in collapsed mode */}
        {isCollapsed && <div className="w-8 h-px bg-[#E7E3DA]" />}

        {/* Team Spaces */}
        <div className="w-full pt-1">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-[#A4A69D] uppercase">
              Team Spaces
            </div>
          )}
          <div className="space-y-1 w-full">
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
                  title={t.name}
                  className={`flex items-center rounded-xl text-xs font-medium transition group ${
                    isCollapsed
                      ? 'w-10 h-10 mx-auto justify-center'
                      : 'w-full justify-between px-3 py-2'
                  } ${
                    isTeamActive
                      ? 'bg-[#292B27] text-white shadow-xs'
                      : 'text-[#777970] hover:text-[#292B27] hover:bg-black/5'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isTeamActive ? 'text-white' : 'text-[#777970] group-hover:text-[#292B27]'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{t.name}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Frosted Card (Human care. AI speed.) */}
      <div className="w-full mt-4">
        {!isCollapsed ? (
          <div className="rounded-2xl p-3.5 bg-white/60 border border-white/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#803D46]" />
              <h4 className="text-xs font-bold text-[#292B27]">Human care. AI speed.</h4>
            </div>
            <p className="text-[10px] text-[#777970] leading-snug">
              Smarter support for happier customers.
            </p>
          </div>
        ) : (
          <div
            className="w-10 h-10 mx-auto rounded-xl bg-white/70 border border-white flex items-center justify-center shadow-xs cursor-pointer hover:bg-white transition"
            title="Human care. AI speed. Smarter support for happier customers."
          >
            <Sparkles className="w-4 h-4 text-[#803D46]" />
          </div>
        )}
      </div>
    </aside>
  );
};
