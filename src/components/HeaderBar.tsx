'use client';

import React from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCw,
} from 'lucide-react';
import { Workspace } from '@/types';
import { PostmarkLogo } from './PostmarkLogo';

interface HeaderBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  workspace: Workspace;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  onToggleMode?: () => void;
  currentView: 'inbox' | 'knowledge' | 'templates' | 'analytics' | 'teams';
  onViewChange: (view: 'inbox' | 'knowledge' | 'templates' | 'analytics' | 'teams') => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onSyncInbox?: () => Promise<void>;
  isSyncing?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  searchQuery,
  onSearchChange,
  workspace,
  onOpenSettings,
  onOpenOnboarding,
  onToggleMode,
  currentView,
  onViewChange,
  isSidebarCollapsed,
  onToggleSidebar,
  onSyncInbox,
  isSyncing,
}) => {
  const isRealMode = workspace.mode === 'real' && workspace.gmail_connected;
  const profileName = isRealMode
    ? (workspace.gmail_name || (workspace.gmail_email ? workspace.gmail_email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Support Agent'))
    : 'Aanya';
  const profileSubtitle = isRealMode
    ? (workspace.gmail_email || 'Gmail Connected')
    : 'Support Specialist';
  const profileInitial = (profileName || 'A')[0].toUpperCase();

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
        {/* Mode Badge with Direct Toggle Action */}
        <button
          onClick={onToggleMode || onOpenOnboarding}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
            isRealMode
              ? 'bg-[#ECFDF3] border-[#A6F4C5] text-[#027A48] hover:bg-[#D1FADF]'
              : 'bg-[#FEF6EE] border-[#F9DBAF] text-[#B54708] hover:bg-[#FEE4C8]'
          }`}
          title={
            isRealMode
              ? 'Currently in Real Gmail mode. Click to switch to Demo Mode'
              : workspace.gmail_connected
              ? 'Currently in Demo mode. Click to switch to Real Gmail'
              : 'Click to connect Gmail or configure modes'
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isRealMode ? 'bg-[#12B76A]' : 'bg-[#F79009]'
            }`}
          />
          <span className="hidden sm:inline">
            {isRealMode ? 'Gmail Connected' : 'Demo Mode'}
          </span>
        </button>

        {/* Sync Mail Button */}
        {onSyncInbox && (
          <button
            onClick={onSyncInbox}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
              isSyncing
                ? 'bg-[#E0E7FF] border-[#C7D2FE] text-[#3730A3]'
                : 'bg-white/80 hover:bg-white border-[#E7E3DA] text-[#292B27] shadow-xs'
            }`}
            title="Fetch new inbound emails from Gmail"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#4F46E5] ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Sync Mail'}</span>
          </button>
        )}

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

        {/* Dynamic User Profile Pill */}
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-black/5 transition cursor-pointer border border-transparent hover:border-[#E7E3DA]"
          title={isRealMode ? `Signed in as ${profileName} (${profileSubtitle})` : 'Operating as Demo Support Specialist'}
        >
          <div
            className={`w-7 h-7 rounded-full font-semibold text-xs flex items-center justify-center border border-white shadow-xs ${
              isRealMode ? 'bg-[#D1FADF] text-[#027A48]' : 'bg-[#E0E7FF] text-[#3730A3]'
            }`}
          >
            {profileInitial}
          </div>
          <div className="text-left hidden sm:block max-w-[140px]">
            <div className="text-xs font-medium text-[#292B27] leading-tight truncate">{profileName}</div>
            <div className="text-[10px] text-[#777970] leading-tight truncate">{profileSubtitle}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#777970]" />
        </div>
      </div>
    </header>
  );
};
