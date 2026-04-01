'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { ActionsDropdown } from '@/components/admin/learnDash';

const PAGE_SIZE = 20;

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, lessonsRes, coursesRes] = await Promise.all([
          fetch('/api/topics'),
          fetch('/api/lessons'),
          fetch('/api/courses')
        ]);
        const topicsData = await topicsRes.json();
        const lessonsData = await lessonsRes.json();
        const coursesData = await coursesRes.json();

        if (topicsData.success) setTopics(topicsData.data || []);
        if (lessonsData.success) setLessons(lessonsData.data || []);
        if (coursesData.success) setCourses(coursesData.data || []);
      } catch (error) {
        toast.error('Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const lessonMap = useMemo(() => {
    const map: Record<string, any> = {};
    lessons.forEach((lesson) => {
      map[lesson._id] = lesson;
    });
    return map;
  }, [lessons]);

  const courseMap = useMemo(() => {
    const map: Record<string, any> = {};
    courses.forEach((course) => {
      map[course._id] = course;
    });
    return map;
  }, [courses]);

  const filteredTopics = topics.filter((topic) => {
    const lessonId = topic.lessonId || topic.lesson;
    const lesson = lessonMap[lessonId] || {};
    const courseId = topic.courseId || topic.course || lesson.courseId || lesson.course;
    const courseTitle = courseMap[courseId]?.title || '';

    const titleMatch = topic.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const lessonMatch = lesson?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const courseMatch = courseTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = !searchQuery || titleMatch || lessonMatch || courseMatch;
    const matchesCourse = courseFilter === 'all' || courseId === courseFilter;
    const matchesLesson = lessonFilter === 'all' || lessonId === lessonFilter;

    let matchesDate = true;
    if (dateFilter === 'last7') {
      const date = new Date(topic.createdAt || topic.updatedAt || Date.now());
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      matchesDate = date >= cutoff;
    }
    if (dateFilter === 'last30') {
      const date = new Date(topic.createdAt || topic.updatedAt || Date.now());
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      matchesDate = date >= cutoff;
    }

    return matchesSearch && matchesCourse && matchesLesson && matchesDate;
  });

  const totalItems = filteredTopics.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedTopics = filteredTopics.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [currentPage, page]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pagedTopics.map((topic) => topic._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setTopics((prev) => prev.filter((topic) => topic._id !== id));
      toast.success('Topic deleted');
    } catch (error) {
      toast.error('Failed to delete topic');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClone = async (topic: any) => {
    try {
      const lessonId = topic.lessonId || topic.lesson;
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${topic.title} (Copy)`,
          lessonId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clone topic');
      setTopics((prev) => [data.data, ...prev]);
      toast.success('Topic cloned');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clone topic');
    }
  };

  const handleBulkApply = async () => {
    if (bulkAction !== 'delete' || selectedIds.length === 0) return;
    if (!confirm('Delete selected topics? This cannot be undone.')) return;

    setIsDeleting(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/topics/${id}`, {
            method: 'DELETE'
          })
        )
      );
      setTopics((prev) => prev.filter((topic) => !selectedIds.includes(topic._id)));
      setSelectedIds([]);
      toast.success('Selected topics deleted');
    } catch (error) {
      toast.error('Failed to delete selected topics');
    } finally {
      setIsDeleting(false);
      setBulkAction('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Topics</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/topics/create"
            className="bg-[#2271b1] hover:bg-[#135e96] text-white font-medium px-4 py-2 rounded-md transition text-sm"
          >
            + Add New Topic
          </Link>
          <ActionsDropdown
            items={[
              { label: 'Topic Categories', href: '/admin/topics/categories' },
              { label: 'Topic Tags', href: '/admin/topics/tags' },
              { label: 'Categories', href: '/admin/topics/wp-categories' },
              { label: 'Tags', href: '/admin/topics/wp-tags' }
            ]}
          />
        </div>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Topics</span>
          <Link href="/admin/topics/settings" className="pb-2 hover:text-zinc-900">Settings</Link>
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

          <select
            value={lessonFilter}
            onChange={(e) => setLessonFilter(e.target.value)}
            className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All Lessons</option>
            {lessons.map((lesson) => (
              <option key={lesson._id} value={lesson._id}>
                {lesson.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setDateFilter('all');
              setCourseFilter('all');
              setLessonFilter('all');
            }}
            className="border border-zinc-300 rounded-md px-3 py-1 text-sm"
          >
            Reset
          </button>
          <button type="button" className="border border-zinc-300 rounded-md px-3 py-1 text-sm">
            Filter
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Topics"
                className="border border-zinc-300 rounded-md pl-8 pr-3 py-1 text-sm"
              />
            </div>
            <button className="border border-zinc-300 rounded-md px-3 py-1 text-sm">Search Topics</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === pagedTopics.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Assigned Course</th>
                <th className="px-4 py-3">Assigned Lesson</th>
                <th className="px-4 py-3">Author</th>
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
              ) : pagedTopics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No topics found.
                  </td>
                </tr>
              ) : (
                pagedTopics.map((topic) => {
                  const lessonId = topic.lessonId || topic.lesson;
                  const lesson = lessonMap[lessonId] || {};
                  const courseId = topic.courseId || topic.course || lesson.courseId || lesson.course;
                  const courseTitle = courseMap[courseId]?.title || '-';
                  return (
                    <tr key={topic._id} className="group hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(topic._id)}
                          onChange={() => toggleSelect(topic._id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-blue-600">
                          <Link href={`/admin/topics/${topic._id}/edit`} className="hover:underline">
                            {topic.title}
                          </Link>
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 opacity-0 group-hover:opacity-100 transition">
                          <Link href={`/admin/topics/${topic._id}/edit`} className="hover:underline">
                            Edit
                          </Link>
                          <span className="mx-1">|</span>
                          <Link href={`/admin/topics/${topic._id}/edit`} className="hover:underline">
                            Quick Edit
                          </Link>
                          <span className="mx-1">|</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(topic._id)}
                            className="text-red-600 hover:underline"
                          >
                            Trash
                          </button>
                          <span className="mx-1">|</span>
                          <Link
                            href={courseId && lessonId ? `/courses/${courseId}/lessons/${lessonId}` : '#'}
                            className="hover:underline"
                          >
                            View
                          </Link>
                          <span className="mx-1">|</span>
                          <button type="button" onClick={() => handleClone(topic)} className="hover:underline">
                            Clone
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/courses/${courseId}/edit`} className="text-blue-600 hover:underline">
                          {courseTitle}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/lessons/${lessonId}/edit`} className="text-blue-600 hover:underline">
                          {lesson.title || '-'}
                        </Link>
                      </td>
                      <td className="px-4 py-3">Admin</td>
                      <td className="px-4 py-3">
                        {topic.createdAt
                          ? new Date(topic.createdAt).toLocaleDateString(undefined, {
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
