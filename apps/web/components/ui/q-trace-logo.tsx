'use client';

import * as React from 'react';

export interface QTraceLogoProps extends React.SVGProps<SVGSVGElement> {
  /**
   * - 'mark-only': Isolated quantum brand glyph
   * - 'full': Mark + "Q-TRACE" typographic wordmark + optional sub-badge
   * - 'hero': Large presentation mark with enhanced coherence corona
   */
  variant?: 'mark-only' | 'full' | 'hero';
  /**
   * Preset or custom size in pixels (controls height of the mark)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /**
   * Whether to display the sub-brand badge "FLIGHT RECORDER" in full variant
   */
  showSubtext?: boolean;
  /**
   * Additional wrapper class
   */
  className?: string;
  /**
   * Optional accessible label
   */
  'aria-label'?: string;
}

const SIZE_MAP = {
  sm: 24,
  md: 32,
  lg: 44,
  xl: 60,
};

export function QTraceLogo({
  variant = 'full',
  size = 'md',
  showSubtext = true,
  className = '',
  'aria-label': ariaLabel = 'Q-Trace Quantum Flight Recorder',
  ...props
}: QTraceLogoProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 32;

  // Mark-only rendering
  if (variant === 'mark-only') {
    return (
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
        aria-label={ariaLabel}
        role="img"
        {...props}
      >
        {/* Outer Superposition Q Orbital with Dirac Ket facet */}
        <circle
          cx="22"
          cy="22"
          r="16"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          className="text-[var(--gate-h,#2a2882)] dark:text-[var(--gate-h,#90a4fd)]"
        />
        {/* Inner concentric coherence orbit */}
        <circle
          cx="22"
          cy="22"
          r="9"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeDasharray="3 2"
          className="text-[var(--accent,#2a2882)] dark:text-[var(--accent,#90a4fd)] opacity-60"
        />
        {/* Coherence Center Nucleus */}
        <circle
          cx="22"
          cy="22"
          r="3"
          fill="currentColor"
          className="text-[var(--evidence-success,#033c00)] dark:text-[var(--evidence-success,#7ccf73)]"
        />
        {/* Dirac Ket Angle Accent */}
        <path
          d="M34 18 L38 22 L34 26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--gate-cnot,#4a02b1)] dark:text-[var(--gate-cnot,#a48fff)]"
        />
        {/* Telemetry Trace Descender */}
        <path
          d="M28 28 L41 41"
          stroke="currentColor"
          strokeWidth="3.6"
          strokeLinecap="round"
          className="text-[var(--gate-cnot,#4a02b1)] dark:text-[var(--gate-cnot,#a48fff)]"
        />
        <circle
          cx="41"
          cy="41"
          r="2.8"
          fill="currentColor"
          className="text-[var(--gate-cnot,#4a02b1)] dark:text-[var(--gate-cnot,#a48fff)]"
        />
      </svg>
    );
  }

  // Hero variant: amplified scale and delicate laser graticules
  if (variant === 'hero') {
    const heroHeight = pixelSize * 1.5;
    return (
      <svg
        width={heroHeight}
        height={heroHeight}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
        aria-label={ariaLabel}
        role="img"
        {...props}
      >
        {/* Subtle ambient graticule ring */}
        <circle
          cx="28"
          cy="28"
          r="26"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="2 3"
          className="text-[var(--border-strong,rgba(11,10,67,0.2))] dark:text-[var(--border-strong,rgba(255,255,255,0.25))]"
        />
        {/* Primary Q Superposition Loop */}
        <circle
          cx="28"
          cy="28"
          r="20"
          stroke="currentColor"
          strokeWidth="3.8"
          strokeLinecap="round"
          className="text-[var(--gate-h,#2a2882)] dark:text-[var(--gate-h,#90a4fd)]"
        />
        {/* Dual Coherence Rings */}
        <circle
          cx="28"
          cy="28"
          r="12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeDasharray="3 2.5"
          className="text-[var(--accent,#2a2882)] dark:text-[var(--accent,#90a4fd)] opacity-60"
        />
        {/* Center Ground-State Core */}
        <circle
          cx="28"
          cy="28"
          r="4"
          fill="currentColor"
          className="text-[var(--evidence-success,#033c00)] dark:text-[var(--evidence-success,#7ccf73)]"
        />
        {/* Dirac Ket Facet */}
        <path
          d="M44 23 L49 28 L44 33"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--gate-cnot,#4a02b1)] dark:text-[var(--gate-cnot,#a48fff)]"
        />
        {/* Flight Trace Descender */}
        <path
          d="M36 36 L52 52"
          stroke="currentColor"
          strokeWidth="4.2"
          strokeLinecap="round"
          className="text-[var(--gate-cnot,#4a02b1)] dark:text-[var(--gate-cnot,#a48fff)]"
        />
        <circle
          cx="52"
          cy="52"
          r="3.5"
          fill="currentColor"
          className="text-[var(--gate-cnot,#4a02b1)] dark:text-[var(--gate-cnot,#a48fff)]"
        />
      </svg>
    );
  }

  // Full lockup: Mark + Typography Wordmark
  const markSize = Math.max(22, Math.round(pixelSize * 0.85));
  const fullWidth = showSubtext ? Math.round(pixelSize * 4.6) : Math.round(pixelSize * 3.4);

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Mark */}
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        <circle
          cx="22"
          cy="22"
          r="16"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          className="text-[var(--gate-h,#2a2882)] dark:text-[var(--gate-h,#90a4fd)]"
        />
        <circle
          cx="22"
          cy="22"
          r="9"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeDasharray="3 2"
          className="text-[var(--accent,#2a2882)] dark:text-[var(--accent,#90a4fd)] opacity-60"
        />
        <circle
          cx="22"
          cy="22"
          r="3"
          fill="currentColor"
          className="text-[var(--evidence-success,#033c00)] dark:text-[var(--evidence-success,#7ccf73)]"
        />
        <path
          d="M34 18 L38 22 L34 26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--gate-cnot,#4a02b1)] dark:text-[var(--gate-cnot,#a48fff)]"
        />
        <path
          d="M28 28 L41 41"
          stroke="currentColor"
          strokeWidth="3.6"
          strokeLinecap="round"
          className="text-[var(--gate-cnot,#4a02b1)] dark:text-[var(--gate-cnot,#a48fff)]"
        />
        <circle
          cx="41"
          cy="41"
          r="2.8"
          fill="currentColor"
          className="text-[var(--gate-cnot,#4a02b1)] dark:text-[var(--gate-cnot,#a48fff)]"
        />
      </svg>

      {/* Typography Block */}
      <div className="flex flex-col leading-none">
        <span className="text-[14px] font-bold tracking-[0.12em] text-text-primary group-hover:text-accent transition-colors font-sans">
          Q-TRACE
        </span>
        {showSubtext && (
          <span className="text-[8.5px] font-semibold tracking-[0.2em] uppercase text-text-muted mt-0.5 font-mono">
            Flight Recorder
          </span>
        )}
      </div>
    </div>
  );
}
