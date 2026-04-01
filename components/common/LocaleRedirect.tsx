'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalePath, getPreferredLocale, persistPreferredLocale } from '@/lib/i18n';

export default function LocaleRedirect() {
  const router = useRouter();

  useEffect(() => {
    const preferredLocale = getPreferredLocale();
    persistPreferredLocale(preferredLocale);
    router.replace(getLocalePath(preferredLocale));
  }, [router]);

  return null;
}
