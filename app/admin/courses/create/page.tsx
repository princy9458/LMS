'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, AlertCircle, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import { autofillHindiTranslation } from '@/lib/hindiTranslation';
import { getLocaleFromPathname, getLocalePath } from '@/lib/i18n';

const createLocalizedValues = () =>
  Object.fromEntries(CONTENT_LANGUAGES.map((language) => [language.code, '']));

export default function AdminCourseCreatePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const adminCoursesPath = getLocalePath(locale, '/admin/courses');
  
  const [formData, setFormData] = useState({
    title: createLocalizedValues(),
    description: createLocalizedValues(),
    instructorName: '',
    instructorId: '65f01234567890abcdef1234', // Mock instructor
    thumbnail: '',
    category: 'Software Engineering',
    difficulty: 'Beginner',
    totalLessons: 0,
    skillsEarned: '',
  });
  
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
        skillsEarned: skillsArray,
        totalLessons: parseInt(formData.totalLessons.toString()) || 0
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
        [field]: locale === 'en' ? autofillHindiTranslation(nextFieldValue) : nextFieldValue,
      };
    });
  };

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
              <label className="text-sm font-semibold text-zinc-900">Multilingual Course Metadata</label>
              <div className="grid grid-cols-1 gap-4">
                {CONTENT_LANGUAGES.map((language) => (
                  <div key={language.code} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 space-y-3">
                    <p className="text-sm font-semibold text-zinc-900">{language.label}</p>
                    <input
                      required={language.code === 'en'}
                      value={formData.title[language.code]}
                      onChange={(e) => handleLocalizedChange('title', language.code, e.target.value)}
                      placeholder={`Course title (${language.label})`}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                    <textarea
                      required={language.code === 'en'}
                      rows={3}
                      value={formData.description[language.code]}
                      onChange={(e) => handleLocalizedChange('description', language.code, e.target.value)}
                      placeholder={`Course description (${language.label})`}
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
                placeholder="e.g. Sarah Drasner"
                required
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

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Thumbnail URL</label>
              <div className="flex relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <input
                  name="thumbnail"
                  type="url"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
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
