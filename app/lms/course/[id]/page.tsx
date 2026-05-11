'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCourse } from '@/plugins/lms/hooks/useLmsData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  PlayCircle, 
  CheckCircle2, 
  Lock, 
  ChevronLeft, 
  BookOpen, 
  Clock, 
  Trophy, 
  ArrowRight 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourseDetails() {
  const params = useParams();
  const router = useRouter();
  const { course, loading, error } = useCourse(params.id);

  if (loading) return <CourseSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!course) return null;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="border-b bg-muted/30 pb-12 pt-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <ChevronLeft size={16} /> Back to Courses
          </Button>

          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-none">
                  {course.category}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground h-5 font-medium">
                  <Trophy size={14} className="text-amber-500" />
                  Certificate Included
                </div>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl leading-tight">
                {course.title}
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-6 pt-4 border-t border-muted/50 max-w-xl">
                <StatItem icon={BookOpen} label={`${course.modules?.length || 0} Modules`} />
                <StatItem icon={Clock} label="12.5 Hours" />
                <StatItem icon={GraduationCap} label={course.level} />
              </div>

              <div className="pt-6">
                <Button size="lg" className="rounded-full px-10 font-bold text-base shadow-xl hover:shadow-2xl transition-all gap-2 h-14">
                  Enroll in this Path <ArrowRight size={20} />
                </Button>
              </div>
            </div>

            <div className="lg:w-96 shrink-0 pt-10 lg:pt-0">
              <Card className="overflow-hidden border-none shadow-2xl shadow-indigo-500/10 ring-1 ring-muted">
                <div className="aspect-video bg-muted relative group">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle size={64} className="text-white fill-white/20" />
                  </div>
                </div>
                <CardHeader className="p-6">
                  <CardTitle className="text-xl">Course Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-sm text-muted-foreground mb-6">
                    Enroll now to start tracking your progress and earning badges.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-medium p-3 bg-muted/40 rounded-lg">
                      <CheckCircle2 size={18} className="text-primary" />
                      Lifetime Access
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium p-3 bg-muted/40 rounded-lg">
                      <CheckCircle2 size={18} className="text-primary" />
                      Practical Projects
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus Section */}
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold mb-10">Syllabus & Learning Roadmap</h2>
          
          <div className="space-y-4">
            {course.modules?.map((module, idx) => (
              <Card key={module._id} className="border-muted bg-background hover:bg-muted/5 transition-colors">
                <CardHeader className="p-5 flex flex-row items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {idx + 1}
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {module.lessons?.length || 0} Lessons
                  </span>
                </CardHeader>
                <CardContent className="p-0 border-t">
                  {module.lessons?.map((lesson, lIdx) => (
                    <div 
                      key={lesson._id} 
                      className="p-4 px-6 flex items-center justify-between hover:bg-muted/30 cursor-pointer transition-colors border-b last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        {lesson.unlockType === 'none' ? (
                          <PlayCircle size={18} className="text-primary" />
                        ) : (
                          <Lock size={18} className="text-muted-foreground/50" />
                        )}
                        <span className="text-sm font-medium text-foreground/80">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">8:45</span>
                        {lesson.unlockType === 'none' && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase font-bold tracking-tighter">Open</Badge>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 bg-background border rounded-lg">
        <Icon size={16} className="text-primary" />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

function CourseSkeleton() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl space-y-12">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-10 w-1/2" />
        </div>
        <Skeleton className="lg:w-96 h-80 rounded-2xl" />
      </div>
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

function GraduationCap({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}

function ErrorMessage({ error }) {
  return (
    <div className="container mx-auto px-4 py-40 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-2">Oops! Something went wrong</h2>
      <p className="text-muted-foreground">{error}</p>
      <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );
}
