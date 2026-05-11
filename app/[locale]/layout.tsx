import LocalePreferenceSync from '@/components/common/LocalePreferenceSync';
import { buildLocalizedMetadata } from '@/lib/seo';
import { isSupportedLocale } from '@/lib/i18n';

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isSupportedLocale(params.locale) ? params.locale : 'en';

  return buildLocalizedMetadata({
    locale,
    pathname: '/',
    title: 'LMS One Platform',
    description: 'A modular Next.js LMS platform with Opportunities integration.',
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <LocalePreferenceSync locale={locale} />
      {children}
    </>
  );
}
