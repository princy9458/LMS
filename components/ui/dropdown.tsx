import * as React from 'react';
import { cn } from '@/lib/utils';

const DropdownMenu = ({ className, ...props }: React.HTMLAttributes<HTMLDetailsElement>) => (
  <details className={cn('relative', className)} {...props} />
);

const DropdownMenuTrigger = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <summary className={cn('list-none cursor-pointer', className)} {...props} />
);

const DropdownMenuContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'absolute right-0 z-50 mt-2 min-w-[10rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
      className
    )}
    {...props}
  />
);

const DropdownMenuItem = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={cn(
      'flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
      className
    )}
    {...props}
  />
);

const DropdownMenuSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
};
