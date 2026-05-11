'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PlaySquare, AlertCircle, Plus, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import AdminLocaleSelector from '@/components/admin/AdminLocaleSelector';
import { autofillHindiTranslation } from '@/lib/hindiTranslation';
import { getContentLocale, getLocaleFromPathname, getLocalePath } from '@/lib/i18n';
import { getLocaleCompletion } from '@/lib/adminLocale';
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

export default function AdminLessonCreatePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const contentLocale = getContentLocale(locale);
  const adminLessonsPath = getLocalePath(locale, '/admin/lessons');
  const { locale: activeLocale, setLocale } = useAdminLocale();
  const [courses, setCourses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    courseId: '',
    title: createLocalizedValues(),
    description: createLocalizedValues(),
    slug: '',
    order: 1,
    unlockType: 'completion',
    unlockDays: 0,
  });
  const [slugEdited, setSlugEdited] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeLanguage = CONTENT_LANGUAGES.find((language) => language.code === activeLocale) || CONTENT_LANGUAGES[0];

  const getDisplayTitle = (title: any) => {
    if (typeof title === 'string') return title;
    if (title && typeof title === 'object') return title[contentLocale] || title.en || Object.values(title)[0] || '';
    return '';
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch(`/api/lms/courses?lang=${contentLocale}`);
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
          if (data.data.length > 0) {
            setFormData(prev => ({ ...prev, courseId: data.data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setFetchingCourses(false);
      }
    };
    loadCourses();
  }, [contentLocale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.courseId) {
      setError('Please select a course for this lesson.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        courseId: formData.courseId,
        title: formData.title,
        description: formData.description,
        slug: formData.slug || toSlug(formData.title.en || ''),
        order: parseInt(formData.order.toString()) || 1,
        unlockLogic: {
          type: formData.unlockType,
          daysFromEnrollment: parseInt(formData.unlockDays.toString()) || 0,
        }
      };

      const response = await fetch('/api/lms/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create lesson');
      }

      router.push(adminLessonsPath);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocalizedTitleChange = (
    locale: (typeof CONTENT_LANGUAGES)[number]['code'],
    value: string
  ) => {
    setFormData((prev) => {
      const nextTitle = {
        ...prev.title,
        [locale]: value,
      };

      return {
        ...prev,
        slug: locale === 'en' && !slugEdited ? toSlug(value) : prev.slug,
        title: locale === 'en' ? autofillHindiTranslation(nextTitle) : nextTitle,
      };
    });
  };

  const handleLocalizedDescriptionChange = (
    locale: (typeof CONTENT_LANGUAGES)[number]['code'],
    value: string
  ) => {
    setFormData((prev) => {
      const nextDescription = {
        ...prev.description,
        [locale]: value,
      };

      return {
        ...prev,
        description: locale === 'en' ? autofillHindiTranslation(nextDescription) : nextDescription,
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={adminLessonsPath} className="text-zinc-500 hover:text-indigo-600 transition-colors">
          &larr; Back to Lessons
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <PlaySquare className="w-6 h-6 text-indigo-500" /> Assemble New Lesson
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Upload video content and configure progression access logic.</p>
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
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Parent Course</label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                disabled={fetchingCourses}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium disabled:opacity-50"
              >
                {fetchingCourses ? (
                  <option>Loading courses...</option>
                ) : courses.length === 0 ? (
                  <option value="">No courses available. Create a course first.</option>
                ) : (
                  courses.map(course => (
                    <option key={course._id} value={course._id}>{getDisplayTitle(course.title)}</option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <AdminLocaleSelector
                value={activeLocale}
                onChange={setLocale}
                completion={getLocaleCompletion(formData.title)}
              />
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Lesson Title ({activeLanguage.label})</label>
                  <input
                    required={activeLocale === 'en'}
                    value={formData.title[activeLocale] || ''}
                    onChange={(e) => handleLocalizedTitleChange(activeLocale, e.target.value)}
                    placeholder={`Lesson title (${activeLanguage.label})`}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Lesson Description ({activeLanguage.label})</label>
                  <textarea
                    required={activeLocale === 'en'}
                    value={formData.description[activeLocale] || ''}
                    onChange={(e) => handleLocalizedDescriptionChange(activeLocale, e.target.value)}
                    placeholder="Write a short summary about this lesson..."
                    rows={4}
                    maxLength={500}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                      {(formData.description[activeLocale] || '').length}/500 characters
                    </span>
                  </div>
                </div>
              </div>
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
                placeholder="introduction-to-ai"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Lesson Sequence Order</label>
              <input
                name="order"
                type="number"
                min="1"
                required
                value={formData.order}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Content Unlock Type</label>
              <div className="flex relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <select
                  name="unlockType"
                  value={formData.unlockType}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                >
                  <option value="completion">Completion Based Next-Unlock</option>
                  <option value="time">Time Delayed (Drip Content)</option>
                </select>
              </div>
            </div>

            {formData.unlockType === 'time' && (
              <div className="space-y-2 md:col-span-2 bg-amber-50 rounded-xl p-4 border border-amber-200/50">
                <label className="text-sm font-semibold text-amber-900">Unlock After (Days from Enrollment)</label>
                <input
                  name="unlockDays"
                  type="number"
                  min="0"
                  value={formData.unlockDays}
                  onChange={handleChange}
                  className="w-full mt-2 bg-white border border-amber-200 rounded-xl px-4 py-3 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
                <p className="text-xs text-amber-700 mt-2">
                  This lesson will automatically unlock exactly {formData.unlockDays || 0} days after a student enrolls in the parent course.
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-zinc-200 flex justify-end">
            <button
              type="button"
              onClick={() => router.push(adminLessonsPath)}
              className="px-6 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchingCourses}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Create Lesson</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
