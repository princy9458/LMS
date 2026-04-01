'use client';

import React from 'react';
import SidebarNavigation from '@/plugins/lms/components/SidebarNavigation';
import JobCard from '@/plugins/lms/components/JobCard';
import { useJobs } from '@/plugins/lms/hooks/useLmsData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobBoard() {
  const { jobs, loading } = useJobs();

  return (
    <div className="flex min-h-screen bg-muted/10">
      <SidebarNavigation role="student" />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Opportunity Pool</h1>
              <p className="text-muted-foreground mt-1">Exclusive job and internship listings for LMS graduates.</p>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input placeholder="Search roles, companies..." className="pl-9 h-11 rounded-xl bg-background border-none shadow-sm" />
              </div>
              <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl border-none shadow-sm bg-background">
                <Filter size={20} />
              </Button>
            </div>
          </header>

          <div className="grid gap-6">
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
            ) : (
              jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))
            )}
            
            {!loading && jobs.length === 0 && (
              <div className="py-20 text-center bg-background rounded-3xl border border-dashed border-muted">
                 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="text-muted-foreground" size={32} />
                 </div>
                 <h3 className="text-lg font-bold">No opportunities currently listed</h3>
                 <p className="text-sm text-muted-foreground">Keep completing your courses to qualify for new listings!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
