'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, GraduationCap, ArrowRight } from 'lucide-react';

interface CareerPathCardProps {
  _id: string;
  careerName: string;
  description: string;
  requiredSkills: string[];
  recommendedCourses?: {
    _id: string;
    title: string;
  }[];
}

export const CareerPathCard: React.FC<CareerPathCardProps> = ({
  _id,
  careerName,
  description,
  requiredSkills,
  recommendedCourses = [],
}) => {
  return (
    <div className="group relative rounded-2xl border bg-card p-1 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
      
      <div className="flex flex-col h-full bg-background rounded-xl p-6">
        <div className="mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Briefcase size={24} />
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">{careerName}</h3>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <div className="space-y-4 flex-1">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <span>Required Skills</span>
              <div className="h-px flex-1 bg-border" />
            </h4>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.slice(0, 4).map((skill, idx) => (
                <span 
                  key={idx} 
                  className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border"
                >
                  {skill}
                </span>
              ))}
              {requiredSkills.length > 4 && (
                <span className="text-xs text-muted-foreground font-medium flex items-center">
                  +{requiredSkills.length - 4} more
                </span>
              )}
            </div>
          </div>

          {recommendedCourses.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <span>Top Courses</span>
                <div className="h-px flex-1 bg-border" />
              </h4>
              <div className="space-y-1.5">
                {recommendedCourses.slice(0, 2).map((course) => (
                  <Link 
                    key={course._id}
                    href={`/courses/${course._id}`}
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors group/link"
                  >
                    <GraduationCap size={14} className="text-muted-foreground group-hover/link:text-primary" />
                    <span className="truncate">{course.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
          <Link 
            href={`/career-paths/${_id}`}
            className="text-sm font-bold text-primary flex items-center gap-1.5 group-hover:gap-2 transition-all"
          >
            Explore Pathway
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
