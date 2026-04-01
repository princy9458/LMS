'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface AnswerEditorProps {
  type: 'single' | 'multiple' | 'boolean' | 'short';
  options: Option[];
  onChange: (options: Option[]) => void;
}

export function AnswerEditor({ type, options, onChange }: AnswerEditorProps) {
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);

  useEffect(() => {
    const index = options.findIndex((opt) => opt.isCorrect);
    setCorrectIndex(index >= 0 ? index : null);
  }, [options]);

  const addOption = () => {
    const newOption: Option = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      isCorrect: options.length === 0
    };
    onChange([...options, newOption]);
  };

  const removeOption = (id: string) => {
    const newOptions = options.filter(opt => opt.id !== id);
    // Ensure at least one is correct if it was the one removed
    if (newOptions.length > 0 && !newOptions.some(opt => opt.isCorrect)) {
      newOptions[0].isCorrect = true;
    }
    onChange(newOptions);
  };

  const updateOption = (id: string, updates: Partial<Option>) => {
    const newOptions = options.map((opt) => (opt.id === id ? { ...opt, ...updates } : opt));
    onChange(newOptions);
  };

  const setSingleCorrect = (index: number) => {
    setCorrectIndex(index);
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    onChange(newOptions);
  };

  if (type === 'short') {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded p-4 text-center border-dashed">
        <p className="text-xs text-zinc-500 font-medium italic">
          Short answer questions don't have predefined options. Students will provide their own text.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isActive = type === 'multiple' ? option.isCorrect : index === correctIndex;
        return (
        <div key={option.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-1 duration-200">
          <button
            onClick={() => {
              if (type === 'multiple') {
                updateOption(option.id, { isCorrect: !option.isCorrect });
                return;
              }
              setSingleCorrect(index);
            }}
            className={cn(
              "flex-shrink-0 w-5 h-5 flex items-center justify-center transition-all",
              isActive ? "text-green-600 scale-110" : "text-zinc-300 hover:text-zinc-400"
            )}
          >
            {type === 'multiple' ? (
              <CheckCircle2 className={cn("w-5 h-5", option.isCorrect ? "fill-green-50" : "")} />
            ) : (
              <Circle className={cn("w-5 h-5", isActive ? "fill-green-600" : "")} />
            )}
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={option.text}
              onChange={(e) => updateOption(option.id, { text: e.target.value })}
              className={cn(
                "w-full px-4 py-2 bg-white border rounded text-sm transition-all focus:ring-2 focus:ring-blue-500/10 outline-none",
                isActive ? "border-green-200 bg-green-50/30" : "border-zinc-200 focus:border-blue-400"
              )}
              placeholder={`Answer option ${index + 1}...`}
            />
          </div>

          {type !== 'boolean' && (
            <button
              onClick={() => removeOption(option.id)}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      );
      })}

      {type !== 'boolean' && (
        <button
          onClick={addOption}
          className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded transition-all mt-4 w-full justify-center border border-dashed border-blue-200"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Answer Option
        </button>
      )}

      {type === 'boolean' && options.length === 0 && (
        <div className="flex gap-4">
          <button 
            onClick={() => onChange([
              { id: 'true', text: 'True', isCorrect: true },
              { id: 'false', text: 'False', isCorrect: false }
            ])}
            className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded"
          >
            Generate True/False Options
          </button>
        </div>
      )}
    </div>
  );
}
