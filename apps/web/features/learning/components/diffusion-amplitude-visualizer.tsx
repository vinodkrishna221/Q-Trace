'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, RotateCcw } from 'lucide-react';

const STATES = ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'];
const MARKED = 5; // index of |101⟩

// Physically correct amplitudes
const PHASES = [
  {
    label: 'Initial Superposition',
    sublabel: 'H⊗³|000⟩ — all 8 states equal',
    step: '00',
    amplitudes: [0.354, 0.354, 0.354, 0.354, 0.354, 0.354, 0.354, 0.354],
    mean: 0.354,
    description: 'Every state has amplitude +1/√8 ≈ 0.354. Measurement probability: exactly 12.5% each. The quantum lottery is completely fair.',
  },
  {
    label: 'After Oracle U_ω',
    sublabel: '|101⟩ amplitude flipped to −0.354',
    step: '01',
    amplitudes: [0.354, 0.354, 0.354, 0.354, 0.354, -0.354, 0.354, 0.354],
    mean: 0.265,
    description: 'The oracle flipped |101⟩ from +0.354 to −0.354. The mean drops to 0.265. Measurement probability is STILL 12.5% for every state — the phase flip is invisible!',
  },
  {
    label: 'After Diffusion U_s',
    sublabel: '|101⟩ catapults to +0.884 (≈78% probability!)',
    step: '02',
    amplitudes: [0.177, 0.177, 0.177, 0.177, 0.177, 0.884, 0.177, 0.177],
    mean: 0.265,
    description: 'Reflection about the mean: |101⟩ jumps from −0.354 to +0.884. All others shrink from +0.354 to +0.177. P(|101⟩) = 0.884² ≈ 78% after just 1 iteration!',
  },
];

const SVG_H = 200; // total SVG canvas height
const SVG_W = 480;
const BASELINE_Y = 140; // y-position of the zero amplitude line
const BAR_W = 38;
const BAR_GAP = 22;
const MAX_AMP = 1.0; // normalize to this
const PX_PER_UNIT = 110; // pixels per amplitude unit

function ampToPx(a: number) {
  return a * PX_PER_UNIT;
}

export function DiffusionAmplitudeVisualizer() {
  const [phase, setPhase] = useState(0);

  const current = PHASES[phase];

  const barColor = (i: number, a: number) => {
    if (i === MARKED && phase >= 2) return '#22c55e'; // amplified — green
    if (i === MARKED && a < 0) return '#ef4444'; // flipped negative — red
    if (i === MARKED) return '#06b6d4'; // marked but positive
    return '#94a3b8'; // non-marked
  };

  const totalW = 8 * BAR_W + 7 * BAR_GAP + 40;
  const startX = (SVG_W - totalW) / 2 + 20;

  return (
    <div className="w-full rounded-xl border border-border-subtle bg-surface shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle bg-surface-raised/40 flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs font-mono font-semibold text-text-primary tracking-wider">
            AMPLITUDE BAR CHART · DIFFUSION STEP-THROUGH
          </p>
          <p className="text-[11px] font-mono text-text-muted mt-0.5">
            <span className="text-accent font-bold">{current.step}</span> — {current.label}
          </p>
        </div>
        <span className="text-[10px] font-mono text-text-muted bg-surface-raised px-2 py-1 rounded border border-border-subtle">
          {current.sublabel}
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="w-full bg-slate-50 border-b border-border-subtle overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          height={SVG_H}
          style={{ minWidth: 340 }}
        >
          {/* Zero baseline */}
          <line
            x1={startX - 10}
            y1={BASELINE_Y}
            x2={startX + totalW}
            y2={BASELINE_Y}
            stroke="#cbd5e1"
            strokeWidth={1.5}
          />
          <text x={startX - 12} y={BASELINE_Y + 4} textAnchor="end" fontSize={9} fill="#94a3b8" fontFamily="monospace">0</text>

          {/* Mean line */}
          {current.mean > 0 && (
            <>
              <line
                x1={startX - 10}
                y1={BASELINE_Y - ampToPx(current.mean)}
                x2={startX + totalW}
                y2={BASELINE_Y - ampToPx(current.mean)}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="5,3"
              />
              <text
                x={startX + totalW + 4}
                y={BASELINE_Y - ampToPx(current.mean) + 4}
                fontSize={9}
                fill="#f59e0b"
                fontFamily="monospace"
              >
                ᾱ={current.mean.toFixed(3)}
              </text>
            </>
          )}

          {/* Bars */}
          {current.amplitudes.map((amp, i) => {
            const x = startX + i * (BAR_W + BAR_GAP);
            const h = Math.abs(ampToPx(amp));
            const y = amp >= 0 ? BASELINE_Y - h : BASELINE_Y;
            const col = barColor(i, amp);

            return (
              <g key={i}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={BAR_W}
                  height={Math.max(h, 1)}
                  fill={col}
                  opacity={0.85}
                  rx={3}
                  style={{ transition: 'all 0.5s ease' }}
                />
                {/* Amplitude label on bar */}
                <text
                  x={x + BAR_W / 2}
                  y={amp >= 0 ? y - 4 : y + h + 11}
                  textAnchor="middle"
                  fontSize={8}
                  fill={col}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {amp.toFixed(3)}
                </text>
                {/* State label below */}
                <text
                  x={x + BAR_W / 2}
                  y={BASELINE_Y + 16}
                  textAnchor="middle"
                  fontSize={8}
                  fill={i === MARKED ? '#0284c7' : '#64748b'}
                  fontFamily="monospace"
                  fontWeight={i === MARKED ? 'bold' : 'normal'}
                >
                  {STATES[i]}
                </text>
                {/* P label */}
                <text
                  x={x + BAR_W / 2}
                  y={BASELINE_Y + 27}
                  textAnchor="middle"
                  fontSize={7}
                  fill="#94a3b8"
                  fontFamily="monospace"
                >
                  {(amp * amp * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Description */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-[12px] text-text-secondary leading-relaxed">{current.description}</p>
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          {PHASES.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPhase(i)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                phase === i
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border-subtle text-text-muted hover:text-text-primary'
              }`}
            >
              {p.step} {p.label.split(' ').slice(-1)[0]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {phase < PHASES.length - 1 && (
            <Button
              size="sm"
              variant="default"
              onClick={() => setPhase((p) => p + 1)}
              className="font-mono text-xs gap-1.5"
            >
              Next Step
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPhase(0)}
            className="font-mono text-xs gap-1.5 text-text-muted"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
