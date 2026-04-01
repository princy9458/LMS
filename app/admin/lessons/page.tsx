'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { ActionsDropdown } from '@/components/admin/learnDash';
import { translateToHindi } from '@/lib/hindiTranslation';
import { getContentLocale, getLocaleFromPathname, getLocalePath } from '@/lib/i18n';

const PAGE_SIZE = 20;

export default function AdminLessonsPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const contentLocale = getContentLocale(locale);
  const [lessons, setLessons] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, coursesRes] = await Promise.all([
          fetch(`/api/lessons?lang=${contentLocale}`),
          fetch(`/api/courses?lang=${contentLocale}`)
        ]);
        const lessonsData = await lessonsRes.json();
        const coursesData = await coursesRes.json();

        if (coursesData.success) {
          setCourses(coursesData.data || []);
        }
        if (lessonsData.success) {
          setLessons(lessonsData.data || []);
        }
      } catch (error) {
        toast.error('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contentLocale]);

  const courseMap = useMemo(() => {
    const map: Record<string, string> = {};
    courses.forEach((course) => {
      map[course._id] = course.title;
    });
    return map;
  }, [courses]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    lessons.forEach((lesson) => {
      if (lesson.category) set.add(lesson.category);
    });
    return Array.from(set);
  }, [lessons]);

  const filteredLessons = lessons.filter((lesson) => {
    const titleMatch = lesson.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const courseTitle = courseMap[lesson.courseId || lesson.course] || '';
    const courseMatch = courseTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = !searchQuery || titleMatch || courseMatch;
    const matchesCourse = courseFilter === 'all' || (lesson.courseId || lesson.course) === courseFilter;
    const matchesCategory = categoryFilter === 'all' || lesson.category === categoryFilter;

    let matchesDate = true;
    if (dateFilter === 'last7') {
      const date = new Date(lesson.createdAt || lesson.updatedAt || Date.now());
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      matchesDate = date >= cutoff;
    }
    if (dateFilter === 'last30') {
      const date = new Date(lesson.createdAt || lesson.updatedAt || Date.now());
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      matchesDate = date >= cutoff;
    }

    return matchesSearch && matchesCourse && matchesCategory && matchesDate;
  });

  const totalItems = filteredLessons.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedLessons = filteredLessons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pagedLessons.map((lesson) => lesson._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setLessons((prev) => prev.filter((lesson) => lesson._id !== id));
      toast.success('Lesson deleted');
    } catch (error) {
      toast.error('Failed to delete lesson');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClone = async (lesson: any) => {
    try {
      const englishTitle = lesson.titleTranslations?.en || lesson.title || '';
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: {
            en: `${englishTitle} (Copy)`,
            hi: translateToHindi(`${englishTitle} (Copy)`),
            fr: '',
            es: '',
          },
          courseId: lesson.courseId || lesson.course,
          order: (lesson.order || 0) + 1
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clone lesson');
      setLessons((prev) => [data.data, ...prev]);
      toast.success('Lesson cloned');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clone lesson');
    }
  };

  const handleBulkApply = async () => {
    if (bulkAction !== 'delete' || selectedIds.length === 0) return;
    if (!confirm('Delete selected lessons? This cannot be undone.')) return;

    setIsDeleting(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/lessons/${id}`, {
            method: 'DELETE'
          })
        )
      );
      setLessons((prev) => prev.filter((lesson) => !selectedIds.includes(lesson._id)));
      setSelectedIds([]);
      toast.success('Selected lessons deleted');
    } catch (error) {
      toast.error('Failed to delete selected lessons');
    } finally {
      setIsDeleting(false);
      setBulkAction('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Lessons</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={getLocalePath(locale, '/admin/lessons/create')}
            className="bg-[#2271b1] hover:bg-[#135e96] text-white font-medium px-4 py-2 rounded-md transition text-sm"
          >
            + Add New Lesson
          </Link>
          <ActionsDropdown
            items={[
              { label: 'Lesson Categories', href: getLocalePath(locale, '/admin/lessons/categories') },
              { label: 'Lesson Tags', href: getLocalePath(locale, '/admin/lessons/tags') },
              { label: 'Categories', href: getLocalePath(locale, '/admin/lessons/wp-categories') },
              { label: 'Tags', href: getLocalePath(locale, '/admin/lessons/wp-tags') }
            ]}
          />
        </div>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Lessons</span>
          <Link href={getLocalePath(locale, '/admin/lessons/settings')} className="pb-2 hover:text-zinc-900">Settings</Link>
        </nav>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="p-3 border-b border-zinc-200 flex flex-wrap items-center gap-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="">Bulk actions</option>
            <option value="delete">Delete</option>
          </select>
          <button
            type="button"
            onClick={handleBulkApply}
            className="border border-zinc-300 rounded-md px-3 py-1 text-sm"
            disabled={isDeleting}
          >
            Apply
          </button>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All dates</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setDateFilter('all');
              setCategoryFilter('all');
              setCourseFilter('all');
            }}
            className="border border-zinc-300 rounded-md px-3 py-1 text-sm"
          >
            Reset
          </button>
          <button
            type="button"
            className="border border-zinc-300 rounded-md px-3 py-1 text-sm"
          >
            Filter
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Lessons"
                className="border border-zinc-300 rounded-md pl-8 pr-3 py-1 text-sm"
              />
            </div>
            <button className="border border-zinc-300 rounded-md px-3 py-1 text-sm">Search Lessons</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === pagedLessons.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Assigned Course</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Categories</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : pagedLessons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No lessons found.
                  </td>
                </tr>
              ) : (
                pagedLessons.map((lesson) => {
                  const courseId = lesson.courseId || lesson.course;
                  const courseTitle = courseMap[courseId] || '-';
                  return (
                    <tr key={lesson._id} className="group hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(lesson._id)}
                          onChange={() => toggleSelect(lesson._id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-blue-600">
                          <Link href={getLocalePath(locale, `/admin/lessons/${lesson._id}/edit`)} className="hover:underline">
                            {lesson.title}
                          </Link>
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 opacity-0 group-hover:opacity-100 transition">
                          <Link href={getLocalePath(locale, `/admin/lessons/${lesson._id}/edit`)} className="hover:underline">
                            Edit
                          </Link>
                          <span className="mx-1">|</span>
                          <Link href={getLocalePath(locale, `/admin/lessons/${lesson._id}/edit`)} className="hover:underline">
                            Quick Edit
                          </Link>
                          <span className="mx-1">|</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(lesson._id)}
                            className="text-red-600 hover:underline"
                          >
                            Trash
                          </button>
                          <span className="mx-1">|</span>
                          <Link
                            href={courseId ? getLocalePath(locale, `/courses/${courseId}/lessons/${lesson._id}`) : '#'}
                            className="hover:underline"
                          >
                            View
                          </Link>
                          <span className="mx-1">|</span>
                          <button type="button" onClick={() => handleClone(lesson)} className="hover:underline">
                            Clone
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={getLocalePath(locale, `/admin/courses/${courseId}/edit`)} className="text-blue-600 hover:underline">
                          {courseTitle}
                        </Link>
                      </td>
                      <td className="px-4 py-3">Admin</td>
                      <td className="px-4 py-3">-</td>
                      <td className="px-4 py-3">
                        {lesson.createdAt
                          ? new Date(lesson.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-zinc-200 flex items-center justify-end gap-3 text-sm text-zinc-600">
          <span>{totalItems} items</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              className="border border-zinc-300 rounded px-2 py-1 disabled:opacity-50"
            >
              &lt;&lt;
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border border-zinc-300 rounded px-2 py-1 disabled:opacity-50"
            >
              &lt;
            </button>
            <span className="px-2">{currentPage}</span>
            <span className="text-zinc-500">of {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border border-zinc-300 rounded px-2 py-1 disabled:opacity-50"
            >
              &gt;
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              className="border border-zinc-300 rounded px-2 py-1 disabled:opacity-50"
            >
              &gt;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
