import { Suspense } from 'react';
import { CoursePlayerContainer } from '@/plugins/lms/components/learning/CoursePlayerContainer';

export default function LearningPage({ 
  params 
}: { 
  params: { id: string; lessonId: string } 
}) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <CoursePlayerContainer 
        courseId={params.id} 
        lessonId={params.lessonId} 
      />
    </Suspense>
  );
}
