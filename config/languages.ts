import supportedLanguagesData from '@/config/supportedLanguages.json';

export type LanguageDefinition = {
  code: string;
  label: string;
  nativeLabel: string;
};

export const SUPPORTED_LANGUAGES: ReadonlyArray<LanguageDefinition> =
  supportedLanguagesData as LanguageDefinition[];

export type SupportedLanguageCode = string;

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((language) => language.code);

export const DEFAULT_LANGUAGE: SupportedLanguageCode =
  SUPPORTED_LANGUAGE_CODES.includes('en') ? 'en' : SUPPORTED_LANGUAGE_CODES[0] || 'en';

export function isSupportedLanguageCode(value?: string | null): value is SupportedLanguageCode {
  return Boolean(value && SUPPORTED_LANGUAGE_CODES.includes(value));
}

export function getLanguageDefinition(code?: string | null) {
  return SUPPORTED_LANGUAGES.find((language) => language.code === code) || null;
}

export function getLanguageLabel(code?: string | null) {
  return getLanguageDefinition(code)?.label || code || '';
}

export function createEmptyLanguageRecord(defaultValue = '') {
  return SUPPORTED_LANGUAGE_CODES.reduce<Record<string, string>>((acc, code) => {
    acc[code] = defaultValue;
    return acc;
  }, {});
}
