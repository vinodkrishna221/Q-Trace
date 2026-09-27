'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Atom,
  Target,
  User,
  Sparkles,
} from 'lucide-react';

export interface MobileBottomNavProps {
  className?: string;
  onOpenQuests?: () => void;
}

export function MobileBottomNav({ className = '', onOpenQuests }: MobileBottomNavProps) {
  const pathname = usePathname() || '/learn';

  const isLearnActive = pathname.startsWith('/learn');
  const isPracticeActive = pathname.startsWith('/lab');
  const isProfileActive = pathname.startsWith('/settings');

  return (
    <nav
      aria-label="Mobile Navigation"
      data-testid="mobile-bottom-nav"
      className={`fixed bottom-0 inset-x-0 z-40 lg:hidden h-14 sm:h-16 border-t border-border-default bg-surface/95 backdrop-blur-md px-3 flex items-center justify-around shadow-lg pb-safe select-none ${className}`}
    >
      {/* 1. Learn Tab */}
      <Link
        href="/learn"
        data-testid="tab-learn"
        aria-current={isLearnActive ? 'page' : undefined}
        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
          isLearnActive
            ? 'text-accent font-bold'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        <Compass className={`w-5 h-5 ${isLearnActive ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] font-mono leading-none tracking-tight">Learn</span>
      </Link>

      {/* 2. Practice Tab */}
      <Link
        href="/lab"
        data-testid="tab-practice"
        aria-current={isPracticeActive ? 'page' : undefined}
        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
          isPracticeActive
            ? 'text-accent font-bold'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        <Atom className={`w-5 h-5 ${isPracticeActive ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] font-mono leading-none tracking-tight">Practice</span>
      </Link>

      {/* 3. Quests Tab */}
      <button
        type="button"
        onClick={onOpenQuests}
        data-testid="tab-quests"
        className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
      >
        <Target className="w-5 h-5" />
        <span className="text-[10px] font-mono leading-none tracking-tight">Quests</span>
      </button>

      {/* 4. Profile Tab */}
      <Link
        href="/settings"
        data-testid="tab-profile"
        aria-current={isProfileActive ? 'page' : undefined}
        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
          isProfileActive
            ? 'text-accent font-bold'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        <User className={`w-5 h-5 ${isProfileActive ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] font-mono leading-none tracking-tight">Profile</span>
      </Link>
    </nav>
  );
}
