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
    id: 'oracle',
    latex: 'U_\\omega',
    color: '#7c3aed',
    bgClass: 'bg-violet-50',
    borderClass: 'border-violet-300',
    title: 'U_ω — The Oracle Operator',
    plain: 'This is the "secret stamp" machine. You feed it any possible answer x, and it checks whether x is the correct one (ω). It runs on all 8 states simultaneously thanks to superposition.',
    analogy: '🔍 Like a lock that hums differently on the right key — but only on the inside. You can\'t hear it from outside.',
  },
  {
    id: 'input',
    latex: '|x\\rangle',
    color: '#0284c7',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-300',
    title: '|x⟩ — The Quantum Input',
    plain: 'This represents any one of the 8 possible 3-bit states (|000⟩ to |111⟩). When in superposition, x is all of them at once — the oracle processes all 8 in a single operation.',
    analogy: '📦 Like 8 mystery chests existing simultaneously until you open one.',
  },
  {
    id: 'phase',
    latex: '(-1)^{f(x)}',
    color: '#d97706',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-300',
    title: '(-1)^{f(x)} — The Phase Kick',
    plain: 'f(x) = 1 only when x = ω (the marked state), 0 otherwise. So (−1)^0 = +1 (no change) for non-marked states, and (−1)^1 = −1 (phase flip) for the marked state.',
    analogy: '🪞 Like flipping a coin to its other face — it looks identical but is secretly "mirrored".',
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
        'U_\\omega |x\\rangle = (-1)^{f(x)} |x\\rangle',
        ref.current,
        { throwOnError: false, displayMode: true }
      );
    }
  }, []);
  return <div ref={ref} className="overflow-x-auto" />;
}

export function InteractiveFormulaDecoder() {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const active = TERMS.find((t) => t.id === activeTerm) ?? null;

  return (
    <div className="w-full rounded-xl border border-border-subtle bg-surface shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle bg-surface-raised/40">
        <p className="text-xs font-mono font-semibold text-text-primary tracking-wider">ORACLE FORMULA · CLICK TO DECODE</p>
        <p className="text-[11px] font-mono text-text-muted mt-0.5">Click any coloured term to see what it really means</p>
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
              <span className="text-text-muted font-sans font-normal" style={{ color: undefined }}>
                {activeTerm === term.id ? '▲ hide' : '▼ explain'}
              </span>
            </button>
          ))}
        </div>

        {/* Expanded explanation panel */}
        {active && (
          <div
            className={`rounded-xl border p-4 space-y-2 relative ${active.bgClass} ${active.borderClass}`}
          >
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

        {/* Case breakdown */}
        <div className="rounded-lg border border-border-subtle bg-surface-sunken p-4 space-y-2">
          <p className="text-[11px] font-mono text-text-muted tracking-wider">WHAT THE ORACLE DOES TO EACH STATE:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-1">
              <p className="text-[11px] font-mono font-bold text-emerald-700">x ≠ ω (non-marked)</p>
              <p className="text-xs text-text-secondary">
                f(x) = 0 → (−1)⁰ = <span className="font-mono font-bold text-emerald-700">+1</span> → amplitude unchanged
              </p>
              <p className="text-[10px] text-text-muted italic">7 out of 8 chests stay upright</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
              <p className="text-[11px] font-mono font-bold text-amber-700">x = ω (marked: |101⟩)</p>
              <p className="text-xs text-text-secondary">
                f(x) = 1 → (−1)¹ = <span className="font-mono font-bold text-amber-700">−1</span> → amplitude flipped
              </p>
              <p className="text-[10px] text-text-muted italic">1 chest flipped — still 12.5% to find it!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
