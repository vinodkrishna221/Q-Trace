'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  requiredIndicator?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, requiredIndicator, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-xs font-medium text-text-secondary tracking-tight select-none flex items-center gap-1',
          className
        )}
        {...props}
      >
        {children}
        {requiredIndicator && <span className="text-danger font-bold">*</span>}
      </label>
    );
  }
);
Label.displayName = 'Label';
