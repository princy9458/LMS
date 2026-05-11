'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  PlayCircle,
  Sparkles,
  Video,
  Layers3,
  PanelLeftOpen,
  BadgeInfo,
  Medal,
  RotateCcw,
} from 'lucide-react';
import { QuizComponent } from '@/modules/lms/components/courses/QuizComponent';
import { getContentLocale, getLocaleFromPathname, getLocalePath, translateCommon } from '@/lib/i18n';
import { readJsonResponse, unwrapApiData } from '@/lib/api';

type Topic = {
  _id: string;
  title: string;
  content?: string;
  contentHtml?: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  keyPoints?: string[];
  notes?: string[];
  resources?: { title: string; url: string }[];
  codeExample?: string;
  summary?: string;
  quizId?: Quiz;
  order?: number;
  quizzes?: Quiz[];
};

type LessonQuizQuestion = {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex?: number;
  explanation?: string;
};

type Quiz = {
  _id: string;
  title: string;
  description?: string;
  questions?: LessonQuizQuestion[];
  passingMarks?: number;
};

type Lesson = {
  _id: string;
  slug?: string;
  courseId?: string;
  course?: string;
  title: string;
  content?: string;
  description?: string;
  topics?: Topic[];
  quizzes?: Quiz[];
  duration?: number;
};

type Course = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
};

const DEMO_USER_ID = '000000000000000000000001';
const DEFAULT_VIDEO_SRC = 'https://www.youtube-nocookie.com/embed/JMUxmLyrhSk';

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractIframeSrc(html: string) {
  const match = html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
  return match?.[1] || '';
}

function toYouTubeEmbedUrl(input: string) {
  if (!input) return '';
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.replace('/', '').trim();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : '';
    }
    if (host.includes('youtube.com')) {
      const videoId = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
    }
    return '';
  } catch {
    return '';
  }
}

function extractListItems(html: string) {
  const matches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
  return matches
    .map((match) => stripHtml(match[1] || ''))
    .filter(Boolean)
    .slice(0, 6);
}

function extractCodeBlocks(html: string) {
  const matches = [...html.matchAll(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi)];
  return matches
    .map((match) => match[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'))
    .filter(Boolean)
    .slice(0, 2);
}

function extractLinks(html: string) {
  const matches = [...html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  return matches
    .map((match) => ({
      href: match[1],
      label: stripHtml(match[2] || match[1]),
    }))
    .filter((item) => item.href)
    .slice(0, 6);
}

function summarizeTopic(html: string, fallback: string) {
  const text = stripHtml(html);
  return text || fallback || 'This topic has no content yet.';
}

function createDefaultKeyPoints(topicTitle: string) {
  return [
    `${topicTitle || 'This topic'} explains the concept in plain language before moving into implementation details.`,
    'Focus on how the idea is used in real products, not just the definition.',
    'Look for data, evaluation, and iteration, because those are usually what make the approach work in practice.',
    'Use the quiz and the notes section to reinforce the main ideas after you finish reading.',
  ];
}

function createDefaultExamples() {
  return [
    'Product recommendations on an e-commerce homepage',
    'Fraud detection for unusual payment behavior',
    'Support chat assistants that summarize and route requests',
    'Image classification or OCR inside document workflows',
  ];
}

function createDefaultNotes() {
  return [
    'Strong AI systems still depend on clean inputs and well-defined goals.',
    'A model can look accurate in a demo and still fail in production if it is not evaluated on realistic data.',
    'The fastest path to understanding is to connect each concept to a workflow you already know.',
  ];
}

function createDefaultResources() {
  return [
    { label: 'Lesson handout', href: '#' },
    { label: 'AI terminology cheat sheet', href: '#' },
    { label: 'Model evaluation checklist', href: '#' },
  ];
}

function createDefaultCodeSnippet(topicTitle: string) {
  return `# ${topicTitle || 'AI workflow'}\n# Pseudocode example for a simple learning pipeline\n\ntraining_data = load_dataset()\nfeatures, labels = prepare_features(training_data)\nmodel = train_model(features, labels)\npredictions = model.predict(new_examples)\nscore = evaluate(predictions, labels)\nprint(f"Validation score: {score:.2f}")`;
}

function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-3xl bg-slate-200/70 ${className}`} />;
}

export default function LessonLearningPage() {
  const params = useParams<Record<string, string>>();
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname);
  const contentLocale = getContentLocale(locale);
  const t = (key: string) => translateCommon(locale, key);

  const courseId = params.courseSlug || params.id;
  const lessonId = params.lessonSlug || params.lessonId;
  const isLegacyRoute = Boolean(params.id || params.lessonId);

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [lessonQuiz, setLessonQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchLesson = async () => {
      setLoading(true);
      setError(null);

      try {
        const [courseRes, lessonRes] = await Promise.all([
          fetch(`/api/lms/courses/${courseId}?lang=${contentLocale}`),
          fetch(`/api/lms/lesson/${lessonId}?lang=${contentLocale}`),
        ]);

        const [coursePayload, lessonPayload] = await Promise.all([
          readJsonResponse(courseRes),
          readJsonResponse(lessonRes),
        ]);

        const resolvedCourse = unwrapApiData<Course>(coursePayload);
        const resolvedLesson = unwrapApiData<Lesson>(lessonPayload);

        if (!courseRes.ok || !lessonRes.ok || !resolvedLesson) {
          throw new Error(
            (resolvedLesson as any)?.error ||
              (lessonPayload as any)?.error ||
              'Failed to load lesson'
          );
        }

        const nextTopics = Array.isArray(resolvedLesson.topics)
          ? [...resolvedLesson.topics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          : [];
        const nextQuiz = resolvedLesson.quizzes?.[0] || null;

        if (!cancelled) {
          setCourse(resolvedCourse || null);
          setLesson(resolvedLesson);
          setTopics(nextTopics);
          setActiveTopicId(nextTopics[0]?._id ?? null);
          setLessonQuiz(nextQuiz);
          setShowQuiz(false);

          if (isLegacyRoute && resolvedCourse?.slug && resolvedLesson?.slug) {
            router.replace(
              getLocalePath(locale, `/courses/${resolvedCourse.slug}/${resolvedLesson.slug}`)
            );
          }

          const storageKey = `lms-progress:${courseId}:${lessonId}`;
          try {
            const saved = window.localStorage.getItem(storageKey);
            const parsed = saved ? JSON.parse(saved) : [];
            if (Array.isArray(parsed)) {
              setCompletedTopicIds(parsed.filter((item) => typeof item === 'string'));
            }
          } catch {
            setCompletedTopicIds([]);
          }
        }
      } catch (fetchError: any) {
        if (!cancelled) {
          setError(fetchError?.message || 'Something went wrong');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (courseId && lessonId) {
      fetchLesson();
    }

    return () => {
      cancelled = true;
    };
  }, [contentLocale, courseId, isLegacyRoute, lessonId, locale, router]);

  useEffect(() => {
    if (!topics.length) return;
    const storageKey = `lms-progress:${courseId}:${lessonId}`;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(completedTopicIds));
    } catch {
      // ignore persistence issues
    }
  }, [completedTopicIds, courseId, lessonId, topics.length]);

  const activeTopic = useMemo(() => {
    if (!topics.length) return null;
    return topics.find((topic) => topic._id === activeTopicId) || topics[0];
  }, [activeTopicId, topics]);

  const currentTopicIndex = topics.findIndex((topic) => topic._id === activeTopic?._id);
  const nextTopic = currentTopicIndex >= 0 ? topics[currentTopicIndex + 1] : null;
  const previousTopic = currentTopicIndex > 0 ? topics[currentTopicIndex - 1] : null;
  const activeTopicQuiz = activeTopic?.quizId || activeTopic?.quizzes?.[0] || lessonQuiz || null;

  const activeTopicHtml = activeTopic?.contentHtml || activeTopic?.content || '';
  const cleanedTopicHtml = activeTopicHtml.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  const topicVideoSrc = activeTopic?.videoUrl ? toYouTubeEmbedUrl(activeTopic.videoUrl) || activeTopic.videoUrl : extractIframeSrc(activeTopicHtml);
  const topicListItems = Array.isArray(activeTopic?.keyPoints) && activeTopic.keyPoints.length ? activeTopic.keyPoints : extractListItems(activeTopicHtml);
  const topicCodeBlocks = activeTopic?.codeExample ? [activeTopic.codeExample] : extractCodeBlocks(activeTopicHtml);
  const topicLinks = Array.isArray(activeTopic?.resources) && activeTopic.resources.length
    ? activeTopic.resources.map((resource) => ({ href: resource.url, label: resource.title || resource.url || 'Resource' }))
    : extractLinks(activeTopicHtml);
  const topicSummary = activeTopic?.summary || summarizeTopic(activeTopicHtml, activeTopic?.description || '');

  const completedCount = completedTopicIds.length;
  const totalTopics = topics.length || 1;
  const progressPercentage = Math.min(100, Math.round((completedCount / totalTopics) * 100));
  const allTopicsComplete = topics.length > 0 && completedCount >= topics.length;
  const durationEstimate = lesson?.duration ?? Math.max(topics.length * 8, 8);
  const totalAttachments = topics.reduce(
    (count, topic) => count + ((Array.isArray(topic.resources) ? topic.resources.length : 0) || extractLinks(topic.contentHtml || topic.content || '').length),
    0
  );
  const activeTopicTitle = activeTopic?.title || lesson?.title || 'Lesson';
  const activeTopicBody = activeTopic?.content || lesson?.content || '';
  const hasTopicVideo = Boolean(activeTopic?.videoUrl || topicVideoSrc);
  const embeddedVideoSrc = topicVideoSrc || activeTopic?.videoUrl || '';
  const keyPoints = topicListItems.length ? topicListItems : createDefaultKeyPoints(activeTopicTitle);
  const realWorldExamples = createDefaultExamples();
  const notes = Array.isArray(activeTopic?.notes) ? activeTopic.notes : [];
  const resources = topicLinks.length ? topicLinks : [];
  const codeBlocks = topicCodeBlocks.length ? topicCodeBlocks : [createDefaultCodeSnippet(activeTopicTitle)];
  const articleSummary =
    topicSummary ||
    lesson?.description ||
    'This lesson breaks the idea into readable steps, shows how it appears in real products, and gives you a practical model to remember.';
  const overviewHtml =
    cleanedTopicHtml ||
    (stripHtml(activeTopicBody)
      ? `<p>${stripHtml(activeTopicBody)}</p>`
      : `<p>This lesson introduces <strong>${activeTopicTitle}</strong> through a practical, article-style explanation. Read the overview, scan the examples, and use the code section to anchor the idea in something concrete.</p>`);

  const markComplete = async (topicId: string | null) => {
    if (!topicId) return;
    setCompletedTopicIds((current) => (current.includes(topicId) ? current : [...current, topicId]));

    try {
      await fetch('/api/lms/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          courseId,
          lessonId,
          completed: true,
        }),
      });
    } catch {
      // Keep the local completion state even if persistence fails.
    }
  };

  const jumpToResumePoint = () => {
    const nextIncomplete = topics.find((topic) => !completedTopicIds.includes(topic._id));
    if (nextIncomplete) {
      setActiveTopicId(nextIncomplete._id);
      setShowQuiz(false);
      return;
    }

    if (activeTopicQuiz) {
      setShowQuiz(true);
    }
  };

  const goToNextTopic = () => {
    if (activeTopic) {
      markComplete(activeTopic._id);
    }

    if (nextTopic) {
      setActiveTopicId(nextTopic._id);
      setShowQuiz(false);
      return;
    }

    if (activeTopicQuiz) {
      setShowQuiz(true);
    }
  };

  const goToPreviousTopic = () => {
    if (previousTopic) {
      setActiveTopicId(previousTopic._id);
      setShowQuiz(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {loading ? (
        <>
          <div className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
              <SkeletonCard className="h-6 w-40" />
              <SkeletonCard className="h-10 w-52 rounded-full" />
            </div>
          </div>
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-6 xl:grid-cols-[300px_minmax(0,1fr)]">
            <div className="space-y-4">
              <SkeletonCard className="h-40" />
              <SkeletonCard className="h-[24rem]" />
              <SkeletonCard className="h-32" />
            </div>
            <div className="space-y-4">
              <SkeletonCard className="h-72" />
              <SkeletonCard className="h-[28rem]" />
            </div>
          </div>
        </>
      ) : error || !lesson ? (
        <div className="flex min-h-screen items-center justify-center px-4 py-20 md:px-6">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-rose-100 bg-white p-8 text-center shadow-xl shadow-rose-100/40 md:p-10">
            <h1 className="text-3xl font-black text-rose-600">Locked or not found</h1>
            <p className="mt-4 text-slate-600">{error || t('somethingWentWrong')}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={getLocalePath(locale, `/courses/${course?.slug || courseId}`)}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20"
              >
                <ArrowLeft size={16} />
                {t('backToCourse')}
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm"
              >
                <RotateCcw size={16} />
                {t('retry')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
              <Link
                href={getLocalePath(locale, `/courses/${course?.slug || courseId}`)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
              >
                <ArrowLeft size={16} />
                Back to course
              </Link>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">
                  <Sparkles size={14} className="text-cyan-600" />
                  Premium learning experience
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700">
                  <CheckCircle2 size={14} />
                  {progressPercentage}% complete
                </span>
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 xl:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Course Progress</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-600">{lesson.title}</p>
                    <p className="mt-1 text-3xl font-black text-slate-950">{progressPercentage}%</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <PanelLeftOpen size={22} />
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>{completedCount} completed topics</span>
                  <span>{allTopicsComplete ? 'Lesson complete' : 'Keep going'}</span>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-2 px-1 pb-3">
                  <BookOpen size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Lesson Map</h2>
                </div>
                <div className="space-y-2">
                  {topics.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-500">
                      No topics have been added to this lesson yet.
                    </div>
                  ) : (
                    topics.map((topic, index) => {
                      const active = activeTopic?._id === topic._id;
                      const completed = completedTopicIds.includes(topic._id);
                      return (
                        <button
                          key={topic._id}
                          onClick={() => {
                            setActiveTopicId(topic._id);
                            setShowQuiz(false);
                          }}
                          className={[
                            'group w-full rounded-2xl border px-4 py-3 text-left transition-all',
                            active
                              ? 'border-blue-200 bg-blue-50 shadow-md shadow-blue-100'
                              : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
                          ].join(' ')}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={[
                                'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black',
                                completed
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : active
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-500',
                              ].join(' ')}
                            >
                              {completed ? <CheckCircle2 size={16} /> : index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-bold text-slate-900">{topic.title}</p>
                                {active ? (
                                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700">
                                    Live
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-xs text-slate-500">
                                {completed ? 'Completed' : active ? 'In progress' : 'Not started'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Quiz Shortcut</h2>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {activeTopicQuiz ? activeTopicQuiz.title : 'No quiz is attached to this lesson yet.'}
                </p>
                <button
                  onClick={() => (activeTopicQuiz ? setShowQuiz(true) : null)}
                  disabled={!activeTopicQuiz}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <PlayCircle size={16} />
                  Open quiz
                </button>
              </div>
            </aside>

            <main className="min-w-0">
              <article className="mx-auto w-full max-w-[760px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
                <header className="border-b border-slate-100 px-5 py-6 sm:px-7 md:px-8 md:py-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                      <Clock3 size={14} />
                      {course?.title || 'Course'} / Lesson
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {topics.length} topics
                      </span>
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                        {durationEstimate} mins
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-4">
                    <div>
                      <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                        {showQuiz && activeTopicQuiz ? activeTopicQuiz.title : activeTopicTitle}
                      </h1>
                      <p className="mt-4 max-w-[70ch] text-base leading-8 text-slate-600 md:text-lg">
                        {showQuiz && activeTopicQuiz
                          ? activeTopicQuiz.description || 'Use the quiz to check how well the lesson concepts have settled in.'
                          : articleSummary}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {previousTopic ? (
                        <button
                          onClick={goToPreviousTopic}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          <ArrowLeft size={16} />
                          Previous
                        </button>
                      ) : null}
                      {activeTopic && !completedTopicIds.includes(activeTopic._id) ? (
                        <button
                          onClick={() => markComplete(activeTopic._id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100"
                        >
                          <CheckCircle2 size={16} />
                          Mark complete
                        </button>
                      ) : null}
                      <button
                        onClick={goToNextTopic}
                        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
                      >
                        Next
                        <ArrowRight size={16} />
                      </button>
                    </div>

                    <div className="grid gap-3 rounded-[1.5rem] border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Progress</span>
                        <span className="mt-1 block text-lg font-bold text-slate-950">{progressPercentage}%</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">State</span>
                        <span className="mt-1 block text-lg font-bold text-slate-950">
                          {allTopicsComplete ? 'Ready for quiz' : 'Keep reading'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Attachments</span>
                        <span className="mt-1 block text-lg font-bold text-slate-950">{totalAttachments}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Current topic</span>
                        <span className="mt-1 block truncate text-lg font-bold text-slate-950">{activeTopicTitle}</span>
                      </div>
                    </div>
                  </div>
                </header>

                <div className="space-y-10 px-5 py-7 sm:px-7 md:px-8 md:py-10">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                  <Video size={14} className="text-cyan-600" />
                  Video
                </div>
                {hasTopicVideo ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950 shadow-lg">
                    <iframe
                      src={embeddedVideoSrc}
                      title={`${activeTopicTitle} video`}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                    No video added yet
                  </div>
                )}
                <p className="max-w-[70ch] text-sm leading-7 text-slate-500">
                  {hasTopicVideo
                    ? 'This embedded lecture sits at the top of the lesson so you can watch first and then move into the article content.'
                    : 'Add a YouTube or direct media URL in the topic editor to show the player here.'}
                </p>
              </section>

                  <section className="border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                      <BookOpen size={14} className="text-blue-600" />
                      Topic overview
                    </div>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                      {activeTopicTitle}
                    </h2>
                    <div className="lesson-rich-content mt-5 max-w-[70ch]" dangerouslySetInnerHTML={{ __html: overviewHtml }} />
                  </section>

                  <section className="border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                      <Layers3 size={14} className="text-blue-600" />
                      Key points
                    </div>
                    <ul className="mt-5 max-w-[70ch] space-y-3">
                      {keyPoints.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700"
                        >
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                      <Sparkles size={14} className="text-cyan-600" />
                      Real-world examples
                    </div>
                    <div className="mt-5 rounded-[1.5rem] border border-sky-100 bg-sky-50/70 p-5">
                      <p className="max-w-[70ch] text-sm leading-7 text-slate-700">
                        AI becomes easier to understand when you connect it to concrete workflows. Here are a few places the same ideas show up in practice:
                      </p>
                      <ul className="mt-4 grid gap-3 md:grid-cols-2">
                        {realWorldExamples.map((example) => (
                          <li
                            key={example}
                            className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm"
                          >
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

              <section className="border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                  <FileText size={14} className="text-blue-600" />
                  Notes
                </div>
                <div className="mt-5 rounded-[1.5rem] border border-amber-100 bg-amber-50/60 p-5">
                  {notes.length ? (
                    <ul className="space-y-3">
                      {notes.map((note) => (
                        <li key={note} className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-7 text-slate-500">No notes available</p>
                  )}
                </div>
              </section>

                  <section className="border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                      <BookOpen size={14} className="text-blue-600" />
                      Resources
                    </div>
                <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  {resources.length ? (
                    <ul className="space-y-3">
                      {resources.map((link) => (
                        <li key={link.href} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                          <a
                            href={link.href}
                            target={link.href.startsWith('http') ? '_blank' : undefined}
                            rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                            className="min-w-0 font-semibold text-blue-700 hover:underline"
                          >
                            {link.label}
                          </a>
                          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Reference
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-7 text-slate-500">No resources attached</p>
                  )}
                </div>
              </section>

                  <section className="border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                      <Sparkles size={14} className="text-cyan-600" />
                      Code examples
                    </div>
                    <div className="mt-5 space-y-4">
                      {codeBlocks.map((snippet) => (
                        <pre
                          key={snippet}
                          className="overflow-auto rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-sm leading-7 text-cyan-50 shadow-lg"
                        >
                          <code>{snippet}</code>
                        </pre>
                      ))}
                    </div>
                  </section>

                  {showQuiz && activeTopicQuiz ? (
                    <section className="border-t border-slate-100 pt-8">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Quiz</p>
                          <h2 className="mt-2 text-2xl font-black text-slate-950">{activeTopicQuiz.title}</h2>
                        </div>
                        <button
                          onClick={() => setShowQuiz(false)}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                        >
                          Back to article
                        </button>
                      </div>
                      <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                        <QuizComponent
                          quizId={activeTopicQuiz._id}
                          title={activeTopicQuiz.title}
                          questions={(activeTopicQuiz.questions || []) as any}
                          passingMarks={activeTopicQuiz.passingMarks || 0}
                          onComplete={(_score, passed) => {
                            if (passed && activeTopic) {
                              markComplete(activeTopic._id);
                            }
                          }}
                          onExit={() => setShowQuiz(false)}
                        />
                      </div>
                    </section>
                  ) : null}

                  <section className="border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                      <FileText size={14} className="text-blue-600" />
                      Summary
                    </div>
                    <p className="mt-4 max-w-[70ch] text-base leading-8 text-slate-700">
                      {articleSummary}
                    </p>
                    <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <p className="max-w-[70ch] text-sm leading-7 text-slate-600">
                        This article layout keeps the lesson readable from top to bottom: watch the embedded video, scan the topic overview, review the examples, and then use the quiz to confirm recall.
                      </p>
                    </div>
                  </section>

                  <section className="border-t border-slate-100 pt-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Navigation</p>
                        <h2 className="mt-2 text-xl font-black text-slate-950">Continue through the lesson</h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {previousTopic ? (
                          <button
                            onClick={goToPreviousTopic}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                          >
                            <ArrowLeft size={16} />
                            Previous
                          </button>
                        ) : null}
                        <button
                          onClick={jumpToResumePoint}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                        >
                          <PlayCircle size={16} />
                          Resume learning
                        </button>
                        {nextTopic ? (
                          <button
                            onClick={goToNextTopic}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
                          >
                            Next
                            <ArrowRight size={16} />
                          </button>
                        ) : (
                          <Link
                    href={getLocalePath(locale, `/courses/${course?.slug || courseId}`)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
                          >
                            Back to course
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        {completedCount} of {topics.length} topics completed
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm">
                        <Layers3 size={14} className="text-blue-600" />
                        {totalAttachments} references
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm">
                        <Clock3 size={14} className="text-cyan-600" />
                        {durationEstimate} mins estimated
                      </span>
                    </div>
                  </section>
                </div>
              </article>
            </main>
          </div>

          <style jsx global>{`
            .lesson-rich-content {
              color: #334155;
              font-size: 17px;
              line-height: 1.95;
            }

            .lesson-rich-content h2 {
              margin: 1.75rem 0 0.8rem;
              font-size: 1.8rem;
              line-height: 1.15;
              font-weight: 900;
              color: #020617;
            }

            .lesson-rich-content h3 {
              margin: 1.5rem 0 0.7rem;
              font-size: 1.25rem;
              line-height: 1.3;
              font-weight: 800;
              color: #0f172a;
            }

            .lesson-rich-content p {
              margin: 0.95rem 0;
              color: #334155;
            }

            .lesson-rich-content ul,
            .lesson-rich-content ol {
              margin: 1.1rem 0;
              padding-left: 1.35rem;
            }

            .lesson-rich-content li {
              margin: 0.5rem 0;
              color: #334155;
            }

            .lesson-rich-content blockquote {
              margin: 1.4rem 0;
              border-left: 4px solid #2563eb;
              background: #eff6ff;
              padding: 1.1rem 1.2rem;
              border-radius: 1rem;
              color: #1e3a8a;
              font-weight: 600;
            }

            .lesson-rich-content pre {
              margin: 1.3rem 0;
              overflow: auto;
              border-radius: 1rem;
              background: #0f172a;
              color: #e2e8f0;
              padding: 1rem 1.1rem;
            }

            .lesson-rich-content code {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
              font-size: 0.95em;
            }

            .lesson-rich-content figure {
              margin: 1.3rem 0;
            }

            .lesson-rich-content img {
              max-width: 100%;
              display: block;
              border-radius: 1.25rem;
            }

            .lesson-rich-content iframe {
              max-width: 100%;
              border: 0;
              border-radius: 1.25rem;
            }

            .lesson-rich-content a {
              color: #2563eb;
              font-weight: 700;
              text-decoration: underline;
              text-underline-offset: 0.18em;
            }

            .lesson-rich-content aside {
              margin: 1.25rem 0;
            }
          `}</style>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
            <SkeletonCard className="h-6 w-40" />
            <SkeletonCard className="h-10 w-52 rounded-full" />
          </div>
        </div>
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-4">
            <SkeletonCard className="h-40" />
            <SkeletonCard className="h-[24rem]" />
            <SkeletonCard className="h-32" />
          </div>
          <div className="space-y-4">
            <SkeletonCard className="h-72" />
            <SkeletonCard className="h-[28rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 text-center md:px-6">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-rose-100 bg-white p-8 shadow-xl shadow-rose-100/40 md:p-10">
          <h1 className="text-3xl font-black text-rose-600">Locked or not found</h1>
          <p className="mt-4 text-slate-600">{error || t('somethingWentWrong')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={getLocalePath(locale, `/courses/${course?.slug || courseId}`)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20"
            >
              <ArrowLeft size={16} />
              {t('backToCourse')}
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm"
            >
              <RotateCcw size={16} />
              {t('retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <div className="relative overflow-hidden border-b border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.25),_transparent_26%),linear-gradient(180deg,_#0f172a_0%,_#111827_45%,_#f8fafc_45%,_#f8fafc_100%)]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-12 top-10 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute right-24 top-0 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-white/80">
            <Link
              href={getLocalePath(locale, `/courses/${course?.slug || courseId}`)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to course
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur">
              <Sparkles size={16} className="text-cyan-300" />
              Premium learning experience
            </div>
          </div>

          <div className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="max-w-4xl text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200/80">
                {course?.title || 'Course'} / Lesson
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                {lesson.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">
                {topicSummary}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white/80 backdrop-blur">
                  <Layers3 size={15} className="text-cyan-300" />
                  {topics.length} topics
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white/80 backdrop-blur">
                  <BadgeInfo size={15} className="text-cyan-300" />
                  {activeTopicQuiz ? 'Quiz included' : 'No quiz attached'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white/80 backdrop-blur">
                  <Clock3 size={15} className="text-cyan-300" />
                  {durationEstimate} mins estimated
                </span>
              </div>

              {course?.thumbnail ? (
                <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-[220px] w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 text-white shadow-2xl shadow-blue-950/30 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Progress</p>
                  <p className="mt-2 text-3xl font-black">{progressPercentage}%</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <Medal size={24} className="text-cyan-200" />
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-white/70">
                <span>{completedCount} completed</span>
                <span>{topics.length || 0} total</span>
              </div>
              <button
                onClick={jumpToResumePoint}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-transform hover:-translate-y-0.5"
              >
                <PlayCircle size={16} />
                Resume learning
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Course Progress</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">{lesson.title}</p>
                <p className="mt-1 text-3xl font-black text-slate-900">{progressPercentage}%</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <PanelLeftOpen size={22} />
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>{completedCount} completed topics</span>
              <span>{allTopicsComplete ? 'Lesson complete' : 'Keep going'}</span>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 px-1 pb-3">
              <BookOpen size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Lesson Map</h2>
            </div>
            <div className="space-y-2">
              {topics.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No topics have been added to this lesson yet.
                </div>
              ) : (
                topics.map((topic, index) => {
                  const active = activeTopic?._id === topic._id;
                  const completed = completedTopicIds.includes(topic._id);
                  return (
                    <button
                      key={topic._id}
                      onClick={() => {
                        setActiveTopicId(topic._id);
                        setShowQuiz(false);
                      }}
                      className={[
                        'group w-full rounded-2xl border px-4 py-3 text-left transition-all',
                        active
                          ? 'border-blue-200 bg-blue-50 shadow-md shadow-blue-100'
                          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={[
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black',
                            completed
                              ? 'bg-emerald-100 text-emerald-700'
                              : active
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-500',
                          ].join(' ')}
                        >
                          {completed ? <CheckCircle2 size={16} /> : index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-bold text-slate-900">{topic.title}</p>
                            {active && <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700">Live</span>}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {completed ? 'Completed' : active ? 'In progress' : 'Not started'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Quiz Shortcut</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {activeTopicQuiz ? activeTopicQuiz.title : 'No quiz is attached to this lesson yet.'}
            </p>
            <button
              onClick={() => setShowQuiz(true)}
              disabled={!activeTopicQuiz}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PlayCircle size={16} />
              Open quiz
            </button>
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    {activeTopic ? 'Current topic' : 'Lesson overview'}
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                    {showQuiz && activeTopicQuiz ? activeTopicQuiz.title : activeTopic?.title || lesson.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    {showQuiz && activeTopicQuiz
                      ? activeTopicQuiz.description || 'Attempt the quiz below to check your understanding.'
                      : topicSummary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {previousTopic ? (
                    <button
                      onClick={goToPreviousTopic}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ArrowLeft size={16} />
                      Previous
                    </button>
                  ) : null}
                  {activeTopic && !completedTopicIds.includes(activeTopic._id) ? (
                    <button
                      onClick={() => markComplete(activeTopic._id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100"
                    >
                      <CheckCircle2 size={16} />
                      Mark complete
                    </button>
                  ) : null}
                  <button
                    onClick={goToNextTopic}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-5">
                {topicVideoSrc ? (
                  <section className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-lg">
                    <div className="mb-4 flex items-center gap-2">
                      <Video size={16} className="text-cyan-300" />
                      <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-white/60">Video Section</h3>
                    </div>
                    <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black">
                      <iframe
                        src={topicVideoSrc}
                        title={`${activeTopic?.title || lesson.title} video`}
                        className="aspect-video w-full"
                        allowFullScreen
                      />
                    </div>
                  </section>
                ) : (
                  <section className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-lg">
                    <div className="mb-3 flex items-center gap-2">
                      <Video size={16} className="text-cyan-300" />
                      <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-white/60">Video Section</h3>
                    </div>
                    <p className="max-w-xl text-sm leading-7 text-white/70">
                      Add a YouTube lecture or walkthrough from the admin topic editor to turn this area into a short video lesson.
                    </p>
                  </section>
                )}

                {showQuiz && activeTopicQuiz ? (
                  <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Quiz Section</p>
                        <h3 className="mt-1 text-xl font-black text-slate-950">{activeTopicQuiz.title}</h3>
                      </div>
                      <button
                        onClick={() => setShowQuiz(false)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                      >
                        Back to topic
                      </button>
                    </div>
                    <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                      <QuizComponent
                        quizId={activeTopicQuiz._id}
                        title={activeTopicQuiz.title}
                        questions={(activeTopicQuiz.questions || []) as any}
                        passingMarks={activeTopicQuiz.passingMarks || 0}
                        onComplete={(_score, passed) => {
                          if (passed && activeTopic) {
                            markComplete(activeTopic._id);
                          }
                        }}
                        onExit={() => setShowQuiz(false)}
                      />
                    </div>
                  </section>
                ) : null}

                {!showQuiz && activeTopic ? (
                  <>
                    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Topic Overview</p>
                          <h3 className="mt-2 text-2xl font-black text-slate-950">{activeTopic.title}</h3>
                        </div>
                        <div className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                          {completedTopicIds.includes(activeTopic._id) ? 'Completed' : 'In progress'}
                        </div>
                      </div>

                      <div className="mt-5">
                        <div
                          className="lesson-rich-content"
                          dangerouslySetInnerHTML={{ __html: cleanedTopicHtml || '<p>This topic does not have content yet.</p>' }}
                        />
                      </div>
                    </section>

                    <div className="grid gap-5 xl:grid-cols-2">
                      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Layers3 size={16} className="text-blue-600" />
                          <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Key Points</h3>
                        </div>
                        {topicListItems.length ? (
                          <ul className="mt-4 space-y-3">
                            {topicListItems.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                              >
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-4 text-sm leading-7 text-slate-500">
                            Add a few bullet points in the editor for ideas like AI, machine learning, data, and decision systems.
                          </p>
                        )}
                      </section>

                      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-600" />
                          <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Summary</h3>
                        </div>
                        <p className="mt-4 text-sm leading-7 text-slate-600">{topicSummary}</p>
                      </section>
                    </div>

                    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-blue-600" />
                        <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Notes and Resources</h3>
                      </div>
                      <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-sm font-bold text-slate-900">Notes</p>
                          <p className="mt-2 text-sm leading-7 text-slate-600">
                            Use the note card button in the admin editor to add callouts, reminders, or definitions.
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-sm font-bold text-slate-900">Resources</p>
                          {topicLinks.length ? (
                            <ul className="mt-2 space-y-2">
                              {topicLinks.map((link) => (
                                <li key={link.href} className="text-sm">
                                  <a href={link.href} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">
                                    {link.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              Add references such as a machine learning cheat sheet, model checklist, or course handout.
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-cyan-300" />
                        <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-white/60">Example / Code</h3>
                      </div>
                      {topicCodeBlocks.length ? (
                        <div className="mt-4 space-y-4">
                          {topicCodeBlocks.map((snippet) => (
                            <pre
                              key={snippet}
                              className="overflow-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-cyan-50"
                            >
                              <code>{snippet}</code>
                            </pre>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm leading-7 text-white/70">
                          Add an example like `model.fit(data)` or a simple prediction snippet to illustrate the concept.
                        </p>
                      )}
                    </section>
                  </>
                ) : null}
              </div>

              <aside className="space-y-5">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Lesson Information</p>
                  <h3 className="mt-3 text-2xl font-black text-slate-950">{lesson.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {topicSummary || activeTopic?.description || 'This lesson introduces AI concepts, examples, and practical machine learning ideas.'}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm font-medium text-slate-600">Duration</span>
                      <span className="text-sm font-bold text-slate-900">{durationEstimate} mins</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm font-medium text-slate-600">Total topics</span>
                      <span className="text-sm font-bold text-slate-900">{topics.length}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm font-medium text-slate-600">Attachments</span>
                      <span className="text-sm font-bold text-slate-900">{totalAttachments}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm font-medium text-slate-600">Completion</span>
                      <span className="text-sm font-bold text-slate-900">{progressPercentage}%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Continue Learning</p>
                  <p className="mt-3 text-lg font-black">{nextTopic ? nextTopic.title : activeTopicQuiz ? 'Start the quiz' : 'Lesson complete'}</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    {nextTopic
                      ? 'Move to the next topic and keep the momentum going.'
                      : activeTopicQuiz
                        ? 'You are ready to test your understanding with the quiz.'
                        : 'You have reached the end of this lesson.'}
                  </p>
                  <div className="mt-5 space-y-3">
                    <button
                      onClick={jumpToResumePoint}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5"
                    >
                      <PlayCircle size={16} />
                      Continue learning
                    </button>
                    <Link
                      href={getLocalePath(locale, `/courses/${course?.slug || courseId}`)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                    >
                      Back to course
                    </Link>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Learning Status</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        {allTopicsComplete ? 'Ready for quiz' : 'Keep progressing'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {completedCount} of {topics.length} topics completed
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>

      <style jsx global>{`
        .lesson-rich-content {
          color: #0f172a;
          font-size: 16px;
          line-height: 1.9;
        }

        .lesson-rich-content h2 {
          margin: 1.5rem 0 0.75rem;
          font-size: 1.75rem;
          line-height: 1.2;
          font-weight: 900;
          color: #020617;
        }

        .lesson-rich-content h3 {
          margin: 1.35rem 0 0.65rem;
          font-size: 1.2rem;
          line-height: 1.35;
          font-weight: 800;
          color: #0f172a;
        }

        .lesson-rich-content p {
          margin: 0.9rem 0;
          color: #334155;
        }

        .lesson-rich-content ul,
        .lesson-rich-content ol {
          margin: 1rem 0;
          padding-left: 1.4rem;
        }

        .lesson-rich-content li {
          margin: 0.45rem 0;
          color: #334155;
        }

        .lesson-rich-content blockquote {
          margin: 1.2rem 0;
          border-left: 4px solid #2563eb;
          background: #eff6ff;
          padding: 1rem 1.1rem;
          border-radius: 1rem;
          color: #1e3a8a;
          font-weight: 600;
        }

        .lesson-rich-content pre {
          margin: 1.2rem 0;
          overflow: auto;
          border-radius: 1rem;
          background: #0f172a;
          color: #e2e8f0;
          padding: 1rem 1.1rem;
        }

        .lesson-rich-content code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
          font-size: 0.95em;
        }

        .lesson-rich-content figure {
          margin: 1.25rem 0;
        }

        .lesson-rich-content img {
          max-width: 100%;
          display: block;
          border-radius: 1.25rem;
        }

        .lesson-rich-content iframe {
          max-width: 100%;
          border: 0;
          border-radius: 1.25rem;
        }

        .lesson-rich-content a {
          color: #2563eb;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 0.18em;
        }

        .lesson-rich-content aside {
          margin: 1.25rem 0;
        }
      `}</style>
    </div>
  );
}
