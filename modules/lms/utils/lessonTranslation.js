import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from '@/config/languages';
import { normalizeLocalizedField } from '@/modules/lms/utils/courseLocalization';

function extractOutputText(responseBody) {
  if (typeof responseBody?.output_text === 'string' && responseBody.output_text.trim()) {
    return responseBody.output_text.trim();
  }

  const text = (responseBody?.output || [])
    .flatMap((item) => item?.content || [])
    .filter((item) => item?.type === 'output_text' && typeof item.text === 'string')
    .map((item) => item.text)
    .join('')
    .trim();

  return text;
}

export async function translateLessonContent({ content, targetLocale, sourceLocale = DEFAULT_LANGUAGE }) {
  const normalizedContent = normalizeLocalizedField(content);
  const resolvedTargetLocale = SUPPORTED_LANGUAGE_CODES.includes(targetLocale) ? targetLocale : DEFAULT_LANGUAGE;
  const sourceText = normalizedContent[sourceLocale] || normalizedContent.en || Object.values(normalizedContent)[0];

  if (!sourceText) {
    throw new Error('Lesson content is required for translation');
  }

  if (resolvedTargetLocale === sourceLocale) {
    return sourceText;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATION_MODEL || 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: `Translate lesson content from ${sourceLocale} to ${resolvedTargetLocale}. Preserve formatting, markup, and educational meaning. Return only the translated lesson content.`,
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: sourceText,
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'text',
        },
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to translate lesson content');
  }

  const translatedText = extractOutputText(data);
  if (!translatedText) {
    throw new Error('Translation response was empty');
  }

  return translatedText;
}
