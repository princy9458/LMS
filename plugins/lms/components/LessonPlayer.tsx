'use client';

import React from 'react';
import { PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const LessonPlayer = ({ lesson, syllabus, onComplete, onNext, onPrev }) => {
  if (!lesson) return null;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Video/Content Area */}
      <div className="flex-1 overflow-y-auto bg-background p-6 lg:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
            {lesson.type === 'video' ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <PlayCircle size={80} className="text-primary/50 group-hover:text-primary transition-colors cursor-pointer" />
                <div className="absolute bottom-6 left-6 right-6 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-1/3" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                <p>Text content would be rendered here</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
            <Button onClick={onComplete} className="rounded-full gap-2 px-6">
              <CheckCircle2 size={18} /> Mark as Complete
            </Button>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {lesson.content || 'In this lesson, we cover the core concepts of the topic. Ensure you follow along with the provided materials.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-10 border-t border-muted">
            <Button variant="outline" onClick={onPrev} className="gap-2 rounded-full">
              <ChevronLeft size={18} /> Previous Lesson
            </Button>
            <Button variant="outline" onClick={onNext} className="gap-2 rounded-full">
              Next Lesson <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Course Navigation Sidebar */}
      <div className="w-full lg:w-96 border-l bg-muted/20 flex flex-col h-full">
        <div className="p-6 border-b bg-background">
          <h2 className="font-bold text-lg mb-1">Course Content</h2>
          <p className="text-xs text-muted-foreground font-medium">12 of 34 lessons completed</p>
        </div>

        <ScrollArea className="flex-1 p-0">
          <div className="p-0">
            {syllabus?.modules?.map((module, mIdx) => (
              <div key={module._id} className="border-b last:border-0">
                <div className="p-4 px-6 bg-muted/40 text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  <span>Module {mIdx + 1}: {module.title}</span>
                </div>
                <div className="p-0">
                  {module.lessons?.map((l, lIdx) => {
                    const isActive = l._id === lesson._id;
                    return (
                      <div 
                        key={l._id} 
                        className={cn(
                          "flex items-center gap-4 p-4 px-6 cursor-pointer transition-all border-l-4",
                          isActive 
                            ? "bg-primary/5 border-primary text-primary" 
                            : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-bold",
                          isActive ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
                        )}>
                          {lIdx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold leading-tight line-clamp-1">{l.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-medium opacity-70">Video</span>
                            <span className="text-[10px] opacity-70 italic">• {l.duration || '5:00'} min</span>
                          </div>
                        </div>
                        {isActive ? (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LessonPlayer;
