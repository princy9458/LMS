import enCommon from '@/public/locales/en/common.json';
import esCommon from '@/public/locales/es/common.json';
import frCommon from '@/public/locales/fr/common.json';
import hiCommon from '@/public/locales/hi/common.json';
import { CONTENT_LANGUAGE_CODES } from '@/config/contentLanguages';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from '@/config/languages';

export const locales = SUPPORTED_LANGUAGE_CODES;
export type Locale = string;

export const defaultLocale: Locale = DEFAULT_LANGUAGE;
export const LOCALE_PREFERENCE_KEY = 'lms-one.locale';

type CommonMessages = typeof enCommon.common;
type TranslationKey = string;

const commonMessages: Record<string, CommonMessages> = {
  en: enCommon.common,
  hi: hiCommon.common,
  fr: frCommon.common,
  es: esCommon.common,
};

export function isSupportedLocale(value: string): value is Locale {
  return locales.includes(value);
}

export function isRtlLocale(value?: string | null) {
  const locale = value?.trim().toLowerCase();
  return locale === 'ar' || locale === 'he' || locale === 'fa' || locale === 'ur';
}

export function normalizeLocale(value?: string | null): Locale {
  const locale = value?.trim().toLowerCase();
  return locale && isSupportedLocale(locale) ? locale : defaultLocale;
}

export function getContentLocale(value?: string | null): (typeof CONTENT_LANGUAGE_CODES)[number] {
  const locale = value?.trim().toLowerCase();
  return CONTENT_LANGUAGE_CODES.includes(locale || '')
    ? (locale || '')
    : 'en';
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split('/')[1];
  return segment && isSupportedLocale(segment) ? segment : defaultLocale;
}

export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_PREFERENCE_KEY);
  return storedLocale && isSupportedLocale(storedLocale) ? storedLocale : null;
}

export function getBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return defaultLocale;
  }

  const browserLocales = [...(navigator.languages || []), navigator.language];

  for (const candidate of browserLocales) {
    const normalizedCandidate = candidate?.toLowerCase().split('-')[0];
    if (normalizedCandidate && isSupportedLocale(normalizedCandidate)) {
      return normalizedCandidate;
    }
  }

  return defaultLocale;
}

export function getPreferredLocale(): Locale {
  return getStoredLocale() || getBrowserLocale() || defaultLocale;
}

export function persistPreferredLocale(locale: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedLocale = normalizeLocale(locale);
  window.localStorage.setItem(LOCALE_PREFERENCE_KEY, normalizedLocale);
  document.cookie = `${LOCALE_PREFERENCE_KEY}=${normalizedLocale}; path=/; max-age=31536000; samesite=lax`;
}

export function getCommonMessages(locale: string): CommonMessages {
  return commonMessages[normalizeLocale(locale)] || commonMessages[defaultLocale];
}

export function translateCommon(locale: string, key: TranslationKey): string {
  const messages = getCommonMessages(locale);
  return messages[key as keyof CommonMessages] ?? commonMessages[defaultLocale][key as keyof CommonMessages] ?? String(key);
}

export function getLocalePath(locale: string, path = '/'): string {
  const resolvedLocale = normalizeLocale(locale);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath === '/') {
    return `/${resolvedLocale}`;
  }

  return `/${resolvedLocale}${normalizedPath}`;
}
