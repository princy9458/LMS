'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlaySquare, 
  Layers,
  HelpCircle, 
  FileQuestion,
  Award,
  Users,
  UserCircle,
  BarChart3,
  TrendingUp,
  Settings,
  Puzzle,
  Terminal
} from 'lucide-react';
import { getLocaleFromPathname, getLocalePath, translateCommon } from '@/lib/i18n';

const MENU_GROUPS = [
  {
    title: 'adminSidebarOverview',
    items: [
      { name: 'adminSidebarDashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'adminSidebarLms',
    items: [
      { name: 'adminSidebarCourses', href: '/admin/courses', icon: BookOpen },
      { name: 'adminSidebarLessons', href: '/admin/lessons', icon: PlaySquare },
      { name: 'adminSidebarTopics', href: '/admin/topics', icon: Layers },
      { name: 'adminSidebarQuizzes', href: '/admin/quizzes', icon: HelpCircle },
      { name: 'adminSidebarQuestions', href: '/admin/questions', icon: FileQuestion },
      { name: 'adminSidebarCertificates', href: '/admin/certificates', icon: Award },
    ]
  },
  {
    title: 'adminSidebarUsers',
    items: [
      { name: 'adminSidebarStudents', href: '/admin/students', icon: Users },
      { name: 'adminSidebarInstructors', href: '/admin/instructors', icon: UserCircle },
    ]
  },
  {
    title: 'adminSidebarReports',
    items: [
      { name: 'adminSidebarAnalytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'adminSidebarProgress', href: '/admin/progress', icon: TrendingUp },
    ]
  },
  {
    title: 'adminSidebarSystem',
    items: [
      { name: 'adminSidebarPlugins', href: '/admin/plugins', icon: Puzzle },
      { name: 'adminSidebarSettings', href: '/admin/settings', icon: Settings },
    ]
  },
  {
    title: 'adminSidebarDeveloper',
    items: [
      { name: 'adminSidebarDbViewer', href: '/admin/debug/db', icon: Terminal },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const t = (key: string) => translateCommon(locale, key);

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 text-zinc-300 hidden md:flex flex-col h-screen sticky top-0 overflow-hidden">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800 flex-shrink-0">
        <span className="text-white font-bold text-xl tracking-tight">LMS Admin<span className="text-indigo-500">.</span></span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] mb-2">{t(group.title)}</p>
            {group.items.map((item) => {
              const localizedHref = getLocalePath(locale, item.href);
              const isActive = pathname.startsWith(localizedHref) || pathname.startsWith(item.href);
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.href} 
                  href={localizedHref}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-400' 
                      : 'hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                  <span className="font-medium text-sm">{t(item.name)}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
