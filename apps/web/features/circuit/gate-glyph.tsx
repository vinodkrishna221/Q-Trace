'use client';

import * as React from 'react';
import { GateName } from '@/lib/contracts';

interface GateVisualProps {
  gate: GateName;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Galvanometer Meter SVG Icon for the Measure Gate.
 * Features curved dial scale, center pivot, 45-degree arrow needle, and standard superscript 'Z'.
 */
export function MeasureGaugeIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Curved Meter Arc */}
      <path
        d="M 4 17.5 A 8.5 8.5 0 0 1 20 17.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Dial calibration ticks */}
      <line x1="12" y1="9" x2="12" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="7" y1="11.5" x2="8.5" y2="12.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="17" y1="11.5" x2="15.5" y2="12.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      
      {/* Needle Pivot */}
      <circle cx="12" cy="17.5" r="1.5" fill="currentColor" />

      {/* Meter Needle pointing 45 deg */}
      <path
        d="M 12 17.5 L 17 9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Needle Arrowhead */}
      <path
        d="M 14.2 9.2 H 17.5 V 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Superscript 'Z' measuring basis indicator */}
      <text
        x="19"
        y="7.5"
        fontSize="6"
        fontWeight="bold"
        fontFamily="ui-monospace, monospace"
        fill="currentColor"
      >
        Z
      </text>
    </svg>
  );
}

/**
 * Circled Plus Crosshair SVG Icon for CNOT & CCX Target.
 * Horizontal and vertical crossbars meet the outer circle with mathematical precision.
 */
export function CnotTargetCrosshairIcon({
  className = 'w-6 h-6',
  strokeWidth = 2,
  'data-testid': dataTestId,
}: {
  className?: string;
  strokeWidth?: number;
  'data-testid'?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      data-testid={dataTestId}
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="12" y1="2.5" x2="12" y2="21.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

/**
 * 3-Qubit Vertical Multi-Terminal Glyph for CCX (Toffoli).
 * Two control dots connected by a vertical spine to a circled plus target symbol.
 */
export function CcxMultiTerminalIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Vertical spine */}
      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Control dot 1 */}
      <circle cx="12" cy="4" r="2.2" fill="currentColor" />
      {/* Control dot 2 */}
      <circle cx="12" cy="9.5" r="2.2" fill="currentColor" />
      {/* Circled plus target */}
      <circle cx="12" cy="17" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="12" y1="13.5" x2="12" y2="20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8.5" y1="17" x2="15.5" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Connected Multi-Terminal Glyph for CZ (Controlled-Z).
 * Two control dots connected by a vertical line (●—●).
 */
export function CzMultiTerminalIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Connecting spine */}
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Control dot 1 */}
      <circle cx="12" cy="6" r="3.2" fill="currentColor" />
      {/* Control dot 2 / Target dot */}
      <circle cx="12" cy="18" r="3.2" fill="currentColor" />
      {/* Subtle basis notation 'Z' */}
      <text
        x="17"
        y="13"
        fontSize="6.5"
        fontWeight="bold"
        fontFamily="ui-monospace, monospace"
        fill="currentColor"
      >
        Z
      </text>
    </svg>
  );
}

/**
 * S Gate Phase Rotation Glyph (π/2 phase shift).
 */
export function PhaseSIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center font-mono ${className}`}>
      <span className="font-bold text-[15px] tracking-tight">S</span>
      <span className="absolute -top-1 -right-1 text-[8px] font-semibold opacity-80">π/2</span>
    </div>
  );
}

/**
 * T Gate π/8 Rotation Glyph (π/4 phase shift).
 */
export function PhaseTIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center font-mono ${className}`}>
      <span className="font-bold text-[15px] tracking-tight">T</span>
      <span className="absolute -top-1 -right-1 text-[8px] font-semibold opacity-80">π/4</span>
    </div>
  );
}

/**
 * Standard IBM Quantum Composer styling configurations per gate family.
 * Saturated, high-contrast, tactile tiles with specular top highlights.
 */
export const GATE_VISUAL_STYLES: Record<
  GateName,
  {
    bgClass: string;
    textClass: string;
    borderClass: string;
    shadowClass: string;
    displayGlyph: React.ReactNode;
  }
> = {
  H: {
    bgClass: 'bg-[#fa4d56]', // IBM Coral/Vermilion
    textClass: 'text-white',
    borderClass: 'border-[#ea3943]',
    shadowClass: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_2px_4px_rgba(234,57,67,0.25)]',
    displayGlyph: <span className="font-mono font-bold tracking-tight">H</span>,
  },
  X: {
    bgClass: 'bg-[#0f62fe]', // Blue or Crimson in Composer
    textClass: 'text-white',
    borderClass: 'border-[#0043ce]',
    shadowClass: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_2px_4px_rgba(15,98,254,0.25)]',
    displayGlyph: <span className="font-mono font-bold tracking-tight">X</span>,
  },
  Y: {
    bgClass: 'bg-[#d12771]', // Electric Magenta/Orchid
    textClass: 'text-white',
    borderClass: 'border-[#9f1853]',
    shadowClass: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_2px_4px_rgba(209,39,113,0.25)]',
    displayGlyph: <span className="font-mono font-bold tracking-tight">Y</span>,
  },
  Z: {
    bgClass: 'bg-[#0ea5e9]', // Electric Cyan / Sky
    textClass: 'text-white',
    borderClass: 'border-[#0284c7]',
    shadowClass: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_2px_4px_rgba(14,165,233,0.25)]',
    displayGlyph: <span className="font-mono font-bold tracking-tight">Z</span>,
  },
  CNOT: {
    bgClass: 'bg-[#0f62fe]', // IBM Quantum Royal Blue
    textClass: 'text-white',
    borderClass: 'border-[#0043ce]',
    shadowClass: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_2px_4px_rgba(15,98,254,0.25)]',
    displayGlyph: <CnotTargetCrosshairIcon className="w-5 h-5" strokeWidth={2.2} />,
  },
  CZ: {
    bgClass: 'bg-[#0ea5e9]', // Electric Cyan / Sky
    textClass: 'text-white',
    borderClass: 'border-[#0284c7]',
    shadowClass: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_2px_4px_rgba(14,165,233,0.25)]',
    displayGlyph: <CzMultiTerminalIcon className="w-5 h-5" />,
  },
  CCX: {
    bgClass: 'bg-[#0f62fe]', // IBM Quantum Royal Blue
    textClass: 'text-white',
    borderClass: 'border-[#0043ce]',
    shadowClass: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_2px_4px_rgba(15,98,254,0.25)]',
    displayGlyph: <CcxMultiTerminalIcon className="w-5 h-5" />,
  },
  S: {
    bgClass: 'bg-[#1192e8]',
    textClass: 'text-white',
    borderClass: 'border-[#0072c3]',
    shadowClass: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_2px_4px_rgba(17,146,232,0.25)]',
    displayGlyph: <PhaseSIcon className="w-5 h-5" />,
  },
  T: {
    bgClass: 'bg-[#8a3ffc]',
    textClass: 'text-white',
    borderClass: 'border-[#6929c4]',
    shadowClass: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_2px_4px_rgba(138,63,252,0.25)]',
    displayGlyph: <PhaseTIcon className="w-5 h-5" />,
  },
  MEASURE: {
    bgClass: 'bg-[#475569]', // IBM Quantum Charcoal / Slate
    textClass: 'text-white',
    borderClass: 'border-[#334155]',
    shadowClass: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_2px_4px_rgba(71,85,105,0.25)]',
    displayGlyph: <MeasureGaugeIcon className="w-5 h-5" />,
  },
};

/**
 * Universal Gate Tile component providing the IBM Quantum Composer look & feel.
 */
export function GateTile({
  gate,
  className = '',
  size = 'md',
}: GateVisualProps) {
  const style = GATE_VISUAL_STYLES[gate];

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs rounded',
    md: 'w-[42px] h-[42px] text-[15px] rounded-[6px]',
    lg: 'w-12 h-12 text-base rounded-md',
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center select-none font-bold border transition-transform ${sizeClasses} ${style.bgClass} ${style.textClass} ${style.borderClass} ${style.shadowClass} ${className}`}
      aria-hidden="true"
    >
      {style.displayGlyph}
    </div>
  );
}
