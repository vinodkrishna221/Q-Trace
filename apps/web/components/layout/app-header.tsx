'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Cpu, BarChart3, Users, User, LogOut, ArrowRight } from 'lucide-react';
import { useRoleStore } from '@/lib/role-store';
import { useAuthStore } from '@/lib/auth-store';
import { Badge } from '@/components/ui/badge';

import { QTraceLogo } from '@/components/ui/q-trace-logo';

export function AppHeader() {
  const pathname = usePathname();
  const { activeRole } = useRoleStore();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const checkSession = useAuthStore((state) => state.checkSession);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  React.useEffect(() => {
    checkSession();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [checkSession]);

  const navItems = [
    { href: '/learn', label: 'Learn', icon: BookOpen, activePrefix: '/learn' },
    { href: '/lab', label: 'Circuit Lab', icon: Cpu, activePrefix: '/lab' },
    { href: '/progress', label: 'Progress', icon: BarChart3, activePrefix: '/progress', hideFor: 'INSTRUCTOR' },
  ];

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full flex justify-center pt-2 pb-2 pointer-events-none">
      <div 
        className={`pointer-events-auto flex items-center justify-between transition-all duration-300 ease-in-out ${
          isScrolled 
            ? 'w-[95%] max-w-5xl h-12 px-5 rounded-full border border-border-medium bg-surface/80 shadow-md backdrop-blur-md' 
            : 'w-full max-w-7xl h-14 px-4 border-b-transparent bg-surface-canvas/90 backdrop-blur-md'
        }`}
      >
        <div className="flex-1 flex justify-start">
          {/* Brand mark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <QTraceLogo variant="full" size="sm" showSubtext={false} />
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

        {/* Right side controls: Auth */}
        <div className="flex-1 flex items-center justify-end gap-2.5">

          {user ? (
            /* Authenticated User Menu */
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border border-border-default bg-surface hover:bg-surface-raised transition-colors cursor-pointer text-xs shadow-2xs"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent text-[10px] font-bold">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-text-primary max-w-[100px] truncate">
                  {user.displayName.split(' ')[0]}
                </span>
                <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 uppercase text-accent border-accent/30">
                  {user.personaTag}
                </Badge>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border-medium bg-surface p-2 shadow-lg backdrop-blur-md z-50 text-xs">
                  <div className="px-2 py-1.5 border-b border-border-subtle mb-1">
                    <p className="font-semibold text-text-primary truncate">{user.displayName}</p>
                    <p className="text-[11px] text-text-muted truncate font-mono">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Login / Sign Up CTA */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-text-primary text-surface hover:opacity-90 transition-opacity shadow-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
