import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
  pip?: 'success' | 'muted' | 'amber';
}

export function Badge({
  className,
  variant = 'default',
  pip,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-accent-muted text-accent border border-accent/25',
    secondary: 'bg-surface-raised text-text-secondary border border-border-subtle',
    outline: 'text-text-secondary border border-border-medium bg-transparent',
    success: 'bg-success/10 text-success border border-success/25',
    warning: 'bg-caution/10 text-caution border border-caution/25',
    destructive: 'bg-danger/10 text-danger border border-danger/25',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full h-[22px] px-2.5 text-[11px] font-medium font-mono tracking-tight transition-colors focus:outline-none focus:ring-1 focus:ring-accent',
        variants[variant],
        className
      )}
      {...props}
    >
      {pip && (
        <span
          className={cn(
            "w-[6px] h-[6px] rounded-full mr-1.5 shrink-0",
            pip === 'success' && "bg-evidence animate-pulse",
            pip === 'muted' && "bg-text-muted",
            pip === 'amber' && "bg-[#f59e0b]"
          )}
          aria-hidden="true"
        />
      )}
      {props.children}
    </div>
  );
}
