'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Cpu, BarChart3, Users } from 'lucide-react';
import { RoleSwitcher } from '@/components/ui/role-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface-canvas/90 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl flex items-center justify-between px-4 h-14 gap-4">
        <div className="flex items-center gap-6">
          {/* Brand mark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border-medium bg-surface text-accent shadow-xs group-hover:border-accent transition-colors">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="8" strokeOpacity="0.4" />
                <path d="M4 12h3.5l2-4 3 8 2-4h5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="text-sm font-semibold tracking-wider text-text-primary group-hover:text-accent transition-colors">
                Q-TRACE
              </span>
              <span className="text-[10px] font-mono text-text-tertiary hidden sm:inline">
                FLIGHT RECORDER
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              if (item.hideFor && activeRole.roleType === item.hideFor) return null;
              const isActive = pathname?.startsWith(item.activePrefix);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-text-primary bg-surface-raised/70'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/40'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls: Role Switcher & Theme Toggle */}
        <div className="flex items-center gap-2">
          <RoleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
