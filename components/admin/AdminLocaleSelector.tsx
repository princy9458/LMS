'use client';

import React from 'react';
import { CONTENT_LANGUAGES } from '@/config/contentLanguages';
import { Languages } from 'lucide-react';
import { Select, SelectItem } from '@/components/ui/select';

type Props = {
  value: string;
  onChange: (value: string) => void;
  completion?: Record<string, 'complete' | 'partial' | 'missing' | boolean>;
  label?: string;
};

export default function AdminLocaleSelector({ value, onChange, label = 'Editing language' }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/90 shadow-sm p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Languages className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">{label}</p>
            <p className="text-sm text-zinc-600">Select a locale to edit its translation without reloading the page.</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:min-w-[18rem]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Language</span>
          <Select value={value} onValueChange={onChange} className="w-full sm:w-[18rem]">
            {CONTENT_LANGUAGES.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
