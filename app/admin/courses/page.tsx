'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ChevronDown, Loader2, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContentLocale, getLocaleFromPathname, getLocalePath } from '@/lib/i18n';

export default function AdminCoursesPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const contentLocale = getContentLocale(locale);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/courses?lang=${contentLocale}`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [contentLocale]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((course) => {
      if (course.category) set.add(course.category);
    });
    return Array.from(set);
  }, [courses]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCourses.map((course) => course._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkApply = async () => {
    if (bulkAction !== 'delete' || selectedIds.length === 0) return;
    if (!confirm('Delete selected courses? This cannot be undone.')) return;

    setIsDeleting(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/courses/${id}`, {
            method: 'DELETE'
          })
        )
      );
      setCourses((prev) => prev.filter((course) => !selectedIds.includes(course._id)));
      setSelectedIds([]);
      toast.success('Selected courses deleted');
    } catch (error) {
      toast.error('Failed to delete selected courses');
    } finally {
      setIsDeleting(false);
      setBulkAction('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setCourses((prev) => prev.filter((course) => course._id !== id));
      toast.success('Course deleted');
    } catch (error) {
      toast.error('Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Courses</h1>
          <p className="text-sm text-zinc-500">Manage your LearnDash-style course catalog.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={getLocalePath(locale, '/admin/courses/create')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-md transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add New Course
          </Link>
          <button className="border border-zinc-300 text-zinc-700 px-3 py-2 rounded-md text-sm flex items-center gap-2">
            Actions <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <span className="border-b-2 border-blue-600 text-blue-600 pb-2">Courses</span>
          <Link href={getLocalePath(locale, '/admin/courses/settings')} className="pb-2 hover:text-zinc-900">Settings</Link>
          <Link href={getLocalePath(locale, '/admin/courses/shortcodes')} className="pb-2 hover:text-zinc-900">Shortcodes</Link>
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

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Courses"
                className="border border-zinc-300 rounded-md pl-8 pr-3 py-1 text-sm"
              />
            </div>
            <button className="border border-zinc-300 rounded-md px-3 py-1 text-sm">Search Courses</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredCourses.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Price Type</th>
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
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No courses found.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(course._id)}
                        onChange={() => toggleSelect(course._id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center overflow-hidden">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <Link
                            href={getLocalePath(locale, `/admin/courses/${course._id}/edit`)}
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            {course.title}
                          </Link>
                          <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                            <Link href={getLocalePath(locale, `/admin/courses/${course._id}/edit`)} className="hover:underline">
                              Edit
                            </Link>
                            <span>|</span>
                            <Link href={getLocalePath(locale, `/admin/courses/builder/${course._id}`)} className="hover:underline">
                              Builder
                            </Link>
                            <span>|</span>
                            <button onClick={() => handleDelete(course._id)} className="text-red-600 hover:underline">
                              Trash
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{course.priceType || 'Free'}</td>
                    <td className="px-4 py-3">{course.instructorName || 'Admin'}</td>
                    <td className="px-4 py-3">{course.category || '-'}</td>
                    <td className="px-4 py-3">
                      {course.createdAt
                        ? new Date(course.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
