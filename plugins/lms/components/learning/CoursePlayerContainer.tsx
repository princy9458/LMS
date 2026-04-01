'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VideoPlayer } from './VideoPlayer';
import { LessonSidebar } from './LessonSidebar';
import { ChevronRight, ChevronLeft, Menu, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CoursePlayerContainer({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [lessonRes, syllabusRes, enrollmentRes] = await Promise.all([
        fetch(`/api/lms/lesson/${lessonId}`),
        fetch(`/api/lms/courses/${courseId}/syllabus`),
        fetch(`/api/lms/enrollment/${courseId}`)
      ]);

      const lessonData = await lessonRes.json();
      const syllabusData = await syllabusRes.json();
      const enrollmentData = await enrollmentRes.json();

      setLesson(lessonData);
      setSyllabus(syllabusData);
      setEnrollment(enrollmentData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch player data', err);
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkComplete = async () => {
    try {
      const res = await fetch('/api/lms/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId, status: 'completed' })
      });
      const data = await res.json();
      
      // Update local enrollment state to show progress change
      if (data.progress) setEnrollment(data.progress);
      
      if (data.nextLessonId) {
        router.push(`/lms/learn/${courseId}/lesson/${data.nextLessonId}`);
      }
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const flatLessons = syllabus.reduce((acc: any[], module: any) => {
    return [...acc, ...(module.lessons || [])];
  }, []);

  const currentIndex = flatLessons.findIndex((l: any) => l._id === lessonId);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex !== -1 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-zinc-400">Loading your lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-950/50 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Learning Path</span>
            <h1 className="text-sm font-semibold truncate max-w-[300px]">{lesson.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/lms/course/${courseId}`)}
            className="text-xs font-bold px-4 py-2 hover:bg-white/5 rounded-lg transition-all"
          >
            Exit Player
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={cn(
          "absolute inset-y-0 left-0 z-20 w-80 bg-zinc-950 border-r border-white/10 transition-transform duration-300 transform",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full shadow-2xl shadow-black/50"
        )}>
          <LessonSidebar 
            courseId={courseId}
            currentLessonId={lessonId}
            syllabus={syllabus}
            enrollment={enrollment}
          />
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isSidebarOpen ? "ml-80" : "ml-0"
        )}>
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            {/* Player Area */}
            <div className="aspect-video bg-black relative shadow-2xl overflow-hidden group">
              <VideoPlayer 
                url={lesson.videoUrl} 
                onEnded={handleMarkComplete}
              />
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto w-full px-6 py-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-bold tracking-tight">{lesson.title}</h2>
                  <p className="text-zinc-500 text-sm">Last updated March 2026</p>
                </div>
                <button 
                  onClick={handleMarkComplete}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                >
                  <CheckCircle size={18} />
                  Complete & Next
                </button>
              </div>

              <div className="prose prose-invert prose-blue max-w-none prose-sm leading-relaxed text-zinc-300">
                {lesson.content ? (
                   <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                ) : (
                  <p className="italic text-zinc-500">No additional content provided for this lesson.</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <footer className="h-16 border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center gap-10 px-6">
            <button 
              disabled={!prevLesson}
              onClick={() => prevLesson && router.push(`/lms/learn/${courseId}/lesson/${prevLesson._id}`)}
              className={cn(
                "flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group",
                !prevLesson && "opacity-20 cursor-not-allowed"
              )}
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold">Previous</span>
            </button>
            <div className="h-1.5 w-64 bg-white/5 rounded-full overflow-hidden relative">
              <div 
                className="absolute inset-y-0 left-0 bg-blue-600 rounded-full transition-all duration-1000" 
                style={{ width: `${enrollment?.progressPercent || 0}%` }} 
              />
            </div>
            <button 
              disabled={!nextLesson}
              onClick={() => nextLesson && router.push(`/lms/learn/${courseId}/lesson/${nextLesson._id}`)}
              className={cn(
                "flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group",
                !nextLesson && "opacity-20 cursor-not-allowed"
              )}
            >
              <span className="text-sm font-bold">Next Lesson</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
