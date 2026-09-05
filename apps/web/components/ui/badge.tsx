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
    default: 'bg-accent/10 text-accent border border-accent/40',
    secondary: 'bg-raised text-ink-dim border border-line',
    outline: 'text-ink-dim border-line-bright border',
    success: 'bg-evidence/10 text-evidence border border-evidence/40',
    warning: 'bg-caution/10 text-caution border border-caution/40',
    destructive: 'bg-danger/10 text-danger border border-danger/40',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-accent',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
