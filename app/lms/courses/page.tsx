'use client';

import React from 'react';
import { useCourses } from '@/plugins/lms/hooks/useLmsData';
import CourseCard from '@/plugins/lms/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourseMarketplace() {
  const { courses, loading, error } = useCourses();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Explore Courses</h1>
          <p className="text-muted-foreground">Master new skills with our premium learning paths.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search concepts..." 
              className="pl-9 bg-background/50 border-muted"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 border-muted">
            <SlidersHorizontal size={18} />
          </Button>
          <Button variant="outline" size="icon" className="shrink-0 border-muted">
            <ArrowUpDown size={18} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
          <p className="text-destructive font-semibold">Error loading course catalog</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
          
          {courses.length === 0 && (
            <div className="col-span-full text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
              <p className="text-muted-foreground font-medium text-lg">No courses found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
