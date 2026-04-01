'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, AlertCircle, Plus, Loader2, FileText, LayoutList } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminTopicCreatePage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    lessonId: '',
    content: ''
  });
  
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, lessonsRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/lessons')
        ]);
        
        const coursesData = await coursesRes.json();
        const lessonsData = await lessonsRes.json();
        
        if (coursesData.success) setCourses(coursesData.data || []);
        if (lessonsData.success) setLessons(lessonsData.data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.courseId || !formData.lessonId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create topic');
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
                    <option key={course._id} value={course._id}>{course.title}</option>
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
                    <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Topic Content</label>
            <textarea
              name="content"
              rows={8}
              value={formData.content}
              onChange={handleChange}
              placeholder="Explain the concepts of this topic in detail..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
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
