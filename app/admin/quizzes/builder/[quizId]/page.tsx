'use client';

import React, { Suspense } from 'react';
import { QuizBuilderContainer } from '@/plugins/lms/components/quiz-builder/QuizBuilderContainer';
import { Loader2 } from 'lucide-react';

export default function QuizBuilderPage({ params }) {
  const { quizId } = params;

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-zinc-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-zinc-500 font-semibold animate-pulse">Initializing Advanced Quiz Builder...</p>
      </div>
    }>
      <QuizBuilderContainer quizId={quizId} />
    </Suspense>
  );
}
