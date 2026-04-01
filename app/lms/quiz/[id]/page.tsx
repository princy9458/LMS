'use client';

import React from 'react';
import { useCourse } from '@/plugins/lms/hooks/useLmsData';
import QuizPlayer from '@/plugins/lms/components/QuizPlayer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuizView() {
  const router = useRouter();
  // Using seed data for structure mockup
  const { course, loading } = useCourse('course_001');

  if (loading) return <div className="p-10"><Skeleton className="w-full h-[500px] rounded-2xl" /></div>;

  // Find a quiz from the course (mockup logic)
  const quiz = course?.modules?.[0]?.lessons?.[1]?.quizzes?.[0] || {
    title: 'Architecture Baseline Quiz',
    passingScore: 80,
    questions: [
      {
        _id: 'q1',
        text: 'What is the primary integration point for the LMS plugin?',
        options: ['Shared Database', 'External API', 'Hard-coded values', 'None'],
        correctAnswer: 'Shared Database'
      }
    ]
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Button 
        variant="ghost" 
        className="mb-6 gap-2 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ChevronLeft size={16} /> Exit Quiz
      </Button>
      <QuizPlayer quiz={quiz} onFinish={(res) => console.log('Quiz finished', res)} />
    </div>
  );
}
