'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/modules/lms/store/store';
import { setJobs, setLoading } from '@/modules/lms/store/slices/opportunitiesSlice';
import { JobCard } from '@/modules/lms/components/opportunities/JobCard';

export default function JobsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading } = useSelector((state: RootState) => state.opportunities);

  useEffect(() => {
    const fetchJobs = async () => {
      dispatch(setLoading(true));
      try {
        const response = await fetch('/api/lms/jobs');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const result = await response.json();
        // The API returns { success: true, count: n, data: [...] }
        // Each job might have employerId populated with companyName
        const processedJobs = (result.data || []).map((job: any) => ({
          ...job,
          companyName: job.employerId?.companyName || job.company || 'Unknown Company'
        }));
        dispatch(setJobs(processedJobs));
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchJobs();
  }, [dispatch]);

  return (
    <div className="container py-12 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-primary">
            Job Opportunities
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Find your next career move. Explore full-time roles from top employers who value your skills and certifications.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[280px] rounded-2xl border bg-muted/20 animate-pulse border-muted" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-16 border-2 border-dashed rounded-2xl text-center bg-muted/5 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <h2 className="text-2xl font-bold">No job openings at the moment</h2>
            <p className="text-muted-foreground mt-3 max-w-sm text-lg">
              We're constantly updating our listings. Please check back later or set up an alert for new opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
              <JobCard key={job._id} {...job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
