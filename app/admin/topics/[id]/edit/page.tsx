'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Save, Loader2, FileText, LayoutList, BookOpen, Video, PlaySquare } from 'lucide-react';
import toast from 'react-hot-toast';
import RichTopicEditor from '../../_components/RichTopicEditor';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import AdminLocaleSelector from '@/components/admin/AdminLocaleSelector';
import { getStoredAdminContentLocale, normalizeAdminContentLocale, persistAdminContentLocale } from '@/lib/adminLocale';

type QuizOption = { _id: string; title: string };

const createLocalizedValues = (translations: Record<string, string> = {}) =>
  Object.fromEntries(CONTENT_LANGUAGES.map((language) => [language.code, translations[language.code] || '']));

function isValidHttpUrl(value: string) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function toYouTubeEmbedUrl(input: string) {
  if (!input) return '';
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.replace('/', '').trim();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : '';
    }
    if (host.includes('youtube.com')) {
      const videoId = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
    }
    return '';
  } catch {
    return '';
  }
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseResources(value: string) {
  return splitLines(value).map((line) => {
    const [titlePart, urlPart] = line.split('|').map((item) => item.trim());
    if (urlPart) {
      return { title: titlePart, url: urlPart };
    }
    const [maybeTitle, maybeUrl] = line.includes(' - ') ? line.split(' - ').map((item) => item.trim()) : [line, ''];
    return { title: maybeTitle, url: maybeUrl };
  });
}

function toSlug(value: string) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminTopicEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params as { id?: string })?.id;

  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState('en');

  const [formData, setFormData] = useState({
    title: createLocalizedValues(),
    slug: '',
    content: '',
    contentHtml: '',
    courseId: '',
    lessonId: '',
    description: createLocalizedValues(),
    videoUrl: '',
    duration: '',
    keyPoints: '',
    notes: '',
    resources: '',
    codeExample: '',
    summary: createLocalizedValues(),
    quizId: '',
    order: 0,
  });

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const getDisplayTitle = (title: any) => {
    if (typeof title === 'string') return title;
    if (title && typeof title === 'object') return title[activeLocale] || title.en || Object.values(title)[0] || '';
    return '';
  };

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    instructorName: '',
    category: 'Software Engineering',
    difficultyLevel: 'Beginner',
    thumbnail: ''
  });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    order: 1
  });

  useEffect(() => {
    setActiveLocale(getStoredAdminContentLocale() || 'en');
  }, []);

  useEffect(() => {
    persistAdminContentLocale(activeLocale);
  }, [activeLocale]);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        if (!id) throw new Error('Missing topic ID');

        const [topicRes, coursesRes] = await Promise.all([
          fetch(`/api/topics/${id}`),
          fetch('/api/courses')
        ]);
        const quizzesRes = await fetch('/api/quizzes');

        const topicData = await topicRes.json();
        const coursesData = await coursesRes.json();
        const quizzesData = await quizzesRes.json();

        const courseList = coursesData.data ?? coursesData;
        if (Array.isArray(courseList)) {
          setCourses(courseList);
        }
        if (quizzesData.success) setQuizzes(quizzesData.data || []);

        const topic = topicData.data ?? topicData;
        if (!topic?._id) {
          throw new Error(topicData?.error || 'Topic not found');
        }

        let inferredCourseId = '';
        if (topic.lessonId || topic.lesson) {
          const lessonRes = await fetch(`/api/lessons/${topic.lessonId || topic.lesson}`);
          const lessonData = await lessonRes.json();
          const lesson = lessonData.data ?? lessonData;
          inferredCourseId = lesson?.courseId || '';
        }

        const topicTranslations = topic.translations || {};
        const titleTranslations = CONTENT_LANGUAGES.reduce<Record<string, string>>((acc, language) => {
          const val = topicTranslations?.[language.code]?.title || topic.titleTranslations?.[language.code] || topic.title;
          acc[language.code] = typeof val === 'object' ? (val?.[language.code] || val?.en || '') : (val || '');
          return acc;
        }, {});
        const descriptionTranslations = CONTENT_LANGUAGES.reduce<Record<string, string>>((acc, language) => {
          const val = topicTranslations?.[language.code]?.description || topic.descriptionTranslations?.[language.code] || topic.description;
          acc[language.code] = typeof val === 'object' ? (val?.[language.code] || val?.en || '') : (val || '');
          return acc;
        }, {});
        const summaryTranslations = CONTENT_LANGUAGES.reduce<Record<string, string>>((acc, language) => {
          const val = topicTranslations?.[language.code]?.summary || topic.summaryTranslations?.[language.code] || topic.summary;
          acc[language.code] = typeof val === 'object' ? (val?.[language.code] || val?.en || '') : (val || '');
          return acc;
        }, {});

        setFormData({
          title: createLocalizedValues(titleTranslations),
          slug: topic.slug || '',
          content: topic.contentHtml || topic.content || '',
          contentHtml: topic.contentHtml || topic.content || '',
          courseId: inferredCourseId,
          lessonId: topic.lessonId || topic.lesson || '',
          description: createLocalizedValues(descriptionTranslations),
          videoUrl: topic.videoUrl || '',
          duration: topic.duration || '',
          keyPoints: Array.isArray(topic.keyPoints) ? topic.keyPoints.join('\n') : '',
          notes: Array.isArray(topic.notes) ? topic.notes.join('\n') : '',
          resources: Array.isArray(topic.resources)
            ? topic.resources.map((item: any) => `${item.title || ''} | ${item.url || ''}`).join('\n')
            : '',
          codeExample: topic.codeExample || '',
          summary: createLocalizedValues(summaryTranslations),
          quizId: topic.quizId?._id || topic.quizId || topic.quizzes?.[0]?._id || topic.quizzes?.[0] || '',
          order: topic.order || 0,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load topic');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  useEffect(() => {
    if (!formData.courseId) return;
    const fetchLessons = async () => {
      try {
        const res = await fetch(`/api/lessons?courseId=${formData.courseId}`);
        const data = await res.json();
        if (data.success) {
          setLessons(data.data);
        }
      } catch (err) {
        console.error('Failed to load lessons', err);
      }
    };
    fetchLessons();
  }, [formData.courseId]);

  useEffect(() => {
    const embedUrl = toYouTubeEmbedUrl(formData.videoUrl);
    setVideoError(formData.videoUrl && !embedUrl ? 'Please paste a valid YouTube URL.' : null);
  }, [formData.videoUrl]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.lessonId) {
        throw new Error('Please select a lesson');
      }
      if (formData.videoUrl && !isValidHttpUrl(formData.videoUrl)) {
        throw new Error('Please provide a valid video URL');
      }
      const parsedResources = parseResources(formData.resources);
      if (parsedResources.some((resource) => resource.url && !isValidHttpUrl(resource.url))) {
        throw new Error('Please provide valid resource URLs');
      }

      const res = await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug || toSlug(formData.title[activeLocale]),
          content: formData.contentHtml || formData.content,
          contentHtml: formData.contentHtml || formData.content,
          lessonId: formData.lessonId,
          description: formData.description,
          videoUrl: formData.videoUrl,
          duration: Number(formData.duration) || 0,
          keyPoints: splitLines(formData.keyPoints),
          notes: splitLines(formData.notes),
          resources: parsedResources,
          codeExample: formData.codeExample,
          summary: formData.summary,
          quizId: formData.quizId,
          order: Number(formData.order) || 0,
          translations: {
            [activeLocale]: {
              title: formData.title[activeLocale],
              description: formData.description[activeLocale],
              summary: formData.summary[activeLocale],
            }
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update topic');
      }

      toast.success('Topic updated');
      router.push('/admin/topics');
    } catch (err: any) {
      setError(err.message || 'Failed to update topic');
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseChange = (value: string) => {
    if (value === '__add__') {
      setShowCourseModal(true);
      return;
    }
    setFormData((prev) => ({ ...prev, courseId: value, lessonId: '' }));
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: {
        ...prev.title,
        [activeLocale]: value,
      },
      slug: slugEdited ? prev.slug : toSlug(value),
    }));
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
        <Link href="/admin/topics" className="text-zinc-500 hover:text-indigo-600 transition-colors">
          &larr; Back to Topics
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-500" /> Edit Topic
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Update topic details and hierarchy selection.</p>
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              >
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{getDisplayTitle(course.title)}</option>
                ))}
                <option value="__add__">➕ Add New Course</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Lesson</label>
              <select
                value={formData.lessonId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__add__') {
                    setShowLessonModal(true);
                    return;
                  }
                  setFormData((prev) => ({ ...prev, lessonId: value }));
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              >
                {lessons.map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>{getDisplayTitle(lesson.title)}</option>
                ))}
                {formData.courseId && <option value="__add__">➕ Add New Lesson</option>}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <AdminLocaleSelector
                value={activeLocale}
                onChange={(value) => setActiveLocale(normalizeAdminContentLocale(value))}
                completion={CONTENT_LANGUAGES.reduce<Record<string, boolean>>((acc, language) => {
                  acc[language.code] = Boolean(
                    formData.title[language.code]?.trim() ||
                    formData.description[language.code]?.trim() ||
                    formData.summary[language.code]?.trim()
                  );
                  return acc;
                }, {})}
              />
              <label className="text-sm font-semibold text-zinc-900">Topic Description</label>
              <textarea
                name="description"
                value={formData.description[activeLocale]}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: { ...prev.description, [activeLocale]: e.target.value } }))}
                placeholder="A short one-sentence explanation of the topic."
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Quiz</label>
              <select
                name="quizId"
                value={formData.quizId}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              >
                <option value="">No quiz attached</option>
                {quizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id}>{getDisplayTitle(quiz.title)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Sequence Order</label>
              <input
                name="order"
                type="number"
                min="0"
                value={formData.order}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Duration (minutes)</label>
              <input
                name="duration"
                type="number"
                min="0"
                value={formData.duration}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              />
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
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-zinc-900"
                />
              </div>
              {videoError ? <p className="text-sm text-red-600">{videoError}</p> : null}
            </div>

            <div className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Live Video Preview</p>
                  <p className="text-xs text-zinc-500">YouTube links convert automatically to an embed.</p>
                </div>
                <PlaySquare className="h-5 w-5 text-indigo-500" />
              </div>
              {toYouTubeEmbedUrl(formData.videoUrl) ? (
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-black">
                  <iframe
                    src={toYouTubeEmbedUrl(formData.videoUrl)}
                    title="Topic video preview"
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">
                  No video added yet
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Key Points</label>
              <textarea
                name="keyPoints"
                value={formData.keyPoints}
                onChange={handleChange}
                placeholder="One point per line"
                rows={5}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="One note per line"
                rows={5}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Resources</label>
              <textarea
                name="resources"
                value={formData.resources}
                onChange={handleChange}
                placeholder="Resource title | https://example.com"
                rows={4}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Code Example</label>
              <textarea
                name="codeExample"
                value={formData.codeExample}
                onChange={handleChange}
                placeholder="Paste a short code snippet or pseudocode example"
                rows={5}
                className="w-full font-mono bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Summary</label>
              <textarea
                name="summary"
                value={formData.summary[activeLocale]}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: { ...prev.summary, [activeLocale]: e.target.value } }))}
                placeholder="A concise wrap-up of the topic."
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Topic Title</label>
              <input
                name="title"
                required
                value={formData.title[activeLocale]}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
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
                placeholder="introduction-to-hooks"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <RichTopicEditor
                label="Content"
                value={formData.contentHtml || formData.content}
                onChange={(html) => setFormData((prev) => ({ ...prev, content: html, contentHtml: html }))}
                placeholder="Compose a rich learning topic..."
                helperText="This content is rendered on the learner page and can include headings, notes, images, embedded videos, and code."
              />
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/topics')}
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
                onClick={async () => {
                  if (!courseForm.title || !courseForm.description || !courseForm.instructorName) {
                    setError('Title, description, and instructor name are required.');
                    return;
                  }
                  setCourseSubmitting(true);
                  try {
                    const res = await fetch('/api/courses', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(courseForm)
                    });
                    const data = await res.json();
                    const course = data.data ?? data;
                    if (!res.ok || !course?._id) throw new Error(data.error || 'Failed to create course');
                    setCourses((prev) => [course, ...prev]);
                    setFormData((prev) => ({ ...prev, courseId: course._id, lessonId: '' }));
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
                }}
                disabled={courseSubmitting}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl disabled:opacity-70"
              >
                {courseSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Create New Lesson</h3>
            <div className="space-y-3">
              <input
                value={lessonForm.title}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Lesson title"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
              <input
                type="number"
                min="1"
                value={lessonForm.order}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                placeholder="Order"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="px-4 py-2 text-sm border border-zinc-200 rounded-xl text-zinc-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!lessonForm.title || !formData.courseId) {
                    setError('Lesson title and course are required.');
                    return;
                  }
                  setLessonSubmitting(true);
                  try {
                    const res = await fetch('/api/lessons', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        courseId: formData.courseId,
                        title: lessonForm.title,
                        order: lessonForm.order
                      })
                    });
                    const data = await res.json();
                    const lesson = data.data ?? data;
                    if (!res.ok || !lesson?._id) throw new Error(data.error || 'Failed to create lesson');
                    setLessons((prev) => [lesson, ...prev]);
                    setFormData((prev) => ({ ...prev, lessonId: lesson._id }));
                    setShowLessonModal(false);
                    setLessonForm({ title: '', order: 1 });
                  } catch (err: any) {
                    setError(err.message || 'Failed to create lesson');
                  } finally {
                    setLessonSubmitting(false);
                  }
                }}
                disabled={lessonSubmitting}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl disabled:opacity-70"
              >
                {lessonSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
