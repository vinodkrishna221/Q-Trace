import * as React from 'react';
import Link from 'next/link';
import { QTraceLogo } from '@/components/ui/q-trace-logo';

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
          <QTraceLogo variant="full" size="sm" showSubtext={false} />
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
