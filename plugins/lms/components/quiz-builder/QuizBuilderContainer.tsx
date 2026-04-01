'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Save, Loader2, ChevronLeft, LayoutPanelLeft, Database, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QuestionCard } from './QuestionCard';
import { cn } from '@/lib/utils';

import { QuestionBankModal } from './QuestionBankModal';

export interface Question {
  _id: string;
  text: string;
  type: 'single' | 'multiple' | 'boolean' | 'short';
  points: number;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
  order: number;
}

interface Quiz {
  _id: string;
  title: string;
  passingScore: number;
  totalPoints: number;
  timeLimit?: number;
}

export function QuizBuilderContainer({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);

  const fetchQuizData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/quizzes/builder/${quizId}`);
      if (!res.ok) throw new Error('Failed to fetch quiz');
      const data = await res.json();
      setQuiz(data);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  const handleAddQuestion = async () => {
    const newQuestion = {
      text: '',
      type: 'single',
      points: 1,
      options: [
        { id: '1', text: 'Option 1', isCorrect: true },
        { id: '2', text: 'Option 2', isCorrect: false }
      ],
      order: questions.length
    };

    try {
      const res = await fetch(`/api/admin/quizzes/builder/${quizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      const savedQuestion = await res.json();
      setQuestions([...questions, savedQuestion]);
      setExpandedId(savedQuestion._id);
      setIsDirty(true);
    } catch (err) {
      console.error('Failed to add question', err);
    }
  };

  const handleUpdateQuestion = async (questionId: string, updates: Partial<Question>) => {
    // Optimistic update
    setQuestions(prev => prev.map(q => q._id === questionId ? { ...q, ...updates } : q));
    setIsDirty(true);

    try {
      await fetch(`/api/admin/quizzes/builder/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to update question', err);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await fetch(`/api/admin/quizzes/builder/${quizId}/questions/${questionId}`, {
        method: 'DELETE'
      });
      setQuestions(prev => prev.filter(q => q._id !== questionId));
      setIsDirty(true);
    } catch (err) {
      console.error('Failed to delete question', err);
    }
  };

  const handleImportQuestions = async (selectedQuestions: Question[]) => {
    try {
      const res = await fetch(`/api/admin/quizzes/builder/${quizId}/questions/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: selectedQuestions })
      });
      const newQuestions = await res.json();
      setQuestions([...questions, ...newQuestions]);
      setIsBankOpen(false);
      setIsDirty(true);
    } catch (err) {
      console.error('Failed to import questions', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-zinc-500 font-medium">Loading quiz structure...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-500" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-widest uppercase">
                Quiz Builder
              </span>
              {isDirty && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded tracking-widest uppercase animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  Unsaved Changes
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">{quiz?.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded transition-all"
          >
            Preview Quiz
          </button>
          <button
            onClick={() => setIsBankOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 rounded hover:bg-zinc-200 transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            Question Bank
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
              <LayoutPanelLeft className="w-4 h-4 text-blue-600" />
              Quiz Questions ({questions.length})
            </h2>
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="bg-white border border-dashed border-zinc-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">No questions yet</h3>
              <p className="text-xs text-zinc-500 mb-6">Start building your quiz by adding your first question.</p>
              <button
                onClick={handleAddQuestion}
                className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                Add Your First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  isExpanded={expandedId === q._id}
                  onToggle={() => setExpandedId(expandedId === q._id ? null : q._id)}
                  onUpdate={(updates) => handleUpdateQuestion(q._id, updates)}
                  onDelete={() => handleDeleteQuestion(q._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-900 mb-4 pb-4 border-b border-zinc-50">Quiz Settings</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Passing Score (%)</label>
                <input
                  type="number"
                  value={quiz?.passingScore}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded text-sm outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Time Limit (Min)</label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={quiz?.timeLimit || ''}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-zinc-50 flex items-center justify-between">
                <div className="text-center flex-1 border-r border-zinc-50">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Points</p>
                  <p className="text-xl font-extrabold text-zinc-900">{quiz?.totalPoints || 0}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Questions</p>
                  <p className="text-xl font-extrabold text-zinc-900">{questions.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-xl p-6 shadow-xl shadow-blue-500/20 text-white">
            <h3 className="font-bold text-sm mb-2">Need to reuse questions?</h3>
            <p className="text-xs text-blue-100 mb-4 opacity-90 leading-relaxed">
              Open the Question Bank to find questions from your other quizzes and import them here.
            </p>
            <button
               onClick={() => setIsBankOpen(true)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold transition-all"
            >
              Browse Bank
            </button>
          </div>
        </div>
      </div>

      {isBankOpen && (
        <QuestionBankModal 
          quizId={quizId}
          onClose={() => setIsBankOpen(false)}
          onImport={handleImportQuestions}
        />
      )}
    </div>
  );
}
