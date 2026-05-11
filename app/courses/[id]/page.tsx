'use client';

import React, { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/modules/lms/store/store';
import Link from 'next/link';
import { CertificateModal } from '@/modules/lms/components/courses/CertificateModal';
import { getContentLocale, getLocaleFromPathname, getLocalePath, isSupportedLocale, translateCommon } from '@/lib/i18n';
import { readJsonResponse, unwrapApiData } from '@/lib/api';
import { 
  PlayCircle, 
  Clock, 
  BookOpen, 
  Award, 
  ChevronRight, 
  User, 
  Calendar,
  Layers,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface Course {
  _id: string;
  slug: string;
  title: string;
  description: string;
  instructorId: string;
  totalLessons: number;
  createdAt: string;
  thumbnail?: string;
  lessons?: Lesson[];
}

interface Lesson {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  order: number;
  unlockType: string;
  unlockAfterDays?: number;
}

interface CertificateData {
  _id: string;
  certificateId: string;
  issuedAt: string;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname);
  const t = (key: string) => translateCommon(locale, key);
  const contentLocale = getContentLocale(locale);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingCert, setClaimingCert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userId = user?._id;

  useEffect(() => {
    if (typeof id === 'string' && isSupportedLocale(id)) {
      router.replace(getLocalePath(id, '/courses'));
    }
  }, [id, router]);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const previewQuery = process.env.NODE_ENV !== 'production' ? '&preview=1' : '';
        console.log('[CourseDetails] fetch start', { id, contentLocale, previewQuery, userId });
        const courseRes = await fetch(`/api/lms/courses/${id}?lang=${contentLocale}${previewQuery}`);

        console.log('[CourseDetails] fetch responses', {
          courseStatus: courseRes.status,
        });

        const courseText = await courseRes.text();
        console.log('[CourseDetails] course api raw', courseText.slice(0, 500));

        if (!courseRes.ok) {
          throw new Error(`Course API failed (${courseRes.status})`);
        }

        const courseData = courseText ? JSON.parse(courseText) : null;
        console.log('[CourseDetails] parsed payloads', {
          courseHasData: Boolean(courseData),
          courseKeys: courseData ? Object.keys(courseData) : [],
        });

        const resolvedCourse = unwrapApiData(courseData);
        const resolvedLessons = Array.isArray((resolvedCourse as any)?.lessons) ? (resolvedCourse as any).lessons : [];
        setCourse(resolvedCourse);
        setLessons(resolvedLessons || []);

        if (resolvedCourse?.slug && typeof id === 'string' && resolvedCourse.slug !== id) {
          router.replace(getLocalePath(locale, `/courses/${resolvedCourse.slug}`));
        }
        
        const [progressData, certData] = resolvedCourse?._id && userId
          ? await Promise.all([
              readJsonResponse(await fetch(`/api/lms/progress?userId=${userId}&courseId=${resolvedCourse._id}`)),
              readJsonResponse(await fetch(`/api/lms/certificates?userId=${userId}&courseId=${resolvedCourse._id}`))
            ])
          : [null, null];

        if ((progressData as any)?.success) {
          setCompletedLessons((unwrapApiData(progressData) || []).filter((p: any) => p.completed).map((p: any) => p.lessonId));
        }

        if ((certData as any)?.success) {
          setCertificate(unwrapApiData(certData));
        }
      } catch (err: any) {
        console.error('Error fetching course detail:', { courseId: id, error: err });
        setError(err.message || translateCommon(locale, 'somethingWentWrong'));
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourseData();
  }, [contentLocale, id, locale, router, userId]);

  const handleClaimCertificate = async () => {
    if (!course || !userId) return;
    setClaimingCert(true);
    try {
      const res = await fetch('/api/lms/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId: course._id })
      });
      const data = await res.json();
      if (data.success) {
        setCertificate(data.data);
        setIsCertModalOpen(true);
      } else {
        alert(data.error || 'Failed to claim certificate');
      }
    } catch (err) {
      console.error('Error claiming certificate:', err);
    } finally {
      setClaimingCert(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-20 animate-pulse space-y-8">
        <div className="h-12 bg-muted rounded-xl w-3/4" />
        <div className="h-6 bg-muted rounded-xl w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="h-32 bg-muted rounded-2xl" />
          </div>
          <div className="h-96 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-3xl font-bold text-destructive">{t('somethingWentWrong')}</h2>
        <p className="text-muted-foreground mt-4">{error || t('courseNotFound')}</p>
        <Link href={getLocalePath(locale, '/courses')} className="mt-8 inline-block text-primary font-bold hover:underline">
          {t('backToCatalog')}
        </Link>
      </div>
    );
  }

  const isCourseCompleted = lessons.length > 0 && completedLessons.length >= lessons.length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Course Header */}
      <div className="bg-slate-900 text-white py-16 lg:py-24">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-6 max-w-5xl">
            <nav className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-4">
              <Link href={getLocalePath(locale, '/courses')} className="hover:text-white transition-colors">{t('courses')}</Link>
              <ChevronRight size={14} />
              <span className="text-slate-200 truncate">{course.title}</span>
            </nav>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                  {course.title}
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mt-4">
                  {course.description}
                </p>
                
                <div className="flex flex-wrap gap-6 mt-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    <User size={18} className="text-primary" />
                    <span>Instructor ID: {course.instructorId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    <Calendar size={18} className="text-primary" />
                    <span>{t('courseDetailsStudentsLabel')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    <Award size={18} className="text-primary" />
                    <span>{t('courseDetailsCertificationIncluded')}</span>
                  </div>
                </div>
              </div>

              {course.thumbnail ? (
                <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full min-h-[220px] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-blue-500/20 to-cyan-400/10 p-6 shadow-2xl shadow-black/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">Course spotlight</p>
                  <p className="mt-3 text-2xl font-black leading-tight">AI & Machine Learning</p>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    Explore AI foundations, practical machine learning examples, and demo-ready learning content.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <BookOpen className="text-primary" />
                {t('aboutCourse')}
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-lg text-muted-foreground leading-relaxed">
                <p>
                  {t('courseAboutIntro').replace('{title}', course.title)}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Layers className="text-primary" />
                {t('courseContent')}
              </h2>
              <div className="space-y-4">
                {lessons.length === 0 ? (
                  <div className="p-8 border-2 border-dashed rounded-2xl text-center text-muted-foreground">
                    {t('curriculumUpdating')}
                  </div>
                ) : (
                  lessons.map((lesson, idx) => {
                    const isCompleted = completedLessons.includes(lesson._id);
                    return (
                      <div 
                        key={lesson._id}
                        className="group flex items-center justify-between p-5 rounded-2xl border bg-card hover:border-primary/50 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors
                            ${isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary'}
                          `}>
                            {isCompleted ? <CheckCircle size={20} /> : idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{lesson.title}</h3>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1 max-w-md mt-0.5">
                                {lesson.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                               <div className="flex items-center gap-1">
                                 <PlayCircle size={14} />
                                 <span>{t('videoLesson')}</span>
                               </div>
                               <span>•</span>
                               <span className="capitalize">{lesson.unlockType} {t('accessSuffix')}</span>
                            </div>
                          </div>
                        </div>
                        <Link 
                          href={getLocalePath(locale, `/courses/${course.slug || id}/${lesson.slug || lesson._id}`)}
                          className={`
                            p-2 rounded-full transition-all shadow-sm
                            ${isCompleted ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:bg-primary group-hover:text-white'}
                          `}
                        >
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="sticky top-24 rounded-3xl border bg-card p-8 shadow-xl">
              {certificate ? (
                <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl p-6 text-center mb-8">
                   <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award size={24} />
                   </div>
                   <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">{t('courseCompleted')}</h3>
                   <p className="text-xs text-muted-foreground mb-4">{t('courseCompletedDescription')}</p>
                   <button 
                     onClick={() => setIsCertModalOpen(true)}
                     className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                   >
                     {t('viewCertificate')}
                   </button>
                </div>
              ) : isCourseCompleted ? (
                <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 text-center mb-8">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{t('claimReward')}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{t('claimRewardDescription')}</p>
                  <button 
                    onClick={handleClaimCertificate}
                    disabled={claimingCert}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {claimingCert ? <Loader2 className="animate-spin" size={18} /> : t('claimCertificate')}
                  </button>
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-slate-900 mb-8 flex items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors" />
                   <PlayCircle size={64} className="text-white relative z-10" />
                </div>
              )}
              
              <div className="space-y-6">
                {!isCourseCompleted && !certificate && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-extrabold">Free</span>
                      <span className="text-muted-foreground line-through">$89.99</span>
                    </div>
                    
                    <Link 
                      href={lessons.length > 0 ? getLocalePath(locale, `/courses/${course.slug || id}/${lessons[0].slug || lessons[0]._id}`) : '#'}
                      className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      {completedLessons.length > 0 ? t('continueLearning') : t('startLearningNow')}
                    </Link>
                  </>
                )}
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <Clock size={18} className="text-primary" />
                    <span>{t('durationLabel')}: {lessons.length * 20} mins estimated</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <BookOpen size={18} className="text-primary" />
                    <span>{course.totalLessons} {t('lessonsTotalLabel')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <Layers size={18} className="text-primary" />
                    <span>{t('progressLabel')}: {Math.round((completedLessons.length / lessons.length) * 100) || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {certificate && (
        <CertificateModal 
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          data={{
            userName: "Student User", // In real app, name from profile
            courseTitle: course.title,
            issuedAt: certificate.issuedAt,
            certificateId: certificate.certificateId
          }}
        />
      )}
    </div>
  );
}
