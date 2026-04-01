import type { SupportedLanguageCode } from '@/config/languages';
import { DEFAULT_LANGUAGE, createEmptyLanguageRecord } from '@/config/languages';

export type LocalizedText =
  | string
  | Partial<Record<SupportedLanguageCode, string>>
  | Record<string, string>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeLocaleCode(value: string) {
  return value.trim().toLowerCase();
}

export const emptyLocalizedText = (locales: string[] = []) => {
  const normalized = createEmptyLanguageRecord('');

  for (const locale of locales) {
    const normalizedLocale = normalizeLocaleCode(locale);
    if (normalizedLocale) {
      normalized[normalizedLocale] = normalized[normalizedLocale] ?? '';
    }
  }

  if (!normalized[DEFAULT_LANGUAGE]) {
    normalized[DEFAULT_LANGUAGE] = '';
  }

  return normalized;
};

export function normalizeLocalizedText(value: LocalizedText | null | undefined) {
  const normalized = emptyLocalizedText();

  if (typeof value === 'string') {
    normalized[DEFAULT_LANGUAGE] = value.trim();
    return normalized;
  }

  if (!isPlainObject(value)) {
    return normalized;
  }

  for (const [locale, localizedValue] of Object.entries(value)) {
    if (typeof localizedValue !== 'string') {
      continue;
    }

    const normalizedLocale = normalizeLocaleCode(locale);
    if (!normalizedLocale) {
      continue;
    }

    normalized[normalizedLocale] = localizedValue.trim();
  }

  if (!normalized[DEFAULT_LANGUAGE]) {
    const firstAvailableLocale = Object.keys(normalized).find((locale) => normalized[locale]);
    if (firstAvailableLocale) {
      normalized[DEFAULT_LANGUAGE] = normalized[firstAvailableLocale];
    }
  }

  return normalized;
}

export function getTranslatedField(field: LocalizedText | null | undefined, locale?: string) {
  const normalized = normalizeLocalizedText(field);
  const requestedLocale = normalizeLocaleCode(locale || '') || DEFAULT_LANGUAGE;

  return normalized[requestedLocale] || normalized[DEFAULT_LANGUAGE] || '';
}

export function hasEnglishTranslation(field: LocalizedText | null | undefined) {
  return Boolean(normalizeLocalizedText(field)[DEFAULT_LANGUAGE]);
}

export function localizedTextField(overrides = {}) {
  return {
    type: Object,
    default: emptyLocalizedText,
    set: normalizeLocalizedText,
    ...overrides,
  };
}

export function localizedTextArrayField(overrides = {}) {
  return {
    type: [Object],
    default: undefined,
    set: (value: LocalizedText[] | undefined) =>
      Array.isArray(value) ? value.map((item) => normalizeLocalizedText(item)) : value,
    ...overrides,
  };
}
