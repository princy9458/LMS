import React from 'react';
import { Progress } from '@/components/ui/progress';

const ProgressBar = ({ value, label }) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-primary">{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="h-2 rounded-full overflow-hidden bg-muted" />
    </div>
  );
};

export default ProgressBar;
