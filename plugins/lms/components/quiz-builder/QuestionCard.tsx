'use client';

import React, { useState } from 'react';
import { Trash2, GripVertical, ChevronDown, ChevronUp, Plus, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnswerEditor } from './AnswerEditor';

interface Question {
  _id?: string;
  text: string;
  type: 'single' | 'multiple' | 'boolean' | 'short';
  points: number;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
  order: number;
}

interface QuestionCardProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function QuestionCard({ 
  question, 
  onUpdate, 
  onDelete, 
  isExpanded, 
  onToggle 
}: QuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const typeLabels = {
    single: 'Single Choice',
    multiple: 'Multiple Choice',
    boolean: 'True/False',
    short: 'Short Answer'
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden mb-4 group hover:border-blue-400 transition-colors">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={onToggle}>
          <GripVertical className="w-4 h-4 text-zinc-400 cursor-grab" />
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
            Q{question.order + 1}
          </span>
          <h3 className="text-sm font-bold text-zinc-900 truncate max-w-md">
            {question.text || 'Untitled Question'}
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-200/50 px-2 py-0.5 rounded">
            {typeLabels[question.type]}
          </span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {question.points} {question.points === 1 ? 'Point' : 'Points'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onDelete}
            className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onToggle}
            className="p-1 text-zinc-500"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Question Text</label>
              <textarea
                value={question.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="w-full p-3 bg-white border border-zinc-200 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none min-h-[80px]"
                placeholder="Enter your question here..."
              />
            </div>

            {/* Config Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Question Type</label>
                <select
                  value={question.type}
                  onChange={(e) => onUpdate({ type: e.target.value as Question['type'] })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded text-sm outline-none focus:border-blue-500"
                >
                  <option value="single">Single Choice</option>
                  <option value="multiple">Multiple Choice</option>
                  <option value="boolean">True/False</option>
                  <option value="short">Short Answer</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Points</label>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Answers */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Answers</label>
              <AnswerEditor 
                type={question.type}
                options={question.options || []}
                onChange={(options: any[]) => onUpdate({ options })}
              />
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Explanation (Optional)</label>
              <textarea
                value={question.explanation || ''}
                onChange={(e) => onUpdate({ explanation: e.target.value })}
                className="w-full p-3 bg-zinc-100/50 border border-dashed border-zinc-300 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none min-h-[60px]"
                placeholder="Provide an explanation for the correct answer..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
