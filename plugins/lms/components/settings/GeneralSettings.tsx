'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Globe, Camera, Clock, X, Upload } from 'lucide-react';

interface GeneralSettingsProps {
  onDirty: (dirty: boolean, data: any) => void;
  searchQuery?: string;
}

export default function GeneralSettings({ onDirty, searchQuery }: GeneralSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [baseSettings, setBaseSettings] = useState<any>(null);
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    logoUrl: '',
    faviconUrl: '',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings?group=general');
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setSettings(prev => ({
          ...prev,
          [type === 'logo' ? 'logoUrl' : 'faviconUrl']: json.url
        }));
      } else {
        alert(json.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('An error occurred during upload');
    }
  };

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
        <p className="text-zinc-500 font-medium text-sm">Loading General Settings...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-in fade-in duration-300">
      <div className="mb-8 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">General Settings</h1>
        <p className="text-xs text-zinc-500 font-medium">Basic information about your learning platform.</p>
      </div>

      <div className="space-y-12">
        {/* Site Identity Section */}
        <section className="space-y-1 border-t border-zinc-200 pt-8">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-6">
            <Globe className="w-4 h-4 text-blue-500" />
            {highlightText('Site Identity')}
          </h3>
          
          <div className="space-y-0 divide-y divide-zinc-100">
            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Site name')}
              </label>
              <div className="flex-1">
                <input 
                  type="text"
                  className="w-full max-w-lg bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={settings.siteName}
                  onChange={e => setSettings({...settings, siteName: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Site description')}
              </label>
              <div className="flex-1">
                <input 
                  type="text"
                  className="w-full max-w-lg bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  value={settings.siteDescription}
                  onChange={e => setSettings({...settings, siteDescription: e.target.value})}
                />
                <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                  {highlightText('A short catchphrase describing your platform.')}
                </p>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="flex flex-col md:flex-row md:items-start py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Site Logo')}
              </label>
              <div className="flex-1 flex items-center gap-6">
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="group relative w-20 h-20 bg-zinc-50 border-2 border-dashed border-zinc-200 hover:border-blue-400 rounded-lg flex items-center justify-center text-zinc-400 overflow-hidden cursor-pointer transition-all"
                >
                  {settings.logoUrl ? (
                    <>
                      <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="w-6 h-6 opacity-60" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Logo</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={logoInputRef}
                    className="hidden" 
                    accept="image/jpeg,image/png,image/svg+xml"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                  />
                </div>
                <div>
                  <button 
                    type="button" 
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-zinc-50 text-zinc-700 font-bold rounded text-[11px] transition-all border border-zinc-200 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Change Logo
                  </button>
                  <p className="text-[10px] text-zinc-400 mt-2">Recommended: 200x200px (PNG/SVG)</p>
                  {settings.logoUrl && (
                    <button 
                      onClick={() => setSettings({...settings, logoUrl: ''})}
                      className="text-[10px] text-red-500 hover:underline mt-1 block"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="flex flex-col md:flex-row md:items-start py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Site Favicon')}
              </label>
              <div className="flex-1 flex items-center gap-6">
                <div 
                  onClick={() => faviconInputRef.current?.click()}
                  className="group relative w-12 h-12 bg-zinc-50 border-2 border-dashed border-zinc-200 hover:border-blue-400 rounded-lg flex items-center justify-center text-zinc-400 overflow-hidden cursor-pointer transition-all"
                >
                  {settings.faviconUrl ? (
                    <>
                      <img src={settings.faviconUrl} alt="Favicon" className="w-full h-full object-contain p-1" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <Globe className="w-5 h-5 opacity-60" />
                  )}
                  <input 
                    type="file" 
                    ref={faviconInputRef}
                    className="hidden" 
                    accept="image/x-icon,image/png,image/svg+xml"
                    onChange={(e) => handleFileUpload(e, 'favicon')}
                  />
                </div>
                <div>
                  <button 
                    type="button" 
                    onClick={() => faviconInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-zinc-50 text-zinc-700 font-bold rounded text-[11px] transition-all border border-zinc-200 shadow-sm"
                  >
                    Set Favicon
                  </button>
                  <p className="text-[10px] text-zinc-400 mt-2">Standard: 32x32px (ICO/PNG)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Localization Section */}
        <section className="space-y-1 border-t border-zinc-200 pt-8">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-blue-500" />
            {highlightText('Localization')}
          </h3>
          
          <div className="space-y-0 divide-y divide-zinc-100">
            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Timezone')}
              </label>
              <div className="flex-1">
                <select 
                  className="bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none min-w-[300px]"
                  value={settings.timezone}
                  onChange={e => setSettings({...settings, timezone: e.target.value})}
                >
                  <option value="UTC">UTC (GMT +0)</option>
                  <option value="America/New_York">Eastern Time (EST)</option>
                  <option value="Europe/London">London (GMT +1)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Date Format')}
              </label>
              <div className="flex-1 space-y-2">
                {[
                  { value: 'YYYY-MM-DD', label: '2026-03-17 (YYYY-MM-DD)' },
                  { value: 'DD/MM/YYYY', label: '17/03/2026 (DD/MM/YYYY)' },
                  { value: 'MM/DD/YYYY', label: '03/17/2026 (MM/DD/YYYY)' },
                ].map(format => (
                  <label key={format.value} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="dateFormat"
                      className="w-3.5 h-3.5 text-blue-600 border-zinc-300 focus:ring-blue-500"
                      checked={settings.dateFormat === format.value}
                      onChange={() => setSettings({...settings, dateFormat: format.value})}
                    />
                    <span className="text-xs text-zinc-600 group-hover:text-zinc-900 transition-colors">
                      {highlightText(format.label)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
              <label className="text-sm font-semibold text-zinc-700 w-full md:w-64">
                {highlightText('Time Format')}
              </label>
              <div className="flex-1">
                <select 
                  className="bg-white border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none min-w-[300px]"
                  value={settings.timeFormat}
                  onChange={e => setSettings({...settings, timeFormat: e.target.value})}
                >
                  <option value="HH:mm">13:20 (24-hour)</option>
                  <option value="hh:mm A">01:20 PM (12-hour)</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
