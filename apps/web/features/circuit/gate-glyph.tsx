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
 * Circled Plus Crosshair SVG Icon for CNOT Target.
 * Horizontal and vertical crossbars meet the outer circle with mathematical precision.
 */
export function CnotTargetCrosshairIcon({ className = 'w-6 h-6', strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="12" y1="2.5" x2="12" y2="21.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
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
