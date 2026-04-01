'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/modules/lms/store/store';
import { setCoursesData, setCoursesLoading, setCoursesError } from '@/modules/lms/store/slices/coursesSlice';
import { CourseCard } from '@/modules/lms/components/courses/CourseCard';
import { getContentLocale, getLocaleFromPathname, getLocalePath, translateCommon } from '@/lib/i18n';

export default function CoursesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const t = (key: string) => translateCommon(locale, key);
  const contentLocale = getContentLocale(locale);
  const { items, loading, error } = useSelector((state: RootState) => state.courses);

  useEffect(() => {
    const fetchCourses = async () => {
      dispatch(setCoursesLoading(true));
      try {
        const response = await fetch(`/api/courses?lang=${contentLocale}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch courses:', response.status, errorText);
          throw new Error(`Failed to fetch courses (${response.status})`);
        }
        const result = await response.json();
        // API returns { success: true, count: n, data: [...] }
        dispatch(setCoursesData(result.data || []));
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        dispatch(setCoursesError(err.message || 'Something went wrong'));
      } finally {
        dispatch(setCoursesLoading(false));
      }
    };

    fetchCourses();
  }, [contentLocale, dispatch]);

  return (
    <div className="container py-12 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-primary">
            {t('coursesPageTitle')}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t('coursesPageDescription')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[300px] rounded-2xl border bg-muted/20 animate-pulse border-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 border-2 border-dashed border-destructive/30 rounded-2xl bg-destructive/5 text-center flex flex-col items-center max-w-lg mx-auto w-full">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-destructive mb-2">{t('somethingWentWrong')}</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-sm"
            >
              {t('tryAgain')}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 border-2 border-dashed rounded-2xl text-center bg-muted/5 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
            </div>
            <h2 className="text-2xl font-bold">{t('noCoursesAvailable')}</h2>
            <p className="text-muted-foreground mt-3 max-w-sm text-lg">
              {t('noCoursesDescription')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((course) => (
              <CourseCard key={course._id} {...course} href={getLocalePath(locale, `/courses/${course._id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
