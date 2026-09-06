'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Cpu, BarChart3, Users } from 'lucide-react';
import { RoleSwitcher } from '@/components/ui/role-switcher';
import { useRoleStore } from '@/lib/role-store';

export function AppHeader() {
  const pathname = usePathname();
  const { activeRole } = useRoleStore();

  const navItems = [
    { href: '/learn/bell-state', label: 'Learn', icon: BookOpen, activePrefix: '/learn' },
    { href: '/lab', label: 'Circuit Lab', icon: Cpu, activePrefix: '/lab' },
    { href: '/progress', label: 'Progress', icon: BarChart3, activePrefix: '/progress', hideFor: 'INSTRUCTOR' },
    { href: '/instructor', label: 'Instructor', icon: Users, activePrefix: '/instructor' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-abyss/85 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-start">
          {/* Brand mark: flight-recorder trace motif */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-accent/50 bg-accent/10 shadow-glow">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <circle cx="12" cy="12" r="8.5" strokeOpacity="0.5" />
                <path d="M3.5 12h4l2-4.5 3 9 2-4.5h6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-display font-bold tracking-widest text-ink group-hover:text-accent transition-colors">
                Q-TRACE
              </span>
              <span className="text-[10px] font-mono text-ink-faint tracking-wider">
                QUANTUM FLIGHT RECORDER
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.hideFor && activeRole.roleType === item.hideFor) return null;
              const isActive = pathname?.startsWith(item.activePrefix);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-accent'
                      : 'text-ink-dim hover:text-ink hover:bg-raised'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-[13px] h-px bg-accent shadow-glow" aria-hidden />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="w-full md:w-auto">
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
}
