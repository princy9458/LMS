'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, AlertCircle, Plus, Loader2, FileText, LayoutList, Video, Link2, ListChecks, MessageSquare, PenTool, PlaySquare } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import RichTopicEditor from '../_components/RichTopicEditor';

type QuizOption = { _id: string; title: string };

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

export default function AdminTopicCreatePage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    courseId: '',
    lessonId: '',
    content: '',
    contentHtml: '',
    description: '',
    videoUrl: '',
    duration: '',
    keyPoints: '',
    notes: '',
    resources: '',
    codeExample: '',
    summary: '',
    quizId: '',
    order: 1,
  });
  
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const activeLocale = 'en';

  const getDisplayTitle = (title: any) => {
    if (typeof title === 'string') return title;
    if (title && typeof title === 'object') return title[activeLocale] || title.en || Object.values(title)[0] || '';
    return '';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, lessonsRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/lessons')
        ]);
        const quizzesRes = await fetch('/api/quizzes');
        
        const coursesData = await coursesRes.json();
        const lessonsData = await lessonsRes.json();
        const quizzesData = await quizzesRes.json();
        
        if (coursesData.success) setCourses(coursesData.data || []);
        if (lessonsData.success) setLessons(lessonsData.data || []);
        if (quizzesData.success) setQuizzes(quizzesData.data || []);
      } catch (err) {
        toast.error('Failed to load courses or lessons');
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.courseId) {
      const filtered = lessons.filter(lesson => 
        (lesson.courseId === formData.courseId) || (lesson.course === formData.courseId)
      );
      setFilteredLessons(filtered);
      // Reset lessonId if it's not in the filtered list
      if (!filtered.find(l => l._id === formData.lessonId)) {
        setFormData(prev => ({ ...prev, lessonId: '' }));
      }
    } else {
      setFilteredLessons([]);
      setFormData(prev => ({ ...prev, lessonId: '' }));
    }
  }, [formData.courseId, lessons]);

  useEffect(() => {
    const embedUrl = toYouTubeEmbedUrl(formData.videoUrl);
    setVideoError(formData.videoUrl && !embedUrl ? 'Please paste a valid YouTube URL.' : null);
  }, [formData.videoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.courseId || !formData.lessonId) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.videoUrl && !isValidHttpUrl(formData.videoUrl)) {
      toast.error('Please provide a valid video URL');
      return;
    }

    const parsedResources = parseResources(formData.resources);
    if (parsedResources.some((resource) => resource.url && !isValidHttpUrl(resource.url))) {
      toast.error('Please provide valid resource URLs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const keyPoints = splitLines(formData.keyPoints);
      const notes = splitLines(formData.notes);
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || toSlug(formData.title),
          duration: Number(formData.duration) || 0,
          keyPoints,
          notes,
          resources: parsedResources,
          order: Number(formData.order) || 0,
          quizId: formData.quizId || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create topic');
      }

      toast.success('Topic created successfully');
      router.push('/admin/topics');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'Failed to create topic');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && !slugEdited ? { slug: toSlug(value) } : {}),
    }));
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/topics" className="text-zinc-500 hover:text-indigo-600 transition-colors text-sm font-medium">
          &larr; Back to Topics
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-500" /> Add New Topic
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Create a new learning unit and assign it to a specific lesson within a course.</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Topic Title *</label>
            <input
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Introduction to Hooks"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Slug</label>
            <input
              name="slug"
              value={formData.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setFormData((prev) => ({ ...prev, slug: toSlug(e.target.value) }));
              }}
              placeholder="introduction-to-hooks"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Select Course *</label>
              <div className="relative">
                <LayoutList className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <select
                  name="courseId"

                  required
                  value={formData.courseId}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none"
                >
                  <option value="">Choose a course...</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{getDisplayTitle(course.title)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Select Lesson *</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <select
                  name="lessonId"
                  required
                  value={formData.lessonId}
                  onChange={handleChange}
                  disabled={!formData.courseId}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{formData.courseId ? 'Choose a lesson...' : 'Select a course first'}</option>
                  {filteredLessons.map(lesson => (
                    <option key={lesson._id} value={lesson._id}>{getDisplayTitle(lesson.title)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Topic Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A short one-sentence explanation of the topic."
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Quiz</label>
              <select
                name="quizId"
                value={formData.quizId}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              >
                <option value="">No quiz attached</option>
                {quizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id}>
                    {getDisplayTitle(quiz.title)}
                  </option>
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
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
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
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
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
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
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
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
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
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
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
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
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
                className="w-full font-mono bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Summary</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="A concise wrap-up of the topic."
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <RichTopicEditor
                label="Topic Content"
                value={formData.contentHtml || formData.content}
                onChange={(html) => setFormData((prev) => ({ ...prev, content: html, contentHtml: html }))}
                placeholder="Create a rich lesson with headings, notes, examples, videos, and resources..."
                helperText="The content is saved as rich HTML and rendered directly on the learner page."
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
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Publish Topic</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
