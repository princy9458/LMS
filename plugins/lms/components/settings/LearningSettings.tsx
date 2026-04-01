'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen, GraduationCap } from 'lucide-react';

interface LearningSettingsProps {
  onDirty: (dirty: boolean, data: any) => void;
  searchQuery?: string;
}

export default function LearningSettings({ onDirty, searchQuery }: LearningSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [baseSettings, setBaseSettings] = useState<any>(null);
  const [settings, setSettings] = useState({
    courseAccess: 'free',
    progression: 'free',
    passingPercentage: 70,
    enableCertificates: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings?group=learning');
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
        <p className="text-zinc-500 font-medium text-sm">Loading Learning Settings...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-in fade-in duration-300">
      <div className="mb-8 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Learning Settings</h1>
        <p className="text-xs text-zinc-500 font-medium">How students interact with your courses and lessons.</p>
      </div>

      <div className="space-y-12">
        {/* Access & Progression Section */}
        <section className="space-y-1 border-t border-zinc-200 pt-8">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-6">
            <BookOpen className="w-4 h-4 text-blue-500" />
            {highlightText('Access & Progression')}
          </h3>
          
          <div className="space-y-0 divide-y divide-zinc-100">
            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Default Course Access')}
              </label>
              <div className="flex-1">
                <select 
                  className="bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none min-w-[300px]"
                  value={settings.courseAccess}
                  onChange={e => setSettings({...settings, courseAccess: e.target.value})}
                >
                  <option value="free">Free - Anyone can enroll</option>
                  <option value="paid">Paid - Require purchase</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Lesson Progression')}
              </label>
              <div className="flex-1 space-y-2">
                {[
                  { value: 'free', label: 'Free Form - Skip lessons freely' },
                  { value: 'sequential', label: 'Sequential - Complete in order' },
                ].map(p => (
                  <label key={p.value} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="progression"
                      className="w-3.5 h-3.5 text-blue-600 border-zinc-300 focus:ring-blue-500"
                      checked={settings.progression === p.value}
                      onChange={() => setSettings({...settings, progression: p.value})}
                    />
                    <span className="text-xs text-zinc-600 group-hover:text-zinc-900 transition-colors">
                      {highlightText(p.label)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Assessment Section */}
        <section className="space-y-1 border-t border-zinc-200 pt-8">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-6">
            <GraduationCap className="w-4 h-4 text-blue-500" />
            {highlightText('Assessment & Grading')}
          </h3>
          
          <div className="space-y-0 divide-y divide-zinc-100">
            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Quiz Passing Percentage')}
              </label>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    className="w-20 bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={settings.passingPercentage}
                    onChange={e => setSettings({...settings, passingPercentage: parseInt(e.target.value)})}
                  />
                  <span className="text-sm text-zinc-500">%</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                  {highlightText('Minimum score required to pass a quiz.')}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Enable Certificates')}
              </label>
              <div className="flex-1">
                <button 
                  type="button"
                  onClick={() => setSettings({...settings, enableCertificates: !settings.enableCertificates})}
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.enableCertificates ? 'bg-blue-600' : 'bg-zinc-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.enableCertificates ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
                <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                  {highlightText('Automatically award certificates on course completion.')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
