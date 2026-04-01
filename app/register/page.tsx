'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/modules/lms/store/store';
import { loginSuccess, loginFailure } from '@/modules/lms/store/slices/authSlice';
import { Loader2, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Update Redux state
      dispatch(loginSuccess(data.user));
      
      // Redirect based on role
      if (data.user.role === 'student') router.push('/dashboard');
      else router.push('/admin');

    } catch (err: any) {
      setError(err.message);
      dispatch(loginFailure(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-3xl shadow-sm border">
        
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
             <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join LMS One to start learning and earning.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-start gap-3 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <input name="name" type="text" required value={formData.name} onChange={handleChange} className="appearance-none relative block w-full px-3 py-3 border border-input bg-background rounded-xl focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="e.g., Jane Doe" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email address</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className="appearance-none relative block w-full px-3 py-3 border border-input bg-background rounded-xl focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="you@example.com" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input name="password" type="password" required minLength={6} value={formData.password} onChange={handleChange} className="appearance-none relative block w-full px-3 py-3 border border-input bg-background rounded-xl focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="••••••••" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">I am a...</label>
              <select name="role" value={formData.role} onChange={handleChange} className="appearance-none relative block w-full px-3 py-3 border border-input bg-background rounded-xl focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm cursor-pointer">
                <option value="student">Student (Learn & Find Jobs)</option>
                <option value="instructor">Instructor (Create Courses)</option>
                <option value="employer">Employer (Post Jobs)</option>
              </select>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
           Already have an account?{' '}
           <Link href="/login" className="font-bold text-primary hover:underline">Log in</Link>
        </p>

      </div>
    </div>
  );
}
