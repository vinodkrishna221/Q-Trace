import * as React from 'react';
import { AppHeader } from './app-header';
import { SoftVerificationBanner } from '@/features/auth/soft-verification-banner';

import { QTraceLogo } from '@/components/ui/q-trace-logo';
import { CursorToggle } from '@/components/ui/cursor-toggle';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <SoftVerificationBanner />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 max-w-7xl w-full">
        {children}
      </main>
      <footer className="border-t border-line py-4 px-4 bg-panel/40">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-faint">
          <div className="flex items-center gap-2">
            <QTraceLogo variant="mark-only" size={18} />
            <span className="font-display font-medium tracking-wide text-ink-dim">
              Q-Trace · AI-Assisted Quantum Learning Platform
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] hidden md:inline">
              Mathematical representation, not physical trajectory. Seeded offline mode enabled.
            </span>
            <CursorToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
