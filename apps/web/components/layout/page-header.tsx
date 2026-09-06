import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  /** Small mono badges above the title (level, module id, cohort…). */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  /** One sentence: what should the judge understand from this screen? */
  purpose?: string;
  /** Right-side slot: primary action, stat, or context card. */
  actions?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

/**
 * The one page header. Every routed screen uses it (design-system §4) —
 * no hand-rolled border-b headers in page files.
 */
export function PageHeader({
  eyebrow,
  title,
  purpose,
  actions,
  className,
  'data-testid': testId,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line pb-6',
        className
      )}
      data-testid={testId}
    >
      <div className="space-y-2 max-w-2xl">
        {eyebrow && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-ink-faint">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl font-display font-bold tracking-tight text-ink">
          {title}
        </h1>
        {purpose && <p className="text-sm text-ink-dim leading-relaxed">{purpose}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
