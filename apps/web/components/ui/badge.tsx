import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-cyan-900/60 text-cyan-200 border border-cyan-700/50',
    secondary: 'border-transparent bg-zinc-800 text-zinc-300 border border-zinc-700',
    outline: 'text-zinc-300 border-zinc-700 border',
    success: 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50',
    warning: 'bg-amber-950/60 text-amber-300 border border-amber-700/50',
    destructive: 'bg-rose-950/60 text-rose-300 border border-rose-700/50',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
