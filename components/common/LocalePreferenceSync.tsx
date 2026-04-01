'use client';

import { useEffect } from 'react';
import { isSupportedLocale, persistPreferredLocale } from '@/lib/i18n';

type LocalePreferenceSyncProps = {
  locale: string;
};

export default function LocalePreferenceSync({ locale }: LocalePreferenceSyncProps) {
  useEffect(() => {
    if (isSupportedLocale(locale)) {
      persistPreferredLocale(locale);
    }
  }, [locale]);

  return null;
}
