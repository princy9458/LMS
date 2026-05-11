import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  onValueChange?: (value: string) => void;
};

export function Select({ className, onValueChange, children, onChange, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-11 w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 pr-10 text-sm font-medium text-zinc-900 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60',
          className
        )}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}

export function SelectItem({
  value,
  children,
  disabled,
}: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
}
