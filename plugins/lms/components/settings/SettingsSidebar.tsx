'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Settings, 
  BookOpen, 
  Mail, 
  CreditCard, 
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'learning', label: 'Learning Settings', icon: BookOpen },
  { id: 'email', label: 'Email Settings', icon: Mail },
  { id: 'payment', label: 'Payment Settings', icon: CreditCard },
  { id: 'advanced', label: 'Advanced Settings', icon: Cpu },
];

export function SettingsSidebar() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';

  return (
    <div className="w-56 flex-shrink-0 bg-white border-r border-zinc-200 h-full overflow-y-auto">
      <div className="py-4">
        <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-6">Settings</h2>
        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={`/admin/settings?tab=${item.id}`}
                className={cn(
                  "flex items-center gap-3 px-6 py-2.5 text-xs font-bold transition-all border-l-4",
                  isActive 
                    ? "bg-blue-50/50 text-blue-600 border-blue-600" 
                    : "text-zinc-500 border-transparent hover:bg-zinc-50 hover:text-zinc-900"
                )}
                scroll={false}
              >
                <item.icon className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  isActive ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-900"
                )} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-zinc-100 opacity-50">
        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">LMS Core v1.2.4</p>
      </div>
    </div>
  );
}
