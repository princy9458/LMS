import Link from 'next/link';
import { BookOpen, Building2, Settings } from 'lucide-react';
import { getCommonMessages, isSupportedLocale } from '@/lib/i18n';

export default async function AdminPortalPage({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const resolvedParams = params ? await params : undefined;
  const locale = resolvedParams?.locale;
  const messages = getCommonMessages(isSupportedLocale(locale || '') ? locale || 'en' : 'en');

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 md:px-6">
      <div className="mb-10 text-center sm:text-left">
         <h1 className="text-4xl font-extrabold flex items-center justify-center sm:justify-start gap-4">
             <Settings className="text-primary w-10 h-10" />
             {messages.adminPortalTitle}
         </h1>
         <p className="text-xl text-muted-foreground mt-3 max-w-2xl">
           {messages.adminPortalDescription}
         </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Link href="/admin/courses" className="rounded-2xl border bg-card text-card-foreground p-8 flex flex-col items-start shadow-sm hover:shadow-md hover:border-primary/50 transition-all group">
          <div className="h-14 w-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
            <BookOpen size={28} />
          </div>
          <h2 className="text-2xl font-bold mb-3">{messages.adminCourseCreator}</h2>
          <p className="text-muted-foreground mb-6">{messages.adminCourseCreatorDescription}</p>
          <div className="mt-auto font-semibold text-primary flex items-center gap-2 group-hover:translate-x-1 transition-transform">
            {messages.adminGoToCourseCreator} &rarr;
          </div>
        </Link>
        
        <Link href="/admin/opportunities" className="rounded-2xl border bg-card text-card-foreground p-8 flex flex-col items-start shadow-sm hover:shadow-md hover:border-primary/50 transition-all group">
          <div className="h-14 w-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform">
            <Building2 size={28} />
          </div>
          <h2 className="text-2xl font-bold mb-3">{messages.adminEmployerDashboard}</h2>
          <p className="text-muted-foreground mb-6">{messages.adminEmployerDashboardDescription}</p>
          <div className="mt-auto font-semibold text-primary flex items-center gap-2 group-hover:translate-x-1 transition-transform">
            {messages.adminGoToEmployerDashboard} &rarr;
          </div>
        </Link>
      </div>
    </div>
  );
}
