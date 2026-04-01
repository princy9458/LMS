'use client';

import React from 'react';
import Link from 'next/link';

export default function LessonCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/lessons" className="text-sm text-zinc-500 hover:text-zinc-900">
          &larr; Back to Lessons
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Lesson Categories</h1>
        <p className="text-sm text-zinc-500">Manage lesson categories.</p>
      </div>
      <div className="bg-white border border-zinc-200 rounded-md p-4">
        <p className="text-sm text-zinc-600">No categories found.</p>
      </div>
    </div>
  );
}
