'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Filter, TrendingUp, Users, GraduationCap, Briefcase, DollarSign, Sparkles } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

const enrollmentData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 200 },
  { name: 'Apr', value: 278 },
  { name: 'May', value: 189 },
  { name: 'Jun', value: 239 },
];

const categoryData = [
  { name: 'Next.js', value: 45 },
  { name: 'UI/UX', value: 25 },
  { name: 'DevOps', value: 15 },
  { name: 'Marketing', value: 15 },
];

const revenueData = [
  { name: '01', rev: 4000 },
  { name: '05', rev: 3000 },
  { name: '10', rev: 5000 },
  { name: '15', rev: 4500 },
  { name: '20', rev: 6000 },
  { name: '25', rev: 5500 },
  { name: '30', rev: 8000 },
];

export default function AdminLmsDashboard() {
  return (
    <div className="p-8 space-y-10 bg-muted/10 min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
            LMS Analytics <Badge className="bg-primary/10 text-primary border-none text-xs font-bold">PRO PLATEFORM</Badge>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Advanced metrics for the learning ecosystem.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl border-muted gap-2 font-bold px-4">
             <Filter size={16} /> Filter Date
           </Button>
           <Button className="rounded-xl gap-2 font-bold px-6 shadow-xl shadow-primary/20">
             <Download size={16} /> Export Report
           </Button>
        </div>
      </header>

      {/* High Level Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value="8.4K" icon={Users} trend="+12.5%" />
        <StatCard title="Active Courses" value="42" icon={GraduationCap} trend="+3.2%" />
        <StatCard title="Job Placements" value="156" icon={Briefcase} trend="+18.7%" />
        <StatCard title="Revenue (MTD)" value="$12.8K" icon={DollarSign} trend="+24.1%" />
      </div>

      <div className="grid lg:grid-cols-7 gap-6">
        {/* Main Enrollment Chart */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Enrollment Velocity</CardTitle>
              <CardDescription>New students per month across categories.</CardDescription>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 />
                <Area type="monotone" dataKey="rev" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="lg:col-span-3 border-none shadow-sm bg-background">
          <CardHeader>
             <CardTitle className="text-xl font-bold">Category Distribution</CardTitle>
             <CardDescription>Top performing learning tracks.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-0 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 flex-wrap justify-center mt-4">
               {categoryData.map((c, i) => (
                 <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{c.name}</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recruitment Pipeline */}
      <Card className="border-none shadow-sm bg-background">
         <CardHeader>
            <CardTitle className="text-xl font-bold">Placement Pipeline</CardTitle>
            <CardDescription>Job applications vs Hires over time.</CardDescription>
         </CardHeader>
         <CardContent className="h-64 pt-6">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
               </BarChart>
            </ResponsiveContainer>
         </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
         <Card className="border-none shadow-sm bg-background">
            <CardHeader>
               <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={18} /> Course Completion Velocity
               </CardTitle>
            </CardHeader>
            <CardContent className="h-64 pt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="name" hide />
                     <Tooltip />
                     <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 4 }} />
                  </LineChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-background">
            <CardHeader>
               <CardTitle className="text-lg font-bold">Student Success Logic</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/5 border">
                     <span className="text-sm font-bold">Certification Rate</span>
                     <span className="text-lg font-black text-primary">78%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/5 border">
                     <span className="text-sm font-bold">Avg. Jobs/Student</span>
                     <span className="text-lg font-black text-amber-500">3.2</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/5 border">
                     <span className="text-sm font-bold">Hire Confidence</span>
                     <span className="text-lg font-black text-green-500 text-sm">92%</span>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group hover:ring-2 hover:ring-primary/20 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-muted/40 rounded-2xl group-hover:bg-primary/10 transition-colors">
            <Icon size={20} className="text-primary" />
          </div>
          <Badge variant="outline" className="text-green-500 bg-green-500/5 border-green-500/20 font-bold border-none">
            {trend}
          </Badge>
        </div>
        <div className="mt-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</h4>
          <p className="text-3xl font-black mt-1 leading-none">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
