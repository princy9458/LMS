'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCourse } from '@/plugins/lms/hooks/useLmsData';
import LessonPlayer from '@/plugins/lms/components/LessonPlayer';
import { Skeleton } from '@/components/ui/skeleton';

export default function LessonView() {
  const params = useParams();
  const router = useRouter();
  
  // In a real app, we'd fetch the specific lesson and its parent course
  // For now, we'll use the useCourse hook and find the lesson in the syllabus
  const { course, loading } = useCourse(params.courseId || 'course_001'); // Fallback for dev

  if (loading) return <div className="p-10"><Skeleton className="w-full h-[600px] rounded-2xl" /></div>;
  
  // Find current lesson (simplified for mockup)
  const allLessons = course?.modules?.flatMap(m => m.lessons) || [];
  const lesson = allLessons.find(l => l._id === params.id) || allLessons[0];

  return (
    <div className="bg-background">
      <LessonPlayer 
        lesson={lesson} 
        syllabus={course}
        onComplete={() => console.log('Lesson completed')}
        onNext={() => console.log('Next lesson')}
        onPrev={() => router.back()}
      />
    </div>
  );
}
