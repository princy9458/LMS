'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HelpCircle, AlertCircle, Plus, Loader2, ListOrdered, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import { getLocaleFromPathname, getLocalePath } from '@/lib/i18n';

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

const createQuestion = (): QuizQuestionInput => ({
  questionText: createLocalizedValues(),
  options: [createLocalizedValues(), createLocalizedValues(), createLocalizedValues(), createLocalizedValues()],
  correctAnswerIndex: 0,
  explanation: createLocalizedValues(),
});

export default function AdminQuizCreatePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  const [formData, setFormData] = useState({
    title: createLocalizedValues(),
    description: createLocalizedValues(),
    courseId: '',
    lessonId: '',
    passingMarks: 1,
    timeLimit: 0,
    questions: [createQuestion()]
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/lms/courses');
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
          if (data.data.length > 0) {
            setFormData(prev => ({ ...prev, courseId: data.data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!formData.courseId) return;
    const fetchLessons = async () => {
      try {
        const res = await fetch(`/api/lms/lessons?courseId=${formData.courseId}`);
        const data = await res.json();
        if (data.success) {
          setLessons(data.data);
          if (data.data.length > 0) {
            setFormData(prev => ({ ...prev, lessonId: data.data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load lessons', err);
      }
    };
    fetchLessons();
  }, [formData.courseId]);

  const updateLocalizedRootField = (
    field: 'title' | 'description',
    language: (typeof CONTENT_LANGUAGES)[number]['code'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
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
      const res = await fetch('/api/lms/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create quiz');

      router.push(getLocalePath(locale, '/admin/quizzes'));
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={getLocalePath(locale, '/admin/quizzes')} className="text-zinc-500 hover:text-indigo-600 transition-colors">&larr; Back to Quizzes</Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-500" /> Quiz Builder
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Create interactive assessments to test student mastery in every supported language.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-zinc-900">Multilingual Quiz Details</label>
            <div className="grid grid-cols-1 gap-4">
              {CONTENT_LANGUAGES.map((language) => (
                <div key={language.code} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
                  <p className="text-sm font-semibold text-zinc-900">{language.label}</p>
                  <input
                    required={language.code === 'en'}
                    value={formData.title[language.code]}
                    onChange={(e) => updateLocalizedRootField('title', language.code, e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    placeholder={`Quiz title (${language.label})`}
                  />
                  <textarea
                    value={formData.description[language.code]}
                    onChange={(e) => updateLocalizedRootField('description', language.code, e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-indigo-500 transition-all min-h-24"
                    placeholder={`Quiz description (${language.label})`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-indigo-500"
                disabled={loadingCourses}
              >
                {loadingCourses && <option value="">Loading courses...</option>}
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Link to Lesson</label>
              <select
                value={formData.lessonId}
                onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-indigo-500"
              >
                {lessons.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}
                {lessons.length === 0 && <option value="">No lessons found for this course</option>}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Passing Score (Items Correct)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Time Limit (Minutes, 0 = No limit)</label>
              <input
                type="number"
                min="0"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-indigo-500"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CONTENT_LANGUAGES.map((language) => (
                      <div key={language.code} className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Question Prompt ({language.label})
                        </label>
                        <input
                          required={language.code === 'en'}
                          value={q.questionText[language.code]}
                          onChange={(e) => updateQuestion(qIndex, 'questionText', language.code, e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder={`Question prompt (${language.label})`}
                        />
                        <textarea
                          value={q.explanation[language.code]}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', language.code, e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-24"
                          placeholder={`Explanation (${language.label})`}
                        />
                      </div>
                    ))}
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {CONTENT_LANGUAGES.map((language) => (
                              <div key={language.code} className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                  {language.label}
                                </label>
                                <input
                                  required={language.code === 'en'}
                                  value={opt[language.code]}
                                  onChange={(e) => updateOption(qIndex, oIndex, language.code, e.target.value)}
                                  className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-sm"
                                  placeholder={`Option ${oIndex + 1} (${language.label})`}
                                />
                              </div>
                            ))}
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
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-12 py-4 rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Launch Quiz</>}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
