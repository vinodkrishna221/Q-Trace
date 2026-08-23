import * as React from 'react';
import { AppHeader } from './app-header';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6 max-w-7xl">
        {children}
      </main>
      <footer className="border-t border-zinc-850 py-3 px-4 text-center text-xs text-zinc-400 bg-zinc-950/60">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Q-Trace · SIH AI-Assisted Quantum Learning Platform</span>
          <span className="font-mono text-[11px] text-zinc-400">
            Mathematical representation, not physical trajectory. Seeded offline mode enabled.
          </span>
        </div>
      </footer>
    </div>
  );
}
