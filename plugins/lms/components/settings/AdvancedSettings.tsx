'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Cpu, Bug, Zap } from 'lucide-react';

interface AdvancedSettingsProps {
  onDirty: (dirty: boolean, data: any) => void;
  searchQuery?: string;
}

export default function AdvancedSettings({ onDirty, searchQuery }: AdvancedSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [baseSettings, setBaseSettings] = useState<any>(null);
  const [settings, setSettings] = useState({
    enableLogging: true,
    enableDebugMode: false,
    apiRateLimit: 100,
    enableCache: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings?group=advanced');
      const json = await res.json();
      if (json.success) {
        setBaseSettings(json.data);
        setSettings(prev => ({ ...prev, ...json.data }));
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baseSettings) {
      const isDirty = JSON.stringify(baseSettings) !== JSON.stringify(settings);
      onDirty(isDirty, settings);
    }
  }, [settings, baseSettings, onDirty]);

  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => (
          part.toLowerCase() === searchQuery.toLowerCase() 
            ? <mark key={i} className="bg-yellow-200 text-zinc-900 rounded-px px-0.5">{part}</mark> 
            : part
        ))}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-zinc-500 font-medium text-sm">Loading Advanced Settings...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-in fade-in duration-300">
      <div className="mb-8 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Advanced Settings</h1>
        <p className="text-xs text-zinc-500 font-medium">Configure system-level performance and debugging options.</p>
      </div>

      <div className="space-y-12">
        {/* Debugging Section */}
        <section className="space-y-1 border-t border-zinc-200 pt-8">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-6">
            <Bug className="w-4 h-4 text-blue-500" />
            {highlightText('Debugging & Maintenance')}
          </h3>
          
          <div className="space-y-0 divide-y divide-zinc-100">
            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('System Logging')}
              </label>
              <div className="flex-1">
                <button 
                  type="button"
                  onClick={() => setSettings({...settings, enableLogging: !settings.enableLogging})}
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.enableLogging ? 'bg-blue-600' : 'bg-zinc-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.enableLogging ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
                <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                  {highlightText('Log all system activities to the database for auditing.')}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Debug Mode')}
              </label>
              <div className="flex-1">
                <button 
                  type="button"
                  onClick={() => setSettings({...settings, enableDebugMode: !settings.enableDebugMode})}
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.enableDebugMode ? 'bg-blue-600' : 'bg-zinc-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.enableDebugMode ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
                <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                  {highlightText('Show verbose error messages for troubleshooting (not recommended for production).')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Section */}
        <section className="space-y-1 border-t border-zinc-200 pt-8">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-6">
            <Zap className="w-4 h-4 text-blue-500" />
            {highlightText('Performance & API')}
          </h3>
          
          <div className="space-y-0 divide-y divide-zinc-100">
            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('API Rate Limit')}
              </label>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    className="w-24 bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={settings.apiRateLimit}
                    onChange={e => setSettings({...settings, apiRateLimit: parseInt(e.target.value)})}
                  />
                  <span className="text-sm text-zinc-500">req/min</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                  {highlightText('Maximum number of API requests allowed per minute per visitor.')}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Response Caching')}
              </label>
              <div className="flex-1">
                <button 
                  type="button"
                  onClick={() => setSettings({...settings, enableCache: !settings.enableCache})}
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.enableCache ? 'bg-blue-600' : 'bg-zinc-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.enableCache ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
                <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                  {highlightText('Cache API results to improve performance and reduce server load.')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
