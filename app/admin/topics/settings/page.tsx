'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { ActionsDropdown, SectionCard, SettingRow, SettingsSidebar, ToggleSwitch } from '@/components/admin/learnDash';

const defaultSettings = {
  topicCategories: true,
  topicTags: true,
  wpCategories: false,
  wpTags: false,
  topicSearch: true,
  loggedInOnly: false,
  enrolledOnly: false,
  archivePage: false,
  editorFeaturedImage: true,
  editorComments: false,
  editorCustomFields: false,
  editorRevisions: true
};

export default function AdminTopicsSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/topics');
        const data = await res.json();
        if (data.success) {
          setSettings({ ...defaultSettings, ...data.data });
        }
      } catch (error) {
        toast.error('Failed to load topic settings');
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
      const res = await fetch('/api/settings/topics', {
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
          <h1 className="text-2xl font-semibold text-zinc-900">Topics</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/topics/create"
            className="bg-[#2271b1] hover:bg-[#135e96] text-white font-medium px-4 py-2 rounded-md transition text-sm"
          >
            + Add New Topic
          </Link>
          <ActionsDropdown
            items={[
              { label: 'Topic Categories', href: '/admin/topics/categories' },
              { label: 'Topic Tags', href: '/admin/topics/tags' },
              { label: 'Categories', href: '/admin/topics/wp-categories' },
              { label: 'Tags', href: '/admin/topics/wp-tags' }
            ]}
          />
        </div>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <Link href="/admin/topics" className="pb-2 hover:text-zinc-900">Topics</Link>
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Settings</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
        <div className="space-y-6">
          <SectionCard
            id="topic-taxonomies"
            title="Topic Taxonomies"
            description="Control which Taxonomies can be used with the LearnDash Topics."
          >
            <SettingRow
              label="Topic Categories"
              helper="Manage Topic Categories via the Actions dropdown"
              control={
                <ToggleSwitch
                  checked={settings.topicCategories}
                  onChange={(value) => updateSetting('topicCategories', value)}
                />
              }
            />
            <SettingRow
              label="Topic Tags"
              helper="Manage Topic Tags via the Actions dropdown"
              control={
                <ToggleSwitch
                  checked={settings.topicTags}
                  onChange={(value) => updateSetting('topicTags', value)}
                />
              }
            />
            <SettingRow
              label="WP Post Categories"
              control={
                <ToggleSwitch
                  checked={settings.wpCategories}
                  onChange={(value) => updateSetting('wpCategories', value)}
                />
              }
            />
            <SettingRow
              label="WP Post Tags"
              control={
                <ToggleSwitch
                  checked={settings.wpTags}
                  onChange={(value) => updateSetting('wpTags', value)}
                />
              }
            />
          </SectionCard>

          <SectionCard
            id="topic-custom-post-type-options"
            title="Topic Custom Post Type Options"
            description="Control the LearnDash Topics Custom Post Type Options."
          >
            <SettingRow
              label="Topic Search"
              control={
                <ToggleSwitch
                  checked={settings.topicSearch}
                  onChange={(value) => updateSetting('topicSearch', value)}
                />
              }
            />
            <div className="border-l border-zinc-200 pl-6 space-y-3">
              <SettingRow
                label="Logged-in User only"
                control={
                  <ToggleSwitch
                    checked={settings.loggedInOnly}
                    onChange={(value) => updateSetting('loggedInOnly', value)}
                  />
                }
              />
              <SettingRow
                label="Enrolled only"
                control={
                  <ToggleSwitch
                    checked={settings.enrolledOnly}
                    onChange={(value) => updateSetting('enrolledOnly', value)}
                  />
                }
              />
            </div>
            <SettingRow
              label="Archive Page"
              control={
                <ToggleSwitch
                  checked={settings.archivePage}
                  onChange={(value) => updateSetting('archivePage', value)}
                />
              }
            />

            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-800">Editor Supported Settings</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={settings.editorFeaturedImage}
                    onChange={(e) => updateSetting('editorFeaturedImage', e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  Featured Image
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={settings.editorComments}
                    onChange={(e) => updateSetting('editorComments', e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  Comments
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={settings.editorCustomFields}
                    onChange={(e) => updateSetting('editorCustomFields', e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  Custom Fields
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={settings.editorRevisions}
                    onChange={(e) => updateSetting('editorRevisions', e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  Revisions
                </label>
              </div>
            </div>
          </SectionCard>
        </div>

        <SettingsSidebar
          saving={saving}
          onSave={handleSave}
          quickLinks={[
            { label: 'Topic Taxonomies', href: '#topic-taxonomies' },
            { label: 'Topic Custom Post Type Options', href: '#topic-custom-post-type-options' }
          ]}
        />
      </div>
    </div>
  );
}
