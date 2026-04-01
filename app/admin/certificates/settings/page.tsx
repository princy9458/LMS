'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { SectionCard, SettingsSidebar } from '@/components/admin/learnDash';

const defaultSettings = {
  certificateEditorFeaturedImage: true,
  certificateEditorCustomFields: false,
  certificateEditorRevisions: true,
  certificateCustomStyles: ''
};

export default function CertificatesSettingsPage() {
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
        toast.error('Failed to load certificate settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSetting = (key: keyof typeof defaultSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

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
      toast.success('Settings saved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
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
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Settings</span>
          <Link href="/admin/certificates/shortcodes" className="pb-2 hover:text-zinc-900">Shortcodes</Link>
          <Link href="/admin/certificates/fonts" className="pb-2 hover:text-zinc-900">Fonts</Link>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
        <div className="space-y-6">
          <SectionCard
            id="certificate-custom-post-type"
            title="Certificate Custom Post Type Options"
            description="Control options specific to the Certificates post type"
          >
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-800">Editor Supported Settings</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={settings.certificateEditorFeaturedImage}
                    onChange={(e) => updateSetting('certificateEditorFeaturedImage', e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  Featured Image
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={settings.certificateEditorCustomFields}
                    onChange={(e) => updateSetting('certificateEditorCustomFields', e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  Custom Fields
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={settings.certificateEditorRevisions}
                    onChange={(e) => updateSetting('certificateEditorRevisions', e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  Revisions
                </label>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="certificate-custom-styles"
            title="Certificate Custom Styles"
            description="Add Custom Styles (CSS) to be used on all legacy certificates."
          >
            <textarea
              value={settings.certificateCustomStyles}
              onChange={(e) => updateSetting('certificateCustomStyles', e.target.value)}
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm min-h-[160px]"
            />
          </SectionCard>
        </div>

        <SettingsSidebar
          saving={saving}
          onSave={handleSave}
          quickLinks={[
            { label: 'Certificate Custom Post Type Options', href: '#certificate-custom-post-type' },
            { label: 'Certificate Custom Styles', href: '#certificate-custom-styles' }
          ]}
        />
      </div>
    </div>
  );
}
