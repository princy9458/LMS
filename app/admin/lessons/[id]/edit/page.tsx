'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { PlaySquare, AlertCircle, Save, Loader2, Video, Lock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import { autofillHindiTranslation, translateToHindi } from '@/lib/hindiTranslation';
import { getContentLocale, getLocaleFromPathname, getLocalePath } from '@/lib/i18n';

const createLocalizedValues = (translations: Record<string, string> = {}) =>
  Object.fromEntries(CONTENT_LANGUAGES.map((language) => [language.code, translations[language.code] || '']));

export default function AdminLessonEditPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const id = (params as { id?: string })?.id;
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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    instructorName: '',
    category: 'Software Engineering',
    difficultyLevel: 'Beginner',
    thumbnail: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (!id) {
          throw new Error('Missing lesson ID');
        }
        const [coursesRes, lessonRes] = await Promise.all([
          fetch(`/api/courses?lang=${contentLocale}`),
          fetch(`/api/lessons/${id}?lang=${contentLocale}`)
        ]);

        const coursesData = await coursesRes.json();
        const lessonData = await lessonRes.json();

        const courseList = coursesData.data ?? coursesData;
        if (Array.isArray(courseList)) {
          setCourses(courseList);
        }

        const lesson = lessonData.data ?? lessonData;
        if (lesson && lesson._id) {
          setFormData({
            courseId: lesson.courseId || '',
            title: createLocalizedValues(lesson.titleTranslations || { en: lesson.title || '' }),
            videoUrl: lesson.videoUrl || '',
            order: lesson.order || 1,
            unlockType: lesson.unlockLogic?.type || 'completion',
            unlockDays: lesson.unlockLogic?.daysFromEnrollment || 0,
            subtitles: Object.fromEntries(
              SUPPORTED_LANGUAGES.map((language) => [language.code, lesson.subtitles?.[language.code] || ''])
            ),
          });
        } else {
          throw new Error('Lesson not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load lesson data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [contentLocale, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!formData.courseId) {
      setError('Please select a parent course.');
      setSaving(false);
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

      const response = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lesson');
      }

      toast.success('Lesson updated');
      router.push(adminLessonsPath);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setSaving(false);
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

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__add__') {
      setShowCourseModal(true);
      return;
    }
    setFormData((prev) => ({ ...prev, courseId: value }));
  };

  const handleCreateCourse = async () => {
    if (!courseForm.title || !courseForm.description || !courseForm.instructorName) {
      setError('Title, description, and instructor name are required.');
      return;
    }
    setCourseSubmitting(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...courseForm,
          title: {
            en: courseForm.title,
            hi: translateToHindi(courseForm.title),
            fr: '',
            es: '',
          },
          description: {
            en: courseForm.description,
            hi: translateToHindi(courseForm.description),
            fr: '',
            es: '',
          },
        })
      });
      const data = await res.json();
      const course = data.data ?? data;
      if (!res.ok || !course?._id) {
        throw new Error(data.error || 'Failed to create course');
      }
      setCourses((prev) => [course, ...prev]);
      setFormData((prev) => ({ ...prev, courseId: course._id }));
      setShowCourseModal(false);
      setCourseForm({
        title: '',
        description: '',
        instructorName: '',
        category: 'Software Engineering',
        difficultyLevel: 'Beginner',
        thumbnail: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    } finally {
      setCourseSubmitting(false);
    }
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
        <Link href={adminLessonsPath} className="text-zinc-500 hover:text-indigo-600 transition-colors">
          &larr; Back to Lessons
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <PlaySquare className="w-6 h-6 text-indigo-500" /> Edit Lesson
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Update {formData.title.en || 'this lesson'} and adjust its unlock criteria.</p>
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
                onChange={handleCourseChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
              >
                {courses.length === 0 && <option value="">No courses available.</option>}
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
                <option value="__add__">➕ Add New Course</option>
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
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Video URL</label>
              <div className="flex relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <input
                  name="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={handleChange}
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
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Create New Course</h3>
            <div className="space-y-3">
              <input
                value={courseForm.title}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Course title"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
                rows={3}
              />
              <input
                value={courseForm.instructorName}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, instructorName: e.target.value }))}
                placeholder="Instructor name"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Marketing">Marketing</option>
                </select>
                <select
                  value={courseForm.difficultyLevel}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, difficultyLevel: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <input
                value={courseForm.thumbnail}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, thumbnail: e.target.value }))}
                placeholder="Thumbnail URL (optional)"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="px-4 py-2 text-sm border border-zinc-200 rounded-xl text-zinc-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCourse}
                disabled={courseSubmitting}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl disabled:opacity-70"
              >
                {courseSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
