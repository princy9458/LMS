import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Briefcase, Calendar } from 'lucide-react';

const JobCard = ({ job }) => {
  return (
    <Card className="hover:border-primary/50 transition-colors shadow-none border-muted">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center font-bold text-primary overflow-hidden">
            {job.employer?.logo ? (
              <img src={job.employer.logo} alt={job.employer.companyName} className="w-full h-full object-cover" />
            ) : (
              job.employer?.companyName?.charAt(0) || 'J'
            )}
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{job.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{job.employer?.companyName}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] font-medium capitalize">
          {job.type}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 my-4 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-muted-foreground/70" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-muted-foreground/70" />
            <span>{job.salaryRange || 'Not disclosed'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase size={14} className="text-muted-foreground/70" />
            <span>Full Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-muted-foreground/70" />
            <span>Posted Recently</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.requirements?.slice(0, 3).map((req, idx) => (
            <Badge key={idx} variant="outline" className="text-[9px] h-5 bg-muted/30">
              {req}
            </Badge>
          ))}
          {job.requirements?.length > 3 && (
            <span className="text-[9px] text-muted-foreground">+{job.requirements.length - 3} more</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
