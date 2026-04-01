import Link from 'next/link';
import { getCommonMessages, getLocalePath, isSupportedLocale } from '@/lib/i18n';

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getCommonMessages(isSupportedLocale(locale) ? locale : 'en');

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center pb-20">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary mb-6">
        {messages.welcome}
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
        {messages.homeSubtitle}
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
         <Link href={getLocalePath(locale, '/courses')} className="rounded-xl border bg-card text-card-foreground p-8 flex flex-col items-center shadow-sm hover:shadow-md transition">
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">{messages.courses}</h2>
            <p className="text-sm text-muted-foreground mb-6">{messages.homeCoursesDescription}</p>
         </Link>
         <div className="rounded-xl border bg-card text-card-foreground p-8 flex flex-col items-center shadow-sm hover:shadow-md transition">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">{messages.homeOpportunitiesTitle}</h2>
            <p className="text-sm text-muted-foreground mb-4">{messages.homeOpportunitiesDescription}</p>
            <div className="flex gap-6 mt-2">
              <Link href={getLocalePath(locale, '/jobs')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                {messages.jobs}
              </Link>
              <Link href={getLocalePath(locale, '/internships')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                {messages.internships}
              </Link>
            </div>
         </div>
      </div>
    </div>
  );
}
