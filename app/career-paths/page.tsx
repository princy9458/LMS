'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/modules/lms/store/store';
import { setCareerPaths, setLoading } from '@/modules/lms/store/slices/opportunitiesSlice';
import { CareerPathCard } from '@/modules/lms/components/opportunities/CareerPathCard';
import { Compass } from 'lucide-react';

export default function CareerPathsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { careerPaths, loading } = useSelector((state: RootState) => state.opportunities);

  useEffect(() => {
    const fetchCareerPaths = async () => {
      dispatch(setLoading(true));
      try {
        const response = await fetch('/api/lms/careerPaths');
        if (!response.ok) {
          throw new Error('Failed to fetch career paths');
        }
        const result = await response.json();
        dispatch(setCareerPaths(result.data || []));
      } catch (err: any) {
        console.error('Error fetching career paths:', err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCareerPaths();
  }, [dispatch]);

  return (
    <div className="bg-slate-50 min-h-screen py-16 dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4 max-w-3xl">
            <div className="flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-sm">
              <Compass size={18} />
              <span>Career Guidance</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
              Chart Your <span className="text-primary italic">Success</span> Path
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Explore curated career pathways designed to bridge the gap between learning and employment. Each path outlines the skills you need and the courses we recommend.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] rounded-2xl border bg-muted/20 animate-pulse border-muted" />
              ))}
            </div>
          ) : careerPaths.length === 0 ? (
            <div className="p-20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center bg-white dark:bg-slate-900 flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-8 text-slate-400">
                <Compass size={40} />
              </div>
              <h2 className="text-3xl font-bold mb-4">New Pathways arriving soon</h2>
              <p className="text-muted-foreground max-w-md text-lg">
                Our team is working with industry experts to curate the best career pathways for you. Stay tuned for updates!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {careerPaths.map((path) => (
                <CareerPathCard key={path._id} {...path} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
