'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { ActionsDropdown, SectionCard, SettingRow, SettingsSidebar, ToggleSwitch } from '@/components/admin/learnDash';

const defaultSettings = {
  lessonCategories: true,
  lessonTags: true,
  wpCategories: true,
  wpTags: true,
  lessonSearch: true,
  loggedInOnly: false,
  enrolledOnly: false,
  archivePage: false,
  editorFeaturedImage: true,
  editorComments: false,
  editorCustomFields: false,
  editorRevisions: true
};

export default function AdminLessonsSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/lessons');
        const data = await res.json();
        if (data.success) {
          setSettings({ ...defaultSettings, ...data.data });
        }
      } catch (error) {
        toast.error('Failed to load lesson settings');
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
      const res = await fetch('/api/settings/lessons', {
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
          <h1 className="text-2xl font-semibold text-zinc-900">Lessons</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/lessons/create"
            className="bg-[#2271b1] hover:bg-[#135e96] text-white font-medium px-4 py-2 rounded-md transition text-sm"
          >
            + Add New Lesson
          </Link>
          <ActionsDropdown
            items={[
              { label: 'Lesson Categories', href: '/admin/lessons/categories' },
              { label: 'Lesson Tags', href: '/admin/lessons/tags' },
              { label: 'Categories', href: '/admin/lessons/wp-categories' },
              { label: 'Tags', href: '/admin/lessons/wp-tags' }
            ]}
          />
        </div>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <Link href="/admin/lessons" className="pb-2 hover:text-zinc-900">Lessons</Link>
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Settings</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
        <div className="space-y-6">
          <SectionCard
            id="lesson-taxonomies"
            title="Lesson Taxonomies"
            description="Control which taxonomies can be used to better organize your LearnDash lessons."
          >
            <SettingRow
              label="Lesson Categories"
              helper="Manage Lesson Categories via the Actions dropdown"
              control={
                <ToggleSwitch
                  checked={settings.lessonCategories}
                  onChange={(value) => updateSetting('lessonCategories', value)}
                />
              }
            />
            <SettingRow
              label="Lesson Tags"
              helper="Manage Lesson Tags via the Actions dropdown"
              control={
                <ToggleSwitch
                  checked={settings.lessonTags}
                  onChange={(value) => updateSetting('lessonTags', value)}
                />
              }
            />
            <SettingRow
              label="WP Post Categories"
              helper="Manage WP Categories via the Actions dropdown"
              control={
                <ToggleSwitch
                  checked={settings.wpCategories}
                  onChange={(value) => updateSetting('wpCategories', value)}
                />
              }
            />
            <SettingRow
              label="WP Post Tags"
              helper="Manage WP Tags via the Actions dropdown"
              control={
                <ToggleSwitch
                  checked={settings.wpTags}
                  onChange={(value) => updateSetting('wpTags', value)}
                />
              }
            />
          </SectionCard>

          <SectionCard
            id="lesson-custom-post-type-options"
            title="Lesson Custom Post Type Options"
            description="Control options specific to the Lessons post type"
          >
            <SettingRow
              label="Lesson Search"
              control={
                <ToggleSwitch
                  checked={settings.lessonSearch}
                  onChange={(value) => updateSetting('lessonSearch', value)}
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
            { label: 'Lesson Taxonomies', href: '#lesson-taxonomies' },
            { label: 'Lesson Custom Post Type Options', href: '#lesson-custom-post-type-options' }
          ]}
        />
      </div>
    </div>
  );
}
