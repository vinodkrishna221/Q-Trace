import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    // Master Pill Geometry (rounded-full)
    const baseStyles =
      'inline-flex items-center justify-center rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variants = {
      default:
        'bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-sm border border-accent/20',
      outline:
        'border border-border-subtle bg-surface text-text-primary hover:bg-surface-raised hover:border-border-medium active:bg-surface-active shadow-xs',
      secondary:
        'bg-surface-raised text-text-primary hover:bg-surface-active border border-border-subtle active:scale-[0.98]',
      ghost:
        'text-text-secondary hover:text-text-primary hover:bg-surface-raised active:bg-surface-active',
      destructive:
        'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30 active:scale-[0.98]',
    };

    // Adjusted horizontal padding ensures pill geometry remains balanced without visual distortion
    const sizes = {
      default: 'h-8 px-4 py-1.5 text-xs',
      sm: 'h-7 rounded-full px-3 text-[11px]',
      lg: 'h-10 rounded-full px-6 text-sm font-semibold',
      icon: 'h-8 w-8 p-0 rounded-full',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
