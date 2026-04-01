'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Database, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Question } from './QuizBuilderContainer';

interface QuestionBankModalProps {
  quizId: string;
  onImport: (questions: Question[]) => void;
  onClose: () => void;
}

export function QuestionBankModal({ quizId, onImport, onClose }: QuestionBankModalProps) {
  const [query, setQuery] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const searchQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/quizzes/builder/${quizId}/questions?q=${query}`);
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchQuestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, quizId]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleImport = () => {
    const selectedQuestions = questions.filter(q => selectedIds.includes(q._id));
    onImport(selectedQuestions);
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Question Bank</h2>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Import reusable questions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by question text or tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
              <p className="text-xs text-zinc-500 font-medium tracking-wide animate-pulse">Searching the vault...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-zinc-400 font-medium">No questions found matching your search.</p>
            </div>
          ) : (
            questions.map(q => (
              <div 
                key={q._id}
                onClick={() => toggleSelect(q._id)}
                className={cn(
                  "p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-4",
                  selectedIds.includes(q._id) 
                    ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/10" 
                    : "border-zinc-100 hover:border-zinc-300 bg-white"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center mt-0.5",
                  selectedIds.includes(q._id) ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-300 bg-white"
                )}>
                  {selectedIds.includes(q._id) && <Plus className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 truncate mb-1">{q.text}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded uppercase leading-none">
                      {q.type}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded leading-none">
                      {q.points} Pts
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <p className="text-xs text-zinc-500 font-medium">
            {selectedIds.length} questions selected
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedIds.length === 0}
              className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none hover:bg-blue-700 transition-all active:scale-95"
            >
              Import Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
