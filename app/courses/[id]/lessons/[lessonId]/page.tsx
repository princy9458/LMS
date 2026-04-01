'use client';

import React, { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/modules/lms/store/store';
import { setLessonStatus, setAllProgress, setProgressLoading } from '@/modules/lms/store/slices/progressSlice';
import { QuizComponent } from '@/modules/lms/components/courses/QuizComponent';
import { AssignmentComponent } from '@/modules/lms/components/courses/AssignmentComponent';
import { isLessonUnlocked } from '@/modules/lms/utils/unlockRules';
import {
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  Menu,
  X,
  FileText,
  BrainCircuit,
  ClipboardList,
  Loader2
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { getContentLocale, getLocaleFromPathname, getLocalePath, translateCommon } from '@/lib/i18n';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  subtitles?: Record<string, string>;
  activeSubtitleLocale?: string | null;
  videoUrl?: string;
  order: number;
  unlockType: string;
  unlockAfterDays: number;
}

interface Course {
  _id: string;
  title: string;
}

interface Quiz {
  _id: string;
  title: string;
  questions: any[];
  passingMarks: number;
}

export default function LessonPlayerPage() {
  const subtitleLanguages = SUPPORTED_LANGUAGES as ReadonlyArray<{
    code: string;
    label: string;
    nativeLabel?: string;
  }>;
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const t = (key: string) => translateCommon(locale, key);
  const contentLocale = getContentLocale(locale);
  const dispatch = useDispatch<AppDispatch>();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [enrollmentDate, setEnrollmentDate] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { lessonStatus } = useSelector((state: RootState) => state.progress);
  const userId = "temp-user-id"; // In a real app, this would come from auth

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseRes, lessonsRes, progressRes, quizRes, enrollRes] = await Promise.all([
          fetch(`/api/lms/courses/${courseId}?lang=${contentLocale}`),
          fetch(`/api/lms/lessons?courseId=${courseId}&lang=${contentLocale}`),
          fetch(`/api/lms/progress?userId=${userId}&courseId=${courseId}`),
          fetch(`/api/lms/quiz?lessonId=${lessonId}`),
          // Fetch enrollment to get the date for time-based unlocking
          fetch(`/api/lms/enrollments?userId=${userId}&courseId=${courseId}`) 
        ]);

        if (!courseRes.ok || !lessonsRes.ok) {
          console.error('Failed to fetch lesson player data', {
            courseId,
            lessonId,
            courseStatus: courseRes.status,
            lessonsStatus: lessonsRes.status,
          });
          throw new Error('Failed to fetch data');
        }

        const courseData = await courseRes.json();
        const lessonsData = await lessonsRes.json();
        const progressData = await progressRes.json();
        const quizData = await quizRes.json();
        const enrollmentData = await enrollRes.json();

        setCourse(courseData.data);
        const fetchedLessons = (lessonsData.data || []).sort((a: Lesson, b: Lesson) => a.order - b.order);
        setAllLessons(fetchedLessons);
        setCurrentQuiz(quizData.data);
        setShowQuiz(false);
        
        if (enrollmentData.success && enrollmentData.data.length > 0) {
          setEnrollmentDate(enrollmentData.data[0].enrolledAt);
        } else {
          setEnrollmentDate(new Date().toISOString()); // Fallback
        }

        // Update Redux progress
        if (progressData.success) {
          dispatch(setAllProgress(progressData.data));
        }

        const lesson = fetchedLessons.find((l: Lesson) => l._id === lessonId);
        if (!lesson) throw new Error('Lesson not found');
        
        // Final check: Is this lesson actually unlocked?
        const unlockCheck = isLessonUnlocked(lesson, fetchedLessons, lessonStatus, enrollmentDate || new Date().toISOString());
        if (!unlockCheck.unlocked && lesson.order > 1) {
           setError(unlockCheck.reason || 'This lesson is locked.');
        }

        setCurrentLesson(lesson);
      } catch (err: any) {
        console.error('Error fetching lesson player data:', { courseId, lessonId, error: err });
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) fetchData();
  }, [contentLocale, courseId, lessonId, dispatch]);

  const markAsCompleted = async () => {
    // If a quiz exists and lesson is not completed, force the quiz first
    if (currentQuiz && !isCompleted) {
      setShowQuiz(true);
      return;
    }

    try {
      const res = await fetch('/api/lms/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          lessonId,
          completed: true
        })
      });

      if (res.ok) {
        dispatch(setLessonStatus({ lessonId: lessonId as string, completed: true }));
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleQuizComplete = async (score: number, passed: boolean) => {
    if (passed) {
      await markAsCompleted();
    }
  };

  const handleNext = () => {
    const currentIndex = allLessons.findIndex(l => l._id === lessonId);
    if (currentIndex < allLessons.length - 1) {
      router.push(getLocalePath(locale, `/courses/${courseId}/lessons/${allLessons[currentIndex + 1]._id}`));
    }
  };

  const handlePrevious = () => {
    const currentIndex = allLessons.findIndex(l => l._id === lessonId);
    if (currentIndex > 0) {
       router.push(getLocalePath(locale, `/courses/${courseId}/lessons/${allLessons[currentIndex - 1]._id}`));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">{t('lessonLoading')}</p>
        </div>
      </div>
    );
  }

  if (error || !currentLesson || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <h2 className="text-3xl font-bold text-destructive mb-4">{t('lockedOrNotFound')}</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">{error || t('somethingWentWrong')}</p>
        <div className="flex gap-4">
          <Link href={getLocalePath(locale, `/courses/${courseId}`)} className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
            {t('backToCourse')}
          </Link>
          <button onClick={() => window.location.reload()} className="px-8 py-3 border font-bold rounded-xl">
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex(l => l._id === lessonId);
  const isLastLesson = currentIndex === allLessons.length - 1;
  const isFirstLesson = currentIndex === 0;
  const isCompleted = lessonStatus[currentLesson._id];

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 overflow-hidden lg:flex-row">
      {/* Sidebar for Mobile Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Curriculum Sidebar */}
      <div className={`
        fixed inset-0 z-40 lg:relative lg:z-0 lg:flex lg:w-96 flex-col border-r bg-slate-50 dark:bg-slate-900/50 transition-transform duration-300 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b flex flex-col gap-1 bg-white dark:bg-slate-950">
          <Link href={getLocalePath(locale, `/courses/${courseId}`)} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mb-2">
            <ChevronLeft size={14} /> {t('backToCourse')}
          </Link>
          <h2 className="font-extrabold text-xl line-clamp-2">{course.title}</h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
             {t('lessonCountOf').replace('{current}', String(currentIndex + 1)).replace('{total}', String(allLessons.length))}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {allLessons.map((lesson, idx) => {
            const isActive = lesson._id === lessonId;
            const completed = lessonStatus[lesson._id];
            const unlockCheck = isLessonUnlocked(lesson, allLessons, lessonStatus, enrollmentDate || new Date().toISOString());
            const isLocked = !unlockCheck.unlocked;

            return (
              <Link 
                key={lesson._id}
                href={isLocked ? '#' : getLocalePath(locale, `/courses/${courseId}/lessons/${lesson._id}`)}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-4 p-4 rounded-xl transition-all relative group
                  ${isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                  ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary'}
                  ${completed && !isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : ''}
                `}>
                  {completed ? <CheckCircle size={16} /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="text-sm font-bold truncate">{lesson.title}</h4>
                   <div className={`text-[10px] mt-0.5 font-medium uppercase tracking-widest ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {isLocked ? (
                        <span className="flex items-center gap-1"><Lock size={10} /> {t('lockedLabel')}</span>
                      ) : (
                        <span className="flex items-center gap-1"><PlayCircle size={10} /> 15m {t('videoLabel')}</span>
                      )}
                   </div>
                </div>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {showQuiz && currentQuiz ? (
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/30 p-8">
             <div className="max-w-3xl mx-auto py-12">
               <div className="flex items-center gap-4 mb-8">
                 <button onClick={() => setShowQuiz(false)} className="text-primary font-bold flex items-center gap-2 hover:underline">
                    <ChevronLeft size={20} /> {t('backToVideo')}
                 </button>
               </div>
               <QuizComponent 
                 quizId={currentQuiz._id}
                 title={currentQuiz.title}
                 questions={currentQuiz.questions}
                 passingMarks={currentQuiz.passingMarks}
                 onComplete={handleQuizComplete} 
               />
             </div>
          </div>
        ) : (
          <>
            <div className="bg-slate-900 aspect-video w-full max-h-[70vh] flex items-center justify-center relative group">
               {currentLesson.videoUrl ? (
                 <video 
                   src={currentLesson.videoUrl} 
                   className="w-full h-full object-contain"
                   controls
                 >
                   {subtitleLanguages.map((language) => {
                     const subtitleUrl = currentLesson.subtitles?.[language.code];

                     if (!subtitleUrl) {
                       return null;
                     }

                     return (
                       <track
                         key={language.code}
                         kind="subtitles"
                         src={subtitleUrl}
                         srcLang={language.code}
                         label={language.nativeLabel ?? language.label}
                         default={currentLesson.activeSubtitleLocale === language.code}
                       />
                     );
                   })}
                 </video>
               ) : (
                 <div className="flex flex-col items-center gap-6 text-slate-400">
                    <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-primary animate-pulse">
                       {currentLesson.content?.toLowerCase().includes('assignment') ? <ClipboardList size={48}/> : <PlayCircle size={48} />}
                    </div>
                    <p className="text-xl font-medium tracking-wide">
                      {currentLesson.content?.toLowerCase().includes('assignment') ? t('practicalAssignment') : t('videoContentProcessing')}
                    </p>
                 </div>
               )}
            </div>

            <div className="flex-1 container max-w-5xl mx-auto py-12 px-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-12 border-b">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-2">
                     <FileText size={16} />
                     <span>{t('detailedContent')}</span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                    {currentLesson.title}
                    {isCompleted && <CheckCircle size={28} className="text-green-500" />}
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  {currentQuiz && !isCompleted && (
                    <button 
                      onClick={() => setShowQuiz(true)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                      <BrainCircuit size={18} /> {t('takeQuiz')}
                    </button>
                  )}
                  {!currentQuiz && !isCompleted && (
                    <button 
                      onClick={markAsCompleted}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                    >
                      <CheckCircle size={18} /> {t('markAsDone')}
                    </button>
                  )}
                  <div className="h-10 w-px bg-border mx-2" />
                  <button 
                    onClick={handlePrevious}
                    disabled={isFirstLesson}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={18} /> {t('previous')}
                  </button>
                  <button 
                    onClick={isLastLesson ? () => router.push(getLocalePath(locale, `/courses/${courseId}`)) : handleNext}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    {isLastLesson ? t('completeCourse') : t('nextLesson')} <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <article className="prose prose-lg dark:prose-invert max-w-none">
                 <div className="bg-primary/5 border-l-4 border-primary p-8 rounded-r-2xl mb-12">
                    <h3 className="text-primary font-black uppercase tracking-tighter text-xl mb-4">{t('lessonOverview')}</h3>
                    <p className="text-muted-foreground leading-relaxed italic text-lg">
                      "{currentLesson.content || t('noLessonContent')}"
                    </p>
                 </div>

                 {currentLesson.content?.toLowerCase().includes('assignment') && (
                    <AssignmentComponent 
                      title={currentLesson.title}
                      description={currentLesson.content}
                      onSuccess={markAsCompleted}
                    />
                 )}
              </article>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
