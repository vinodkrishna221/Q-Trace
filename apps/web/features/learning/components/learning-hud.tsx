'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Flame,
  Zap,
  Shield,
  ShieldAlert,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useGamificationStore } from '@/lib/gamification-store';
import { useAuthStore } from '@/lib/auth-store';
import { QTraceLogo } from '@/components/ui/q-trace-logo';

export interface LearningHUDProps {
  className?: string;
}

export function LearningHUD({ className = '' }: LearningHUDProps) {
  const { coherenceJoules, coherenceShield, streakDays } = useGamificationStore();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [showFreezeTooltip, setShowFreezeTooltip] = React.useState(false);

  // Animation / flash state tracking
  const [isXpFlashing, setIsXpFlashing] = React.useState(false);
  const [isShieldFlashing, setIsShieldFlashing] = React.useState(false);

  const prevJoulesRef = React.useRef(coherenceJoules);
  const prevShieldRef = React.useRef(coherenceShield);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Detect XP gains and trigger visual pulse
  React.useEffect(() => {
    if (coherenceJoules > prevJoulesRef.current) {
      setIsXpFlashing(true);
      const timer = setTimeout(() => setIsXpFlashing(false), 1200);
      prevJoulesRef.current = coherenceJoules;
      return () => clearTimeout(timer);
    }
    prevJoulesRef.current = coherenceJoules;
  }, [coherenceJoules]);

  // Detect decoherence hits (shield drops) and trigger amber flash
  React.useEffect(() => {
    if (coherenceShield < prevShieldRef.current) {
      setIsShieldFlashing(true);
      const timer = setTimeout(() => setIsShieldFlashing(false), 1200);
      prevShieldRef.current = coherenceShield;
      return () => clearTimeout(timer);
    }
    prevShieldRef.current = coherenceShield;
  }, [coherenceShield]);

  // Click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setShowFreezeTooltip(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setShowFreezeTooltip(false);
      }
    }
    if (isProfileOpen || showFreezeTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileOpen, showFreezeTooltip]);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Determine shield condition tokens and styling
  const isCritical = coherenceShield < 20;
  const isWarning = coherenceShield < 50 && !isCritical;
  const isOptimal = coherenceShield >= 50;

  const shieldStatus = isCritical ? 'critical' : isWarning ? 'warning' : 'optimal';

  const shieldColorClasses = isCritical
    ? 'shield-critical shield-crimson text-rose-700 bg-rose-500/15 border-rose-500/40 dark:text-rose-400'
    : isWarning
      ? 'shield-warning shield-amber text-amber-700 bg-amber-500/15 border-amber-500/40 dark:text-amber-400'
      : 'shield-optimal text-emerald-800 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400';

  const displayName = user?.displayName || 'Learner Profile';
  const displayEmail = user?.email || 'aarav@qtrace.dev';
  const personaTag = user?.personaTag || 'LEARNER';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header
      role="banner"
      aria-label="Learning Telemetry HUD"
      className={`sticky top-0 z-40 w-full flex justify-center py-2 px-3 sm:px-6 bg-surface-canvas/90 backdrop-blur-md border-b border-border-subtle select-none transition-all ${className}`}
    >
      <div className="w-full max-w-7xl flex items-center justify-between gap-2 sm:gap-4">
        {/* Item 1: Brand Wordmark & Route Breadcrumb */}
        <div className="flex items-center gap-2.5 shrink-0" data-testid="hud-brand-section">
          <Link
            href="/learn"
            className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-border-focus rounded-lg px-1 py-0.5"
            aria-label="Q-Trace Learn Home"
          >
            <QTraceLogo variant="mark-only" size="sm" className="transition-transform group-hover:scale-105" />
            <span className="font-bold text-sm sm:text-base tracking-tight text-text-primary">
              Q-TRACE
            </span>
          </Link>

          {/* Route Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-text-muted font-mono border-l border-border-medium pl-2.5">
            <span className="text-text-faint">/</span>
            <span className="text-text-secondary font-medium">learn</span>
          </div>
        </div>

        {/* Center Telemetry Cluster: Streak, Joules, Shield */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Item 2: Streak Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFreezeTooltip((prev) => !prev)}
              onMouseEnter={() => setShowFreezeTooltip(true)}
              onMouseLeave={() => setShowFreezeTooltip(false)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-border-focus ${
                streakDays >= 3
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/30'
                  : 'border-border-default bg-surface text-text-primary hover:bg-surface-raised'
              }`}
              aria-label={`Calibration Streak: ${streakDays} days`}
              aria-describedby="hud-freeze-tooltip"
              data-testid="hud-streak-pill"
            >
              <Flame className={`w-3.5 h-3.5 ${streakDays > 0 ? 'text-amber-500 fill-amber-500' : 'text-text-muted'}`} />
              {/* Desktop view */}
              <span className="hidden sm:inline font-mono">
                {streakDays}-Day Streak
              </span>
              {/* Mobile view */}
              <span className="inline sm:hidden font-mono">
                {streakDays}
              </span>
            </button>

            {/* Freeze-Shield Tooltip */}
            {showFreezeTooltip && (
              <div
                id="hud-freeze-tooltip"
                role="tooltip"
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 rounded-lg border border-border-medium bg-surface shadow-lg text-[11px] text-text-secondary z-50 pointer-events-none backdrop-blur-md"
              >
                <div className="flex items-center gap-1.5 font-semibold text-text-primary mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Freeze Shield Active</span>
                </div>
                <p className="text-[10px] text-text-muted leading-tight">
                  Protects your {streakDays}-day streak if inactive for 24h. Resets in 14h 22m.
                </p>
              </div>
            )}
          </div>

          {/* Item 3: Coherence Joules (Energy) Counter */}
          <div
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border border-border-default bg-surface text-xs font-semibold transition-all duration-300 ${
              isXpFlashing
                ? 'ring-2 ring-violet-500/60 bg-violet-500/15 border-violet-500/40 text-violet-700 dark:text-violet-300 scale-105'
                : 'text-text-primary'
            }`}
            aria-label={`Coherence Joules: ${coherenceJoules} Coherence`}
            data-testid="hud-joules-counter"
          >
            <Zap className={`w-3.5 h-3.5 text-violet-600 fill-violet-600 ${isXpFlashing ? 'animate-bounce' : ''}`} />
            {/* Desktop view */}
            <span className="hidden sm:inline font-mono">
              {coherenceJoules.toLocaleString()} Coherence
            </span>
            {/* Mobile view */}
            <span className="inline sm:hidden font-mono">
              {coherenceJoules.toLocaleString()}
            </span>
          </div>

          {/* Item 4: Coherence Shield Gauge */}
          <div
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border text-xs font-semibold transition-all duration-300 ${shieldColorClasses} ${
              isShieldFlashing ? 'ring-2 ring-amber-500/70 scale-105 animate-pulse' : ''
            }`}
            aria-label={`Coherence Shield: ${coherenceShield}%`}
            data-testid="hud-shield-gauge"
            data-shield-status={shieldStatus}
          >
            {isCritical ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 fill-rose-600/30" />
            ) : (
              <Shield className={`w-3.5 h-3.5 ${isWarning ? 'text-amber-600 fill-amber-600/30' : 'text-emerald-600 fill-emerald-600/30'}`} />
            )}
            {/* Desktop view */}
            <span className="hidden sm:inline font-mono">
              {coherenceShield}% Shield
            </span>
            {/* Mobile view */}
            <span className="inline sm:hidden font-mono">
              {coherenceShield}%
            </span>
          </div>
        </div>

        {/* Item 5: Account Profile Pill & Dropdown Menu */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full border border-border-default bg-surface hover:bg-surface-raised transition-colors cursor-pointer text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-border-focus"
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            aria-label="Learner Profile Menu"
            data-testid="hud-profile-trigger"
          >
            {/* Avatar Circle */}
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent text-[10px] font-bold">
              {initial}
            </div>

            {/* Desktop Label & Chevron */}
            <span className="hidden sm:inline font-medium text-text-primary max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown
              className={`hidden sm:inline w-3 h-3 text-text-muted transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            />

            {/* Desktop Settings Gear */}
            <Settings className="hidden sm:inline w-3 h-3 text-text-muted hover:text-text-primary ml-0.5" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div
              role="menu"
              aria-label="Learner Account Settings"
              className="absolute right-0 mt-2 w-64 rounded-xl border border-border-medium bg-surface p-3 shadow-xl backdrop-blur-md z-50 text-xs"
              data-testid="hud-profile-menu"
            >
              {/* User Identity Header */}
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-border-subtle mb-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-bold shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary truncate">{displayName}</p>
                  <p className="text-[11px] text-text-muted truncate font-mono">{displayEmail}</p>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-accent/30 text-accent uppercase shrink-0">
                  {personaTag}
                </span>
              </div>

              {/* Calibration Telemetry Summary */}
              <div className="bg-surface-raised rounded-lg p-2.5 mb-2.5 border border-border-subtle space-y-1.5" data-testid="hud-profile-telemetry">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Calibration Telemetry
                </p>
                <div className="grid grid-cols-3 gap-1 text-center font-mono pt-1">
                  <div className="p-1 rounded bg-surface/70 border border-border-subtle">
                    <span className="block text-[10px] text-text-muted">Streak</span>
                    <span className="font-bold text-xs text-text-primary">🔥 {streakDays}d</span>
                  </div>
                  <div className="p-1 rounded bg-surface/70 border border-border-subtle">
                    <span className="block text-[10px] text-text-muted">Joules</span>
                    <span className="font-bold text-xs text-text-primary">⚡ {coherenceJoules}</span>
                  </div>
                  <div className="p-1 rounded bg-surface/70 border border-border-subtle">
                    <span className="block text-[10px] text-text-muted">Shield</span>
                    <span className={`font-bold text-xs ${isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                      🛡️ {coherenceShield}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-1">
                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer font-medium"
                  role="menuitem"
                  data-testid="hud-settings-link"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Individual Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer text-left font-medium"
                  role="menuitem"
                  data-testid="hud-logout-button"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
