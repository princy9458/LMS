import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from '@/config/languages';

const SUPPORTED_LOCALES = [...SUPPORTED_LANGUAGE_CODES];
const DEFAULT_LOCALE = DEFAULT_LANGUAGE;
const LOCALE_PREFERENCE_KEY = 'lms-one.locale';

function isSupportedLocale(value?: string) {
  return Boolean(value && SUPPORTED_LOCALES.includes(value));
}

function isPossibleLocaleSegment(value?: string) {
  return Boolean(value && /^[a-z]{2}$/i.test(value));
}

function getPreferredLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(LOCALE_PREFERENCE_KEY)?.value?.toLowerCase();
  return isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
}

function getNormalizedPath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (!isSupportedLocale(firstSegment)) {
    return {
      locale: null,
      normalizedPath: pathname,
      firstSegment,
      restSegments: segments.slice(1),
    };
  }

  const remainingSegments = segments.slice(1);
  return {
    locale: firstSegment,
    normalizedPath: `/${remainingSegments.join('/')}`.replace(/\/+$/, '') || '/',
    firstSegment,
    restSegments: remainingSegments,
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

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const { locale, normalizedPath, firstSegment, restSegments } = getNormalizedPath(path);

  if (isPossibleLocaleSegment(firstSegment) && !isSupportedLocale(firstSegment)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${DEFAULT_LOCALE}${restSegments.length > 0 ? `/${restSegments.join('/')}` : ''}`;
    return withCommonHeaders(NextResponse.redirect(redirectUrl), request);
  }

  if (normalizedPath.startsWith('/admin') && !locale) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${getPreferredLocale(request)}${normalizedPath}`;
    return withCommonHeaders(NextResponse.redirect(redirectUrl), request);
  }

  // Admin Route Protection
  if (normalizedPath.startsWith('/admin') && !normalizedPath.startsWith('/admin/login')) {
    const token = request.cookies.get('token')?.value;
    const loginPath = `/${locale || getPreferredLocale(request)}/admin/login`;

    if (!token) {
      return withCommonHeaders(NextResponse.redirect(new URL(loginPath, request.url)), request);
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const decodedJson = atob(base64);
      const payload = JSON.parse(decodedJson);

      console.log('--- Middleware Trace (Proxy) ---');
      console.log('Path:', normalizedPath);
      console.log('Payload Role:', payload.role);

      if (payload.role !== 'admin') {
        return withCommonHeaders(NextResponse.redirect(new URL(loginPath, request.url)), request);
      }
    } catch (error) {
      return withCommonHeaders(NextResponse.redirect(new URL(loginPath, request.url)), request);
    }
  }

  return withCommonHeaders(NextResponse.next(), request);
}

export const config = {
  matcher: [
    '/((?!api|_next|.*\\..*).*)',
    '/api/lms/:path*',
  ],
};
