'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Atom, BookOpen, Cpu, BarChart3, Users } from 'lucide-react';
import { RoleSwitcher } from '@/components/ui/role-switcher';
import { Badge } from '@/components/ui/badge';
import { useRoleStore } from '@/lib/role-store';

export function AppHeader() {
  const pathname = usePathname();
  const { activeRole } = useRoleStore();

  const navItems = [
    { href: '/learn/bell-state', label: 'Learn (Bell State)', icon: BookOpen, activePrefix: '/learn' },
    { href: '/lab', label: 'Circuit Lab', icon: Cpu, activePrefix: '/lab' },
    { href: '/progress', label: 'My Progress', icon: BarChart3, activePrefix: '/progress', hideFor: 'INSTRUCTOR' },
    { href: '/instructor', label: 'Instructor Insight', icon: Users, activePrefix: '/instructor' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between p-3 gap-3">
        {/* Brand & Nav */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <Link href="/learn/bell-state" className="flex items-center gap-2.5 font-bold tracking-tight text-white hover:opacity-90">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600/30 border border-cyan-500/40 text-cyan-400">
              <Atom className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Q-TRACE
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Quantum Flight Recorder</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 border-l border-zinc-800 pl-4">
            {navItems.map((item) => {
              if (item.hideFor && activeRole.roleType === item.hideFor) return null;
              const isActive = pathname?.startsWith(item.activePrefix);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-cyan-300 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Role Switcher */}
        <div className="w-full md:w-auto">
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
}
