'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, FileText, HelpCircle, Pencil, Trash2 } from 'lucide-react';
import { SortableItem } from './SortableItem';

interface LessonItemProps {
  lesson: any;
  onAddTopic: (id: string) => void;
  onAddQuiz: (id: string) => void;
}

export function LessonItem({ lesson, onAddTopic, onAddQuiz }: LessonItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden mb-3 ml-6 shadow-sm group/lesson transition-all hover:border-zinc-300">
      <div className="flex items-center justify-between p-3.5 bg-zinc-50/30 hover:bg-white transition-all">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-all"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-800 text-sm tracking-tight">{lesson.title}</span>
              <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider border border-indigo-100">Lesson</span>
            </div>
            {(lesson.topics?.length > 0 || lesson.quizzes?.length > 0) && (
              <span className="text-[9px] text-zinc-400 font-bold uppercase mt-1">
                {lesson.topics?.length || 0} Topics • {lesson.quizzes?.length || 0} Quizzes
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-all scale-95 group-hover/lesson:scale-100">
          <button 
            className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
            onClick={() => onAddTopic(lesson._id)}
            title="Add Topic"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-zinc-200"></div>
          <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all">
            <Pencil className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-zinc-50/50 border-t border-zinc-100 space-y-2.5">
          {lesson.topics?.map((topic: any) => (
            <SortableItem key={topic._id} id={topic._id} handle={true}>
              <div className="flex items-center gap-3 p-2.5 bg-white border border-zinc-200 rounded-xl ml-6 shadow-sm hover:border-zinc-300 transition-all group/item">
                <div className="bg-emerald-50 p-1.5 rounded-lg">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-sm text-zinc-700 font-semibold flex-1 tracking-tight">{topic.title}</span>
                <span className="text-[8px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest hidden group-hover/item:block">Topic</span>
              </div>
            </SortableItem>
          ))}
          {lesson.quizzes?.map((quiz: any) => (
            <SortableItem key={quiz._id} id={quiz._id} handle={true}>
              <div className="flex items-center gap-3 p-2.5 bg-white border border-zinc-200 rounded-xl ml-6 shadow-sm hover:border-zinc-300 transition-all group/item">
                <div className="bg-amber-50 p-1.5 rounded-lg">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-sm text-zinc-700 font-semibold flex-1 tracking-tight">{quiz.title}</span>
                <span className="text-[8px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest hidden group-hover/item:block">Quiz</span>
              </div>
            </SortableItem>
          ))}
          {(lesson.topics?.length === 0 && lesson.quizzes?.length === 0) && (
            <div className="ml-8 py-4 border-2 border-dashed border-zinc-200 rounded-xl bg-white/50 text-center">
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">No interactive content yet</p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <button onClick={() => onAddTopic(lesson._id)} className="text-[10px] text-indigo-600 font-bold hover:underline">+ ADD TOPIC</button>
                <button onClick={() => onAddQuiz(lesson._id)} className="text-[10px] text-amber-600 font-bold hover:underline">+ ATTACH QUIZ</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
