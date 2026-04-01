'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { ActionsDropdown } from '@/components/admin/learnDash';

export default function QuizSubmittedEssaysPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [courseRes, lessonRes, topicRes, quizRes, questionRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/lessons'),
          fetch('/api/topics'),
          fetch('/api/quizzes'),
          fetch('/api/questions')
        ]);

        const courseData = await courseRes.json();
        const lessonData = await lessonRes.json();
        const topicData = await topicRes.json();
        const quizData = await quizRes.json();
        const questionData = await questionRes.json();

        if (courseData.success) setCourses(courseData.data || []);
        if (lessonData.success) setLessons(lessonData.data || []);
        if (topicData.success) setTopics(topicData.data || []);
        if (quizData.success) setQuizzes(quizData.data || []);
        if (questionData.success) setQuestions(questionData.data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

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
          <Link href="/admin/quizzes" className="pb-2 hover:text-zinc-900">Quizzes</Link>
          <Link href="/admin/quizzes/settings" className="pb-2 hover:text-zinc-900">Settings</Link>
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Submitted Essays</span>
        </nav>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="p-3 border-b border-zinc-200 flex flex-wrap items-center gap-2">
          <select className="border border-zinc-300 rounded-md px-2 py-1 text-sm">
            <option>All Authors</option>
          </select>
          <select className="border border-zinc-300 rounded-md px-2 py-1 text-sm">
            <option>All Groups</option>
          </select>
          <select className="border border-zinc-300 rounded-md px-2 py-1 text-sm">
            <option>All Courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
          <select className="border border-zinc-300 rounded-md px-2 py-1 text-sm">
            <option>All Lessons</option>
            {lessons.map((lesson) => (
              <option key={lesson._id} value={lesson._id}>
                {lesson.title}
              </option>
            ))}
          </select>
          <select className="border border-zinc-300 rounded-md px-2 py-1 text-sm">
            <option>All Topics</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>
                {topic.title}
              </option>
            ))}
          </select>
          <select className="border border-zinc-300 rounded-md px-2 py-1 text-sm">
            <option>All Quizzes</option>
            {quizzes.map((quiz) => (
              <option key={quiz._id} value={quiz._id}>
                {quiz.title}
              </option>
            ))}
          </select>
          <select className="border border-zinc-300 rounded-md px-2 py-1 text-sm">
            <option>All Questions</option>
            {questions.map((question) => (
              <option key={question._id} value={question._id}>
                {question.text || question.questionText}
              </option>
            ))}
          </select>
          <button type="button" className="border border-zinc-300 rounded-md px-3 py-1 text-sm">Reset</button>
          <button type="button" className="border border-zinc-300 rounded-md px-3 py-1 text-sm">Filter</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3">Essay Question Title</th>
                <th className="px-4 py-3">Submitted By</th>
                <th className="px-4 py-3">Status / Points</th>
                <th className="px-4 py-3">Assigned Quiz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-zinc-500">
                    Submitted Essay Not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
