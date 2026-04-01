'use client';

import React, { Suspense } from 'react';
import { SettingsSidebar } from '@/plugins/lms/components/settings/SettingsSidebar';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-white h-full border border-zinc-200 overflow-hidden">
      <Suspense fallback={<div className="w-56 bg-white border-r border-zinc-200 h-full animate-pulse" />}>
        <SettingsSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
