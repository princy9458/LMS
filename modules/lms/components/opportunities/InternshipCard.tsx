import React from 'react';
import Link from 'next/link';

interface InternshipCardProps {
  _id: string;
  title: string;
  companyName: string;
  duration?: string;
  stipend?: string;
  requiredSkills?: string[];
  matchedSkills?: string[];
  matchScore?: number;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({ 
  _id, title, companyName, duration, stipend, requiredSkills = [], matchedSkills = [] 
}) => {
  return (
    <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition-colors relative">
      {/* Decorative badge indicating internship type */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
         <div className="absolute transform rotate-45 bg-blue-500 text-white text-[10px] font-bold py-1 right-[-35px] top-[16px] w-[120px] text-center shadow-sm">
           INTERN
         </div>
      </div>

      <div className="p-6 flex flex-col gap-2 z-10">
        <div className="flex justify-between items-start pr-8">
           <h3 className="font-semibold leading-tight tracking-tight text-xl">{title}</h3>
           {matchedSkills.length > 0 && (
              <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full border border-blue-300 flex items-center gap-1 shrink-0 ml-2">
                 MATCH
              </span>
           )}
        </div>
        <p className="text-sm text-muted-foreground font-medium w-full truncate">
          {companyName}
        </p>
        
        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
          {duration && (
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {duration}
            </span>
          )}
          {stipend && (
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              {stipend}
            </span>
          )}
        </div>
        
        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {requiredSkills.map((skill, idx) => {
              const isMatched = matchedSkills.some(ms => ms.toLowerCase() === skill.toLowerCase());
              return (
                <span 
                  key={idx} 
                  className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
                    isMatched 
                      ? 'bg-blue-100 text-blue-700 border-blue-300' 
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800'
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
          href={`/internships/${_id}`}
          className="w-full mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 h-9 px-4 py-2 transition-colors"
        >
          Apply Now
        </Link>
      </div>
    </div>
  );
};
