'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Bell, ShieldCheck } from 'lucide-react';

interface EmailSettingsProps {
  onDirty: (dirty: boolean, data: any) => void;
  searchQuery?: string;
}

export default function EmailSettings({ onDirty, searchQuery }: EmailSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [baseSettings, setBaseSettings] = useState<any>(null);
  const [settings, setSettings] = useState({
    enrollmentEmail: true,
    certificateEmail: true,
    jobApplicationEmail: true,
    senderName: 'LMS Platform',
    senderEmail: 'noreply@lms.com',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings?group=email');
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
        <p className="text-zinc-500 font-medium text-sm">Loading Email Settings...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-in fade-in duration-300">
      <div className="mb-8 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Email Settings</h1>
        <p className="text-xs text-zinc-500 font-medium">Configure notifications sent to your students and instructors.</p>
      </div>

      <div className="space-y-12">
        {/* Sender Configuration Section */}
        <section className="space-y-1 border-t border-zinc-200 pt-8">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-6">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            {highlightText('Sender Configuration')}
          </h3>
          
          <div className="space-y-0 divide-y divide-zinc-100">
            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Sender Name')}
              </label>
              <div className="flex-1">
                <input 
                  type="text"
                  className="w-full max-w-lg bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  value={settings.senderName}
                  onChange={e => setSettings({...settings, senderName: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Sender Email')}
              </label>
              <div className="flex-1">
                <input 
                  type="email"
                  className="w-full max-w-lg bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  value={settings.senderEmail}
                  onChange={e => setSettings({...settings, senderEmail: e.target.value})}
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                  {highlightText('Emails will be sent from this address.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Email Notifications Section */}
        <section className="space-y-1 border-t border-zinc-200 pt-8">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-6">
            <Bell className="w-4 h-4 text-blue-500" />
            {highlightText('Notification Toggles')}
          </h3>
          
          <div className="space-y-0 divide-y divide-zinc-100">
            {[
              { id: 'enrollmentEmail', label: 'Course Enrollment', desc: 'Sent when a student joins a new course' },
              { id: 'certificateEmail', label: 'Certificate Awarded', desc: 'Sent when a student completes a course' },
              { id: 'jobApplicationEmail', label: 'Job Application', desc: 'Sent when an application is submitted' },
            ].map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center py-4 gap-4">
                <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                  {highlightText(item.label)}
                </label>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setSettings({...settings, [item.id]: !settings[item.id as keyof typeof settings]})}
                      className={`w-10 h-5 rounded-full transition-all relative ${settings[item.id as keyof typeof settings] ? 'bg-blue-600' : 'bg-zinc-300'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings[item.id as keyof typeof settings] ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                    <span className="text-[11px] text-zinc-400 font-medium italic">
                      {highlightText(item.desc)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
