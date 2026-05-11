'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import AdminLocaleSelector from '@/components/admin/AdminLocaleSelector';
import { getLocaleCompletion } from '@/lib/adminLocale';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';

const createLocalizedValues = () =>
  Object.fromEntries(CONTENT_LANGUAGES.map((language) => [language.code, '']));

export default function CreateQuestionPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const { locale: activeLocale, setLocale } = useAdminLocale();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizId, setQuizId] = useState('');
  const [questionText, setQuestionText] = useState(createLocalizedValues());
  const [answers, setAnswers] = useState([createLocalizedValues(), createLocalizedValues()]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(0);
  const activeLanguage = CONTENT_LANGUAGES.find((language) => language.code === activeLocale) || CONTENT_LANGUAGES[0];

  const getDisplayTitle = (title: any) => {
    if (typeof title === 'string') return title;
    if (title && typeof title === 'object') return title[activeLocale] || title.en || Object.values(title)[0] || '';
    return '';
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch('/api/quizzes');
        const data = await res.json();
        if (data.success) {
          setQuizzes(data.data || []);
          if (!quizId && data.data?.length) {
            setQuizId(data.data[0]._id);
          }
        }
      } catch (error) {
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuestionText = (
    locale: (typeof CONTENT_LANGUAGES)[number]['code'],
    value: string
  ) => {
    setQuestionText((prev) => ({ ...prev, [locale]: value }));
  };

  const updateAnswer = (
    index: number,
    locale: (typeof CONTENT_LANGUAGES)[number]['code'],
    value: string
  ) => {
    setAnswers((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [locale]: value } : item))
    );
  };

  const addAnswer = () => {
    setAnswers((prev) => [...prev, createLocalizedValues()]);
  };

  const removeAnswer = (index: number) => {
    setAnswers((prev) => {
      if (prev.length <= 2) return prev;
      const next = prev.filter((_, i) => i !== index);
      if (correctIndex !== null && index === correctIndex) {
        setCorrectIndex(0);
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!quizId || !questionText.en.trim()) {
      toast.error('Quiz and English question text are required');
      return;
    }

    if (answers.length < 2 || answers.some((answer) => !answer.en.trim())) {
      toast.error('Provide at least two English answers');
      return;
    }

    if (correctIndex === null) {
      toast.error('Select the correct answer');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          text: questionText,
          options: answers,
          correctAnswerIndex: correctIndex
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create question');

      toast.success('Question created');
      setQuestionText(createLocalizedValues());
      setAnswers([createLocalizedValues(), createLocalizedValues()]);
      setCorrectIndex(0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Add New Question</h1>
        </div>
        <Link
          href="/admin/questions"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          &larr; Back to Questions
        </Link>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <AdminLocaleSelector
              value={activeLocale}
              onChange={setLocale}
              completion={getLocaleCompletion(questionText)}
            />
            <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 space-y-3">
              <label className="text-sm font-medium text-zinc-700">{activeLanguage.label}</label>
              <input
                value={questionText[activeLocale] || ''}
                required={activeLocale === 'en'}
                onChange={(e) => updateQuestionText(activeLocale, e.target.value)}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white"
                placeholder={`Enter your question (${activeLanguage.label})`}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">Quiz</label>
            <select
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
              disabled={loading}
            >
              {quizzes.map((quiz) => (
                <option key={quiz._id} value={quiz._id}>
                  {getDisplayTitle(quiz.title)}
                </option>
              ))}
              {quizzes.length === 0 && <option value="">No quizzes found</option>}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700">Answers</label>
              <button
                type="button"
                onClick={addAnswer}
                className="text-sm text-[#2271b1] flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Answer
              </button>
            </div>
            {answers.map((answer, index) => (
              <div key={index} className="space-y-3 rounded-md border border-zinc-200 p-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCorrectIndex(index)}
                    className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      correctIndex === index ? 'border-[#2271b1] bg-[#2271b1]' : 'border-zinc-300'
                    }`}
                  >
                    {correctIndex === index ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                  </button>
                  <span className="text-sm font-medium text-zinc-700">Answer {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeAnswer(index)}
                    disabled={answers.length <= 2}
                    className="ml-auto p-2 text-zinc-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {activeLanguage.label}
                  </label>
                  <input
                    value={answer[activeLocale] || ''}
                    required={activeLocale === 'en'}
                    onChange={(e) => updateAnswer(index, activeLocale, e.target.value)}
                    className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
                    placeholder={`Answer ${index + 1} (${activeLanguage.label})`}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#2271b1] hover:bg-[#135e96] text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Question
          </button>
        </form>
      </div>
    </div>
  );
}
