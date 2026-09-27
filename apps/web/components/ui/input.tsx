'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-lg border bg-surface px-3 py-1 text-sm text-text-primary shadow-xs transition-colors',
          'border-border-default placeholder:text-text-muted',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus focus-visible:border-border-focus',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger focus-visible:ring-danger focus-visible:border-danger',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
