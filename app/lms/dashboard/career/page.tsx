'use client';

import React from 'react';
import SidebarNavigation from '@/plugins/lms/components/SidebarNavigation';
import { useStudentAnalytics, useJobMatches, useRecommendations } from '@/plugins/lms/hooks/useLmsData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, Zap, Briefcase, TrendingUp, Sparkles, Download, FileText } from 'lucide-react';

export default function StudentCareerDashboard() {
  const { data: analytics, loading: loadingStats } = useStudentAnalytics();
  const { matches, loading: loadingJobs } = useJobMatches();
  const { recommendations, loading: loadingRecs } = useRecommendations();

  return (
    <div className="flex min-h-screen bg-muted/20">
      <SidebarNavigation role="student" />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-10">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                Career Pulse <Sparkles className="text-amber-500" size={32} />
              </h1>
              <p className="text-muted-foreground mt-1 font-medium">Your intelligence-backed path to professional growth.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="rounded-2xl gap-2 font-bold px-6 h-12">
                <FileText size={18} /> Building Resume
              </Button>
              <Button className="rounded-2xl gap-2 font-bold px-6 h-12 shadow-xl shadow-primary/20">
                <Award size={18} /> My Credentials
              </Button>
            </div>
          </header>

          <div className="grid lg:grid-cols-4 gap-6">
             {/* Left Column: Analytics & Skills */}
             <div className="lg:col-span-1 space-y-6">
                <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden">
                   <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                         <div className="p-4 bg-white/20 rounded-full">
                            <TrendingUp size={32} />
                         </div>
                         <div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Engagement Score</p>
                            <h2 className="text-5xl font-black">{analytics?.overview?.engagementScore || 0}%</h2>
                         </div>
                         <p className="text-xs opacity-70">Top 5% of learners this month</p>
                      </div>
                   </CardContent>
                </Card>

                <Card className="border-none shadow-sm h-full">
                  <CardHeader>
                     <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Zap className="text-amber-500" size={16} /> Skills Gained
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="flex flex-wrap gap-2">
                        {['Next.js', 'React', 'Tailwind SDK', 'System Design', 'MongoDB', 'AI Prompting'].map(skill => (
                           <Badge key={skill} className="bg-muted text-foreground hover:bg-primary hover:text-white transition-colors border-none py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase">
                              {skill}
                           </Badge>
                        ))}
                     </div>
                  </CardContent>
                </Card>
             </div>

             {/* Center Column: Job Matches & Recs */}
             <div className="lg:col-span-3 space-y-8">
                {/* AI Job Matches */}
                <section className="space-y-4">
                   <h2 className="text-xl font-bold flex items-center gap-2">
                      <Briefcase className="text-primary" size={20} /> AI Ranked Job Matches
                   </h2>
                   <div className="grid md:grid-cols-2 gap-4">
                      {matches.map((job) => (
                         <div key={job._id} className="group p-5 rounded-3xl bg-background border border-muted/20 hover:border-primary/40 transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                               <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center font-bold text-lg">
                                  {job.employer?.companyName?.charAt(0)}
                               </div>
                               <Badge className="bg-green-500/10 text-green-600 border-none font-bold text-[10px]">
                                  {job.matchScore}% Match
                               </Badge>
                            </div>
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{job.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{job.employer?.companyName} • {job.location}</p>
                            <div className="mt-4 pt-4 border-t border-muted/10 flex items-center justify-between">
                               <span className="text-[10px] font-bold text-primary italic">“{job.matchReason}”</span>
                               <Button size="sm" variant="ghost" className="h-8 rounded-xl font-bold text-xs">Apply Now</Button>
                            </div>
                         </div>
                      ))}
                   </div>
                </section>

                {/* Course Recommendations */}
                <section className="space-y-4">
                   <h2 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="text-amber-500" size={20} /> Boost Your Learning
                   </h2>
                   <div className="grid md:grid-cols-3 gap-4">
                      {recommendations.map(course => (
                         <div key={course._id} className="p-4 rounded-2xl bg-white border border-muted shadow-sm hover:translate-y-[-4px] transition-transform cursor-pointer">
                            <div className="aspect-video bg-muted rounded-xl mb-3 overflow-hidden">
                               <img src={course.thumbnail} className="w-full h-full object-cover" alt="" />
                            </div>
                            <h4 className="font-bold text-sm leading-tight line-clamp-2">{course.title}</h4>
                            <div className="flex items-center justify-between mt-3">
                               <Badge variant="secondary" className="text-[9px] h-4 uppercase font-black">{course.level}</Badge>
                               <span className="text-[10px] font-bold text-primary">Resume Boost →</span>
                            </div>
                         </div>
                      ))}
                   </div>
                </section>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
