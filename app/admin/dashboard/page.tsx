'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Briefcase, 
  Building2, 
  TrendingUp, 
  ArrowUpRight, 
  Loader2 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Students', value: data?.totalStudents || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Courses', value: data?.totalCourses || 0, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'Jobs Posted', value: data?.totalJobs || 0, icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Internships', value: data?.totalInternships || 0, icon: Building2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Overview</h1>
        <p className="text-zinc-500 text-sm mt-1">Monitor the pulse of your Learn and Earn ecosystem.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                +12% <ArrowUpRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            <div>
              <p className="text-zinc-500 text-sm font-medium">{stat.title}</p>
              <h3 className="text-3xl font-bold text-zinc-900 mt-1">{stat.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}

        {/* Course Completion Rate (Mock Metric for SaaS feel) */}
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl border border-indigo-400 shadow-sm flex flex-col justify-between text-white lg:col-span-1 lg:row-span-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-white/20 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-indigo-100 text-sm font-medium">Avg Completion Rate</p>
            <h3 className="text-3xl font-bold mt-1">68.4%</h3>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-4">
              <div className="bg-white h-1.5 rounded-full" style={{ width: '68.4%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-900 mb-6">Student Growth (Monthly)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlySignups || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a'}} />
                <Tooltip 
                  cursor={{fill: '#f4f4f5'}}
                  contentStyle={{borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 mb-6">Recent Students</h2>
          <div className="space-y-5">
            {data?.recentEnrollments && data.recentEnrollments.length > 0 ? (
              data.recentEnrollments.map((user: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-zinc-400 hidden xl:block">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 text-center py-4">No recent students found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
