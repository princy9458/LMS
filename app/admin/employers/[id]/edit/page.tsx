'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building, ArrowLeft, Loader2, Save, Globe, Mail, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditEmployerPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    logo: '',
    contactEmail: '',
    description: '',
    isVerified: false
  });

  useEffect(() => {
    const fetchEmployer = async () => {
      try {
        const res = await fetch(`/api/lms/employers/${id}`);
        // Wait, the API doesn't have a GET_BY_ID for employers in modular api yet?
        // Let's check employers.js
        const data = await res.json();
        if (data.success) {
          const emp = data.data;
          setFormData({
            companyName: emp.companyName || '',
            industry: emp.industry || '',
            website: emp.website || '',
            logo: emp.logo || '',
            contactEmail: emp.contactEmail || '',
            description: emp.description || '',
            isVerified: emp.isVerified || false
          });
        }
      } catch (err) {
        setError('Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployer();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/lms/employers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/employers');
      }
    } catch (error) {
      setError('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/employers" className="p-2 hover:bg-zinc-100 rounded-full transition text-zinc-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Edit Corporate Partner</h1>
          <p className="text-zinc-500 text-sm">Update profile and verification status.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-12">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-500" /> Company Name
              </label>
              <input 
                required
                type="text" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                Industry
              </label>
              <input 
                required
                type="text" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" /> Website URL
              </label>
              <input 
                type="url" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-500" /> Contact Email
              </label>
              <input 
                required
                type="email" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
             <input 
               type="checkbox" 
               id="isVerified"
               checked={formData.isVerified}
               onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
               className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
             />
             <label htmlFor="isVerified" className="text-sm font-semibold text-zinc-700">
               Verified Partner Status
             </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              About the Company
            </label>
            <textarea 
              rows={5}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/employers" className="px-6 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 transition">Cancel</Link>
          <button 
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-8 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
