'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Providers } from '@/modules/lms/store/Providers';
import { Navbar } from '@/modules/lms/components/layout/Navbar';
import { AuthProvider } from '@/modules/lms/components/auth/AuthProvider';
import ToastProvider from '@/components/ToastProvider';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.includes('/admin/');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <Providers>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <ToastProvider />
        <main className="flex-1 w-full flex flex-col pt-4">
          <AuthProvider>{children}</AuthProvider>
        </main>
      </div>
    </Providers>
  );
}
