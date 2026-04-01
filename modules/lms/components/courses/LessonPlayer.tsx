import React from 'react';

interface LessonPlayerProps {
  lessonId: string;
  title: string;
  videoUrl?: string;
  content?: string;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({ title, videoUrl, content }) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-6">
      <div className="rounded-xl overflow-hidden bg-black/5 border shadow-sm aspect-video flex items-center justify-center relative">
        {videoUrl ? (
          <video 
            controls 
            className="w-full h-full object-cover"
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 mb-2 opacity-50"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
             <p>No video available for this lesson</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground bg-muted/30 p-6 rounded-xl border">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p>No content details provided.</p>
          )}
        </div>
      </div>
    </div>
  );
};
