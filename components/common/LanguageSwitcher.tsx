'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { getLocaleFromPathname, getLocalePath, isSupportedLocale, persistPreferredLocale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const switcherLanguages = SUPPORTED_LANGUAGES;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);

  const onSelectChange = (newLocale: string) => {
    if (!isSupportedLocale(newLocale)) {
      return;
    }

    persistPreferredLocale(newLocale);

    startTransition(() => {
      const segments = pathname.split('/');
      const currentSegment = segments[1];

      if (currentSegment && isSupportedLocale(currentSegment)) {
        segments[1] = newLocale;
        router.push(segments.join('/') || getLocalePath(newLocale));
        return;
      }

      router.push(getLocalePath(newLocale, pathname || '/'));
    });
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card hover:bg-muted/50 transition-colors cursor-pointer group">
        <Globe size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
        <select
          value={locale}
          disabled={isPending}
          onChange={(e) => onSelectChange(e.target.value)}
          className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer appearance-none border-none pr-4"
        >
          {switcherLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeLabel ?? lang.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 pointer-events-none">
           <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
           </svg>
        </div>
      </div>
    </div>
  );
}
