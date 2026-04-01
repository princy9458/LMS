'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  LayoutDashboard, 
  Briefcase, 
  Settings, 
  GraduationCap,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const SidebarNavigation = ({ role = 'student' }) => {
  const pathname = usePathname();

  const studentLinks = [
    { title: 'My Dashboard', href: '/lms/dashboard/student', icon: LayoutDashboard },
    { title: 'Explore Courses', href: '/lms/courses', icon: BookOpen },
    { title: 'My Learning', href: '/lms/dashboard/student#courses', icon: GraduationCap },
    { title: 'Job Board', href: '/lms/jobs', icon: Briefcase },
    { title: 'Settings', href: '/lms/settings', icon: Settings },
  ];

  const employerLinks = [
    { title: 'Employer Dashboard', href: '/lms/dashboard/employer', icon: LayoutDashboard },
    { title: 'Post a Job', href: '/lms/dashboard/employer#post', icon: Briefcase },
    { title: 'Manage Applicants', href: '/lms/dashboard/employer#applicants', icon: GraduationCap },
    { title: 'Company Settings', href: '/lms/settings', icon: Settings },
  ];

  const links = role === 'employer' ? employerLinks : studentLinks;

  return (
    <div className="w-64 border-r bg-background/50 backdrop-blur-md h-screen sticky top-0 flex flex-col p-4">
      <div className="flex items-center gap-2 px-4 mb-10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">L</div>
        <span className="text-xl font-extrabold tracking-tight">LMS One</span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div className={cn(
                "flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}>
                <div className="flex items-center gap-3">
                  <link.icon size={20} className={cn(isActive ? "text-primary-foreground" : "group-hover:text-primary")} />
                  <span className="text-sm font-semibold">{link.title}</span>
                </div>
                {!isActive && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-muted">
        <Button variant="ghost" className="w-full justify-start gap-3 px-4 py-6 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <LogOut size={20} />
          <span className="text-sm font-semibold">Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default SidebarNavigation;
