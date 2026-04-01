'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { getLocaleFromPathname, getLocalePath } from '@/lib/i18n';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const localizedLoginPath = getLocalePath(locale, '/admin/login');

  // The login page should not have the sidebar/topbar layout
  if (pathname === '/admin/login' || pathname === localizedLoginPath) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-50 border-t border-zinc-200 shadow-[inset_0_4px_6px_-4px_rgba(0,0,0,0.05)]">
          {children}
        </main>
      </div>
    </div>
  );
}
