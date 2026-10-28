'use client';

import React, { useState } from 'react';
import { Mail, Sparkles, ShieldCheck, ArrowRight, Check, X, RefreshCw } from 'lucide-react';
import { Workspace } from '@/types';
import { PostmarkLogo } from './PostmarkLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
  onSelectMode: (mode: 'demo' | 'real') => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onSelectMode,
}) => {
  const [connecting, setConnecting] = useState(false);

  if (!isOpen) return null;

  const handleConnectGmail = () => {
    setConnecting(true);
    window.location.href = '/api/auth/google';
  };

  const handleSelectDemo = async () => {
    await onSelectMode('demo');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-[#FAF9F5] rounded-3xl shadow-2xl border border-white/60 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-8 pb-4 text-center space-y-2 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-[#777970] hover:bg-black/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <PostmarkLogo size={48} className="mx-auto shadow-md" />
          <h2 className="text-xl font-bold text-[#292B27] tracking-tight">
            Welcome to Postmark Workspace
          </h2>
          <p className="text-xs text-[#777970] max-w-md mx-auto">
            Choose how you would like to run your intelligent support inbox. You can switch modes at any time.
          </p>
        </div>

        {/* Two Core Options */}
        <div className="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Connect Real Gmail */}
          <div className="p-6 rounded-2xl bg-white border border-[#E7E3DA] hover:border-[#292B27] transition flex flex-col justify-between group shadow-xs">
            <div className="space-y-4">
              <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] text-[#3538CD] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#292B27]">Option A — Connect Gmail</h3>
                <p className="text-xs text-[#777970] mt-1 leading-relaxed">
                  Connect your Google support inbox with real OAuth 2.0. AI assists your replies with strict human-in-the-loop approval before anything is sent.
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#50524B]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#12B76A]" />
                  <span>Real Gmail API synchronization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#12B76A]" />
                  <span>Human review required before every send</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#12B76A]" />
                  <span>Minimal practical scopes & token safety</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E7E3DA]">
              <button
                onClick={handleConnectGmail}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold bg-[#292B27] text-white hover:bg-black transition shadow-xs disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Redirecting to Google...</span>
                  </>
                ) : (
                  <>
                    <span>Connect Google Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option B: Explore with Demo Data */}
          <div className="p-6 rounded-2xl bg-white border border-[#E7E3DA] hover:border-[#803D46] transition flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="w-9 h-9 rounded-xl bg-[#FEF3F2] text-[#803D46] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#292B27]">Option B — Explore Demo Mode</h3>
                <p className="text-xs text-[#777970] mt-1 leading-relaxed">
                  Explore the full experience using 20 realistic synthetic conversations without connecting your real personal email account.
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#50524B]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#12B76A]" />
                  <span>20 realistic customer tickets & threads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#12B76A]" />
                  <span>Real AI inference (NVIDIA / OpenRouter)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#12B76A]" />
                  <span>Safe simulated sending (zero email leakage)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E7E3DA]">
              <button
                onClick={handleSelectDemo}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold bg-[#803D46] text-white hover:bg-[#682F37] transition shadow-xs"
              >
                <span>Launch Demo Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="p-4 bg-white/60 border-t border-[#E7E3DA] text-center text-[11px] text-[#777970] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#12B76A]" />
          <span>Postmark never stores plain-text API credentials or sends unapproved customer replies.</span>
        </div>
      </div>
    </div>
  );
};
