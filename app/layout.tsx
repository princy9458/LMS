'use client';

import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/modules/lms/store/Providers';
import Link from 'next/link';
import { Navbar } from '@/modules/lms/components/layout/Navbar';
import { AuthProvider } from '@/modules/lms/components/auth/AuthProvider';
import ToastProvider from '@/components/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [faviconUrl, setFaviconUrl] = useState<string>('/favicon.ico');

  useEffect(() => {
    fetch('/api/admin/settings?group=general')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data.faviconUrl) {
          setFaviconUrl(json.data.faviconUrl);
        }
      })
      .catch(err => console.error('Failed to fetch favicon', err));
  }, []);

  return (
    <html lang="en">
      <head>
        <title>LMS One Platform</title>
        <meta name="description" content="A modular Next.js LMS platform with Opportunities integration." />
        <link rel="icon" href={faviconUrl} />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <ToastProvider />
            
            <main className="flex-1 w-full flex flex-col pt-4">
              <AuthProvider>
                {children}
              </AuthProvider>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
