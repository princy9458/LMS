'use client';

import React from 'react';
import Link from 'next/link';

export default function QuizWpTagsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/quizzes" className="text-sm text-zinc-500 hover:text-zinc-900">
          &larr; Back to Quizzes
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Tags</h1>
        <p className="text-sm text-zinc-500">Manage WordPress tags.</p>
      </div>
      <div className="bg-white border border-zinc-200 rounded-md p-4">
        <p className="text-sm text-zinc-600">No tags found.</p>
      </div>
    </div>
  );
}
