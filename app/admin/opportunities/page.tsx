'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Building2, GraduationCap, AlertCircle, Plus, Loader2 } from 'lucide-react';

export default function AdminOpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<'job' | 'internship'>('job');
  
  // Job Form State
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    salaryRange: '',
    requiredSkills: '',
  });

  // Internship Form State
  const [internData, setInternData] = useState({
    title: '',
    company: '',
    duration: '',
    stipend: '',
    requiredSkills: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess('');

    try {
      const skillsArray = jobData.requiredSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const response = await fetch('/api/lms/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          salaryRange: jobData.salaryRange,
          requiredSkills: skillsArray,
        }),
      });

      if (!response.ok) throw new Error('Failed to post job');

      setSuccess('Job posted successfully!');
      setJobData({ title: '', company: '', location: '', salaryRange: '', requiredSkills: '' });
    } catch (err: any) {
      setError(err.message || 'Error posting job');
    } finally {
      setLoading(false);
    }
  };

  const handleInternSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess('');

    try {
      const skillsArray = internData.requiredSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const response = await fetch('/api/lms/internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: internData.title,
          company: internData.company,
          duration: internData.duration,
          stipend: internData.stipend,
          requiredSkills: skillsArray,
        }),
      });

      if (!response.ok) throw new Error('Failed to post internship');

      setSuccess('Internship posted successfully!');
      setInternData({ title: '', company: '', duration: '', stipend: '', requiredSkills: '' });
    } catch (err: any) {
      setError(err.message || 'Error posting internship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 md:px-6">
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Admin Portal</Link>
           <h1 className="text-3xl font-extrabold flex items-center gap-3">
               <Building2 className="text-primary" />
               Employer Dashboard
           </h1>
           <p className="text-muted-foreground mt-2">Post new career opportunities to match with skilled students.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-sm overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => { setActiveTab('job'); setError(null); setSuccess(''); }}
            className={`flex-1 py-4 px-6 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'job' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted-foreground hover:bg-muted/30'}`}
          >
            <Briefcase size={18} />
            Post a Job
          </button>
          <button
            onClick={() => { setActiveTab('internship'); setError(null); setSuccess(''); }}
            className={`flex-1 py-4 px-6 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'internship' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted-foreground hover:bg-muted/30'}`}
          >
            <GraduationCap size={18} />
            Post an Internship
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6 flex items-start gap-3 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 p-4 rounded-xl mb-6 text-sm border border-green-200 dark:border-green-800">
              <p className="font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                {success}
              </p>
            </div>
          )}

          {activeTab === 'job' ? (
            <form onSubmit={handleJobSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Job Title *</label>
                  <input required placeholder="e.g., Frontend Developer" value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Company Name *</label>
                  <input required placeholder="e.g., TechCorp" value={jobData.company} onChange={e => setJobData({...jobData, company: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Location</label>
                  <input placeholder="e.g., Remote / New York" value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Salary Range</label>
                  <input placeholder="e.g., $100k - $120k" value={jobData.salaryRange} onChange={e => setJobData({...jobData, salaryRange: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Required Skills (Comma separated)</label>
                <input placeholder="e.g., React, TypeScript, Node.js" value={jobData.requiredSkills} onChange={e => setJobData({...jobData, requiredSkills: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                <p className="text-xs text-muted-foreground">These will be used to match students who have completed courses with these skills.</p>
              </div>
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center rounded-md font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 mt-4">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Publish Job
              </button>
            </form>
          ) : (
            <form onSubmit={handleInternSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Internship Title *</label>
                  <input required placeholder="e.g., UI/UX Intern" value={internData.title} onChange={e => setInternData({...internData, title: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Company Name *</label>
                  <input required placeholder="e.g., DesignStudio" value={internData.company} onChange={e => setInternData({...internData, company: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Duration</label>
                  <input placeholder="e.g., 3 Months" value={internData.duration} onChange={e => setInternData({...internData, duration: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Stipend</label>
                  <input placeholder="e.g., $1,500/month" value={internData.stipend} onChange={e => setInternData({...internData, stipend: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Required Skills (Comma separated)</label>
                <input placeholder="e.g., Figma, CSS" value={internData.requiredSkills} onChange={e => setInternData({...internData, requiredSkills: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center rounded-md font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 mt-4">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Publish Internship
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
