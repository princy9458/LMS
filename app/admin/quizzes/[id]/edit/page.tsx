'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { HelpCircle, Save, Loader2, ListOrdered, CheckCircle2, X, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import { getLocaleFromPathname, getLocalePath } from '@/lib/i18n';
import AdminLocaleSelector from '@/components/admin/AdminLocaleSelector';
import { getLocaleCompletion } from '@/lib/adminLocale';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';

type LocalizedInput = Record<(typeof CONTENT_LANGUAGES)[number]['code'], string>;

type QuizQuestionInput = {
  questionText: LocalizedInput;
  options: LocalizedInput[];
  correctAnswerIndex: number;
  explanation: LocalizedInput;
};

const createLocalizedValues = (seed?: Partial<Record<string, string>>): LocalizedInput =>
  Object.fromEntries(
    CONTENT_LANGUAGES.map((language) => [language.code, seed?.[language.code] || ''])
  ) as LocalizedInput;

const createQuestion = (seed?: Partial<QuizQuestionInput>): QuizQuestionInput => ({
  questionText: createLocalizedValues(seed?.questionText),
  options: (seed?.options || [createLocalizedValues(), createLocalizedValues(), createLocalizedValues(), createLocalizedValues()]).map((option) =>
    createLocalizedValues(typeof option === 'string' ? { en: option } : option)
  ),
  correctAnswerIndex: seed?.correctAnswerIndex || 0,
  explanation: createLocalizedValues(seed?.explanation),
});

const toSlug = (value: string) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function AdminQuizEditPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { locale: activeLocale, setLocale } = useAdminLocale();
  const params = useParams();
  const id = (params as { id?: string })?.id;
  
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [topicSubmitting, setTopicSubmitting] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const activeLocaleVal = 'en';

  const getDisplayTitle = (title: any) => {
    if (typeof title === 'string') return title;
    if (title && typeof title === 'object') return title[activeLocaleVal] || title.en || Object.values(title)[0] || '';
    return '';
  };
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
    courseId: '',
    order: 1
  });
  const [topicForm, setTopicForm] = useState({
    title: '',
    lessonId: ''
  });
  
  const [formData, setFormData] = useState({
    title: createLocalizedValues(),
    slug: '',
    description: createLocalizedValues(),
    courseId: '',
    lessonId: '',
    topicId: '',
    passingMarks: 1,
    timeLimit: 0,
    questions: [createQuestion()]
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeLanguage = CONTENT_LANGUAGES.find((language) => language.code === activeLocale) || CONTENT_LANGUAGES[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          throw new Error('Missing quiz ID');
        }
        const [quizRes, coursesRes] = await Promise.all([
          fetch(`/api/quizzes/${id}`),
          fetch('/api/courses')
        ]);
        
        const quizData = await quizRes.json();
        const coursesData = await coursesRes.json();

        const courseList = coursesData.data ?? coursesData;
        if (Array.isArray(courseList)) {
          setCourses(courseList);
        }

        const q = quizData.data ?? quizData;
        if (q && q._id) {
          setFormData({
            title: createLocalizedValues(q.titleTranslations || q.title || {}),
            slug: q.slug || '',
            description: createLocalizedValues(q.descriptionTranslations || q.description || {}),
            courseId: q.courseId || '',
            lessonId: q.lessonId || '',
            topicId: q.topicId || '',
            passingMarks: q.passingMarks || 1,
            timeLimit: q.timeLimit || 0,
            questions: (q.questions || []).length
              ? (q.questions || []).map((question: any) => createQuestion({
                  questionText: question.textTranslations || question.questionTextTranslations || question.questionText || question.text || {},
                  options: question.optionTranslations || question.options || [],
                  correctAnswerIndex: question.correctAnswerIndex,
                  explanation: question.explanationTranslations || question.explanation || {},
                }))
              : [createQuestion()]
          });
          setLessonForm((prev) => ({ ...prev, courseId: q.courseId || '' }));
          setTopicForm((prev) => ({ ...prev, lessonId: q.lessonId || '' }));
        } else {
          setError('Quiz not found');
        }
      } catch (err) {
        console.error('Failed to load data', err);
        setError('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!formData.courseId) return;
    const fetchLessons = async () => {
      try {
        const res = await fetch(`/api/lessons?courseId=${formData.courseId}`);
        const data = await res.json();
        if (data.success) {
          setLessons(data.data);
        }
      } catch (err) {
        console.error('Failed to load lessons', err);
      }
    };
    fetchLessons();
  }, [formData.courseId]);

  useEffect(() => {
    if (!formData.lessonId) return;
    const fetchTopics = async () => {
      try {
        const res = await fetch(`/api/topics?lessonId=${formData.lessonId}`);
        const data = await res.json();
        if (data.success) {
          setTopics(data.data);
        }
      } catch (err) {
        console.error('Failed to load topics', err);
      }
    };
    fetchTopics();
  }, [formData.lessonId]);

  const updateLocalizedRootField = (
    field: 'title' | 'description',
    language: (typeof CONTENT_LANGUAGES)[number]['code'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      slug: field === 'title' && language === 'en' && !slugEdited ? toSlug(value) : prev.slug,
      [field]: {
        ...prev[field],
        [language]: value,
      },
    }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, createQuestion()]
    }));
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, questionIndex) => questionIndex !== index)
    }));
  };

  const updateQuestion = (
    index: number,
    field: 'questionText' | 'explanation',
    language: (typeof CONTENT_LANGUAGES)[number]['code'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, questionIndex) =>
        questionIndex === index
          ? {
              ...question,
              [field]: {
                ...question[field],
                [language]: value,
              },
            }
          : question
      )
    }));
  };

  const updateOption = (
    qIndex: number,
    oIndex: number,
    language: (typeof CONTENT_LANGUAGES)[number]['code'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, questionIndex) =>
        questionIndex === qIndex
          ? {
              ...question,
              options: question.options.map((option, optionIndex) =>
                optionIndex === oIndex
                  ? {
                      ...option,
                      [language]: value,
                    }
                  : option
              ),
            }
          : question
      )
    }));
  };

  const updateCorrectAnswer = (qIndex: number, oIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, questionIndex) =>
        questionIndex === qIndex
          ? {
              ...question,
              correctAnswerIndex: oIndex,
            }
          : question
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.title.en.trim()) {
      setError('English quiz title is required');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || toSlug(formData.title.en || ''),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update quiz');

      toast.success('Quiz updated');
      router.push(getLocalePath(locale, '/admin/quizzes'));
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={getLocalePath(locale, '/admin/quizzes')} className="text-zinc-500 hover:text-indigo-600 transition-colors">&larr; Back to Quizzes</Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-500" /> Edit Assessment
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Refine questions and scoring for {Object.values(formData.title).find(Boolean) || 'this quiz'}.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
          <div className="space-y-4">
            <AdminLocaleSelector
              value={activeLocale}
              onChange={setLocale}
              completion={CONTENT_LANGUAGES.reduce<Record<string, 'complete' | 'partial' | 'missing'>>((acc, language) => {
                const title = formData.title[language.code]?.trim();
                const description = formData.description[language.code]?.trim();
                acc[language.code] = title && description
                  ? 'complete'
                  : title || description || (language.code !== 'en' && formData.title.en?.trim())
                    ? 'partial'
                    : 'missing';
                return acc;
              }, {})}
            />
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
              <p className="text-sm font-semibold text-zinc-900">{activeLanguage.label}</p>
              <input
                required={activeLocale === 'en'}
                value={formData.title[activeLocale] || ''}
                onChange={(e) => updateLocalizedRootField('title', activeLocale, e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                placeholder={`Quiz title (${activeLanguage.label})`}
              />
              <textarea
                value={formData.description[activeLocale] || ''}
                onChange={(e) => updateLocalizedRootField('description', activeLocale, e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-indigo-500 transition-all min-h-24"
                placeholder={`Quiz description (${activeLanguage.label})`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Slug</label>
            <input
              name="slug"
              value={formData.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setFormData((prev) => ({ ...prev, slug: toSlug(e.target.value) }));
              }}
              placeholder="basic-ai-quiz"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  setFormData({ ...formData, courseId: value, lessonId: '', topicId: '' });
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              >
                {courses.map(c => <option key={c._id} value={c._id}>{getDisplayTitle(c.title)}</option>)}
                <option value="__add__">➕ Add New Course</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Link to Lesson</label>
              <select
                value={formData.lessonId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__add__') {
                    setLessonForm((prev) => ({ ...prev, courseId: formData.courseId }));
                    setShowLessonModal(true);
                    return;
                  }
                  setFormData({ ...formData, lessonId: value, topicId: '' });
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              >
                {lessons.map(l => <option key={l._id} value={l._id}>{getDisplayTitle(l.title)}</option>)}
                {lessons.length === 0 && <option value="">No lessons found</option>}
                {formData.courseId && <option value="__add__">➕ Add New Lesson</option>}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Link to Topic</label>
              <select
                value={formData.topicId || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__add__') {
                    setTopicForm((prev) => ({ ...prev, lessonId: formData.lessonId }));
                    setShowTopicModal(true);
                    return;
                  }
                  setFormData({ ...formData, topicId: value });
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
              >
                {topics.map(t => <option key={t._id} value={t._id}>{getDisplayTitle(t.title)}</option>)}
                {topics.length === 0 && <option value="">No topics found</option>}
                {formData.lessonId && <option value="__add__">➕ Add New Topic</option>}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Passing Score</label>
              <input
                type="number"
                min="1"
                required
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Time Limit (Min)</label>
              <input
                type="number"
                min="0"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
              <ListOrdered className="w-5 h-5 text-indigo-500" /> Questions ({formData.questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-bold border border-indigo-100 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          <div className="space-y-6">
            {formData.questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden group">
                <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-500">Question {qIndex + 1}</span>
                  <button 
                    type="button" 
                    onClick={() => removeQuestion(qIndex)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Question Prompt ({activeLanguage.label})
                      </label>
                    </div>
                    <input
                      required={activeLocale === 'en'}
                      value={q.questionText[activeLocale] || ''}
                      onChange={(e) => updateQuestion(qIndex, 'questionText', activeLocale, e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <textarea
                      value={q.explanation[activeLocale] || ''}
                      onChange={(e) => updateQuestion(qIndex, 'explanation', activeLocale, e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 min-h-24"
                      placeholder={`Explanation (${activeLanguage.label})`}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-zinc-700">Answer Options</label>
                    <div className="grid grid-cols-1 gap-4">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="rounded-xl border border-zinc-200 p-4 space-y-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateCorrectAnswer(qIndex, oIndex)}
                              className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                q.correctAnswerIndex === oIndex ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300'
                              }`}
                            >
                              {q.correctAnswerIndex === oIndex ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : null}
                            </button>
                            <span className="text-sm font-medium text-zinc-700">Option {oIndex + 1}</span>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              {activeLanguage.label}
                            </label>
                            <input
                              required={activeLocale === 'en'}
                              value={opt[activeLocale] || ''}
                              onChange={(e) => updateOption(qIndex, oIndex, activeLocale, e.target.value)}
                              className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-sm"
                              placeholder={`Option ${oIndex + 1} (${activeLanguage.label})`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-8 right-8 z-30">
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-12 py-4 rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all flex items-center gap-3"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Quiz</>}
          </button>
        </div>
      </form>

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
              <input
                value={courseForm.thumbnail}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, thumbnail: e.target.value }))}
                placeholder="Paste a course thumbnail image URL"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm"
              />
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
                    setFormData((prev) => ({ ...prev, courseId: course._id, lessonId: '', topicId: '' }));
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
                    setFormData((prev) => ({ ...prev, lessonId: lesson._id, topicId: '' }));
                    setShowLessonModal(false);
                    setLessonForm({ title: '', courseId: formData.courseId, order: 1 });
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
                    setFormData((prev) => ({ ...prev, topicId: topic._id }));
                    setShowTopicModal(false);
                    setTopicForm({ title: '', lessonId: formData.lessonId });
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
    </div>
  );
}
