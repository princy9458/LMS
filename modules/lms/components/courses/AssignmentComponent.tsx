'use client';

import React, { useState } from 'react';
import { FileText, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AssignmentProps {
  title: string;
  description: string;
  onSuccess?: () => void;
}

export const AssignmentComponent: React.FC<AssignmentProps> = ({ title, description, onSuccess }) => {
  const [submission, setSubmission] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission.trim()) return;

    setStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      if (onSuccess) onSuccess();
    }, 1500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border bg-card p-8 mt-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">Practical Assignment</p>
        </div>
      </div>

      <div className="prose prose-slate dark:prose-invert mb-8">
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {status === 'success' ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl flex flex-col items-center text-center gap-3">
          <CheckCircle className="text-emerald-500" size={32} />
          <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-400">Assignment Submitted!</h4>
          <p className="text-sm text-emerald-600 dark:text-emerald-500">
            Great job! Your submission has been received and is being reviewed.
          </p>
          <button 
            onClick={() => setStatus('idle')}
            className="mt-2 text-sm font-bold text-emerald-700 underline"
          >
            Edit Submission
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Your Solution
              <span className="text-[10px] font-medium lowercase">Link to repo or text</span>
            </label>
            <textarea 
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="Paste your link or solution here..."
              className="w-full min-h-[120px] p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={status === 'submitting' || !submission.trim()}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 transition-all"
          >
            {status === 'submitting' ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={18} /> Submit Assignment
              </>
            )}
          </button>
          
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
             <AlertCircle size={14} className="mt-0.5" />
             <p>Make sure your repository is public if you are sharing a GitHub link.</p>
          </div>
        </form>
      )}
    </div>
  );
};
