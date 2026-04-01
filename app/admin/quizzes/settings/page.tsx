'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { ActionsDropdown, SectionCard, SettingRow, SettingsSidebar, ToggleSwitch } from '@/components/admin/learnDash';

const defaultSettings = {
  quizBuilder: true,
  questionsDisplayed: 20,
  sharedQuizQuestions: false,
  customQuizTimeFormats: false,
  quizTimeFormat: 'F j, Y g:i a',
  quizTemplates: [{ id: 'default', name: 'Default Template' }],
  selectedQuizTemplate: 'default',
  quizTemplateName: 'Default Template',
  adminEmailFromName: '',
  adminEmailFromEmail: '',
  adminEmailMailTo: '',
  adminEmailSubject: '',
  adminEmailMessage: '',
  adminAllowHtml: false,
  userEmailFromName: '',
  userEmailFromEmail: '',
  userEmailMailTo: '',
  userEmailSubject: '',
  userEmailMessage: '',
  userAllowHtml: false,
  quizCategories: true,
  quizTags: true,
  wpCategories: false,
  wpTags: false,
  quizSearch: true,
  quizArchivePage: false,
  editorFeaturedImage: true,
  editorComments: false,
  editorCustomFields: false,
  editorRevisions: true
};

function WysiwygEditor({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [tab, setTab] = useState<'visual' | 'code'>('visual');
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tab === 'visual' && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value, tab]);

  const exec = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
  };

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || '');
  };

  return (
    <div className="border border-zinc-300 rounded-md overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 text-xs text-zinc-600">
        <button
          type="button"
          className="border border-zinc-300 px-2 py-1 rounded text-xs"
        >
          Add Media
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('visual')}
            className={`px-2 py-1 rounded text-xs ${tab === 'visual' ? 'bg-zinc-100 text-zinc-900' : ''}`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setTab('code')}
            className={`px-2 py-1 rounded text-xs ${tab === 'code' ? 'bg-zinc-100 text-zinc-900' : ''}`}
          >
            Code
          </button>
        </div>
      </div>
      {tab === 'visual' ? (
        <div>
          <div className="flex items-center gap-1 border-b border-zinc-200 px-2 py-1 text-xs text-zinc-600">
            <button type="button" onClick={() => exec('bold')} className="px-1.5 py-0.5 rounded hover:bg-zinc-100">B</button>
            <button type="button" onClick={() => exec('italic')} className="px-1.5 py-0.5 rounded hover:bg-zinc-100">I</button>
            <button type="button" onClick={() => exec('underline')} className="px-1.5 py-0.5 rounded hover:bg-zinc-100">U</button>
            <button
              type="button"
              onClick={() => {
                const url = window.prompt('Enter URL');
                if (url) exec('createLink', url);
              }}
              className="px-1.5 py-0.5 rounded hover:bg-zinc-100"
            >
              Link
            </button>
            <button type="button" onClick={() => exec('unlink')} className="px-1.5 py-0.5 rounded hover:bg-zinc-100">Unlink</button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="min-h-[140px] px-3 py-2 text-sm outline-none"
          />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[160px] px-3 py-2 text-sm outline-none"
        />
      )}
    </div>
  );
}

export default function AdminQuizSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/quizzes');
        const data = await res.json();
        if (data.success) {
          const merged = { ...defaultSettings, ...data.data };
          const templateList = Array.isArray(merged.quizTemplates) ? merged.quizTemplates : defaultSettings.quizTemplates;
          merged.quizTemplates = templateList;
          if (!merged.selectedQuizTemplate && templateList.length > 0) {
            merged.selectedQuizTemplate = templateList[0].id;
          }
          const selected = templateList.find((tpl: any) => tpl.id === merged.selectedQuizTemplate);
          merged.quizTemplateName = merged.quizTemplateName || selected?.name || '';
          setSettings(merged);
        }
      } catch (error) {
        toast.error('Failed to load quiz settings');
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
      const res = await fetch('/api/settings/quizzes', {
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

  const quizTemplateOptions = useMemo(() => {
    return Array.isArray(settings.quizTemplates) ? settings.quizTemplates : [];
  }, [settings.quizTemplates]);

  const handleTemplateSelect = (id: string) => {
    const selected = quizTemplateOptions.find((tpl: any) => tpl.id === id);
    updateSetting('selectedQuizTemplate', id);
    updateSetting('quizTemplateName', selected?.name || '');
  };

  const handleTemplateUpdate = () => {
    const name = settings.quizTemplateName.trim();
    if (!name) {
      toast.error('Enter a template name');
      return;
    }

    const templates = [...quizTemplateOptions];
    const index = templates.findIndex((tpl: any) => tpl.id === settings.selectedQuizTemplate);

    if (index >= 0) {
      templates[index] = { ...templates[index], name };
    } else {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      templates.push({ id, name });
      updateSetting('selectedQuizTemplate', id);
    }

    updateSetting('quizTemplates', templates as any);
    toast.success('Template updated');
  };

  const handleTemplateDelete = () => {
    const templates = quizTemplateOptions.filter((tpl: any) => tpl.id !== settings.selectedQuizTemplate);
    updateSetting('quizTemplates', templates as any);
    updateSetting('selectedQuizTemplate', templates[0]?.id || '');
    updateSetting('quizTemplateName', templates[0]?.name || '');
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const formatPreview = new Date().toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Quizzes</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/quizzes/create"
            className="bg-[#2271b1] hover:bg-[#135e96] text-white font-medium px-4 py-2 rounded-md transition text-sm"
          >
            + Add New Quiz
          </Link>
          <ActionsDropdown
            items={[
              { label: 'Quiz Categories', href: '/admin/quizzes/categories' },
              { label: 'Quiz Tags', href: '/admin/quizzes/tags' },
              { label: 'Categories', href: '/admin/quizzes/wp-categories' },
              { label: 'Tags', href: '/admin/quizzes/wp-tags' }
            ]}
          />
        </div>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <Link href="/admin/quizzes" className="pb-2 hover:text-zinc-900">Quizzes</Link>
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Settings</span>
          <Link href="/admin/quizzes/submitted-essays" className="pb-2 hover:text-zinc-900">Submitted Essays</Link>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
        <div className="space-y-6">
          <SectionCard
            id="quiz-management"
            title="Global Quiz Management & Display Settings"
            description="Control settings for quiz creation, and visual organization"
          >
            <SettingRow
              label="Quiz Builder"
              control={
                <ToggleSwitch
                  checked={settings.quizBuilder}
                  onChange={(value) => updateSetting('quizBuilder', value)}
                />
              }
            />
            <SettingRow
              label="Questions displayed"
              control={
                <input
                  type="number"
                  min={1}
                  value={settings.questionsDisplayed}
                  onChange={(e) => updateSetting('questionsDisplayed', Number(e.target.value || 0))}
                  className="border border-zinc-300 rounded-md px-2 py-1 text-sm w-24 text-right"
                />
              }
            />
            <SettingRow
              label="Shared Quiz Questions"
              control={
                <ToggleSwitch
                  checked={settings.sharedQuizQuestions}
                  onChange={(value) => updateSetting('sharedQuizQuestions', value)}
                />
              }
            />
            <SettingRow
              label="Custom Quiz Time Formats"
              control={
                <ToggleSwitch
                  checked={settings.customQuizTimeFormats}
                  onChange={(value) => updateSetting('customQuizTimeFormats', value)}
                />
              }
            />
            <SettingRow
              label="Time Format"
              control={
                <input
                  value={settings.quizTimeFormat}
                  onChange={(e) => updateSetting('quizTimeFormat', e.target.value)}
                  className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
                />
              }
            />
            <div className="text-xs text-zinc-500">Default format: {formatPreview} · {settings.quizTimeFormat}</div>
          </SectionCard>

          <SectionCard id="quiz-template" title="Quiz Template Management">
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-center">
              <select
                value={settings.selectedQuizTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
              >
                <option value="">Select a template</option>
                {quizTemplateOptions.map((tpl: any) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
              <input
                value={settings.quizTemplateName}
                onChange={(e) => updateSetting('quizTemplateName', e.target.value)}
                placeholder="Template name"
                className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTemplateDelete}
                className="border border-zinc-300 rounded-md px-3 py-1 text-sm"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={handleTemplateUpdate}
                className="border border-zinc-300 rounded-md px-3 py-1 text-sm"
              >
                Update
              </button>
            </div>
          </SectionCard>

          <SectionCard id="quiz-email" title="Quiz Email Settings" description="Control the quiz email notification options">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-zinc-900">ADMIN NOTIFICATIONS</div>
                <p className="text-xs text-zinc-500">Manage the email content sent to the admin when a user completes a quiz.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-600">From Name</label>
                    <input
                      value={settings.adminEmailFromName}
                      onChange={(e) => updateSetting('adminEmailFromName', e.target.value)}
                      className="border border-zinc-300 rounded-md px-2 py-1 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-600">From Email</label>
                    <input
                      value={settings.adminEmailFromEmail}
                      onChange={(e) => updateSetting('adminEmailFromEmail', e.target.value)}
                      className="border border-zinc-300 rounded-md px-2 py-1 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-600">Mail To</label>
                    <input
                      value={settings.adminEmailMailTo}
                      onChange={(e) => updateSetting('adminEmailMailTo', e.target.value)}
                      className="border border-zinc-300 rounded-md px-2 py-1 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-600">Subject</label>
                    <input
                      value={settings.adminEmailSubject}
                      onChange={(e) => updateSetting('adminEmailSubject', e.target.value)}
                      className="border border-zinc-300 rounded-md px-2 py-1 text-sm w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
                  <div className="text-xs text-zinc-500 space-y-1">
                    <p className="font-semibold text-zinc-700">Supported variables:</p>
                    <p>$userid - User-ID</p>
                    <p>$username - Username</p>
                    <p>$userlogin - User Login</p>
                    <p>$quizname - Quiz-Name</p>
                    <p>$result - Result in percent</p>
                    <p>$points - Reached points</p>
                    <p>$categories - Category-Overview</p>
                  </div>
                  <WysiwygEditor
                    value={settings.adminEmailMessage}
                    onChange={(value) => updateSetting('adminEmailMessage', value)}
                  />
                </div>
                <SettingRow
                  label="Allow HTML"
                  control={
                    <ToggleSwitch
                      checked={settings.adminAllowHtml}
                      onChange={(value) => updateSetting('adminAllowHtml', value)}
                    />
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-zinc-900">USER NOTIFICATIONS</div>
                <p className="text-xs text-zinc-500">Manage the email content sent to the user when a quiz is completed.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-600">From Name</label>
                    <input
                      value={settings.userEmailFromName}
                      onChange={(e) => updateSetting('userEmailFromName', e.target.value)}
                      className="border border-zinc-300 rounded-md px-2 py-1 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-600">From Email</label>
                    <input
                      value={settings.userEmailFromEmail}
                      onChange={(e) => updateSetting('userEmailFromEmail', e.target.value)}
                      className="border border-zinc-300 rounded-md px-2 py-1 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-600">Mail To</label>
                    <input
                      value={settings.userEmailMailTo}
                      onChange={(e) => updateSetting('userEmailMailTo', e.target.value)}
                      className="border border-zinc-300 rounded-md px-2 py-1 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-600">Subject</label>
                    <input
                      value={settings.userEmailSubject}
                      onChange={(e) => updateSetting('userEmailSubject', e.target.value)}
                      className="border border-zinc-300 rounded-md px-2 py-1 text-sm w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
                  <div className="text-xs text-zinc-500 space-y-1">
                    <p className="font-semibold text-zinc-700">Supported variables:</p>
                    <p>$userid - User-ID</p>
                    <p>$username - Username</p>
                    <p>$userlogin - User Login</p>
                    <p>$quizname - Quiz-Name</p>
                    <p>$result - Result in percent</p>
                    <p>$points - Reached points</p>
                    <p>$categories - Category-Overview</p>
                  </div>
                  <WysiwygEditor
                    value={settings.userEmailMessage}
                    onChange={(value) => updateSetting('userEmailMessage', value)}
                  />
                </div>
                <SettingRow
                  label="Allow HTML"
                  control={
                    <ToggleSwitch
                      checked={settings.userAllowHtml}
                      onChange={(value) => updateSetting('userAllowHtml', value)}
                    />
                  }
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard id="quiz-taxonomies" title="Quiz Taxonomies">
            <SettingRow
              label="Quiz Categories"
              control={
                <ToggleSwitch
                  checked={settings.quizCategories}
                  onChange={(value) => updateSetting('quizCategories', value)}
                />
              }
            />
            <SettingRow
              label="Quiz Tags"
              control={
                <ToggleSwitch
                  checked={settings.quizTags}
                  onChange={(value) => updateSetting('quizTags', value)}
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

          <SectionCard id="quiz-custom-post" title="Quiz Custom Post Type Options">
            <SettingRow
              label="Quiz Search"
              control={
                <ToggleSwitch
                  checked={settings.quizSearch}
                  onChange={(value) => updateSetting('quizSearch', value)}
                />
              }
            />
            <SettingRow
              label="Archive Page"
              control={
                <ToggleSwitch
                  checked={settings.quizArchivePage}
                  onChange={(value) => updateSetting('quizArchivePage', value)}
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
            { label: 'Global Quiz Management & Display Settings', href: '#quiz-management' },
            { label: 'Quiz Email Settings', href: '#quiz-email' },
            { label: 'Quiz Taxonomies', href: '#quiz-taxonomies' },
            { label: 'Quiz Custom Post Type Options', href: '#quiz-custom-post' }
          ]}
        />
      </div>
    </div>
  );
}
