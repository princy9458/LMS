'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HelpCircle, AlertCircle, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import AdminLocaleSelector from '@/components/admin/AdminLocaleSelector';
import { getLocaleCompletion } from '@/lib/adminLocale';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';

const createLocalizedValues = (translations: Record<string, string> = {}) =>
  Object.fromEntries(CONTENT_LANGUAGES.map((language) => [language.code, translations[language.code] || '']));

type AnswerInput = {
  text: Record<string, string>;
  isCorrect: boolean;
};

export default function AdminQuestionEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params as { id?: string })?.id;
  const { locale: activeLocale, setLocale } = useAdminLocale();
  const activeLanguage = CONTENT_LANGUAGES.find((language) => language.code === activeLocale) || CONTENT_LANGUAGES[0];

  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const getDisplayTitle = (title: any) => {
    if (typeof title === 'string') return title;
    if (title && typeof title === 'object') return title[activeLocale] || title.en || Object.values(title)[0] || '';
    return '';
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    text: createLocalizedValues(),
    courseId: '',
    lessonId: '',
    topicId: '',
    quizId: '',
    answers: [
      { text: createLocalizedValues(), isCorrect: true },
      { text: createLocalizedValues(), isCorrect: false }
    ] as AnswerInput[]
  });

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [topicSubmitting, setTopicSubmitting] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    instructorName: '',
    category: 'Software Engineering',
    difficultyLevel: 'Beginner',
    thumbnail: ''
  });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    order: 1
  });
  const [topicForm, setTopicForm] = useState({
    title: ''
  });
  const [quizForm, setQuizForm] = useState({
    title: '',
    passingMarks: 1,
    timeLimit: 0
  });

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        if (!id) throw new Error('Missing question ID');

        const [questionRes, coursesRes] = await Promise.all([
          fetch(`/api/questions/${id}`),
          fetch('/api/courses')
        ]);

        const questionData = await questionRes.json();
        const coursesData = await coursesRes.json();

        const courseList = coursesData.data ?? coursesData;
        if (Array.isArray(courseList)) {
          setCourses(courseList);
        }

        const question = questionData.data ?? questionData;
        if (!question?._id) {
          throw new Error(questionData?.error || 'Question not found');
        }

        const quizId = question.quizId || question.quiz || '';
        const options = question.options || [];
        const correctIndex = question.correctAnswerIndex ?? 0;
        const answers = options.length
          ? options.map((text: string, idx: number) => ({
              text: createLocalizedValues((question.optionTranslations || [])[idx] || { en: text }),
              isCorrect: idx === correctIndex,
            }))
          : [
              { text: createLocalizedValues(), isCorrect: true },
              { text: createLocalizedValues(), isCorrect: false }
            ];

        let courseId = '';
        let lessonId = '';
        let topicId = '';

        if (quizId) {
          const quizRes = await fetch(`/api/quizzes/${quizId}`);
          const quizData = await quizRes.json();
          const quiz = quizData.data ?? quizData;
          courseId = quiz?.courseId || '';
          lessonId = quiz?.lessonId || '';
          topicId = quiz?.topicId || '';
        }

        setFormData({
          text: createLocalizedValues(question.textTranslations || question.questionTextTranslations || { en: question.text || question.questionText || '' }),
          courseId,
          lessonId,
          topicId,
          quizId,
          answers
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  useEffect(() => {
    if (!formData.courseId) return;
    const fetchLessons = async () => {
      const res = await fetch(`/api/lessons?courseId=${formData.courseId}`);
      const data = await res.json();
      if (data.success) {
        setLessons(data.data);
      }
    };
    fetchLessons();
  }, [formData.courseId]);

  useEffect(() => {
    if (!formData.lessonId) return;
    const fetchTopics = async () => {
      const res = await fetch(`/api/topics?lessonId=${formData.lessonId}`);
      const data = await res.json();
      if (data.success) {
        setTopics(data.data);
      }
    };
    fetchTopics();
  }, [formData.lessonId]);

  useEffect(() => {
    if (!formData.topicId) return;
    const fetchQuizzes = async () => {
      const res = await fetch(`/api/quizzes?topicId=${formData.topicId}`);
      const data = await res.json();
      if (data.success) {
        setQuizzes(data.data);
      }
    };
    fetchQuizzes();
  }, [formData.topicId]);

  const updateAnswer = (
    index: number,
    updates: Partial<AnswerInput> & { locale?: (typeof CONTENT_LANGUAGES)[number]['code']; value?: string }
  ) => {
    setFormData((prev) => {
      const answers = [...prev.answers];
      const { locale, value, ...rest } = updates;
      answers[index] = {
        ...answers[index],
        ...rest,
        text:
          locale && typeof value === 'string'
            ? { ...answers[index].text, [locale]: value }
            : answers[index].text,
      };

      if (rest.isCorrect) {
        for (let i = 0; i < answers.length; i += 1) {
          if (i !== index) answers[i].isCorrect = false;
        }
      }

      return { ...prev, answers };
    });
  };

  const addAnswer = () => {
    setFormData((prev) => ({
      ...prev,
      answers: [...prev.answers, { text: createLocalizedValues(), isCorrect: false }]
    }));
  };

  const removeAnswer = (index: number) => {
    setFormData((prev) => {
      if (prev.answers.length <= 2) return prev;
      const answers = prev.answers.filter((_, i) => i !== index);
      if (!answers.some((answer) => answer.isCorrect)) {
        answers[0].isCorrect = true;
      }
      return { ...prev, answers };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.quizId || !formData.text.en.trim()) {
        throw new Error('Quiz and English question text are required');
      }

      const correctIndex = formData.answers.findIndex((answer) => answer.isCorrect);
      const options = formData.answers.map((answer) => answer.text);

      const res = await fetch(`/api/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: formData.quizId,
          text: formData.text,
          options,
          correctAnswerIndex: correctIndex,
          answers: formData.answers
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update question');

      toast.success('Question updated');
      router.push('/admin/questions');
    } catch (err: any) {
      setError(err.message || 'Failed to update question');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/questions" className="text-zinc-500 hover:text-indigo-600 transition-colors">
          &larr; Back to Questions
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-500" /> Edit Question
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Update question content and hierarchy selections.</p>
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
            <div className="space-y-2 md:col-span-2">
              <AdminLocaleSelector
                value={activeLocale}
                onChange={setLocale}
                completion={getLocaleCompletion(formData.text)}
              />
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 space-y-3">
                <label className="text-sm font-semibold text-zinc-900">{activeLanguage.label}</label>
                <input
                  value={formData.text[activeLocale] || ''}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    text: {
                      ...prev.text,
                      [activeLocale]: e.target.value,
                    },
                  }))}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
                  required={activeLocale === 'en'}
                  placeholder={`Question text (${activeLanguage.label})`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__add__') {
                    setShowCourseModal(true);
                    return;
                  }
                  setFormData((prev) => ({ ...prev, courseId: value, lessonId: '', topicId: '', quizId: '' }));
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              >
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{getDisplayTitle(course.title)}</option>
                ))}
                <option value="__add__">➕ Add New Course</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Lesson</label>
              <select
                value={formData.lessonId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__add__') {
                    setShowLessonModal(true);
                    return;
                  }
                  setFormData((prev) => ({ ...prev, lessonId: value, topicId: '', quizId: '' }));
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              >
                {lessons.map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>{getDisplayTitle(lesson.title)}</option>
                ))}
                {formData.courseId && <option value="__add__">➕ Add New Lesson</option>}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Topic</label>
              <select
                value={formData.topicId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__add__') {
                    setShowTopicModal(true);
                    return;
                  }
                  setFormData((prev) => ({ ...prev, topicId: value, quizId: '' }));
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              >
                {topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>{getDisplayTitle(topic.title)}</option>
                ))}
                {formData.lessonId && <option value="__add__">➕ Add New Topic</option>}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Quiz</label>
              <select
                value={formData.quizId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__add__') {
                    setShowQuizModal(true);
                    return;
                  }
                  setFormData((prev) => ({ ...prev, quizId: value }));
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              >
                {quizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id}>{getDisplayTitle(quiz.title)}</option>
                ))}
                {formData.topicId && <option value="__add__">➕ Add New Quiz</option>}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-900">Answers</label>
              <button
                type="button"
                onClick={addAnswer}
                className="text-indigo-600 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Answer
              </button>
            </div>
            <div className="space-y-3">
              {formData.answers.map((answer, index) => (
                <div key={index} className="space-y-3 rounded-xl border border-zinc-200 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-900">Answer {index + 1}</span>
                    <label className="flex items-center gap-2 text-xs text-zinc-600">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={(e) => updateAnswer(index, { isCorrect: e.target.checked })}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Correct
                    </label>
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className="ml-auto p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      disabled={formData.answers.length <= 2}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {activeLanguage.label}
                    </label>
                    <input
                      type="text"
                      value={answer.text[activeLocale] || ''}
                      onChange={(e) => updateAnswer(index, { locale: activeLocale, value: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Answer ${index + 1} (${activeLanguage.label})`}
                      required={activeLocale === 'en'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/questions')}
              className="px-6 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Create New Course</h3>
            <div className="space-y-3">
              <input
                value={courseForm.title}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Course title"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
                rows={3}
              />
              <input
                value={courseForm.instructorName}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, instructorName: e.target.value }))}
                placeholder="Instructor name"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Marketing">Marketing</option>
                </select>
                <select
                  value={courseForm.difficultyLevel}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, difficultyLevel: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="px-4 py-2 text-sm border border-zinc-200 rounded-xl text-zinc-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!courseForm.title || !courseForm.description || !courseForm.instructorName) {
                    setError('Title, description, and instructor name are required.');
                    return;
                  }
                  setCourseSubmitting(true);
                  try {
                    const res = await fetch('/api/courses', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(courseForm)
                    });
                    const data = await res.json();
                    const course = data.data ?? data;
                    if (!res.ok || !course?._id) throw new Error(data.error || 'Failed to create course');
                    setCourses((prev) => [course, ...prev]);
                    setFormData((prev) => ({ ...prev, courseId: course._id, lessonId: '', topicId: '', quizId: '' }));
                    setShowCourseModal(false);
                  } catch (err: any) {
                    setError(err.message || 'Failed to create course');
                  } finally {
                    setCourseSubmitting(false);
                  }
                }}
                disabled={courseSubmitting}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl disabled:opacity-70"
              >
                {courseSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Create New Lesson</h3>
            <div className="space-y-3">
              <input
                value={lessonForm.title}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Lesson title"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
              <input
                type="number"
                min="1"
                value={lessonForm.order}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                placeholder="Order"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="px-4 py-2 text-sm border border-zinc-200 rounded-xl text-zinc-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!lessonForm.title || !formData.courseId) {
                    setError('Lesson title and course are required.');
                    return;
                  }
                  setLessonSubmitting(true);
                  try {
                    const res = await fetch('/api/lessons', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        courseId: formData.courseId,
                        title: lessonForm.title,
                        order: lessonForm.order
                      })
                    });
                    const data = await res.json();
                    const lesson = data.data ?? data;
                    if (!res.ok || !lesson?._id) throw new Error(data.error || 'Failed to create lesson');
                    setLessons((prev) => [lesson, ...prev]);
                    setFormData((prev) => ({ ...prev, lessonId: lesson._id, topicId: '', quizId: '' }));
                    setShowLessonModal(false);
                  } catch (err: any) {
                    setError(err.message || 'Failed to create lesson');
                  } finally {
                    setLessonSubmitting(false);
                  }
                }}
                disabled={lessonSubmitting}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl disabled:opacity-70"
              >
                {lessonSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTopicModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Create New Topic</h3>
            <div className="space-y-3">
              <input
                value={topicForm.title}
                onChange={(e) => setTopicForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Topic title"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowTopicModal(false)}
                className="px-4 py-2 text-sm border border-zinc-200 rounded-xl text-zinc-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!topicForm.title || !formData.lessonId) {
                    setError('Topic title and lesson are required.');
                    return;
                  }
                  setTopicSubmitting(true);
                  try {
                    const res = await fetch('/api/topics', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        lessonId: formData.lessonId,
                        title: topicForm.title
                      })
                    });
                    const data = await res.json();
                    const topic = data.data ?? data;
                    if (!res.ok || !topic?._id) throw new Error(data.error || 'Failed to create topic');
                    setTopics((prev) => [topic, ...prev]);
                    setFormData((prev) => ({ ...prev, topicId: topic._id, quizId: '' }));
                    setShowTopicModal(false);
                  } catch (err: any) {
                    setError(err.message || 'Failed to create topic');
                  } finally {
                    setTopicSubmitting(false);
                  }
                }}
                disabled={topicSubmitting}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl disabled:opacity-70"
              >
                {topicSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Topic'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">Create New Quiz</h3>
            <div className="space-y-3">
              <input
                value={quizForm.title}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Quiz title"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
              <input
                type="number"
                min="1"
                value={quizForm.passingMarks}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, passingMarks: Number(e.target.value) }))}
                placeholder="Passing marks"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowQuizModal(false)}
                className="px-4 py-2 text-sm border border-zinc-200 rounded-xl text-zinc-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!quizForm.title || !formData.courseId) {
                    setError('Quiz title and course are required.');
                    return;
                  }
                  setQuizSubmitting(true);
                  try {
                    const res = await fetch('/api/quizzes', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: quizForm.title,
                        courseId: formData.courseId,
                        lessonId: formData.lessonId,
                        topicId: formData.topicId,
                        passingMarks: quizForm.passingMarks,
                        timeLimit: quizForm.timeLimit
                      })
                    });
                    const data = await res.json();
                    const quiz = data.data ?? data;
                    if (!res.ok || !quiz?._id) throw new Error(data.error || 'Failed to create quiz');
                    setQuizzes((prev) => [quiz, ...prev]);
                    setFormData((prev) => ({ ...prev, quizId: quiz._id }));
                    setShowQuizModal(false);
                  } catch (err: any) {
                    setError(err.message || 'Failed to create quiz');
                  } finally {
                    setQuizSubmitting(false);
                  }
                }}
                disabled={quizSubmitting}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl disabled:opacity-70"
              >
                {quizSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
