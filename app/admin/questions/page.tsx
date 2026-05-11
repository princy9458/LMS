'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 20;

const typeLabels: Record<string, string> = {
  single: 'Single choice',
  multiple: 'Multiple choice',
  boolean: 'True / False',
  short: 'Free choice'
};

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [quizFilter, setQuizFilter] = useState('all');
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
        const [questionRes, quizRes] = await Promise.all([
          fetch('/api/questions'),
          fetch('/api/quizzes')
        ]);

        const questionData = await questionRes.json();
        const quizData = await quizRes.json();

        if (questionData.success) setQuestions(questionData.data || []);
        if (quizData.success) setQuizzes(quizData.data || []);
      } catch (error) {
        toast.error('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quizMap = useMemo(() => {
    const map: Record<string, string> = {};
    quizzes.forEach((quiz) => {
      map[quiz._id] = getDisplayTitle(quiz.title);
    });
    return map;
  }, [quizzes]);

  const questionTypes = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((question) => {
      if (question.type) set.add(question.type);
    });
    return Array.from(set);
  }, [questions]);

  const filteredQuestions = questions.filter((question) => {
    const quizId = question.quizId || question.quiz;
    const title = question.text || question.questionText || '';
    const titleMatch = title.toLowerCase().includes(searchQuery.toLowerCase());
    const quizMatch = (quizMap[quizId] || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = !searchQuery || titleMatch || quizMatch;

    const matchesType = typeFilter === 'all' || question.type === typeFilter;
    const matchesQuiz = quizFilter === 'all' || quizId === quizFilter;

    let matchesDate = true;
    if (dateFilter === 'last7') {
      const date = new Date(question.createdAt || question.updatedAt || Date.now());
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      matchesDate = date >= cutoff;
    }
    if (dateFilter === 'last30') {
      const date = new Date(question.createdAt || question.updatedAt || Date.now());
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      matchesDate = date >= cutoff;
    }

    return matchesSearch && matchesType && matchesQuiz && matchesDate;
  });

  const totalItems = filteredQuestions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedQuestions = filteredQuestions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pagedQuestions.map((question) => question._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setQuestions((prev) => prev.filter((question) => question._id !== id));
      toast.success('Question deleted');
    } catch (error) {
      toast.error('Failed to delete question');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkApply = async () => {
    if (!bulkAction || selectedIds.length === 0) return;

    if (bulkAction === 'edit') {
      if (selectedIds.length !== 1) {
        toast.error('Select a single question to edit');
        return;
      }
      router.push(`/admin/questions/${selectedIds[0]}/edit`);
      return;
    }

    if (bulkAction === 'trash') {
      if (!confirm('Move selected questions to trash?')) return;
      setIsDeleting(true);
      try {
        await Promise.all(selectedIds.map((id) => fetch(`/api/questions/${id}`, { method: 'DELETE' })));
        setQuestions((prev) => prev.filter((question) => !selectedIds.includes(question._id)));
        setSelectedIds([]);
        toast.success('Selected questions deleted');
      } catch (error) {
        toast.error('Failed to delete selected questions');
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
          <h1 className="text-2xl font-semibold text-zinc-900">Questions</h1>
        </div>
        <Link
          href="/admin/questions/create"
          className="bg-[#2271b1] hover:bg-[#135e96] text-white font-medium px-4 py-2 rounded-md transition text-sm"
        >
          + Add New Question
        </Link>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Questions</span>
          <Link href="/admin/questions/settings" className="pb-2 hover:text-zinc-900">Settings</Link>
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All Question Types</option>
            {questionTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type] || type}
              </option>
            ))}
          </select>

          <select
            value={quizFilter}
            onChange={(e) => setQuizFilter(e.target.value)}
            className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All Quizzes</option>
            {quizzes.map((quiz) => (
              <option key={quiz._id} value={quiz._id}>
                {getDisplayTitle(quiz.title)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setDateFilter('all');
              setTypeFilter('all');
              setQuizFilter('all');
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
                placeholder="Search Questions"
                className="border border-zinc-300 rounded-md pl-8 pr-3 py-1 text-sm"
              />
            </div>
            <button className="border border-zinc-300 rounded-md px-3 py-1 text-sm">Search Questions</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === pagedQuestions.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Assigned Quiz</th>
                <th className="px-4 py-3">Question Category</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : pagedQuestions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                    No questions found.
                  </td>
                </tr>
              ) : (
                pagedQuestions.map((question) => {
                  const quizId = question.quizId || question.quiz;
                  const title = question.text || question.questionText || 'Untitled question';
                  return (
                    <tr key={question._id} className="group hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(question._id)}
                          onChange={() => toggleSelect(question._id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-blue-600">
                          <Link href={`/admin/questions/${question._id}/edit`} className="hover:underline">
                            {title}
                          </Link>
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 opacity-0 group-hover:opacity-100 transition">
                          <Link href={`/admin/questions/${question._id}/edit`} className="hover:underline">
                            Edit
                          </Link>
                          <span className="mx-1">|</span>
                          <Link href={`/admin/questions/${question._id}/edit`} className="hover:underline">
                            Quick Edit
                          </Link>
                          <span className="mx-1">|</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(question._id)}
                            className="text-red-600 hover:underline"
                          >
                            Trash
                          </button>
                          <span className="mx-1">|</span>
                          <Link href={`/admin/questions/${question._id}/edit`} className="hover:underline">
                            View
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3">{typeLabels[question.type] || question.type || '-'}</td>
                      <td className="px-4 py-3">{question.points ?? 0}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/quizzes/${quizId}/edit`} className="text-blue-600 hover:underline">
                          {quizMap[quizId] || '-'}
                        </Link>
                      </td>
                      <td className="px-4 py-3">-</td>
                      <td className="px-4 py-3">Admin</td>
                      <td className="px-4 py-3">
                        {question.createdAt
                          ? new Date(question.createdAt).toLocaleDateString(undefined, {
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
