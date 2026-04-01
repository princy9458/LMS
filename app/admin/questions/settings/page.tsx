'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { SectionCard, SettingRow, SettingsSidebar, ToggleSwitch } from '@/components/admin/learnDash';

const defaultSettings = {
  questionCategories: true,
  questionCategoryList: [{ id: 'general', name: 'General' }],
  selectedQuestionCategory: 'general',
  questionCategoryName: 'General',
  questionTemplates: [{ id: 'default', name: 'Default Template' }],
  selectedQuestionTemplate: 'default',
  questionTemplateName: 'Default Template'
};

export default function AdminQuestionsSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/questions');
        const data = await res.json();
        if (data.success) {
          const merged = { ...defaultSettings, ...data.data };
          const categories = Array.isArray(merged.questionCategoryList)
            ? merged.questionCategoryList
            : defaultSettings.questionCategoryList;
          const templates = Array.isArray(merged.questionTemplates)
            ? merged.questionTemplates
            : defaultSettings.questionTemplates;
          merged.questionCategoryList = categories;
          merged.questionTemplates = templates;
          if (!merged.selectedQuestionCategory && categories.length > 0) {
            merged.selectedQuestionCategory = categories[0].id;
          }
          if (!merged.selectedQuestionTemplate && templates.length > 0) {
            merged.selectedQuestionTemplate = templates[0].id;
          }
          const selectedCategory = categories.find((cat: any) => cat.id === merged.selectedQuestionCategory);
          merged.questionCategoryName = merged.questionCategoryName || selectedCategory?.name || '';
          const selectedTemplate = templates.find((tpl: any) => tpl.id === merged.selectedQuestionTemplate);
          merged.questionTemplateName = merged.questionTemplateName || selectedTemplate?.name || '';
          setSettings(merged);
        }
      } catch (error) {
        toast.error('Failed to load question settings');
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
      const res = await fetch('/api/settings/questions', {
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

  const categoryOptions = useMemo(() => {
    return Array.isArray(settings.questionCategoryList) ? settings.questionCategoryList : [];
  }, [settings.questionCategoryList]);

  const templateOptions = useMemo(() => {
    return Array.isArray(settings.questionTemplates) ? settings.questionTemplates : [];
  }, [settings.questionTemplates]);

  const handleCategorySelect = (id: string) => {
    const selected = categoryOptions.find((cat: any) => cat.id === id);
    updateSetting('selectedQuestionCategory', id);
    updateSetting('questionCategoryName', selected?.name || '');
  };

  const handleCategoryUpdate = () => {
    const name = settings.questionCategoryName.trim();
    if (!name) {
      toast.error('Enter a category name');
      return;
    }

    const categories = [...categoryOptions];
    const index = categories.findIndex((cat: any) => cat.id === settings.selectedQuestionCategory);

    if (index >= 0) {
      categories[index] = { ...categories[index], name };
    } else {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      categories.push({ id, name });
      updateSetting('selectedQuestionCategory', id);
    }

    updateSetting('questionCategoryList', categories as any);
    toast.success('Category updated');
  };

  const handleCategoryDelete = () => {
    const categories = categoryOptions.filter((cat: any) => cat.id !== settings.selectedQuestionCategory);
    updateSetting('questionCategoryList', categories as any);
    updateSetting('selectedQuestionCategory', categories[0]?.id || '');
    updateSetting('questionCategoryName', categories[0]?.name || '');
  };

  const handleTemplateSelect = (id: string) => {
    const selected = templateOptions.find((tpl: any) => tpl.id === id);
    updateSetting('selectedQuestionTemplate', id);
    updateSetting('questionTemplateName', selected?.name || '');
  };

  const handleTemplateUpdate = () => {
    const name = settings.questionTemplateName.trim();
    if (!name) {
      toast.error('Enter a template name');
      return;
    }

    const templates = [...templateOptions];
    const index = templates.findIndex((tpl: any) => tpl.id === settings.selectedQuestionTemplate);

    if (index >= 0) {
      templates[index] = { ...templates[index], name };
    } else {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      templates.push({ id, name });
      updateSetting('selectedQuestionTemplate', id);
    }

    updateSetting('questionTemplates', templates as any);
    toast.success('Template updated');
  };

  const handleTemplateDelete = () => {
    const templates = templateOptions.filter((tpl: any) => tpl.id !== settings.selectedQuestionTemplate);
    updateSetting('questionTemplates', templates as any);
    updateSetting('selectedQuestionTemplate', templates[0]?.id || '');
    updateSetting('questionTemplateName', templates[0]?.name || '');
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
          <h1 className="text-2xl font-semibold text-zinc-900">Questions</h1>
        </div>
        <Link
          href="/admin/questions/create"
          className="bg-[#2271b1] hover:bg-[#135e96] text-white font-medium px-4 py-2 rounded-md transition text-sm"
        >
          + Add New Question
        </Link>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <Link href="/admin/questions" className="pb-2 hover:text-zinc-900">Questions</Link>
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Settings</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
        <div className="space-y-6">
          <SectionCard
            id="question-taxonomies"
            title="Question Taxonomies"
            description="Control which taxonomies can be used with the LearnDash Quiz questions."
          >
            <SettingRow
              label="Question Categories"
              control={
                <ToggleSwitch
                  checked={settings.questionCategories}
                  onChange={(value) => updateSetting('questionCategories', value)}
                />
              }
            />
            {settings.questionCategories && (
              <div className="border-l border-zinc-200 pl-6 space-y-3">
                <SettingRow
                  label="Category management"
                  control={
                    <select
                      value={settings.selectedQuestionCategory}
                      onChange={(e) => handleCategorySelect(e.target.value)}
                      className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
                    >
                      {categoryOptions.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  }
                />
                <input
                  value={settings.questionCategoryName}
                  onChange={(e) => updateSetting('questionCategoryName', e.target.value)}
                  placeholder="Category name"
                  className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCategoryDelete}
                    className="border border-zinc-300 rounded-md px-3 py-1 text-sm"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={handleCategoryUpdate}
                    className="border border-zinc-300 rounded-md px-3 py-1 text-sm"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            id="question-management"
            title="Global Question Management & Display Settings"
            description="Control which templates can be used to better organize your LearnDash questions."
          >
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-center">
              <select
                value={settings.selectedQuestionTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
              >
                <option value="">Select a template</option>
                {templateOptions.map((tpl: any) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
              <input
                value={settings.questionTemplateName}
                onChange={(e) => updateSetting('questionTemplateName', e.target.value)}
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
        </div>

        <SettingsSidebar
          saving={saving}
          onSave={handleSave}
          quickLinks={[
            { label: 'Question Taxonomies', href: '#question-taxonomies' },
            { label: 'Global Question Management & Display Settings', href: '#question-management' }
          ]}
        />
      </div>
    </div>
  );
}
