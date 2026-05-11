'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, AlertCircle, Plus, Loader2, Image as ImageIcon, Trash2, Zap } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import AdminLocaleSelector from '@/components/admin/AdminLocaleSelector';
import { autofillHindiTranslation } from '@/lib/hindiTranslation';
import { getLocaleFromPathname, getLocalePath } from '@/lib/i18n';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';

const createLocalizedValues = () =>
  Object.fromEntries(CONTENT_LANGUAGES.map((language) => [language.code, '']));

const toSlug = (value: string) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function AdminCourseCreatePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale: activeLocale, setLocale } = useAdminLocale();
  const locale = getLocaleFromPathname(pathname);
  const adminCoursesPath = getLocalePath(locale, '/admin/courses');
  
  const [formData, setFormData] = useState({
    title: createLocalizedValues(),
    slug: '',
    description: createLocalizedValues(),
    instructorName: '',
    instructorId: '65f01234567890abcdef1234', // Mock instructor
    thumbnail: '',
    category: 'Software Engineering',
    difficulty: 'Beginner',
    totalLessons: 0,
    skillsEarned: '',
    attributes: [] as { key: string; value: Record<string, string> }[],
  });
  const [slugEdited, setSlugEdited] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const skillsArray = formData.skillsEarned
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const payload = {
        ...formData,
        slug: formData.slug || toSlug(formData.title.en || ''),
        skillsEarned: skillsArray,
        totalLessons: parseInt(formData.totalLessons.toString()) || 0,
        attributes: formData.attributes
      };

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create course');
      }

      toast.success('Course created successfully');
      router.push(adminCoursesPath);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
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
        slug: field === 'title' && locale === 'en' && !slugEdited ? toSlug(value) : prev.slug,
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

  const handleThumbnailFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: typeof reader.result === 'string' ? reader.result : prev.thumbnail,
      }));
    };
    reader.readAsDataURL(file);
  };

  const activeLanguage = CONTENT_LANGUAGES.find((language) => language.code === activeLocale) || CONTENT_LANGUAGES[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={adminCoursesPath} className="text-zinc-500 hover:text-indigo-600 transition-colors">
          &larr; Back to Courses
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-500" /> Assemble New Course
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Configure metadata, assign instructors, and set difficulty for your new learning module.</p>
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
              <AdminLocaleSelector
                value={activeLocale}
                onChange={(value) => setLocale(value)}
              />
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 space-y-3 transition-all duration-300">
                <p className="text-sm font-semibold text-zinc-900">{activeLanguage.label}</p>
                <input
                  required={activeLocale === 'en'}
                  value={formData.title[activeLocale] || ''}
                  onChange={(e) => handleLocalizedChange('title', activeLocale, e.target.value)}
                  placeholder={`Course title (${activeLanguage.label})`}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                />
                <textarea
                  required={activeLocale === 'en'}
                  rows={3}
                  value={formData.description[activeLocale] || ''}
                  onChange={(e) => handleLocalizedChange('description', activeLocale, e.target.value)}
                  placeholder={`Course description (${activeLanguage.label})`}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
                <p className="text-xs text-zinc-500">Missing locales automatically fall back to English on the learner side.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Instructor Name</label>
              <input
                name="instructorName"
                value={formData.instructorName}
                onChange={handleChange}
                placeholder="e.g. Sarah Drasner"
                required
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Slug</label>
              <input
                name="slug"
                value={formData.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setFormData((prev) => ({ ...prev, slug: toSlug(e.target.value) }));
                }}
                placeholder="ai-machine-learning"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
              />
              <p className="text-xs text-zinc-500">Auto-generated from the English title unless you override it here.</p>
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
              <label className="text-sm font-semibold text-zinc-900">Initial Total Lessons</label>
              <input
                name="totalLessons"
                type="number"
                min="0"
                value={formData.totalLessons}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-zinc-900">Course Thumbnail</label>
                <span className="text-xs text-zinc-500">Image only, used for preview cards.</span>
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-3">
                  <div className="flex relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input
                      name="thumbnail"
                      type="url"
                      value={formData.thumbnail}
                      onChange={handleChange}
                      placeholder="Paste an image URL"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition">
                    <Plus className="w-4 h-4" />
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleThumbnailFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 min-h-[140px]">
                  {formData.thumbnail ? (
                    <img src={formData.thumbnail} alt="Course thumbnail preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-[140px] items-center justify-center px-4 text-center text-sm text-zinc-500">
                      Thumbnail preview will appear here
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Skills Earned <span className="font-normal text-zinc-500">(comma separated)</span></label>
              <input
                name="skillsEarned"
                value={formData.skillsEarned}
                onChange={handleChange}
                placeholder="React, TypeScript, Next.js"
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
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 flex items-center gap-1">
                          {activeLanguage.label}
                        </label>
                        <input
                          value={attr.value[activeLocale] || ''}
                          onChange={(e) => handleAttributeValueChange(index, activeLocale, e.target.value)}
                          placeholder={`Value in ${activeLanguage.label}`}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                        />
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
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Publish Course</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
