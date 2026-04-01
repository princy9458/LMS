'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Award, 
  Briefcase, 
  GraduationCap, 
  Layers, 
  TrendingUp, 
  ChevronRight,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { JobCard } from '@/modules/lms/components/opportunities/JobCard';
import { InternshipCard } from '@/modules/lms/components/opportunities/InternshipCard';
import { getLocaleFromPathname, getLocalePath, translateCommon } from '@/lib/i18n';

interface Skill {
  name: string;
  level: string;
  earnedAt: string;
}

interface Profile {
  skills: Skill[];
  totalCoursesCompleted: number;
}

export default function DashboardPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const t = (key: string) => translateCommon(locale, key);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<{ jobs: any[], internships: any[] }>({ jobs: [], internships: [] });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const userId = "temp-user-id"; // Mock user

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [profileRes, matchesRes] = await Promise.all([
          fetch(`/api/lms/profile?userId=${userId}`),
          fetch(`/api/lms/matching?userId=${userId}`)
        ]);

        const profileData = await profileRes.json();
        const matchesData = await matchesRes.json();

        if (profileData.success) setProfile(profileData.data);
        if (matchesData.success) setMatches(matchesData.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  const handleSyncProfile = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/lms/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        // Refresh matches after sync
        const matchRes = await fetch(`/api/lms/matching?userId=${userId}`);
        const matchData = await matchRes.json();
        if (matchData.success) setMatches(matchData.data);
      }
    } catch (err) {
      console.error('Error syncing profile:', err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 bg-primary/10 rounded-full mb-8" />
        <div className="h-8 bg-muted rounded-xl w-48 mb-4" />
        <div className="h-4 bg-muted rounded-xl w-64" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-slate-900 border-b pt-24 pb-12 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-2">
                 <Zap size={16} />
                 <span>{t('dashboardStudentHub')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                {t('dashboardWelcomeStudent')}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {t('dashboardIntro')}
              </p>
            </div>
            <button 
              onClick={handleSyncProfile}
              disabled={syncing}
              className="px-8 py-4 bg-slate-900 border border-slate-700 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <Sparkles size={18} className={syncing ? 'animate-spin' : ''} />
              {syncing ? t('syncingSkills') : t('syncSkillProfile')}
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-12">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: t('dashboardCompleted'), value: profile?.totalCoursesCompleted || 0, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: t('dashboardSkillsMastered'), value: profile?.skills?.length || 0, icon: Award, color: 'text-primary' },
            { label: t('dashboardJobMatches'), value: matches.jobs.length, icon: Briefcase, color: 'text-orange-500' },
            { label: t('dashboardNextMilestone'), value: '75%', icon: TrendingUp, color: 'text-blue-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                    <stat.icon size={24} />
                 </div>
                 <ArrowUpRight size={18} className="text-muted-foreground opacity-30" />
              </div>
              <h3 className="text-muted-foreground font-bold text-xs uppercase tracking-widest leading-none mb-1">
                 {stat.label}
              </h3>
              <p className="text-3xl font-black tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Matches Area */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Job Matches Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-extrabold flex items-center gap-3">
                    <Briefcase className="text-primary" />
                    {t('dashboardMatchedJobs')}
                 </h2>
                 <Link href={getLocalePath(locale, '/jobs')} className="text-primary font-bold hover:underline flex items-center gap-1">
                    {t('viewAll')} <ChevronRight size={16} />
                 </Link>
              </div>

              {matches.jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches.jobs.map((job: any) => (
                    <JobCard 
                      key={job._id} 
                      _id={job._id}
                      title={job.title}
                      companyName={job.company}
                      location={job.location}
                      salaryRange={job.salaryRange}
                      requiredSkills={job.requiredSkills}
                      matchedSkills={job.matchedSkills}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 border-2 border-dashed rounded-3xl text-center bg-white dark:bg-slate-900/50">
                   <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                   <h3 className="text-xl font-bold mb-2">{t('dashboardNoJobMatches')}</h3>
                   <p className="text-muted-foreground mb-6">{t('dashboardNoJobMatchesDescription')}</p>
                   <Link href={getLocalePath(locale, '/courses')} className="px-6 py-3 bg-primary text-white font-bold rounded-xl inline-block transition-all hover:bg-primary/90">
                      {t('exploreCourses')}
                   </Link>
                </div>
              )}
            </section>

             {/* Internship Matches Section */}
             <section>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-extrabold flex items-center gap-3">
                    <GraduationCap className="text-primary" />
                    {t('dashboardInternshipOpportunities')}
                 </h2>
                 <Link href={getLocalePath(locale, '/internships')} className="text-primary font-bold hover:underline flex items-center gap-1">
                    {t('viewAll')} <ChevronRight size={16} />
                 </Link>
              </div>

              {matches.internships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches.internships.map((intern: any) => (
                    <InternshipCard 
                      key={intern._id} 
                      _id={intern._id}
                      title={intern.title}
                      companyName={intern.company}
                      duration={intern.duration}
                      stipend={intern.stipend}
                      requiredSkills={intern.requiredSkills}
                      matchedSkills={intern.matchedSkills}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 border-2 border-dashed rounded-3xl text-center">
                   <p className="text-muted-foreground">{t('dashboardKeepLearning')}</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Skills Cloud */}
          <div className="space-y-8">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-xl shadow-primary/5">
                <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                   <Layers className="text-primary" />
                   {t('dashboardMySkills')}
                </h3>
                
                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Award size={32} className="mx-auto text-muted-foreground/20 mb-2" />
                    <p className="text-sm text-muted-foreground">{t('dashboardNoBadges')}</p>
                  </div>
                )}
                
                <div className="mt-8 pt-6 border-t font-medium text-sm space-y-3">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={16} />
                      <span>{t('dashboardLastUpdated')}: {profile?.skills?.[0] ? new Date(profile.skills[0].earnedAt).toLocaleDateString() : t('dashboardNever')}</span>
                   </div>
                </div>

                <div className="mt-8 bg-primary/5 p-6 rounded-2xl">
                   <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                      <Zap size={14} /> {t('dashboardCareerTip')}
                   </h4>
                   <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('dashboardCareerTipBody')}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
