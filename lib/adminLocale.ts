import { CONTENT_LANGUAGES } from '@/config/contentLanguages';

export type AdminContentLocale = (typeof CONTENT_LANGUAGES)[number]['code'];

export const ADMIN_CONTENT_LOCALE_KEY = 'lms-one.admin-content-locale';

export function isAdminContentLocale(value?: string | null): value is AdminContentLocale {
  return Boolean(value && CONTENT_LANGUAGES.some((language) => language.code === value));
}

export function normalizeAdminContentLocale(value?: string | null): AdminContentLocale {
  return isAdminContentLocale(value) ? value : 'en';
}

export function getStoredAdminContentLocale(): AdminContentLocale | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(ADMIN_CONTENT_LOCALE_KEY);
  if (stored) {
    return normalizeAdminContentLocale(stored);
  }

  const cookie = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${ADMIN_CONTENT_LOCALE_KEY}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.split('=').slice(1).join('=');
  return normalizeAdminContentLocale(value);
}

export function persistAdminContentLocale(locale: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalized = normalizeAdminContentLocale(locale);
  window.localStorage.setItem(ADMIN_CONTENT_LOCALE_KEY, normalized);
  document.cookie = `${ADMIN_CONTENT_LOCALE_KEY}=${normalized}; path=/; max-age=31536000; samesite=lax`;
}

export function getLocalizedValue(value: Record<string, string> | undefined | null, locale: string) {
  if (!value || typeof value !== 'object') {
    return '';
  }

  const normalized = normalizeAdminContentLocale(locale);
  return value[normalized] || value.en || Object.values(value).find((entry) => typeof entry === 'string' && entry.trim()) || '';
}

export function getLocaleCompletion(value: Record<string, string> | undefined | null) {
  return CONTENT_LANGUAGES.reduce<Record<string, 'complete' | 'partial' | 'missing'>>((acc, language) => {
    const translated = typeof value?.[language.code] === 'string' ? value[language.code].trim() : '';
    if (translated) {
      acc[language.code] = 'complete';
      return acc;
    }

    acc[language.code] = language.code === 'en'
      ? 'missing'
      : value?.en?.trim()
        ? 'partial'
        : 'missing';
    return acc;
  }, {});
}
