'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const defaultSettings = {
  certificateFontLabel: '',
  certificateFontRegular: '',
  certificateFontBold: '',
  certificateFontItalic: '',
  certificateFontBoldItalic: ''
};

export default function CertificateFontsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/certificates');
        const data = await res.json();
        if (data.success) {
          setSettings({ ...defaultSettings, ...data.data });
        }
      } catch (error) {
        toast.error('Failed to load font settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/certificates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Save failed');
      }
      toast.success('Font settings saved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save font settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const updateFile = (key: keyof typeof defaultSettings, file?: File | null) => {
    if (!file) return;
    setSettings((prev) => ({ ...prev, [key]: file.name }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Certificates</h1>
        </div>
        <Link
          href="/admin/certificates/create"
          className="bg-[#2271b1] hover:bg-[#135e96] text-white font-medium px-4 py-2 rounded-md transition text-sm"
        >
          + Add New Certificate
        </Link>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <Link href="/admin/certificates" className="pb-2 hover:text-zinc-900">Certificates</Link>
          <Link href="/admin/certificates/settings" className="pb-2 hover:text-zinc-900">Settings</Link>
          <Link href="/admin/certificates/shortcodes" className="pb-2 hover:text-zinc-900">Shortcodes</Link>
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Fonts</span>
        </nav>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 items-center">
          <label className="text-sm text-zinc-700">Label</label>
          <input
            value={settings.certificateFontLabel}
            onChange={(e) => setSettings((prev) => ({ ...prev, certificateFontLabel: e.target.value }))}
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 items-center">
          <label className="text-sm text-zinc-700">Regular (*)</label>
          <input type="file" onChange={(e) => updateFile('certificateFontRegular', e.target.files?.[0])} />
          <div className="md:col-start-2 text-xs text-zinc-500">{settings.certificateFontRegular || 'No file chosen'}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 items-center">
          <label className="text-sm text-zinc-700">Bold</label>
          <input type="file" onChange={(e) => updateFile('certificateFontBold', e.target.files?.[0])} />
          <div className="md:col-start-2 text-xs text-zinc-500">{settings.certificateFontBold || 'No file chosen'}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 items-center">
          <label className="text-sm text-zinc-700">Italic</label>
          <input type="file" onChange={(e) => updateFile('certificateFontItalic', e.target.files?.[0])} />
          <div className="md:col-start-2 text-xs text-zinc-500">{settings.certificateFontItalic || 'No file chosen'}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 items-center">
          <label className="text-sm text-zinc-700">Bold Italic</label>
          <input type="file" onChange={(e) => updateFile('certificateFontBoldItalic', e.target.files?.[0])} />
          <div className="md:col-start-2 text-xs text-zinc-500">{settings.certificateFontBoldItalic || 'No file chosen'}</div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2271b1] hover:bg-[#135e96] text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Changes
        </button>
      </div>
    </div>
  );
}
