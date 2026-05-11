import type { Metadata } from 'next';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from '@/config/languages';
import { getLocalePath, normalizeLocale } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function toAbsoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export function buildLocalizedMetadata({
  locale,
  pathname = '/',
  title,
  description,
}: {
  locale: string;
  pathname?: string;
  title: string;
  description: string;
}): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const canonical = toAbsoluteUrl(getLocalePath(normalizedLocale, normalizedPath));

  const languages = Object.fromEntries(
    SUPPORTED_LANGUAGE_CODES.map((code) => [code, toAbsoluteUrl(getLocalePath(code, normalizedPath))])
  );

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...languages,
        'x-default': toAbsoluteUrl(getLocalePath(DEFAULT_LANGUAGE, normalizedPath)),
      },
    },
    openGraph: {
      title,
      description,
      locale: normalizedLocale,
      url: canonical,
      type: 'website',
    },
  };
}
