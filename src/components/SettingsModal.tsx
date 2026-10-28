'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Key,
  Cpu,
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  Layers,
  Zap,
} from 'lucide-react';
import { AISettings, Workspace, DraftTone } from '@/types';
import { NVIDIA_MODELS, OPENROUTER_MODELS } from '@/lib/ai/models';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
  onRefreshWorkspace: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onRefreshWorkspace,
}) => {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [nvidiaKey, setNvidiaKey] = useState('');
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [primaryProvider, setPrimaryProvider] = useState<'nvidia' | 'openrouter' | 'mock'>('nvidia');
  const [fallbackProvider, setFallbackProvider] = useState<'nvidia' | 'openrouter' | 'mock'>('openrouter');
  const [classifierModel, setClassifierModel] = useState('meta/llama-3.3-70b-instruct');
  const [draftModel, setDraftModel] = useState('meta/llama-3.3-70b-instruct');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [supportTone, setSupportTone] = useState<DraftTone>('professional');

  const [testingProvider, setTestingProvider] = useState<'nvidia' | 'openrouter' | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; ok: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            setSettings(data.settings);
            setNvidiaKey(data.settings.nvidiaApiKey || '');
            setOpenrouterKey(data.settings.openrouterApiKey || '');
            setPrimaryProvider(data.settings.primaryProvider || 'nvidia');
            setFallbackProvider(data.settings.fallbackProvider || 'openrouter');
            setClassifierModel(data.settings.classifierModel || 'meta/llama-3.3-70b-instruct');
            setDraftModel(data.settings.draftModel || 'meta/llama-3.3-70b-instruct');
            setConfidenceThreshold(data.settings.confidenceThreshold || 0.85);
            setSupportTone(data.settings.supportTone || 'professional');
          }
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async (provider: 'nvidia' | 'openrouter') => {
    setTestingProvider(provider);
    setTestResult(null);

    const apiKey = provider === 'nvidia' ? nvidiaKey : openrouterKey;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      });
      const data = await res.json();
      setTestResult({ provider, ok: data.ok, message: data.message });
    } catch (err: any) {
      setTestResult({ provider, ok: false, message: err.message });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nvidiaApiKey: nvidiaKey,
          openrouterApiKey: openrouterKey,
          primaryProvider,
          fallbackProvider,
          classifierModel,
          draftModel,
          confidenceThreshold,
          supportTone,
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (confirm('Disconnect Gmail and return to simulated demo mode?')) {
      await fetch('/api/gmail/disconnect', { method: 'POST' });
      onRefreshWorkspace();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-[#FAF9F5] rounded-3xl shadow-2xl border border-[#E7E3DA] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#E7E3DA] flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#292B27] text-white flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#292B27]">Workspace & AI Settings</h2>
              <p className="text-xs text-[#777970]">
                Configure real NVIDIA NIM, OpenRouter inference, and Gmail connectivity
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

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* Gmail Account Status */}
          <div className="p-4 rounded-2xl bg-white border border-[#E7E3DA] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#292B27]" />
                <span className="font-bold text-[#292B27]">Gmail Account Connection</span>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  workspace.gmail_connected
                    ? 'bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]'
                    : 'bg-[#FEF6EE] text-[#B54708] border border-[#F9DBAF]'
                }`}
              >
                {workspace.gmail_connected ? 'Connected' : 'Demo Mode Active'}
              </span>
            </div>

            <div className="text-[#50524B] leading-relaxed">
              {workspace.gmail_connected ? (
                <div>Connected inbox: <strong>{workspace.gmail_email}</strong></div>
              ) : (
                <div>Currently operating in Demo Mode with 20 realistic sample support conversations.</div>
              )}
            </div>

            <div className="pt-1 flex gap-2">
              {workspace.gmail_connected ? (
                <button
                  type="button"
                  onClick={handleDisconnectGmail}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#B42318] bg-[#FEECEB] hover:bg-[#FECDCA] transition border border-[#FECDCA]"
                >
                  Disconnect Gmail
                </button>
              ) : (
                <a
                  href="/api/auth/google"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#292B27] hover:bg-black transition"
                >
                  Connect Real Gmail
                </a>
              )}
            </div>
          </div>

          {/* AI Credentials: NVIDIA & OpenRouter */}
          <div className="p-4 rounded-2xl bg-white border border-[#E7E3DA] space-y-4">
            <div className="flex items-center gap-2 font-bold text-[#292B27]">
              <Key className="w-4 h-4" />
              <span>Real AI API Credentials</span>
            </div>

            {/* NVIDIA NIM Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#50524B]">NVIDIA API Key</label>
                <button
                  type="button"
                  onClick={() => handleTestKey('nvidia')}
                  disabled={!nvidiaKey || testingProvider === 'nvidia'}
                  className="text-[11px] text-[#4F46E5] hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  {testingProvider === 'nvidia' && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Test Connection</span>
                </button>
              </div>
              <input
                type="password"
                value={nvidiaKey}
                onChange={(e) => setNvidiaKey(e.target.value)}
                placeholder="nvapi-••••••••••••••••"
                className="w-full bg-[#FAF9F5] p-2 rounded-xl border border-[#E7E3DA] focus:outline-none focus:border-[#292B27] font-mono"
              />
              <p className="text-[10px] text-[#A4A69D]">
                Official NVIDIA NIM inference catalog (nvapi key from build.nvidia.com)
              </p>
            </div>

            {/* OpenRouter Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#50524B]">OpenRouter API Key</label>
                <button
                  type="button"
                  onClick={() => handleTestKey('openrouter')}
                  disabled={!openrouterKey || testingProvider === 'openrouter'}
                  className="text-[11px] text-[#4F46E5] hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  {testingProvider === 'openrouter' && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Test Connection</span>
                </button>
              </div>
              <input
                type="password"
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                placeholder="sk-or-v1-••••••••••••••••"
                className="w-full bg-[#FAF9F5] p-2 rounded-xl border border-[#E7E3DA] focus:outline-none focus:border-[#292B27] font-mono"
              />
              <p className="text-[10px] text-[#A4A69D]">
                OpenRouter universal model gateway (openrouter.ai/keys)
              </p>
            </div>

            {/* Test result feedback */}
            {testResult && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                  testResult.ok
                    ? 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]'
                    : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                }`}
              >
                {testResult.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span className="font-medium">
                  {testResult.provider.toUpperCase()}: {testResult.message}
                </span>
              </div>
            )}
          </div>

          {/* Provider Routing & Models */}
          <div className="p-4 rounded-2xl bg-white border border-[#E7E3DA] space-y-4">
            <div className="flex items-center gap-2 font-bold text-[#292B27]">
              <Cpu className="w-4 h-4" />
              <span>Model Routing & Fallback Architecture</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-[#50524B] block mb-1">Primary Provider</label>
                <select
                  value={primaryProvider}
                  onChange={(e) => setPrimaryProvider(e.target.value as any)}
                  className="w-full bg-[#FAF9F5] p-2 rounded-xl border border-[#E7E3DA] focus:outline-none focus:border-[#292B27]"
                >
                  <option value="nvidia">NVIDIA NIM</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="mock">Simulated (Mock)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#50524B] block mb-1">Fallback Provider</label>
                <select
                  value={fallbackProvider}
                  onChange={(e) => setFallbackProvider(e.target.value as any)}
                  className="w-full bg-[#FAF9F5] p-2 rounded-xl border border-[#E7E3DA] focus:outline-none focus:border-[#292B27]"
                >
                  <option value="openrouter">OpenRouter</option>
                  <option value="nvidia">NVIDIA NIM</option>
                  <option value="mock">Simulated (Mock)</option>
                </select>
              </div>
            </div>

            {/* Active Model Catalog Presets */}
            <div className="space-y-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#50524B] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Classifier Model (Triage & Urgency)</span>
                  </label>
                  <span className="text-[10px] text-[#4F46E5] font-medium">⚡ Recommended: Fast models (&lt;400ms)</span>
                </div>
                <select
                  value={classifierModel}
                  onChange={(e) => setClassifierModel(e.target.value)}
                  className="w-full bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E7E3DA] text-xs focus:outline-none focus:border-[#292B27]"
                >
                  <optgroup label="NVIDIA NIM Models (Fast & Reasoning)">
                    {NVIDIA_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.badge} — {m.name} ({m.speed})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="OpenRouter Models">
                    {OPENROUTER_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.badge} — {m.name} ({m.speed})
                      </option>
                    ))}
                  </optgroup>
                  <option value={classifierModel}>Custom: {classifierModel}</option>
                </select>
                <input
                  type="text"
                  value={classifierModel}
                  onChange={(e) => setClassifierModel(e.target.value)}
                  placeholder="Or enter custom model ID..."
                  className="w-full mt-1.5 bg-[#FAF9F5] px-2.5 py-1.5 rounded-lg border border-[#E7E3DA] font-mono text-[11px] text-[#50524B]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#50524B] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>Drafting Model (Grounded Policy Replies)</span>
                  </label>
                  <span className="text-[10px] text-[#027A48] font-medium">🧠 Recommended: High Reasoning</span>
                </div>
                <select
                  value={draftModel}
                  onChange={(e) => setDraftModel(e.target.value)}
                  className="w-full bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E7E3DA] text-xs focus:outline-none focus:border-[#292B27]"
                >
                  <optgroup label="NVIDIA NIM Models (Flagship & Fast)">
                    {NVIDIA_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.badge} — {m.name} ({m.speed})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="OpenRouter Models">
                    {OPENROUTER_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.badge} — {m.name} ({m.speed})
                      </option>
                    ))}
                  </optgroup>
                  <option value={draftModel}>Custom: {draftModel}</option>
                </select>
                <input
                  type="text"
                  value={draftModel}
                  onChange={(e) => setDraftModel(e.target.value)}
                  placeholder="Or enter custom model ID..."
                  className="w-full mt-1.5 bg-[#FAF9F5] px-2.5 py-1.5 rounded-lg border border-[#E7E3DA] font-mono text-[11px] text-[#50524B]"
                />
              </div>
            </div>
          </div>

          {/* Company Response Style & Safety Threshold */}
          <div className="p-4 rounded-2xl bg-white border border-[#E7E3DA] space-y-4">
            <div className="flex items-center gap-2 font-bold text-[#292B27]">
              <Layers className="w-4 h-4" />
              <span>Response Style & Confidence Guardrails</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-[#50524B] block mb-1">Default Response Tone</label>
                <select
                  value={supportTone}
                  onChange={(e) => setSupportTone(e.target.value as DraftTone)}
                  className="w-full bg-[#FAF9F5] p-2 rounded-xl border border-[#E7E3DA] capitalize"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="concise">Concise</option>
                  <option value="empathetic">Empathetic</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#50524B]">Review Threshold</label>
                  <span className="font-mono text-xs font-bold text-[#292B27]">
                    {Math.round(confidenceThreshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[#292B27]"
                />
                <p className="text-[10px] text-[#A4A69D] mt-0.5">
                  Classifications below this confidence score are queued for mandatory human review.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-between border-t border-[#E7E3DA]">
            {saveSuccess && (
              <span className="text-xs text-[#027A48] font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Settings saved successfully!</span>
              </span>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-medium text-[#777970] hover:bg-black/5 transition"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#292B27] text-white hover:bg-black transition shadow-xs disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
