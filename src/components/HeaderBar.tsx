'use client';

import React from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  Sparkles,
  Mail,
  ShieldCheck,
  BookOpen,
  BarChart3,
  Users,
} from 'lucide-react';
import { Workspace } from '@/types';

interface HeaderBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  workspace: Workspace;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  currentView: 'inbox' | 'knowledge' | 'templates' | 'analytics' | 'teams';
  onViewChange: (view: 'inbox' | 'knowledge' | 'templates' | 'analytics' | 'teams') => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  searchQuery,
  onSearchChange,
  workspace,
  onOpenSettings,
  onOpenOnboarding,
  currentView,
  onViewChange,
}) => {
  return (
    <header className="h-14 border-b border-[#E7E3DA]/80 px-5 flex items-center justify-between select-none bg-white/40 backdrop-blur-md rounded-t-3xl">
      {/* Left: macOS Traffic Lights & Mode Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-sm cursor-pointer hover:opacity-80 transition" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-sm cursor-pointer hover:opacity-80 transition" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-sm cursor-pointer hover:opacity-80 transition" />
        </div>

        {/* Mode Pill Indicator */}
        <button
          onClick={onOpenOnboarding}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
            workspace.mode === 'real' && workspace.gmail_connected
              ? 'bg-[#ECFDF3] border-[#A6F4C5] text-[#027A48] hover:bg-[#D1FADF]'
              : 'bg-[#FEF6EE] border-[#F9DBAF] text-[#B54708] hover:bg-[#FEE4C8]'
          }`}
          title="Click to switch between Real Gmail and Demo Mode"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              workspace.mode === 'real' && workspace.gmail_connected
                ? 'bg-[#12B76A]'
                : 'bg-[#F79009]'
            }`}
          />
          {workspace.mode === 'real' && workspace.gmail_connected ? 'Gmail Connected' : 'Demo Mode'}
        </button>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-[#777970] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations, customers, or topics..."
            className="w-full bg-white/70 hover:bg-white/90 focus:bg-white text-xs pl-9 pr-12 py-1.5 rounded-full border border-[#E7E3DA] focus:border-[#777970] focus:outline-none transition shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] text-[#292B27] placeholder:text-[#A4A69D]"
          />
          <div className="absolute right-3 text-[10px] text-[#A4A69D] font-mono border border-[#E7E3DA] bg-white/80 px-1.5 py-0.5 rounded pointer-events-none">
            ⌘ K
          </div>
        </div>
      </div>

      {/* Right: View Navigation, Notifications, Settings, Profile */}
      <div className="flex items-center gap-2">
        {/* Quick View Switches */}
        <div className="hidden lg:flex items-center bg-[#F2EFE9]/80 p-0.5 rounded-lg border border-[#E7E3DA]/80 text-xs">
          <button
            onClick={() => onViewChange('inbox')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              currentView === 'inbox'
                ? 'bg-white text-[#292B27] shadow-xs'
                : 'text-[#777970] hover:text-[#292B27]'
            }`}
          >
            Inbox
          </button>
          <button
            onClick={() => onViewChange('knowledge')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              currentView === 'knowledge'
                ? 'bg-white text-[#292B27] shadow-xs'
                : 'text-[#777970] hover:text-[#292B27]'
            }`}
          >
            Knowledge
          </button>
          <button
            onClick={() => onViewChange('analytics')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              currentView === 'analytics'
                ? 'bg-white text-[#292B27] shadow-xs'
                : 'text-[#777970] hover:text-[#292B27]'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-full hover:bg-black/5 text-[#777970] hover:text-[#292B27] transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#803D46] absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-black/5 text-[#777970] hover:text-[#292B27] transition"
          title="Workspace & AI Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-black/5 transition cursor-pointer border border-transparent hover:border-[#E7E3DA]">
          <div className="w-7 h-7 rounded-full bg-[#E0E7FF] text-[#3730A3] font-semibold text-xs flex items-center justify-center border border-white shadow-xs">
            A
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-medium text-[#292B27] leading-tight">Aanya</div>
            <div className="text-[10px] text-[#777970] leading-tight">Support Team</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#777970]" />
        </div>
      </div>
    </header>
  );
};
