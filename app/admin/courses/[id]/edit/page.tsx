'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { BookOpen, AlertCircle, Save, Loader2, Image as ImageIcon, Trash2, Zap, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import { autofillHindiTranslation } from '@/lib/hindiTranslation';
import { getContentLocale, getLocaleFromPathname, getLocalePath } from '@/lib/i18n';

const createLocalizedValues = (translations: Record<string, string> = {}) =>
  Object.fromEntries(
    CONTENT_LANGUAGES.map((language) => [language.code, translations[language.code] || ''])
  );

type Attribute = { key: string; value: Record<string, string> };

export default function AdminCourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const id = (params as { id?: string })?.id;
  const locale = getLocaleFromPathname(pathname);
  const contentLocale = getContentLocale(locale);
  const adminCoursesPath = getLocalePath(locale, '/admin/courses');

  const [formData, setFormData] = useState({
    title: createLocalizedValues(),
    description: createLocalizedValues(),
    instructorName: '',
    thumbnail: '',
    category: 'Software Engineering',
    difficulty: 'Beginner',
    totalLessons: 0,
    skillsEarned: '',
    attributes: [] as Attribute[],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!id) {
          throw new Error('Missing course ID');
        }

        const res = await fetch(`/api/courses/${id}?lang=${contentLocale}`);
        const data = await res.json();

        const course = data?.data ?? data;
        if (res.ok && course?._id) {
          const titleTranslations = course.titleTranslations || { en: course.title || '' };
          const descriptionTranslations = course.descriptionTranslations || { en: course.description || '' };
          setFormData({
            title: createLocalizedValues(titleTranslations),
            description: createLocalizedValues(descriptionTranslations),
            instructorName: course.instructorName || '',
            thumbnail: course.thumbnail || '',
            category: course.category || 'Software Engineering',
            difficulty: course.difficulty || 'Beginner',
            totalLessons: course.totalLessons || 0,
            skillsEarned: course.skillsEarned ? course.skillsEarned.join(', ') : '',
            attributes: Array.isArray(course.attributes) ? course.attributes.map((attr: any) => ({
              key: attr.key,
              value: createLocalizedValues(attr.value)
            })) : [],
          });
        } else {
          throw new Error(data?.error || 'Course not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [contentLocale, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const skillsArray = formData.skillsEarned
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const payload = {
        ...formData,
        skillsEarned: skillsArray,
        totalLessons: parseInt(formData.totalLessons.toString()) || 0,
        attributes: formData.attributes
      };

      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update course');
      }

      toast.success('Course updated');
      router.push(adminCoursesPath);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocalizedChange = (
    field: 'title' | 'description',
    locale: (typeof CONTENT_LANGUAGES)[number]['code'],
    value: string
  ) => {
    setFormData((prev) => {
      const nextFieldValue = {
        ...prev[field],
        [locale]: value,
      };

      return {
        ...prev,
        [field]: locale === 'en' ? autofillHindiTranslation(nextFieldValue) : nextFieldValue,
      };
    });
  };

  const handleAddAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { key: '', value: createLocalizedValues() }]
    }));
  };

  const handleRemoveAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const handleAttributeKeyChange = (index: number, key: string) => {
    setFormData(prev => {
      const newAttributes = [...prev.attributes];
      newAttributes[index].key = key;
      return { ...prev, attributes: newAttributes };
    });
  };

  const handleAttributeValueChange = (index: number, locale: string, value: string) => {
    setFormData(prev => {
      const newAttributes = [...prev.attributes];
      newAttributes[index].value[locale] = value;
      return { ...prev, attributes: newAttributes };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={adminCoursesPath} className="text-zinc-500 hover:text-indigo-600 transition-colors">
          &larr; Back to Courses
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-500" /> Edit Course
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Modify metadata and content configuration for {formData.title.en || 'this module'}.</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Multilingual Course Metadata</label>
              <div className="grid grid-cols-1 gap-4">
                {CONTENT_LANGUAGES.map((language) => (
                  <div key={language.code} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 space-y-3">
                    <p className="text-sm font-semibold text-zinc-900">{language.label}</p>
                    <input
                      required={language.code === 'en'}
                      value={formData.title[language.code]}
                      onChange={(e) => handleLocalizedChange('title', language.code, e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                    <textarea
                      required={language.code === 'en'}
                      rows={3}
                      value={formData.description[language.code]}
                      onChange={(e) => handleLocalizedChange('description', language.code, e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Instructor Name</label>
              <input
                name="instructorName"
                value={formData.instructorName}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Productivity">Productivity</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Difficulty Level</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Total Lessons</label>
              <input
                name="totalLessons"
                type="number"
                min="0"
                value={formData.totalLessons}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Thumbnail URL</label>
              <div className="flex relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <input
                  name="thumbnail"
                  type="url"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Skills Earned</label>
              <input
                name="skillsEarned"
                value={formData.skillsEarned}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-4 md:col-span-2 pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Course Attributes
                  </label>
                  <p className="text-xs text-zinc-500 font-normal">Add custom metadata like Duration, Prerequisites, or Certification type.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Attribute
                </button>
              </div>

              {formData.attributes.length > 0 ? (
                <div className="space-y-4">
                  {formData.attributes.map((attr, index) => (
                    <div key={index} className="rounded-2xl border border-zinc-200 bg-zinc-50/40 p-5 space-y-4 relative overflow-hidden group">
                      <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
                        <input
                          placeholder="Attribute Name (e.g. Duration)"
                          value={attr.key}
                          onChange={(e) => handleAttributeKeyChange(index, e.target.value)}
                          className="bg-transparent border-none p-0 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 focus:ring-0 w-full"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(index)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {CONTENT_LANGUAGES.map((language) => (
                          <div key={language.code} className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 flex items-center gap-1">
                              {language.label}
                            </label>
                            <input
                              value={attr.value[language.code]}
                              onChange={(e) => handleAttributeValueChange(index, language.code, e.target.value)}
                              placeholder={`Value in ${language.label}`}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center bg-zinc-50/30">
                  <p className="text-sm text-zinc-500">No custom attributes added yet. Click "Add Attribute" to begin.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 flex justify-end">
            <button
              type="button"
              onClick={() => router.push(adminCoursesPath)}
              className="px-6 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
