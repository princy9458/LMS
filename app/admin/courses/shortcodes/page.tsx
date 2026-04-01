'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminCoursesShortcodesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses" className="text-sm text-zinc-500 hover:text-zinc-900">
          &larr; Back to Courses
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Course Shortcodes</h1>
        <p className="text-sm text-zinc-500">Manage LearnDash-style shortcodes for course embeds.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md p-6">
        <p className="text-sm text-zinc-600">Shortcodes UI coming next. This route exists to mirror LearnDash tabs.</p>
      </div>
    </div>
  );
}
