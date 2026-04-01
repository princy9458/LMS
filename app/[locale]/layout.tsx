import LocalePreferenceSync from '@/components/common/LocalePreferenceSync';

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
