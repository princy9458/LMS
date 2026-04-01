'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/modules/lms/store/store';
import { loginSuccess, loginFailure } from '@/modules/lms/store/slices/authSlice';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

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
             <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to access your dashboard.
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
              <label className="block text-sm font-medium text-foreground mb-1">Email address</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className="appearance-none relative block w-full px-3 py-3 border border-input bg-background rounded-xl focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="you@example.com" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input name="password" type="password" required value={formData.password} onChange={handleChange} className="appearance-none relative block w-full px-3 py-3 border border-input bg-background rounded-xl focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
           Don't have an account?{' '}
           <Link href="/register" className="font-bold text-primary hover:underline">Sign up</Link>
        </p>

      </div>
    </div>
  );
}
