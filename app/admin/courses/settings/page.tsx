'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ChevronDown, Loader2 } from 'lucide-react';

const mockPages = [
  { id: 'page-1', title: 'Course Completion' },
  { id: 'page-2', title: 'Student Dashboard' },
  { id: 'page-3', title: 'My Certificates' },
  { id: 'page-4', title: 'Learning Hub' }
];

const defaultSettings = {
  courseBuilderEnabled: true,
  stepsDisplayed: 20,
  sharedCourseSteps: false,
  courseTablePagination: true,
  markIncompleteEnabled: false,
  completionPageId: 'page-1',
  automaticProgression: false,
  taxCourseCategories: true,
  taxCourseTags: true,
  taxWpCategories: false,
  taxWpTags: true,
  courseSearch: true,
  archivePageEnabled: true,
  archiveUrl: '/courses',
  rssFeed: false,
  editorFeaturedImage: true,
  editorComments: false,
  editorCustomFields: false,
  editorRevisions: true
};

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

function ToggleSwitch({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full border transition ${
        checked ? 'bg-blue-600 border-blue-600' : 'bg-zinc-200 border-zinc-300'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
};

function SelectDropdown({ value, onChange, options }: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm pr-8"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
    </div>
  );
}

type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-md">
      <div className="px-4 py-3 border-b border-zinc-200">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

type RowProps = {
  label: string;
  helper?: string;
  control: React.ReactNode;
};

function SettingRow({ label, helper, control }: RowProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-zinc-800">{label}</p>
        {helper && <p className="text-xs text-zinc-500 mt-1">{helper}</p>}
      </div>
      <div className="md:min-w-[220px] flex justify-end">{control}</div>
    </div>
  );
}

export default function AdminCoursesSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/course');
        const data = await res.json();
        if (data.success) {
          setSettings({ ...defaultSettings, ...data.data });
        }
      } catch (error) {
        toast.error('Failed to load course settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const pageOptions = useMemo(
    () => mockPages.map((page) => ({ label: page.title, value: page.id })),
    []
  );

  const updateSetting = (key: keyof typeof defaultSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/course', {
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
          <h1 className="text-2xl font-semibold text-zinc-900">Course Settings</h1>
          <p className="text-sm text-zinc-500">Configure global course options.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Options
        </button>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <Link href="/admin/courses" className="pb-2 hover:text-zinc-900">Courses</Link>
          <span className="border-b-2 border-blue-600 text-blue-600 pb-2">Settings</span>
          <Link href="/admin/courses/shortcodes" className="pb-2 hover:text-zinc-900">Shortcodes</Link>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
        <div className="space-y-6">
          <SectionCard
            title="Global Course Management & Display Settings"
            description="Control settings for course creation, and visual organization"
          >
            <SettingRow
              label="Course Builder"
              control={
                <ToggleSwitch
                  checked={settings.courseBuilderEnabled}
                  onChange={(value) => updateSetting('courseBuilderEnabled', value)}
                />
              }
            />
            <SettingRow
              label="Steps Displayed"
              helper="per page"
              control={
                <input
                  type="number"
                  min={1}
                  value={settings.stepsDisplayed}
                  onChange={(e) => updateSetting('stepsDisplayed', Number(e.target.value))}
                  className="w-24 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm"
                />
              }
            />
            <SettingRow
              label="Shared Course Steps"
              control={
                <ToggleSwitch
                  checked={settings.sharedCourseSteps}
                  onChange={(value) => updateSetting('sharedCourseSteps', value)}
                />
              }
            />
            <SettingRow
              label="Course Table Pagination"
              control={
                <ToggleSwitch
                  checked={settings.courseTablePagination}
                  onChange={(value) => updateSetting('courseTablePagination', value)}
                />
              }
            />
            <SettingRow
              label="Mark Incomplete Enabled"
              control={
                <ToggleSwitch
                  checked={settings.markIncompleteEnabled}
                  onChange={(value) => updateSetting('markIncompleteEnabled', value)}
                />
              }
            />
          </SectionCard>

          <SectionCard title="Global Course Completion Page">
            <SettingRow
              label="Completion Page"
              control={
                <SelectDropdown
                  value={settings.completionPageId}
                  onChange={(value) => updateSetting('completionPageId', value)}
                  options={pageOptions}
                />
              }
            />
          </SectionCard>

          <SectionCard title="Automatic Progression">
            <SettingRow
              label="Enable Automatic Progression"
              helper="Enabling this setting does not meet accessibility standards"
              control={
                <ToggleSwitch
                  checked={settings.automaticProgression}
                  onChange={(value) => updateSetting('automaticProgression', value)}
                />
              }
            />
          </SectionCard>

          <SectionCard
            title="Course Taxonomies"
            description="Control which taxonomies can be used to better organize your LearnDash course."
          >
            <SettingRow
              label="Course Categories"
              helper="Manage Course Categories via the Actions dropdown"
              control={
                <ToggleSwitch
                  checked={settings.taxCourseCategories}
                  onChange={(value) => updateSetting('taxCourseCategories', value)}
                />
              }
            />
            <SettingRow
              label="Course Tags"
              helper="Manage Course Tags via the Actions dropdown"
              control={
                <ToggleSwitch
                  checked={settings.taxCourseTags}
                  onChange={(value) => updateSetting('taxCourseTags', value)}
                />
              }
            />
            <SettingRow
              label="WP Post Categories"
              helper="Manage WP Categories via the Actions dropdown"
              control={
                <ToggleSwitch
                  checked={settings.taxWpCategories}
                  onChange={(value) => updateSetting('taxWpCategories', value)}
                />
              }
            />
            <SettingRow
              label="WP Post Tags"
              helper="Manage WP Tags via the Actions dropdown"
              control={
                <ToggleSwitch
                  checked={settings.taxWpTags}
                  onChange={(value) => updateSetting('taxWpTags', value)}
                />
              }
            />
          </SectionCard>

          <SectionCard title="Course Custom Post Type Options">
            <SettingRow
              label="Course Search"
              control={
                <ToggleSwitch
                  checked={settings.courseSearch}
                  onChange={(value) => updateSetting('courseSearch', value)}
                />
              }
            />
            <SettingRow
              label="Archive Page"
              helper="Archive URL"
              control={
                <div className="flex items-center gap-3">
                  <ToggleSwitch
                    checked={settings.archivePageEnabled}
                    onChange={(value) => updateSetting('archivePageEnabled', value)}
                  />
                  <input
                    value={settings.archiveUrl}
                    readOnly
                    className="w-56 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500"
                  />
                </div>
              }
            />
            <SettingRow
              label="RSS/Atom Feed"
              control={
                <ToggleSwitch
                  checked={settings.rssFeed}
                  onChange={(value) => updateSetting('rssFeed', value)}
                />
              }
            />
          </SectionCard>

          <SectionCard title="Editor Supported Settings">
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
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-md">
            <div className="px-4 py-3 border-b border-zinc-200">
              <h3 className="text-sm font-semibold text-zinc-900">Save Options</h3>
            </div>
            <div className="p-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
