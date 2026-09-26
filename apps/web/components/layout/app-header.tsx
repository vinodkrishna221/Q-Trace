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
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/learn/bell-state', label: 'Learn', icon: BookOpen, activePrefix: '/learn' },
    { href: '/lab', label: 'Circuit Lab', icon: Cpu, activePrefix: '/lab' },
    { href: '/progress', label: 'Progress', icon: BarChart3, activePrefix: '/progress', hideFor: 'INSTRUCTOR' },
    { href: '/instructor', label: 'Instructor', icon: Users, activePrefix: '/instructor' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full flex justify-center pt-2 pb-2 pointer-events-none">
      <div 
        className={`pointer-events-auto flex items-center justify-between transition-all duration-300 ease-in-out ${
          isScrolled 
            ? 'w-[95%] max-w-4xl h-12 px-6 rounded-full border border-border-medium bg-surface/80 shadow-md backdrop-blur-md' 
            : 'w-full max-w-7xl h-14 px-4 border-b-transparent bg-surface-canvas/90 backdrop-blur-md'
        }`}
      >
        <div className="flex-1 flex justify-start">
          {/* Brand mark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border-medium bg-surface text-accent shadow-xs group-hover:border-accent transition-colors">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="8" strokeOpacity="0.4" />
                <path d="M4 12h3.5l2-4 3 8 2-4h5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="text-sm font-semibold tracking-wider text-text-primary group-hover:text-accent transition-colors">
                Q-TRACE
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links - Centered */}
        <div className="shrink-0">
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
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-text-primary bg-surface-raised/80 font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls: Role Switcher */}
        <div className="flex-1 flex items-center justify-end">
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
}
