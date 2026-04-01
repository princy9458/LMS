import React from 'react';
import Link from 'next/link';

interface JobCardProps {
  _id: string;
  title: string;
  companyName: string;
  location?: string;
  salaryRange?: string;
  requiredSkills?: string[];
  matchedSkills?: string[];
  matchScore?: number;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  _id, title, companyName, location, salaryRange, requiredSkills = [], matchedSkills = []
}) => {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div className="p-6 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold leading-tight tracking-tight text-xl">{title}</h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            {salaryRange && (
              <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full whitespace-nowrap">
                {salaryRange}
              </span>
            )}
            {matchedSkills.length > 0 && (
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                 MATCHED
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          {companyName} {location && `• ${location}`}
        </p>
        
        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {requiredSkills.map((skill, idx) => {
              const isMatched = matchedSkills.some(ms => ms.toLowerCase() === skill.toLowerCase());
              return (
                <span 
                  key={idx} 
                  className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
                    isMatched 
                      ? 'bg-primary/5 text-primary border-primary/20 ring-1 ring-primary/10' 
                      : 'bg-secondary text-secondary-foreground border-transparent'
                  }`}
                >
                  {skill}
                </span>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="p-6 pt-0 mt-auto border-t bg-muted/10">
        <Link 
          href={`/jobs/${_id}`}
          className="w-full mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};
