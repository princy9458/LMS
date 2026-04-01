'use client';

import React from 'react';
import { SettingsSidebar } from './SettingsSidebar';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      <SettingsSidebar />
      <main className="flex-1 overflow-y-auto bg-zinc-50/10">
        {children}
      </main>
    </div>
  );
}
