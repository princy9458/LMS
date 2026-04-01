'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, ArrowLeft, Loader2, Save, MapPin, Building, Info } from 'lucide-react';
import Link from 'next/link';

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employers, setEmployers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    employer: '',
    location: '',
    type: 'Full-time',
    description: '',
    salaryRange: '',
    requirements: ''
  });

  useEffect(() => {
    const fetchEmployers = async () => {
      const res = await fetch('/api/lms/employers');
      const data = await res.json();
      if (data.success) setEmployers(data.data);
    };
    fetchEmployers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/lms/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements.split('\n').filter(r => r.trim() !== '')
        }),
      });

      if (res.ok) {
        router.push('/admin/jobs');
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/jobs" className="p-2 hover:bg-zinc-100 rounded-full transition text-zinc-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">New Job Listing</h1>
          <p className="text-zinc-500 text-sm">Create a new career opportunity for your students.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-12">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Job Title
              </label>
              <input 
                required
                type="text" 
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-500" /> Hiring Employer
              </label>
              <select 
                required
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                value={formData.employer}
                onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
              >
                <option value="">Select Employer...</option>
                {employers.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.companyName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" /> Location
              </label>
              <input 
                required
                type="text" 
                placeholder="e.g. Remote or San Francisco, CA"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-500" /> Employment Type
              </label>
              <select 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              Job Description
            </label>
            <textarea 
              required
              rows={6}
              placeholder="Describe the role, responsibilities, and team culture..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                Salary Range (Optional)
              </label>
              <input 
                type="text" 
                placeholder="e.g. $80,000 - $120,000"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                Requirements (One per line)
              </label>
              <textarea 
                rows={4}
                placeholder="e.g. 3+ years React experience&#10;Strong CSS skills"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link 
            href="/admin/jobs"
            className="px-6 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 transition"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-8 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish Job
          </button>
        </div>
      </form>
    </div>
  );
}
