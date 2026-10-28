'use client';

import React from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Workspace } from '@/types';
import { PostmarkLogo } from './PostmarkLogo';

interface HeaderBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  workspace: Workspace;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  currentView: 'inbox' | 'knowledge' | 'templates' | 'analytics' | 'teams';
  onViewChange: (view: 'inbox' | 'knowledge' | 'templates' | 'analytics' | 'teams') => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  searchQuery,
  onSearchChange,
  workspace,
  onOpenSettings,
  onOpenOnboarding,
  currentView,
  onViewChange,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  return (
    <header className="h-14 border-b border-[#E7E3DA]/80 px-4 sm:px-5 flex items-center justify-between select-none bg-white/40 backdrop-blur-md rounded-t-3xl">
      {/* Left: Branding with Postmark Logo and Sidebar Collapse Button */}
      <div className="flex items-center gap-3">
        {/* Sidebar Collapse Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-[#777970] hover:text-[#292B27] hover:bg-black/5 transition"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Postmark Logo & Brand Typography */}
        <div className="flex items-center gap-2.5">
          <PostmarkLogo size={28} className="shadow-xs" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#292B27] leading-tight">
              Postmark
            </h1>
            <p className="text-[10px] text-[#777970] leading-none mt-0.5">
              Intelligent Support Workspace
            </p>
          </div>
        </div>
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

      {/* Right: Mode Badge, View Switchers, Notifications, Settings, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Relocated Demo Mode / Gmail Connected Badge */}
        <button
          onClick={onOpenOnboarding}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
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
          <span className="hidden sm:inline">
            {workspace.mode === 'real' && workspace.gmail_connected ? 'Gmail Connected' : 'Demo Mode'}
          </span>
        </button>

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
