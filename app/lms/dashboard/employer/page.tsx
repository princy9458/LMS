'use client';

import React from 'react';
import SidebarNavigation from '@/plugins/lms/components/SidebarNavigation';
import JobCard from '@/plugins/lms/components/JobCard';
import StatCard from '@/plugins/lms/components/DashboardStats';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, CheckCircle, Clock, Plus, Filter, MoreHorizontal, ArrowUpRight, Sparkles } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown';

export default function EmployerDashboard() {
  const stats = [
    { title: 'Open Jobs', value: '4', icon: Briefcase, description: 'Active postings' },
    { title: 'Total Applicants', value: '128', icon: Users, description: 'Across all jobs' },
    { title: 'Interviewing', value: '12', icon: CheckCircle, description: 'In-progress' },
    { title: 'Avg. Time to Hire', value: '18d', icon: Clock, description: 'Efficiency' },
  ];

  const recentApplicants = [
    { id: 1, name: 'Alex Dev', course: 'Next.js Mastery', status: 'Reviewed', score: '95%', applied: '2h ago' },
    { id: 2, name: 'Sarah Chen', course: 'UI/UX Design', status: 'Pending', score: '88%', applied: '5h ago' },
    { id: 3, name: 'Mike Ross', course: 'FullStack Integration', status: 'Interviewing', score: '92%', applied: '1d ago' },
    { id: 4, name: 'Janice Wu', course: 'Next.js Mastery', status: 'Rejected', score: '72%', applied: '2d ago' },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      <SidebarNavigation role="employer" />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-10">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Recruitment Hub</h1>
              <p className="text-muted-foreground mt-1">Manage your active postings and candidate pipeline.</p>
            </div>
            <Button className="rounded-full gap-2 px-6 h-12 font-bold shadow-lg shadow-primary/20">
              <Plus size={18} /> Post New Job
            </Button>
          </header>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             {stats.map((s, i) => (
                <Card key={i} className="border-none shadow-sm bg-background">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between pb-2">
                       <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{s.title}</p>
                       <s.icon size={16} className="text-primary" />
                    </div>
                    <div className="pt-2">
                      <h3 className="text-3xl font-black">{s.value}</h3>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1">{s.description}</p>
                    </div>
                  </CardContent>
                </Card>
             ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Applicant Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="text-primary" size={20} /> Recent Applicants
                </h2>
                <Button variant="outline" size="sm" className="rounded-full gap-2 h-8 text-xs font-bold border-muted">
                  <Filter size={14} /> Refine List
                </Button>
              </div>
              
              <Card className="border-none shadow-sm bg-background overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-muted hover:bg-transparent">
                      <TableHead className="font-bold text-xs">CANDIDATE</TableHead>
                      <TableHead className="font-bold text-xs text-center">LMS SCORE</TableHead>
                      <TableHead className="font-bold text-xs">STATUS</TableHead>
                      <TableHead className="font-bold text-xs text-right">ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentApplicants.map((app) => (
                      <TableRow key={app.id} className="border-muted hover:bg-muted/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                              <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{app.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                               <p className="text-sm font-bold leading-none">{app.name}</p>
                               <p className="text-[10px] text-muted-foreground mt-1">Course: {app.course}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-black text-primary text-sm">{app.score}</TableCell>
                        <TableCell>
                           <Badge variant="secondary" className={cn(
                             "text-[9px] font-bold uppercase px-1.5 h-5 border-none",
                             app.status === 'Reviewed' ? "bg-blue-100 text-blue-700" : 
                             app.status === 'Interviewing' ? "bg-amber-100 text-amber-700" :
                             app.status === 'Rejected' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                           )}>
                             {app.status}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <ArrowUpRight size={16} className="text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Job Management Sidebar */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Active Listings</h2>
              <div className="space-y-4">
                <JobListingItem title="Frontend Engineer (React)" applicants={45} status="Active" />
                <JobListingItem title="UI/UX Product Designer" applicants={12} status="Draft" />
                <JobListingItem title="Backend Intern" applicants={71} status="Active" />
              </div>
              <Button variant="outline" className="w-full rounded-xl border-dashed py-6 border-muted font-bold text-muted-foreground hover:text-primary hover:border-primary">
                View All Postings
              </Button>

              <AIRankedCandidates candidates={[
                { name: 'Alex Dev', skills: ['Next.js', 'React'], matchScore: 98 },
                { name: 'Mike Ross', skills: ['System Design', 'Node.js'], matchScore: 92 },
                { name: 'Sarah Chen', skills: ['UI/UX', 'Tailwind'], matchScore: 89 }
              ]} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function JobListingItem({ title, applicants, status }: { title: string, applicants: number, status: string }) {
  return (
    <div className="group p-4 rounded-2xl bg-background shadow-sm border border-muted/20 hover:border-primary/30 transition-all cursor-pointer">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{title}</h4>
        <Badge className={cn(
          "text-[8px] h-4 px-1 border-none",
          status === 'Active' ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
        )}>{status}</Badge>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <div className="flex -space-x-2">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="w-5 h-5 rounded-full border border-background bg-muted text-[8px] flex items-center justify-center font-bold">C</div>
           ))}
        </div>
        <span className="text-[10px] font-bold text-muted-foreground">{applicants} candidates</span>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export function AIRankedCandidates({ candidates }: { candidates: any[] }) {
  return (
    <Card className="border-none shadow-sm bg-background mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
           <Sparkles className="text-amber-500" size={16} /> AI Top Talent Matches
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {candidates?.map((can, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-muted/10 bg-muted/5 group hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px]">
                  {can.name.charAt(0)}
                </div>
                <div>
                  <h5 className="text-[11px] font-bold">{can.name}</h5>
                  <div className="flex gap-1 mt-0.5">
                    {can.skills.slice(0, 2).map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-[7px] h-3 font-black px-1">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-primary">{can.matchScore}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
