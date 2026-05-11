'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Loader2,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

interface QuizProps {
  quizId: string;
  title: string;
  questions: Question[];
  passingMarks: number;
  onComplete: (score: number, passed: boolean) => void;
  onExit?: () => void;
}

type QuizStage = 'intro' | 'quiz' | 'result';

const DEMO_USER_ID = '000000000000000000000001';

export const QuizComponent: React.FC<QuizProps> = ({ quizId, title, questions, passingMarks, onComplete, onExit }) => {
  const [stage, setStage] = useState<QuizStage>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { score: number; total: number; passed: boolean; attemptId?: string }>(null);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const canSubmit = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleStart = () => {
    setStage('quiz');
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setResult(null);
    setError(null);
  };

  const handleSelect = (optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIdx]: optionIdx }));
  };

  const handlePrevious = () => {
    setCurrentQuestionIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Please answer every question before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/lms/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          quizId,
          userAnswers: questions.map((_, index) => selectedAnswers[index] ?? -1),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Quiz submission failed');
      }

      setResult(data.data);
      setStage('result');
      onComplete(data.data.score, data.data.passed);
    } catch (submissionError: any) {
      setError(submissionError?.message || 'Quiz submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const restartQuiz = () => {
    setStage('intro');
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setResult(null);
    setError(null);
  };

  if (!questions.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No quiz questions were added for this lesson yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      {stage === 'intro' && (
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              <Sparkles size={14} className="text-cyan-300" />
              Assessment
            </div>
            <h3 className="mt-5 text-3xl font-black tracking-tight">{title}</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
              Review the key ideas from this lesson, answer the questions one by one, and get a clear pass/fail result at the end.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">Questions</p>
                <p className="mt-2 text-2xl font-black">{questions.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">Passing</p>
                <p className="mt-2 text-2xl font-black">{passingMarks}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">Mode</p>
                <p className="mt-2 text-2xl font-black">Demo</p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5"
            >
              <PlayCircle size={16} />
              Start quiz
            </button>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-6 md:p-8 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">What you will practice</p>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">Core AI definitions and terminology</div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">Recognizing practical AI use cases</div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">Distinguishing narrow AI from broader concepts</div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <ShieldCheck size={16} className="text-emerald-600" />
                Scoring tip
              </div>
              <p className="mt-2">
                Answer every question before submitting. You can navigate freely between questions before you finish.
              </p>
            </div>
          </div>
        </div>
      )}

      {stage === 'quiz' && (
        <div className="p-5 md:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Question {currentQuestionIdx + 1} of {totalQuestions}
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">{title}</h3>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              <BadgeCheck size={16} className="text-blue-600" />
              {answeredCount}/{totalQuestions} answered
            </div>
          </div>

          <div className="mb-6 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
              style={{ width: `${(currentQuestionIdx + 1) / totalQuestions * 100}%` }}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Current prompt</p>
                <h4 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{currentQuestion.questionText}</h4>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  const active = selectedAnswers[currentQuestionIdx] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={[
                        'w-full rounded-2xl border px-4 py-4 text-left transition-all',
                        active
                          ? 'border-blue-200 bg-blue-50 shadow-md shadow-blue-100'
                          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={[
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black',
                            active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500',
                          ].join(' ')}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-sm font-medium leading-7 text-slate-700">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIdx === 0 || submitting}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>

                {currentQuestionIdx < totalQuestions - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={selectedAnswers[currentQuestionIdx] === undefined}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next question
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={16} />}
                    Submit quiz
                  </button>
                )}
              </div>
            </div>

            <aside className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Question map</p>
              <div className="mt-4 space-y-2">
                {questions.map((question, index) => {
                  const answered = selectedAnswers[index] !== undefined;
                  const active = index === currentQuestionIdx;
                  return (
                    <button
                      key={question._id}
                      onClick={() => setCurrentQuestionIdx(index)}
                      className={[
                        'flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all',
                        active
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-black',
                          answered
                            ? 'bg-emerald-100 text-emerald-700'
                            : active
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-500',
                        ].join(' ')}
                      >
                        {answered ? <CheckCircle2 size={16} /> : index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">Question {index + 1}</p>
                        <p className="text-xs text-slate-500">{answered ? 'Answered' : 'Pending'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      )}

      {stage === 'result' && result && (
        <div className="grid gap-0 lg:grid-cols-[1fr_0.9fr]">
          <div
            className={[
              'p-6 md:p-8',
              result.passed
                ? 'bg-gradient-to-br from-emerald-50 to-white'
                : 'bg-gradient-to-br from-rose-50 to-white',
            ].join(' ')}
          >
            <div
              className={[
                'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em]',
                result.passed
                  ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                  : 'border-rose-200 bg-rose-100 text-rose-700',
              ].join(' ')}
            >
              {result.passed ? <Trophy size={14} /> : <Circle size={14} />}
              {result.passed ? 'Passed' : 'Needs practice'}
            </div>

            <h3 className="mt-5 text-3xl font-black text-slate-950">
              {result.passed ? 'Great job on the quiz' : 'Keep practicing and try again'}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              You scored <span className="font-bold text-slate-950">{result.score}</span> out of{' '}
              <span className="font-bold text-slate-950">{result.total}</span> questions.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Score</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{result.score}/{result.total}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Passing</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{passingMarks}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Attempts</p>
                <p className="mt-2 text-2xl font-black text-slate-950">1</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={restartQuiz}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700"
              >
                <RotateCcw size={16} />
                Retry quiz
              </button>
              <button
                onClick={() => {
                  if (onExit) {
                    onExit();
                    return;
                  }
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20"
              >
                Continue learning
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-950 p-6 text-white md:p-8 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
              <Sparkles size={14} className="text-cyan-300" />
              Review
            </div>
            <div className="mt-5 space-y-3">
              {questions.map((q, idx) => {
                const selected = selectedAnswers[idx];
                const correct = q.correctAnswerIndex;
                const isCorrect = selected === correct;
                return (
                  <div key={q._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">Q{idx + 1}. {q.questionText}</p>
                        <p className="mt-2 text-sm text-white/65">
                          Selected: {selected >= 0 ? q.options[selected] : 'No answer'}
                        </p>
                        <p className="mt-1 text-sm text-white/65">
                          Correct: {q.options[correct]}
                        </p>
                      </div>
                      <div
                        className={[
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                          isCorrect ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300',
                        ].join(' ')}
                      >
                        {isCorrect ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </div>
                    </div>
                    {q.explanation && <p className="mt-3 text-sm leading-7 text-white/70">{q.explanation}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
