'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Save, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTopicEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params as { id?: string })?.id;

  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    courseId: '',
    lessonId: ''
  });

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
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
    const fetchTopic = async () => {
      try {
        if (!id) throw new Error('Missing topic ID');

        const [topicRes, coursesRes] = await Promise.all([
          fetch(`/api/topics/${id}`),
          fetch('/api/courses')
        ]);

        const topicData = await topicRes.json();
        const coursesData = await coursesRes.json();

        const courseList = coursesData.data ?? coursesData;
        if (Array.isArray(courseList)) {
          setCourses(courseList);
        }

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

        setFormData({
          title: topic.title || '',
          content: topic.content || '',
          courseId: inferredCourseId,
          lessonId: topic.lessonId || topic.lesson || ''
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.lessonId) {
        throw new Error('Please select a lesson');
      }

      const res = await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          lessonId: formData.lessonId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update topic');
      }

      toast.success('Topic updated');
      router.push('/admin/topics');
    } catch (err: any) {
      setError(err.message || 'Failed to update topic');
      setSaving(false);
    }
  };

  const handleCourseChange = (value: string) => {
    if (value === '__add__') {
      setShowCourseModal(true);
      return;
    }
    setFormData((prev) => ({ ...prev, courseId: value, lessonId: '' }));
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
                  <option key={course._id} value={course._id}>{course.title}</option>
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
                  <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                ))}
                {formData.courseId && <option value="__add__">➕ Add New Lesson</option>}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Topic Title</label>
              <input
                name="title"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Content</label>
              <textarea
                name="content"
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
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
