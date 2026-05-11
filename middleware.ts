import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from '@/config/languages';

const SUPPORTED_LOCALES = [...SUPPORTED_LANGUAGE_CODES];
const DEFAULT_LOCALE = DEFAULT_LANGUAGE;
const LOCALE_PREFERENCE_KEY = 'lms-one.locale';

function isSupportedLocale(value?: string) {
  return Boolean(value && SUPPORTED_LOCALES.includes(value));
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap') ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

function getPreferredLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(LOCALE_PREFERENCE_KEY)?.value?.toLowerCase();
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get('accept-language') || '';
  const browserLocale = acceptLanguage
    .split(',')
    .map((entry) => entry.trim().split(';')[0]?.toLowerCase().split('-')[0])
    .find((entry) => isSupportedLocale(entry));

  return browserLocale || DEFAULT_LOCALE;
}

function getLocalePathInfo(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (!isSupportedLocale(firstSegment)) {
    return {
      locale: null,
      restSegments: segments,
    };
  }

  return {
    locale: firstSegment,
    restSegments: segments.slice(1),
  };
}

function withCommonHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*.stripe.com; frame-src https://js.stripe.com;");

  const hostname = request.headers.get('host');
  const subdomain = hostname?.split('.')[0];
  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    response.headers.set('x-tenant-slug', subdomain);
  }

  return response;
}

function redirectToLocale(request: NextRequest, locale: string, restSegments: string[]) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${restSegments.length > 0 ? `/${restSegments.join('/')}` : ''}`;
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(LOCALE_PREFERENCE_KEY, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return withCommonHeaders(response, request);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const { locale, restSegments } = getLocalePathInfo(pathname);
  const preferredLocale = getPreferredLocale(request);

  if (!locale) {
    return redirectToLocale(request, preferredLocale, pathname === '/' ? [] : pathname.split('/').filter(Boolean));
  }

  if (!isSupportedLocale(locale)) {
    return redirectToLocale(request, DEFAULT_LOCALE, restSegments);
  }

  const normalizedPath = `/${restSegments.join('/')}` || '/';
  // Removed admin auth check to allow direct access


  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);
  requestHeaders.set('x-next-locale', locale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(LOCALE_PREFERENCE_KEY, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return withCommonHeaders(response, request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
