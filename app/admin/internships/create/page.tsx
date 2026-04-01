'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowLeft, Loader2, Save, MapPin, Building, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function CreateInternshipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employers, setEmployers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    employer: '',
    duration: '',
    stipend: '',
    location: 'Remote',
    description: '',
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
      const res = await fetch('/api/lms/internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements.split('\n').filter(r => r.trim() !== '')
        }),
      });

      if (res.ok) {
        router.push('/admin/internships');
      }
    } catch (error) {
      console.error('Failed to create internship:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/internships" className="p-2 hover:bg-zinc-100 rounded-full transition text-zinc-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">New Internship Placement</h1>
          <p className="text-zinc-500 text-sm">Create a new career learning opportunity.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-12">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" /> Internship Title
              </label>
              <input 
                required
                type="text" 
                placeholder="e.g. Marketing Intern"
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
                <option value="">Select Partner...</option>
                {employers.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.companyName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> Duration
              </label>
              <input 
                required
                type="text" 
                placeholder="e.g. 3 Months or Summer 2024"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-500" /> Stipend / Multiplier
              </label>
              <input 
                required
                type="text" 
                placeholder="e.g. $500/mo or Unpaid"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500" /> Location
            </label>
            <input 
              required
              type="text" 
              placeholder="e.g. Remote, Hybrid, or London"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              Program Description
            </label>
            <textarea 
              required
              rows={6}
              placeholder="Describe the learning objectives, daily tasks, and mentorship details..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              Learner Requirements (One per line)
            </label>
            <textarea 
              rows={4}
              placeholder="e.g. Final year undergraduate&#10;Basic knowledge of Python"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link 
            href="/admin/internships"
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
            Launch Placement
          </button>
        </div>
      </form>
    </div>
  );
}
