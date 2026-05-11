'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  PlaySquare, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy
} from 'lucide-react';
import Link from 'next/link';
import { getContentLocale, getLocaleFromPathname, getLocalePath } from '@/lib/i18n';
import toast from 'react-hot-toast';

export default function AdminLessonsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const contentLocale = getContentLocale(locale);
  const adminLessonsPath = getLocalePath(locale, '/admin/lessons');
  
  const [lessons, setLessons] = useState<any[]>([]);
  const [courseMap, setCourseMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getDisplayTitle = (title: any) => {
    if (typeof title === 'string') return title;
    if (title && typeof title === 'object') return title[contentLocale] || title.en || Object.values(title)[0] || '';
    return '';
  };

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const [lessonsRes, coursesRes] = await Promise.all([
        fetch(`/api/lms/lessons?lang=${contentLocale}`),
        fetch(`/api/lms/courses?lang=${contentLocale}`)
      ]);
      
      const lessonsData = await lessonsRes.json();
      const coursesData = await coursesRes.json();
      
      if (lessonsData.success) {
        setLessons(lessonsData.data);
      }
      
      if (coursesData.success) {
        const cmap: Record<string, any> = {};
        coursesData.data.forEach((c: any) => {
          cmap[c._id] = c;
        });
        setCourseMap(cmap);
      }
    } catch (err) {
      console.error('Failed to fetch lessons', err);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [contentLocale]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      const res = await fetch(`/api/lms/lessons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Lesson deleted');
        setLessons(prev => prev.filter(l => l._id !== id));
      } else {
        toast.error(data.error || 'Failed to delete lesson');
      }
    } catch (err) {
      toast.error('An error occurred while deleting');
    }
  };

  const handleClone = async (lesson: any) => {
    try {
      const payload = {
        ...lesson,
        title: { en: `${getDisplayTitle(lesson.title)} (Copy)` },
        slug: `${lesson.slug}-copy-${Date.now().toString().slice(-4)}`,
        _id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      };
      
      const res = await fetch('/api/lms/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Lesson cloned');
        fetchLessons();
      } else {
        toast.error(data.error || 'Failed to clone lesson');
      }
    } catch (err) {
      toast.error('An error occurred while cloning');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredLessons = lessons.filter(lesson => {
    const lessonTitle = getDisplayTitle(lesson.title);
    const courseTitle = getDisplayTitle(courseMap[lesson.courseId || lesson.course]?.title);
    return lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
           courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const pagedLessons = filteredLessons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <PlaySquare className="w-6 h-6 text-indigo-500" /> Lesson Management
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Organize and configure learning content for your courses.</p>
        </div>
        <Link 
          href={getLocalePath(locale, '/admin/lessons/create')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm shrink-0 justify-center"
        >
          <Plus className="w-4 h-4" /> Assemble Lesson
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-50/50">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by title or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-all">
              <Filter className="w-4 h-4" /> Filter
            </button>
            {selectedIds.length > 0 && (
              <button className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium hover:bg-red-100 transition-all">
                Delete ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-4 py-3 w-10">
                  <input 
                    type="checkbox" 
                    onChange={(e) => setSelectedIds(e.target.checked ? pagedLessons.map(l => l._id) : [])}
                    checked={selectedIds.length === pagedLessons.length && pagedLessons.length > 0}
                  />
                </th>
                <th className="px-4 py-3">Lesson Details</th>
                <th className="px-4 py-3">Parent Course</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                    <p className="text-zinc-500 mt-2">Loading lessons...</p>
                  </td>
                </tr>
              ) : pagedLessons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-zinc-300" />
                      <p>No lessons found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedLessons.map((lesson) => {
                  const courseId = lesson.courseId || lesson.course;
                  const courseEntry = courseMap[courseId] || {};
                  const courseTitle = getDisplayTitle(courseEntry.title) || '-';
                  return (
                    <tr key={lesson._id} className="group hover:bg-zinc-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <input 
                          type="checkbox"
                          checked={selectedIds.includes(lesson._id)}
                          onChange={() => toggleSelect(lesson._id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                          <Link href={getLocalePath(locale, `/admin/lessons/${lesson._id}/edit`)}>
                            {getDisplayTitle(lesson.title)}
                          </Link>
                        </div>
                        {lesson.description && (
                          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1 max-w-xs">
                            {getDisplayTitle(lesson.description)}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                          <Link href={getLocalePath(locale, `/admin/lessons/${lesson._id}/edit`)} className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700">
                            Edit
                          </Link>
                          <span className="text-zinc-300 text-[10px]">•</span>
                          <button 
                            onClick={() => handleClone(lesson)}
                            className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-indigo-600"
                          >
                            Clone
                          </button>
                          <span className="text-zinc-300 text-[10px]">•</span>
                          <button 
                            onClick={() => handleDelete(lesson._id)}
                            className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600"
                          >
                            Trash
                          </button>
                          <span className="text-zinc-300 text-[10px]">•</span>
                          <Link 
                            href={getLocalePath(locale, `/courses/${courseEntry.slug || courseId}/${lesson.slug || lesson._id}`)}
                            target="_blank"
                            className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-indigo-600 flex items-center gap-0.5"
                          >
                            View <ExternalLink size={8} />
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Link 
                          href={getLocalePath(locale, `/admin/courses/${courseId}/edit`)}
                          className="text-zinc-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                        >
                          <div className="w-2 h-2 rounded-full bg-indigo-400" />
                          {courseTitle}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-zinc-100 text-zinc-600 text-xs font-bold">
                          {lesson.order}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-100">
                          <div className="w-1 h-1 rounded-full bg-emerald-600" />
                          Published
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="p-2 hover:bg-zinc-100 rounded-lg transition-all text-zinc-400 hover:text-zinc-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 bg-zinc-50/30 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Showing <span className="font-semibold text-zinc-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-zinc-900">{Math.min(currentPage * itemsPerPage, filteredLessons.length)}</span> of <span className="font-semibold text-zinc-900">{filteredLessons.length}</span> results
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
