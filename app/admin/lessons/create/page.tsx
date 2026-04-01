'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PlaySquare, AlertCircle, Plus, Loader2, Video, Lock } from 'lucide-react';
import Link from 'next/link';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import { autofillHindiTranslation } from '@/lib/hindiTranslation';
import { getContentLocale, getLocaleFromPathname, getLocalePath } from '@/lib/i18n';

const createLocalizedValues = () =>
  Object.fromEntries(CONTENT_LANGUAGES.map((language) => [language.code, '']));

export default function AdminLessonCreatePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const contentLocale = getContentLocale(locale);
  const adminLessonsPath = getLocalePath(locale, '/admin/lessons');
  const [courses, setCourses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    courseId: '',
    title: createLocalizedValues(),
    videoUrl: '',
    order: 1,
    unlockType: 'completion',
    unlockDays: 0,
    subtitles: Object.fromEntries(SUPPORTED_LANGUAGES.map((language) => [language.code, ''])),
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        videoUrl: formData.videoUrl,
        subtitles: formData.subtitles,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        title: locale === 'en' ? autofillHindiTranslation(nextTitle) : nextTitle,
      };
    });
  };

  const handleSubtitleChange = (locale: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      subtitles: {
        ...prev.subtitles,
        [locale]: value,
      },
    }));
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
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Multilingual Lesson Title</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONTENT_LANGUAGES.map((language) => (
                  <div key={language.code} className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {language.label}
                    </label>
                    <input
                      required={language.code === 'en'}
                      value={formData.title[language.code] || ''}
                      onChange={(e) => handleLocalizedTitleChange(language.code, e.target.value)}
                      placeholder={`Lesson title (${language.label})`}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Video URL <span className="text-zinc-500 font-normal">(YouTube, Vimeo, MP4)</span></label>
              <div className="flex relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <input
                  name="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://youtu.be/..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Subtitle Files</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <div key={language.code} className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {language.label}
                    </label>
                    <input
                      type="url"
                      value={formData.subtitles[language.code] || ''}
                      onChange={(e) => handleSubtitleChange(language.code, e.target.value)}
                      placeholder={`https://example.com/subtitles-${language.code}.vtt`}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                ))}
              </div>
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
