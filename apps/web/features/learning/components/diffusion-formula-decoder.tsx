'use client';

import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { X } from 'lucide-react';

interface Term {
  id: string;
  latex: string;
  color: string;
  bgClass: string;
  borderClass: string;
  title: string;
  plain: string;
  analogy: string;
}

const TERMS: Term[] = [
  {
    id: 'us',
    latex: 'U_s',
    color: '#7c3aed',
    bgClass: 'bg-violet-50',
    borderClass: 'border-violet-300',
    title: 'U_s — The Diffusion Operator',
    plain: 'Also called the "Grover Diffusion Operator" or "Inversion About the Mean". It takes ALL amplitudes and reflects each one across the average amplitude ᾱ. Negative values get pushed positive; low positive values shrink; the anomalous large value grows even more.',
    analogy: '📊 Like a see-saw balanced at the class average — a student far below gets catapulted above when the board flips.',
  },
  {
    id: 'ket_s',
    latex: '2|s\\rangle\\langle s|',
    color: '#0284c7',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-300',
    title: '2|s⟩⟨s| — The Projection onto Uniform Superposition',
    plain: '|s⟩ is the uniform superposition state (1/√N × all basis states). The outer product |s⟩⟨s| is a projector onto this state. 2|s⟩⟨s| - I is the mathematical definition of a reflection about |s⟩.',
    analogy: '🪞 The mirror itself — |s⟩⟨s| defines the reflection plane; subtracting identity makes it a flip rather than a projection.',
  },
  {
    id: 'mean',
    latex: '\\bar{\\alpha} = \\frac{1}{N}\\sum_{j=1}^{N}\\alpha_j',
    color: '#d97706',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-300',
    title: 'ᾱ — The Mean Amplitude',
    plain: 'The average of all 8 amplitudes. After the oracle flips |101⟩ negative, this average drops from 0.354 to 0.265. That shift is what makes the reflection asymmetric — and why the marked state gets amplified more than it loses.',
    analogy: '⚖️ Like a class average that drops when one student scores negative — everyone else gets graded relative to this new, lower average.',
  },
  {
    id: 'reflect',
    latex: '\\alpha_i \\to 2\\bar{\\alpha} - \\alpha_i',
    color: '#16a34a',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-300',
    title: 'αᵢ → 2ᾱ − αᵢ — The Reflection Formula',
    plain: 'Each amplitude αᵢ is replaced by 2ᾱ − αᵢ. This is literally a mirror reflection: if you\'re 0.1 below the mean, you end up 0.1 above; if you\'re 0.6 below (like the oracle-flipped state), you end up 0.6 above — but 0.6 above a shifted mean, which overshoots dramatically.',
    analogy: '🏓 Like ping-pong: the further below the table you drop the ball, the higher it bounces back on the other side.',
  },
];

function KaTeXSpan({ latex, color }: { latex: string; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(latex, ref.current, { throwOnError: false, displayMode: false });
      ref.current.style.color = color;
    }
  }, [latex, color]);
  return <span ref={ref} />;
}

function FullFormula() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(
        'U_s = 2|s\\rangle\\langle s| - I, \\quad \\alpha_i \\to 2\\bar{\\alpha} - \\alpha_i \\quad \\text{where } \\bar{\\alpha} = \\frac{1}{N}\\sum_{j=1}^{N} \\alpha_j',
        ref.current,
        { throwOnError: false, displayMode: true }
      );
    }
  }, []);
  return <div ref={ref} className="overflow-x-auto" />;
}

export function DiffusionFormulaDecoder() {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const active = TERMS.find((t) => t.id === activeTerm) ?? null;

  return (
    <div className="w-full rounded-xl border border-border-subtle bg-surface shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle bg-surface-raised/40">
        <p className="text-xs font-mono font-semibold text-text-primary tracking-wider">
          DIFFUSION FORMULA · CLICK TO DECODE
        </p>
        <p className="text-[11px] font-mono text-text-muted mt-0.5">
          Click any coloured button to understand each part in plain English
        </p>
      </div>

      <div className="p-6 space-y-5">
        {/* Full KaTeX Formula */}
        <div className="text-center py-2">
          <FullFormula />
        </div>

        {/* Clickable term buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {TERMS.map((term) => (
            <button
              key={term.id}
              type="button"
              onClick={() => setActiveTerm(activeTerm === term.id ? null : term.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
                activeTerm === term.id
                  ? `${term.bgClass} ${term.borderClass} shadow-sm scale-105`
                  : 'bg-surface-raised border-border-subtle hover:border-border-default'
              }`}
              style={{ color: term.color }}
            >
              <KaTeXSpan latex={term.latex} color={term.color} />
              <span className="text-text-muted font-sans font-normal text-[10px]">
                {activeTerm === term.id ? '▲ hide' : '▼ explain'}
              </span>
            </button>
          ))}
        </div>

        {/* Expanded explanation panel */}
        {active && (
          <div className={`rounded-xl border p-4 space-y-2 relative ${active.bgClass} ${active.borderClass}`}>
            <button
              type="button"
              onClick={() => setActiveTerm(null)}
              className="absolute top-2.5 right-2.5 text-text-muted hover:text-text-primary"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="text-xs font-mono font-bold" style={{ color: active.color }}>
              {active.title}
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">{active.plain}</p>
            <p className="text-[11px] text-text-muted italic leading-relaxed border-t border-current/10 pt-2">
              {active.analogy}
            </p>
          </div>
        )}

        {/* Before/After summary boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 space-y-1">
            <p className="text-[10px] font-mono font-bold text-sky-700">BEFORE ORACLE</p>
            <p className="text-xs text-text-secondary">All amplitudes = +0.354</p>
            <p className="text-[10px] text-text-muted font-mono">mean ᾱ = 0.354</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
            <p className="text-[10px] font-mono font-bold text-red-700">AFTER ORACLE</p>
            <p className="text-xs text-text-secondary">|101⟩ = −0.354, others = +0.354</p>
            <p className="text-[10px] text-text-muted font-mono">mean ᾱ = 0.265</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-1">
            <p className="text-[10px] font-mono font-bold text-emerald-700">AFTER DIFFUSION</p>
            <p className="text-xs text-text-secondary">|101⟩ = +0.884, others = +0.177</p>
            <p className="text-[10px] text-text-muted font-mono">P(|101⟩) ≈ 78%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
