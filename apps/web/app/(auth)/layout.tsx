import * as React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-canvas text-text-primary selection:bg-accent/20">
      {/* Top Brand Bar */}
      <header className="w-full flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border-medium bg-surface text-accent shadow-xs group-hover:border-accent transition-colors">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="8" strokeOpacity="0.4" />
              <path d="M4 12h3.5l2-4 3 8 2-4h5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wider text-text-primary group-hover:text-accent transition-colors">
            Q-TRACE
          </span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Mandatory Scientific Disclaimer (docs/DESIGN-SYSTEM.md Section 7) */}
      <footer className="w-full py-4 text-center text-xs text-text-muted border-t border-border-subtle">
        <p>Mathematical representation, not physical trajectory. · Linear Precision Quantum Instrument</p>
      </footer>
    </div>
  );
}
