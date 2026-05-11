'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ActionsDropdown } from '@/components/admin/learnDash';

const PAGE_SIZE = 20;

export default function AdminQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [certificateFilter, setCertificateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const activeLocale = 'en';

  const getDisplayTitle = (title: any) => {
    if (typeof title === 'string') return title;
    if (title && typeof title === 'object') return title[activeLocale] || title.en || Object.values(title)[0] || '';
    return '';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, courseRes, lessonRes, topicRes, certRes] = await Promise.all([
          fetch('/api/quizzes'),
          fetch('/api/courses'),
          fetch('/api/lessons'),
          fetch('/api/topics'),
          fetch('/api/certificates')
        ]);

        const quizData = await quizRes.json();
        const courseData = await courseRes.json();
        const lessonData = await lessonRes.json();
        const topicData = await topicRes.json();
        const certData = await certRes.json();

        if (quizData.success) setQuizzes(quizData.data || []);
        if (courseData.success) setCourses(courseData.data || []);
        if (lessonData.success) setLessons(lessonData.data || []);
        if (topicData.success) setTopics(topicData.data || []);
        if (certData.success) setCertificates(certData.data || []);
      } catch (error) {
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const courseMap = useMemo(() => {
    const map: Record<string, string> = {};
    courses.forEach((course) => {
      map[course._id] = getDisplayTitle(course.title);
    });
    return map;
  }, [courses]);

  const lessonMap = useMemo(() => {
    const map: Record<string, string> = {};
    lessons.forEach((lesson) => {
      map[lesson._id] = getDisplayTitle(lesson.title);
    });
    return map;
  }, [lessons]);

  const topicMap = useMemo(() => {
    const map: Record<string, string> = {};
    topics.forEach((topic) => {
      map[topic._id] = getDisplayTitle(topic.title);
    });
    return map;
  }, [topics]);

  const certificateCourseMap = useMemo(() => {
    const map: Record<string, string> = {};
    certificates.forEach((certificate) => {
      if (certificate._id && certificate.courseId) {
        map[certificate._id] = certificate.courseId;
      }
    });
    return map;
  }, [certificates]);

  const filteredQuizzes = quizzes.filter((quiz) => {
    const courseId = quiz.courseId || quiz.course;
    const lessonId = quiz.lessonId || quiz.lesson;
    const topicId = quiz.topicId || quiz.topic;

    const quizTitle = getDisplayTitle(quiz.title);
    const titleMatch = quizTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const courseMatch = (courseMap[courseId] || '').toLowerCase().includes(searchQuery.toLowerCase());
    const lessonMatch = (lessonMap[lessonId] || '').toLowerCase().includes(searchQuery.toLowerCase());
    const topicMatch = (topicMap[topicId] || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = !searchQuery || titleMatch || courseMatch || lessonMatch || topicMatch;

    const matchesCourse = courseFilter === 'all' || courseId === courseFilter;
    const matchesLesson = lessonFilter === 'all' || lessonId === lessonFilter;
    const matchesTopic = topicFilter === 'all' || topicId === topicFilter;

    const certificateCourseId = certificateCourseMap[certificateFilter];
    const matchesCertificate =
      certificateFilter === 'all' || (certificateCourseId && certificateCourseId === courseId);

    let matchesDate = true;
    if (dateFilter === 'last7') {
      const date = new Date(quiz.createdAt || quiz.updatedAt || Date.now());
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      matchesDate = date >= cutoff;
    }
    if (dateFilter === 'last30') {
      const date = new Date(quiz.createdAt || quiz.updatedAt || Date.now());
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      matchesDate = date >= cutoff;
    }

    return matchesSearch && matchesCourse && matchesLesson && matchesTopic && matchesCertificate && matchesDate;
  });

  const totalItems = filteredQuizzes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedQuizzes = filteredQuizzes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pagedQuizzes.map((quiz) => quiz._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setQuizzes((prev) => prev.filter((quiz) => quiz._id !== id));
      toast.success('Quiz deleted');
    } catch (error) {
      toast.error('Failed to delete quiz');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkApply = async () => {
    if (!bulkAction || selectedIds.length === 0) return;

    if (bulkAction === 'edit') {
      if (selectedIds.length !== 1) {
        toast.error('Select a single quiz to edit');
        return;
      }
      router.push(`/admin/quizzes/${selectedIds[0]}/edit`);
      return;
    }

    if (bulkAction === 'trash') {
      if (!confirm('Move selected quizzes to trash?')) return;
      setIsDeleting(true);
      try {
        await Promise.all(selectedIds.map((id) => fetch(`/api/quizzes/${id}`, { method: 'DELETE' })));
        setQuizzes((prev) => prev.filter((quiz) => !selectedIds.includes(quiz._id)));
        setSelectedIds([]);
        toast.success('Selected quizzes deleted');
      } catch (error) {
        toast.error('Failed to delete selected quizzes');
      } finally {
        setIsDeleting(false);
        setBulkAction('');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Quizzes</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/quizzes/create"
            className="bg-[#2271b1] hover:bg-[#135e96] text-white font-medium px-4 py-2 rounded-md transition text-sm"
          >
            + Add New Quiz
          </Link>
          <ActionsDropdown
            items={[
              { label: 'Quiz Categories', href: '/admin/quizzes/categories' },
              { label: 'Quiz Tags', href: '/admin/quizzes/tags' },
              { label: 'Categories', href: '/admin/quizzes/wp-categories' },
              { label: 'Tags', href: '/admin/quizzes/wp-tags' }
            ]}
          />
        </div>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Quizzes</span>
          <Link href="/admin/quizzes/settings" className="pb-2 hover:text-zinc-900">Settings</Link>
          <Link href="/admin/quizzes/submitted-essays" className="pb-2 hover:text-zinc-900">Submitted Essays</Link>
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
            <option value="edit">Edit</option>
            <option value="trash">Move to Trash</option>
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
                {getDisplayTitle(course.title)}
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
                {getDisplayTitle(lesson.title)}
              </option>
            ))}
          </select>

          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All Topics</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>
                {getDisplayTitle(topic.title)}
              </option>
            ))}
          </select>

          <select
            value={certificateFilter}
            onChange={(e) => setCertificateFilter(e.target.value)}
            className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All Certificates</option>
            {certificates.map((certificate) => (
              <option key={certificate._id} value={certificate._id}>
                {certificate.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setDateFilter('all');
              setCourseFilter('all');
              setLessonFilter('all');
              setTopicFilter('all');
              setCertificateFilter('all');
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
                placeholder="Search Quizzes"
                className="border border-zinc-300 rounded-md pl-8 pr-3 py-1 text-sm"
              />
            </div>
            <button className="border border-zinc-300 rounded-md px-3 py-1 text-sm">Search Quizzes</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === pagedQuizzes.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Shortcode</th>
                <th className="px-4 py-3">Assigned Course</th>
                <th className="px-4 py-3">Assigned Lesson / Topic</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : pagedQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    No quizzes found.
                  </td>
                </tr>
              ) : (
                pagedQuizzes.map((quiz) => {
                  const courseId = quiz.courseId || quiz.course;
                  const lessonId = quiz.lessonId || quiz.lesson;
                  const topicId = quiz.topicId || quiz.topic;
                  const courseTitle = courseMap[courseId] || '-';
                  const lessonTitle = lessonMap[lessonId] || '';
                  const topicTitle = topicMap[topicId] || '';
                  const assignedLabel = topicTitle || lessonTitle || '-';

                  return (
                    <tr key={quiz._id} className="group hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(quiz._id)}
                          onChange={() => toggleSelect(quiz._id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-blue-600">
                          <Link href={`/admin/quizzes/${quiz._id}/edit`} className="hover:underline">
                            {getDisplayTitle(quiz.title)}
                          </Link>
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 opacity-0 group-hover:opacity-100 transition">
                          <Link href={`/admin/quizzes/${quiz._id}/edit`} className="hover:underline">
                            Edit
                          </Link>
                          <span className="mx-1">|</span>
                          <Link href={`/admin/quizzes/${quiz._id}/edit`} className="hover:underline">
                            Quick Edit
                          </Link>
                          <span className="mx-1">|</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(quiz._id)}
                            className="text-red-600 hover:underline"
                          >
                            Trash
                          </button>
                          <span className="mx-1">|</span>
                          <Link
                            href={`/admin/quizzes/builder/${quiz._id}`}
                            className="hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        <div>{`[ld_quiz quiz_id="${quiz._id}"]`}</div>
                        <div>{`[ld_adv_quiz_toplist ${quiz._id}]`}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/courses/${courseId}/edit`} className="text-blue-600 hover:underline">
                          {courseTitle}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {assignedLabel !== '-' ? (
                          <span className="text-blue-600">{assignedLabel}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3">Admin</td>
                      <td className="px-4 py-3">
                        {quiz.createdAt
                          ? new Date(quiz.createdAt).toLocaleDateString(undefined, {
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
