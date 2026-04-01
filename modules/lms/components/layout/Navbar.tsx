'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/modules/lms/store/store';
import { logoutUser } from '@/modules/lms/store/slices/authSlice';
import { LogOut, User as UserIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { getLocaleFromPathname, getLocalePath, translateCommon } from '@/lib/i18n';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const t = (key: Parameters<typeof translateCommon>[1]) => translateCommon(locale, key);
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings?group=general')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data.logoUrl) {
          setLogoUrl(json.data.logoUrl);
        }
      })
      .catch(err => console.error('Failed to fetch logo', err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      dispatch(logoutUser());
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="border-b shadow-sm sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container flex h-16 items-center">
        <Link href={getLocalePath(locale)} className="font-bold text-xl mr-auto text-primary px-4 flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="LMS One" className="h-8 w-auto object-contain" />
          ) : (
            <span>LMS One</span>
          )}
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium px-4">
          <Link href={getLocalePath(locale, '/courses')} className="hover:text-primary transition-colors hidden md:inline-block">{t('courses')}</Link>
          <Link href={getLocalePath(locale, '/jobs')} className="hover:text-primary transition-colors hidden md:inline-block">{t('jobs')}</Link>
          <Link href={getLocalePath(locale, '/internships')} className="hover:text-primary transition-colors hidden md:inline-block">{t('internships')}</Link>
          <Link href={getLocalePath(locale, '/career-paths')} className="hover:text-primary transition-colors hidden lg:inline-block">{t('careerPaths')}</Link>
          
          <div className="flex items-center gap-4 border-l pl-4">
            <LanguageSwitcher />

            {loading ? (
              <div className="w-24 h-8 bg-muted rounded animate-pulse hidden sm:block"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-muted-foreground font-semibold hidden sm:flex">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <UserIcon size={16} />
                  </div>
                  {user.name.split(' ')[0]}
                </span>
                
                {user.role === 'student' ? (
                  <Link href={getLocalePath(locale, '/dashboard')} className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors hidden sm:inline-block shadow-sm">{t('studentDashboard')}</Link>
                ) : (
                  <Link href={getLocalePath(locale, '/admin')} className="px-4 py-2 bg-muted text-foreground font-bold rounded-lg hover:bg-muted/80 transition-colors hidden sm:inline-block border">{t('adminPortal')}</Link>
                )}
                
                <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors ml-2" title={t('logout')}>
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href={getLocalePath(locale, '/login')} className="px-4 py-2 font-bold hover:text-primary transition-colors">{t('login')}</Link>
                <Link href={getLocalePath(locale, '/register')} className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors hidden sm:inline-block shadow-sm">{t('signup')}</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
