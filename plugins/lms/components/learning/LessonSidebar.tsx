'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Play, CheckCircle2, Lock, ChevronDown, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonSidebarProps {
  courseId: string;
  currentLessonId: string;
  syllabus: any[];
  enrollment: any;
}

export function LessonSidebar({ courseId, currentLessonId, syllabus, enrollment }: LessonSidebarProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Course Content</h3>
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                  style={{ width: `${enrollment?.progressPercent || 0}%` }} 
                />
            </div>
            <span className="text-[10px] font-bold text-zinc-500">{enrollment?.progressPercent || 0}%</span>
        </div>
      </div>

      <div className="flex-1 py-4">
        {syllabus.map((module: any, mIdx: number) => (
          <div key={module._id} className="mb-4">
            <div className="px-6 py-2 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-bold text-zinc-600 w-4">{mIdx + 1}</span>
                 <h4 className="text-xs font-bold text-zinc-300 truncate tracking-tight">{module.title}</h4>
              </div>
              <ChevronDown size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>

            <div className="mt-1">
              {module.lessons?.map((lesson: any) => {
                const isActive = lesson._id === currentLessonId;
                const isCompleted = enrollment?.completedLessons?.includes(lesson._id);
                const isLocked = false; // Optional logic for future

                return (
                  <button
                    key={lesson._id}
                    onClick={() => !isLocked && router.push(`/lms/learn/${courseId}/lesson/${lesson._id}`)}
                    className={cn(
                      "w-full px-6 py-3 flex items-start gap-3 transition-all border-l-2",
                      isActive 
                        ? "bg-blue-600/10 border-blue-600 text-white" 
                        : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5",
                      isLocked && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : isLocked ? (
                        <Lock size={16} className="text-zinc-700" />
                      ) : (
                        <Play size={16} className={isActive ? "text-blue-500" : "text-zinc-600"} />
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <span className={cn(
                        "text-xs font-medium text-left leading-snug",
                        isActive && "font-bold"
                      )}>
                        {lesson.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-600">Video</span>
                        <span className="text-[9px] font-bold text-zinc-700">•</span>
                        <span className="text-[9px] font-bold text-zinc-600">12:45</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
