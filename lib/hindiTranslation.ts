import hindiTranslationMap from '@/config/hindiTranslationMap.json';

type LocalizedFieldValue = Record<string, string>;

const translationMap = hindiTranslationMap as Record<string, string>;

export function translateToHindi(text?: string | null) {
  const normalizedText = typeof text === 'string' ? text.trim() : '';
  if (!normalizedText) {
    return '';
  }

  return translationMap[normalizedText] || normalizedText;
}

export function autofillHindiTranslation<T extends LocalizedFieldValue>(value: T): T {
  const englishValue = typeof value?.en === 'string' ? value.en.trim() : '';
  const hindiValue = typeof value?.hi === 'string' ? value.hi.trim() : '';

  if (!englishValue || hindiValue) {
    return value;
  }

  return {
    ...value,
    hi: translateToHindi(englishValue),
  };
}
