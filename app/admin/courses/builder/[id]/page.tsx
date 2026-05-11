'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  GripVertical,
  HelpCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2
} from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { skeletonStyles } from '@/plugins/lms/utils/skeletons';

type SortableRowProps = {
  id: string;
  children: React.ReactNode;
};

function SortableRow({ id, children }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="absolute left-2 top-4 text-zinc-400">
        <button
          type="button"
          className="cursor-grab rounded-md p-1 hover:bg-zinc-100"
          {...attributes}
          {...listeners}
          aria-label="Drag handle"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>
      <div className="pl-8">{children}</div>
    </div>
  );
}

export default function CourseBuilderPage() {
  const routeParams = useParams();
  const router = useRouter();
  const courseId = (routeParams?.id as string) || '';

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [topicsByLesson, setTopicsByLesson] = useState<Record<string, any[]>>({});
  const [quizzesByTopic, setQuizzesByTopic] = useState<Record<string, any[]>>({});
  const [questionsByQuiz, setQuestionsByQuiz] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [expandedQuizzes, setExpandedQuizzes] = useState<Record<string, boolean>>({});
  const [addingLesson, setAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [activeTopicLessonId, setActiveTopicLessonId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [topicSubmitting, setTopicSubmitting] = useState(false);
  const [activeQuizTopicId, setActiveQuizTopicId] = useState<string | null>(null);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [activeQuestionQuizId, setActiveQuestionQuizId] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const activeLocale = 'en';

  const getDisplayTitle = (title: any) => {
    if (typeof title === 'string') return title;
    if (title && typeof title === 'object') return title[activeLocale] || title.en || Object.values(title)[0] || '';
    return '';
  };

  useEffect(() => {
    if (courseId) {
      fetchStructure();
    }
  }, [courseId]);

  const fetchStructure = async () => {
    try {
      console.log('Course ID:', courseId);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      const [courseRes, lessonsRes] = await Promise.all([
        fetch(`${baseUrl}/api/courses/${courseId}`, { cache: 'no-store' }),
        fetch(`/api/lessons?courseId=${courseId}`)
      ]);

      const courseData = await courseRes.json();
      const lessonsData = await lessonsRes.json();
      console.log('API response:', courseData);

      const resolvedCourse = courseData?.data ?? courseData;
      if (!courseRes.ok || !resolvedCourse?._id) {
        throw new Error(courseData?.error || 'Course not found');
      }

      setCourse(resolvedCourse);
      setLessons(lessonsData.data || []);

      const topicsMap: Record<string, any[]> = {};
      const quizzesMap: Record<string, any[]> = {};
      const questionsMap: Record<string, any[]> = {};

      await Promise.all(
        (lessonsData.data || []).map(async (lesson: any) => {
          const topicsRes = await fetch(`/api/topics?lessonId=${lesson._id}`);
          const topicsData = await topicsRes.json();
          topicsMap[lesson._id] = topicsData.data || [];

          await Promise.all(
            (topicsData.data || []).map(async (topic: any) => {
              const quizRes = await fetch(`/api/quizzes?topicId=${topic._id}`);
              const quizData = await quizRes.json();
              const quizzes = quizData.data || [];
              quizzesMap[topic._id] = quizzes;

              await Promise.all(
                quizzes.map(async (quiz: any) => {
                  const questionsRes = await fetch(`/api/questions?quizId=${quiz._id}`);
                  const questionsData = await questionsRes.json();
                  questionsMap[quiz._id] = questionsData.data || [];
                })
              );
            })
          );
        })
      );

      setTopicsByLesson(topicsMap);
      setQuizzesByTopic(quizzesMap);
      setQuestionsByQuiz(questionsMap);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load course structure');
    } finally {
      setLoading(false);
    }
  };

  const topicCount = useMemo(
    () => Object.values(topicsByLesson).reduce((sum, list) => sum + list.length, 0),
    [topicsByLesson]
  );

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const toggleQuiz = (quizId: string) => {
    setExpandedQuizzes((prev) => ({ ...prev, [quizId]: !prev[quizId] }));
  };

  const handleLessonDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLessons((prev) => {
      const oldIndex = prev.findIndex((lesson) => lesson._id === active.id);
      const newIndex = prev.findIndex((lesson) => lesson._id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);

      fetch('/api/lessons/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessons: reordered.map((lesson, index) => ({
            id: lesson._id,
            order: index + 1
          }))
        })
      }).catch(() => {});

      return reordered;
    });
  };

  const handleTopicDragEnd = async (lessonId: string, event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTopicsByLesson((prev) => {
      const list = prev[lessonId] || [];
      const oldIndex = list.findIndex((topic) => topic._id === active.id);
      const newIndex = list.findIndex((topic) => topic._id === over.id);
      const reordered = arrayMove(list, oldIndex, newIndex);

      fetch('/api/topics/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: reordered.map((topic, index) => ({
            id: topic._id,
            order: index + 1
          }))
        })
      }).catch(() => {});

      return { ...prev, [lessonId]: reordered };
    });
  };

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) return;
    setLessonSubmitting(true);
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title: newLessonTitle,
          order: lessons.length + 1
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add lesson');
      setLessons((prev) => [...prev, data.data]);
      setNewLessonTitle('');
      setAddingLesson(false);
      toast.success('Lesson added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add lesson');
    } finally {
      setLessonSubmitting(false);
    }
  };

  const handleAddTopic = async (lessonId: string) => {
    if (!newTopicTitle.trim()) return;
    setTopicSubmitting(true);
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          title: newTopicTitle,
          content: newTopicContent
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add topic');
      setTopicsByLesson((prev) => ({
        ...prev,
        [lessonId]: [...(prev[lessonId] || []), data.data]
      }));
      setNewTopicTitle('');
      setNewTopicContent('');
      setActiveTopicLessonId(null);
      toast.success('Topic added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add topic');
    } finally {
      setTopicSubmitting(false);
    }
  };

  const handleAddQuiz = async (topicId: string, lessonId: string) => {
    if (!newQuizTitle.trim()) return;
    setQuizSubmitting(true);
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newQuizTitle,
          courseId,
          lessonId,
          topicId,
          passingMarks: 1
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add quiz');
      setQuizzesByTopic((prev) => ({
        ...prev,
        [topicId]: [...(prev[topicId] || []), data.data]
      }));
      setNewQuizTitle('');
      setActiveQuizTopicId(null);
      toast.success('Quiz added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add quiz');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleAddQuestion = async (quizId: string) => {
    if (!newQuestionText.trim()) return;
    setQuestionSubmitting(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          text: newQuestionText
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add question');
      setQuestionsByQuiz((prev) => ({
        ...prev,
        [quizId]: [...(prev[quizId] || []), data.data]
      }));
      setNewQuestionText('');
      setActiveQuestionQuizId(null);
      toast.success('Question added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add question');
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete lesson');
      setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
      setTopicsByLesson((prev) => {
        const copy = { ...prev };
        delete copy[lessonId];
        return copy;
      });
      toast.success('Lesson deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete lesson');
    }
  };

  const handleDeleteTopic = async (topicId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    try {
      const res = await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete topic');
      setTopicsByLesson((prev) => ({
        ...prev,
        [lessonId]: (prev[lessonId] || []).filter((topic) => topic._id !== topicId)
      }));
      setQuizzesByTopic((prev) => {
        const copy = { ...prev };
        delete copy[topicId];
        return copy;
      });
      toast.success('Topic deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete topic');
    }
  };

  const handleDeleteQuiz = async (quizId: string, topicId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete quiz');
      setQuizzesByTopic((prev) => ({
        ...prev,
        [topicId]: (prev[topicId] || []).filter((quiz) => quiz._id !== quizId)
      }));
      toast.success('Quiz deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete quiz');
    }
  };

  const handleDeleteQuestion = async (questionId: string, quizId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/questions/${questionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete question');
      setQuestionsByQuiz((prev) => ({
        ...prev,
        [quizId]: (prev[quizId] || []).filter((question) => question._id !== questionId)
      }));
      toast.success('Question deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-20 px-6 space-y-4">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
             <div className="h-8 w-64 bg-zinc-200 animate-pulse rounded-lg"></div>
             <div className="h-4 w-32 bg-zinc-100 animate-pulse rounded-lg"></div>
          </div>
          <div className="h-10 w-32 bg-zinc-200 animate-pulse rounded-lg"></div>
        </div>
        {[1, 2, 3, 4].map(i => <div key={i} className={skeletonStyles.row} />)}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto mt-20 px-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center">
          <p className="text-zinc-600 font-medium">Course not found</p>
          <button
            onClick={() => router.push('/admin/courses')}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 rounded-full transition text-zinc-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{getDisplayTitle(course?.title)}</h1>
              <p className="text-sm text-zinc-500">
                Lessons ({lessons.length}) - Topics ({topicCount})
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
            className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm hover:border-zinc-300"
          >
            <Pencil className="w-4 h-4" /> Edit Course
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 px-6 space-y-6">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Course Structure</h2>
            <button
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center gap-1"
              onClick={() => setAddingLesson(true)}
            >
              <Plus className="w-4 h-4" /> Add Lesson
            </button>
          </div>

          <div className="p-4">
            {addingLesson && (
              <div className="mb-4 flex flex-col md:flex-row gap-3">
                <input
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Lesson title"
                />
                <button
                  onClick={handleAddLesson}
                  disabled={lessonSubmitting}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-70"
                >
                  {lessonSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save Lesson
                </button>
                <button
                  onClick={() => setAddingLesson(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-200 text-zinc-600"
                >
                  Cancel
                </button>
              </div>
            )}

            {lessons.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                <p className="text-zinc-500">No lessons yet. Start building!</p>
              </div>
            ) : (
              <DndContext collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
                <SortableContext items={lessons.map((lesson) => lesson._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {lessons.map((lesson) => (
                      <SortableRow key={lesson._id} id={lesson._id}>
                        <div className="border border-zinc-200 rounded-xl bg-white">
                          <div className="flex items-center gap-3 p-3">
                            <button onClick={() => toggleLesson(lesson._id)} className="p-1 hover:bg-zinc-100 rounded text-zinc-400 transition">
                              {expandedLessons[lesson._id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-zinc-900 truncate">{getDisplayTitle(lesson.title)}</h3>
                              <p className="text-xs text-zinc-500">
                                {(topicsByLesson[lesson._id] || []).length} Topics
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setActiveTopicLessonId(activeTopicLessonId === lesson._id ? null : lesson._id)}
                                className="p-2 text-zinc-400 hover:text-indigo-600 rounded-lg"
                                title="Add Topic"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <Link
                                href={`/admin/lessons/${lesson._id}/edit`}
                                className="p-2 text-zinc-400 hover:text-indigo-600 rounded-lg"
                                title="Edit Lesson"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteLesson(lesson._id)}
                                className="p-2 text-zinc-400 hover:text-red-500 rounded-lg"
                                title="Delete Lesson"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {expandedLessons[lesson._id] && (
                            <div className="border-t border-zinc-100 bg-zinc-50/30 px-4 py-3 space-y-3">
                              {activeTopicLessonId === lesson._id && (
                                <div className="space-y-2 bg-white p-3 rounded-lg border border-zinc-200">
                                  <input
                                    value={newTopicTitle}
                                    onChange={(e) => setNewTopicTitle(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Topic title"
                                  />
                                  <textarea
                                    value={newTopicContent}
                                    onChange={(e) => setNewTopicContent(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Topic content (optional)"
                                    rows={2}
                                  />
                                  <button
                                    onClick={() => handleAddTopic(lesson._id)}
                                    disabled={topicSubmitting}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-70"
                                  >
                                    {topicSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Save Topic
                                  </button>
                                </div>
                              )}

                              <DndContext collisionDetection={closestCenter} onDragEnd={(event) => handleTopicDragEnd(lesson._id, event)}>
                                <SortableContext
                                  items={(topicsByLesson[lesson._id] || []).map((topic) => topic._id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="space-y-2">
                                    {(topicsByLesson[lesson._id] || []).map((topic) => (
                                      <SortableRow key={topic._id} id={topic._id}>
                                        <div className="border border-zinc-200 rounded-lg bg-white">
                                          <div className="flex items-center gap-3 p-3">
                                            <button onClick={() => toggleTopic(topic._id)} className="p-1 hover:bg-zinc-100 rounded text-zinc-400 transition">
                                              {expandedTopics[topic._id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>
                                            <FileText className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm font-medium text-zinc-700 flex-1 truncate">{getDisplayTitle(topic.title)}</span>
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() => setActiveQuizTopicId(activeQuizTopicId === topic._id ? null : topic._id)}
                                                className="p-2 text-zinc-400 hover:text-indigo-600 rounded-lg"
                                                title="Add Quiz"
                                              >
                                                <Plus className="w-4 h-4" />
                                              </button>
                                              <Link
                                                href={`/admin/topics/${topic._id}/edit`}
                                                className="p-2 text-zinc-400 hover:text-indigo-600 rounded-lg"
                                                title="Edit Topic"
                                              >
                                                <Pencil className="w-4 h-4" />
                                              </Link>
                                              <button
                                                onClick={() => handleDeleteTopic(topic._id, lesson._id)}
                                                className="p-2 text-zinc-400 hover:text-red-500 rounded-lg"
                                                title="Delete Topic"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </div>

                                          {expandedTopics[topic._id] && (
                                            <div className="border-t border-zinc-100 bg-zinc-50/30 px-4 py-3 space-y-2">
                                              {activeQuizTopicId === topic._id && (
                                                <div className="flex flex-col md:flex-row gap-2">
                                                  <input
                                                    value={newQuizTitle}
                                                    onChange={(e) => setNewQuizTitle(e.target.value)}
                                                    className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm"
                                                    placeholder="Quiz title"
                                                  />
                                                  <button
                                                    onClick={() => handleAddQuiz(topic._id, lesson._id)}
                                                    disabled={quizSubmitting}
                                                    className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-70"
                                                  >
                                                    {quizSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                    Save Quiz
                                                  </button>
                                                </div>
                                              )}

                                              {(quizzesByTopic[topic._id] || []).map((quiz) => (
                                                <div key={quiz._id} className="border border-zinc-200 rounded-lg bg-white">
                                                  <div className="flex items-center gap-3 p-3">
                                                    <button onClick={() => toggleQuiz(quiz._id)} className="p-1 hover:bg-zinc-100 rounded text-zinc-400 transition">
                                                      {expandedQuizzes[quiz._id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </button>
                                                    <HelpCircle className="w-4 h-4 text-amber-500" />
                                                    <span className="text-sm font-medium text-zinc-700 flex-1 truncate">{getDisplayTitle(quiz.title)}</span>
                                                    <div className="flex items-center gap-1">
                                                      <button
                                                        onClick={() => setActiveQuestionQuizId(activeQuestionQuizId === quiz._id ? null : quiz._id)}
                                                        className="p-2 text-zinc-400 hover:text-indigo-600 rounded-lg"
                                                        title="Add Question"
                                                      >
                                                        <Plus className="w-4 h-4" />
                                                      </button>
                                                      <Link
                                                        href={`/admin/quizzes/${quiz._id}/edit`}
                                                        className="p-2 text-zinc-400 hover:text-indigo-600 rounded-lg"
                                                        title="Edit Quiz"
                                                      >
                                                        <Pencil className="w-4 h-4" />
                                                      </Link>
                                                      <button
                                                        onClick={() => handleDeleteQuiz(quiz._id, topic._id)}
                                                        className="p-2 text-zinc-400 hover:text-red-500 rounded-lg"
                                                        title="Delete Quiz"
                                                      >
                                                        <Trash2 className="w-4 h-4" />
                                                      </button>
                                                    </div>
                                                  </div>

                                                  {expandedQuizzes[quiz._id] && (
                                                    <div className="border-t border-zinc-100 bg-zinc-50/30 px-4 py-3 space-y-2">
                                                      {activeQuestionQuizId === quiz._id && (
                                                        <div className="flex flex-col md:flex-row gap-2">
                                                          <input
                                                            value={newQuestionText}
                                                            onChange={(e) => setNewQuestionText(e.target.value)}
                                                            className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm"
                                                            placeholder="Question text"
                                                          />
                                                          <button
                                                            onClick={() => handleAddQuestion(quiz._id)}
                                                            disabled={questionSubmitting}
                                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-70"
                                                          >
                                                            {questionSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                            Save Question
                                                          </button>
                                                        </div>
                                                      )}

                                                      {(questionsByQuiz[quiz._id] || []).map((question) => (
                                                        <div key={question._id} className="flex items-center gap-3 p-2 bg-white border border-zinc-100 rounded-lg">
                                                          <span className="text-sm font-medium text-zinc-700 flex-1 truncate">
                                                            {getDisplayTitle(question.text || question.questionText) || 'Untitled question'}
                                                          </span>
                                                          <div className="flex items-center gap-1">
                                                            <Link
                                                              href={`/admin/questions/${question._id}/edit`}
                                                              className="p-2 text-zinc-400 hover:text-indigo-600 rounded-lg"
                                                              title="Edit Question"
                                                            >
                                                              <Pencil className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                              onClick={() => handleDeleteQuestion(question._id, quiz._id)}
                                                              className="p-2 text-zinc-400 hover:text-red-500 rounded-lg"
                                                              title="Delete Question"
                                                            >
                                                              <Trash2 className="w-4 h-4" />
                                                            </button>
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </SortableRow>
                                    ))}
                                  </div>
                                </SortableContext>
                              </DndContext>
                            </div>
                          )}
                        </div>
                      </SortableRow>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
