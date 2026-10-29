import React, { useState } from 'react';
import { Settings, Sliders, KeyRound, Check, AlertTriangle } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [unitSystem, setUnitSystem] = useState<'SI' | 'Imperial'>('SI');
  const [notation, setNotation] = useState<'Engineering' | 'Scientific'>('Engineering');
  const [apiKey, setApiKey] = useState('');
  const [modelProvider, setModelProvider] = useState('offline');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearCache = () => {
    if (confirm('Clear local chat sessions and saved calculator state?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences & Integration</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Settings & System Status
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Manage engineering calculation standards, upcoming AI model integration endpoints, and workspace preferences.
          </p>
        </div>

        {/* AI Integration Configuration Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              AI Reasoning Engine Integration (Phase 2 Preview)
            </h3>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Integration Notice:</span>
              <span>
                Backend AI connectivity is currently inactive. You will be able to hook your preferred API key or local electrical engineering RAG server here in the next development phase.
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Engine Provider
                </label>
                <select
                  value={modelProvider}
                  onChange={(e) => setModelProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="offline">Electric Sence Offline Mock (Current)</option>
                  <option value="anthropic">Anthropic Claude (Upcoming)</option>
                  <option value="openai">OpenAI GPT-4o (Upcoming)</option>
                  <option value="gemini">Google Gemini 2.0 (Upcoming)</option>
                  <option value="local">Local Ollama / vLLM (Upcoming)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom API Key (Optional Preview)
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Credentials are stored exclusively in client-side memory.
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-colors shadow-2xs"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{savedSuccess ? 'Settings Saved' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Engineering Units & Notation Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Engineering Notation & Calculation Conventions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Unit System
              </label>
              <select
                value={unitSystem}
                onChange={(e) => setUnitSystem(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="SI">SI Units (Volts, Amperes, Watts, Hertz, Farads, Henries)</option>
                <option value="Imperial">Imperial Units (HP, BTU, ft-lbs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Number Display Format
              </label>
              <select
                value={notation}
                onChange={(e) => setNotation(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="Engineering">Engineering Multipliers (k, M, G, m, µ, n, p)</option>
                <option value="Scientific">Pure Scientific Powers (e.g. 1.25e+06)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data & Reset Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Reset Local Application Storage</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Clear browser session histories, calculator entries, and preferences.
            </p>
          </div>
          <button
            onClick={handleClearCache}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            Clear Local Data
          </button>
        </div>
      </div>
    </div>
  );
};
