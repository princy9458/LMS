'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useTransition } from 'react';
import {
  getStoredAdminContentLocale,
  normalizeAdminContentLocale,
  persistAdminContentLocale,
  type AdminContentLocale,
} from '@/lib/adminLocale';

type AdminLocaleContextValue = {
  locale: AdminContentLocale;
  setLocale: (locale: string) => void;
};

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null);

export function AdminLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AdminContentLocale>(() => getStoredAdminContentLocale() || 'en');
  const [, startTransition] = useTransition();

  useEffect(() => {
    persistAdminContentLocale(locale);
  }, [locale]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== undefined && event.key !== 'lms-one.admin-content-locale') {
        return;
      }

      const nextLocale = getStoredAdminContentLocale();
      if (nextLocale && nextLocale !== locale) {
        setLocaleState(nextLocale);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [locale]);

  const setLocale = (nextLocale: string) => {
    const normalized = normalizeAdminContentLocale(nextLocale);
    startTransition(() => {
      setLocaleState(normalized);
    });
  };

  const value = useMemo(
    () => ({ locale, setLocale }),
    [locale]
  );

  return <AdminLocaleContext.Provider value={value}>{children}</AdminLocaleContext.Provider>;
}

export function useAdminLocale() {
  const context = useContext(AdminLocaleContext);
  if (!context) {
    throw new Error('useAdminLocale must be used within an AdminLocaleProvider');
  }
  return context;
}
