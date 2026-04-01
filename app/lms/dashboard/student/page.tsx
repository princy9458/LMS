'use client';

import React from 'react';
import SidebarNavigation from '@/plugins/lms/components/SidebarNavigation';
import DashboardStats from '@/plugins/lms/components/DashboardStats';
import ProgressBar from '@/plugins/lms/components/ProgressBar';
import { useStudentDashboard } from '@/plugins/lms/hooks/useLmsData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function StudentDashboard() {
  const { data, loading } = useStudentDashboard();

  return (
    <div className="flex min-h-screen bg-muted/10">
      <SidebarNavigation role="student" />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-10">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, Alex!</h1>
              <p className="text-muted-foreground mt-1">You have 2 courses in progress and 1 pending invitation.</p>
            </div>
            <Link href="/lms/courses">
              <Button className="rounded-full gap-2 px-6">
                <BookOpen size={18} /> Continue Learning
              </Button>
            </Link>
          </header>

          <DashboardStats stats={data?.stats || { totalCourses: 12, totalStudents: 450, totalEnrollments: 890, avgProgress: 68 }} />

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Active Enrollments */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <PlayCircle className="text-primary" size={20} /> Current Learning Paths
              </h2>
              
              <div className="space-y-4">
                {loading ? (
                  <Skeleton className="h-40 w-full rounded-2xl" />
                ) : (
                  data?.enrollments?.map((enrollment) => (
                    <Card key={enrollment._id} className="group border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-background">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-48 aspect-video sm:aspect-square bg-muted">
                          <img src={enrollment.course.thumbnail} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <Badge variant="outline" className="mb-2 text-[9px] uppercase tracking-wider">{enrollment.course.category}</Badge>
                              <Link href={`/lms/course/${enrollment.course._id}`}>
                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors cursor-pointer">{enrollment.course.title}</h3>
                              </Link>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 hover:text-primary">
                              <ArrowRight size={20} />
                            </Button>
                          </div>
                          
                          <div className="space-y-4 pt-4">
                            <ProgressBar value={enrollment.progressPercent} label="Overall Completion" />
                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                              <div className="flex items-center gap-1.5">
                                <Clock size={14} /> 2h 45m left
                              </div>
                              <div className="flex items-center gap-1.5">
                                <BookOpen size={14} /> 4/12 lessons
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )) || (
                    <Card className="p-12 text-center bg-background border-dashed">
                       <p className="text-muted-foreground font-medium">No active enrollments found. Go explore some courses!</p>
                       <Link href="/lms/courses">
                         <Button variant="outline" className="mt-4 rounded-full">Browse Catalog</Button>
                       </Link>
                    </Card>
                  )
                )}
              </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-xl font-bold">Upcoming Quizzes</h2>
                <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden">
                  <CardContent className="p-6">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-3">Today</Badge>
                    <h3 className="text-lg font-bold mb-1">Architecture Baseline</h3>
                    <p className="text-sm opacity-80 mb-6 font-medium">Topic: Next.js Plugins</p>
                    <Link href="/lms/quiz/1">
                      <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 font-bold rounded-xl">Start Quiz Now</Button>
                    </Link>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold">Recent Certificates</h2>
                <div className="space-y-3">
                  <CertificateItem title="UI/UX Fundamentals" date="Mar 12, 2026" />
                  <CertificateItem title="React State Mastery" date="Feb 24, 2026" />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CertificateItem({ title, date }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-background shadow-sm border border-muted/20">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
        <GraduationCap size={20} />
      </div>
      <div>
        <p className="text-sm font-bold leading-tight">{title}</p>
        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Earned on {date}</p>
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
