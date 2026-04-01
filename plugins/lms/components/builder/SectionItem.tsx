'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Layout, BookOpen } from 'lucide-react';
import { LessonItem } from './LessonItem';
import { SortableItem } from './SortableItem';

interface SectionItemProps {
  section: any;
  onAddLesson: (id: string) => void;
  onAddTopic: (id: string) => void;
  onAddQuiz: (id: string) => void;
}

export function SectionItem({ section, onAddLesson, onAddTopic, onAddQuiz }: SectionItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden mb-6 group/section">
      <div className="flex items-center justify-between p-5 bg-zinc-50/50 hover:bg-zinc-50 transition-all border-b border-zinc-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-zinc-900 tracking-tight leading-none">{section.title}</span>
              <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded-md font-black uppercase tracking-widest shadow-sm">Module</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase mt-1.5 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {section.lessons?.length || 0} Lessons
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover/section:opacity-100 transition-all scale-95 group-hover/section:scale-100">
          <button 
            className="px-3 py-1.5 gap-1.5 bg-white border border-zinc-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 font-bold rounded-lg text-xs flex items-center transition-all shadow-sm active:scale-95"
            onClick={() => onAddLesson(section._id)}
          >
            <Plus className="w-4 h-4" />
            <span>Add Lesson</span>
          </button>
          <div className="h-6 w-px bg-zinc-200 mx-1"></div>
          <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all">
            <Pencil className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-4 bg-white/50">
          {section.lessons?.length > 0 ? (
            <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-6 before:w-0.5 before:bg-zinc-100">
              {section.lessons.map((lesson: any) => (
                <SortableItem key={lesson._id} id={lesson._id} handle={true}>
                  <LessonItem 
                    lesson={lesson} 
                    onAddTopic={onAddTopic} 
                    onAddQuiz={onAddQuiz} 
                  />
                </SortableItem>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/30">
              <p className="text-sm text-zinc-400 font-bold">No curriculum defined for this section.</p>
              <button 
                className="mt-3 text-indigo-600 hover:text-indigo-700 font-black text-sm transition-colors flex items-center gap-2 mx-auto"
                onClick={() => onAddLesson(section._id)}
              >
                <Plus className="w-4 h-4" />
                Add First Lesson
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
