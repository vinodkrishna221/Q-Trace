'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';

interface IterationState {
  label: string;
  sublabel: string;
  probTarget: number; // |101⟩ probability
  probOthers: number; // each of 7 other states
  icon: string;
  description: string;
  color: string;
}

const ITERATIONS: IterationState[] = [
  {
    label: 'Before Grover',
    sublabel: 'H⊗³|000⟩ — uniform superposition',
    icon: '00',
    probTarget: 0.125,
    probOthers: 0.125,
    color: '#94a3b8',
    description: 'Equal superposition. Every one of the 8 states (|000⟩ to |111⟩) has exactly 12.5% probability. Grover\'s algorithm hasn\'t started — the search needle hasn\'t moved yet.',
  },
  {
    label: 'After Iteration 1',
    sublabel: 'Oracle → Diffusion (×1)',
    icon: '01',
    probTarget: 0.781,
    probOthers: (1 - 0.781) / 7,
    color: '#0284c7',
    description: 'One Oracle+Diffusion cycle. |101⟩ jumps from 12.5% to 78.1%! The other 7 states each shrink from 12.5% to 3.1%. One cycle already makes finding the answer 6× more likely.',
  },
  {
    label: 'After Iteration 2',
    sublabel: 'Oracle → Diffusion (×2) ← PEAK',
    icon: '02',
    probTarget: 0.945,
    probOthers: (1 - 0.945) / 7,
    color: '#22c55e',
    description: '⭐ Two iterations: the sweet spot for N=8. P(|101⟩) reaches 94.5%! The other 7 states are barely detectable at 0.79% each. This is the optimal stopping point — do NOT add more iterations.',
  },
  {
    label: 'After Iteration 3',
    sublabel: 'Over-rotated — Soufflé collapsed!',
    icon: '03',
    probTarget: 0.335,
    probOthers: (1 - 0.335) / 7,
    color: '#ef4444',
    description: '⚠️ Three iterations over-rotates past the target. P(|101⟩) crashes from 94.5% all the way back to 33.5%. This is the soufflé pitfall — quantum search gets WORSE if you run too many iterations.',
  },
];

const BAR_H = 140; // max bar height in px
const BAR_W = 38;
const GAP = 14;
const STATES = ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'];
const MARKED = 5;

export function GroverIterationVisualizer() {
  const [step, setStep] = useState(0);
  const current = ITERATIONS[step];

  const bars = STATES.map((label, i) => {
    const isTarget = i === MARKED;
    const prob = isTarget ? current.probTarget : current.probOthers;
    return { label, prob, isTarget };
  });

  const totalBarW = 8 * BAR_W + 7 * GAP;
  const svgW = totalBarW + 60;
  const svgH = BAR_H + 60;

  return (
    <div className="w-full rounded-xl border border-border-subtle bg-surface shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle bg-surface-raised/40 flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs font-mono font-semibold text-text-primary tracking-wider">
            GROVER ITERATION VISUALIZER · PROBABILITY GROWTH
          </p>
          <p className="text-[11px] font-mono text-text-muted mt-0.5">
            <span className="font-bold" style={{ color: current.color }}>{current.icon}</span> — {current.label}
          </p>
        </div>
        <span
          className="text-[10px] font-mono px-2 py-1 rounded border"
          style={{ color: current.color, borderColor: current.color, background: `${current.color}15` }}
        >
          P(|101⟩) = {(current.probTarget * 100).toFixed(1)}%
        </span>
      </div>

      {/* SVG bar chart */}
      <div className="w-full bg-slate-50 border-b border-border-subtle overflow-x-auto py-4">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          height={svgH}
          style={{ minWidth: 340 }}
        >
          {/* Baseline */}
          <line x1={20} y1={BAR_H + 4} x2={svgW - 10} y2={BAR_H + 4} stroke="#cbd5e1" strokeWidth={1.5} />

          {bars.map(({ label, prob, isTarget }, i) => {
            const x = 30 + i * (BAR_W + GAP);
            const h = Math.max(prob * BAR_H, 2);
            const y = BAR_H + 4 - h;
            const col = isTarget ? current.color : '#cbd5e1';

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={BAR_W}
                  height={h}
                  fill={col}
                  opacity={isTarget ? 0.9 : 0.6}
                  rx={3}
                  style={{ transition: 'all 0.5s ease' }}
                />
                {/* Probability label */}
                <text
                  x={x + BAR_W / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={isTarget ? 9 : 8}
                  fill={col}
                  fontFamily="monospace"
                  fontWeight={isTarget ? 'bold' : 'normal'}
                >
                  {(prob * 100).toFixed(1)}%
                </text>
                {/* State label */}
                <text
                  x={x + BAR_W / 2}
                  y={BAR_H + 18}
                  textAnchor="middle"
                  fontSize={8}
                  fill={isTarget ? '#0284c7' : '#94a3b8'}
                  fontFamily="monospace"
                  fontWeight={isTarget ? 'bold' : 'normal'}
                >
                  {label}
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

      {/* Iteration progress pills */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <div className="flex gap-2 flex-wrap">
          {ITERATIONS.map((it, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                step === i
                  ? 'shadow-sm scale-105'
                  : 'border-border-subtle text-text-muted hover:text-text-primary'
              }`}
              style={
                step === i
                  ? { borderColor: it.color, background: `${it.color}15`, color: it.color }
                  : {}
              }
            >
              {it.icon} {it.label.split(' ').slice(-1)[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="font-mono text-xs gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </Button>
        <Button
          size="sm"
          variant={step < ITERATIONS.length - 1 ? 'default' : 'outline'}
          onClick={() => setStep((s) => Math.min(ITERATIONS.length - 1, s + 1))}
          disabled={step === ITERATIONS.length - 1}
          className="font-mono text-xs gap-1"
        >
          {step === 0 ? 'Run Iteration 1' : step === 1 ? 'Run Iteration 2 (Peak)' : step === 2 ? 'See Over-Rotation' : 'End'}
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setStep(0)}
          className="font-mono text-xs gap-1 text-text-muted"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
