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
    id: 'h3',
    latex: 'H^{\\otimes 3}|000\\rangle',
    color: '#7c3aed',
    bgClass: 'bg-violet-50',
    borderClass: 'border-violet-300',
    title: 'H⊗³|000⟩ — Equal Superposition Kickoff',
    plain: 'Three Hadamard gates applied to 3 qubits starting from |000⟩. This creates a uniform superposition of all 8 basis states: each with amplitude 1/√8 and probability 12.5%. This is step zero — the starting gun of the race.',
    analogy: '🎲 Like shuffling a deck perfectly: every card (state) is equally likely before the oracle starts marking answers.',
  },
  {
    id: 'uomega',
    latex: 'U_\\omega',
    color: '#d97706',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-300',
    title: 'U_ω — The Phase Oracle',
    plain: 'The oracle operator you learned about in the previous chamber. It flips the sign (phase) of the marked state |101⟩ while leaving all others unchanged. One application is one "oracle query" — this is the expensive step that Grover minimizes.',
    analogy: '🔍 The secret stamp machine — marks the treasure chest\'s sign without revealing which chest it is.',
  },
  {
    id: 'us',
    latex: 'U_s',
    color: '#0284c7',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-300',
    title: 'U_s — The Diffusion Operator',
    plain: 'Inversion About the Mean from the previous chamber. Takes the phase-flipped superposition and reflects all amplitudes about their average. Each application "pumps" probability from non-marked states into the marked state.',
    analogy: '📊 The see-saw flip — after oracle marks one bar negative, diffusion reflects all bars above their average, making the negative one shoot highest.',
  },
  {
    id: 'k',
    latex: '(U_sU_\\omega)^k',
    color: '#16a34a',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-300',
    title: '(U_sU_ω)^k — k Grover Iterations',
    plain: 'The entire oracle+diffusion cycle repeated k times. For N=8 states, optimal k = ⌊(π/4)√8⌋ = 2. Each iteration rotates the quantum state vector by angle 2θ (where sin θ = 1/√N) toward the target state.',
    analogy: '🔄 Like pumping a water pistol: each pump (iteration) pushes more water pressure toward the target. But too many pumps (over-rotation) and the water flies past the target!',
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
        '|\\psi_k\\rangle = (U_s U_\\omega)^k H^{\\otimes 3}|000\\rangle',
        ref.current,
        { throwOnError: false, displayMode: true }
      );
    }
  }, []);
  return <div ref={ref} className="overflow-x-auto" />;
}

export function GroverFormulaDecoder() {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const active = TERMS.find((t) => t.id === activeTerm) ?? null;

  return (
    <div className="w-full rounded-xl border border-border-subtle bg-surface shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle bg-surface-raised/40">
        <p className="text-xs font-mono font-semibold text-text-primary tracking-wider">
          GROVER STATE FORMULA · CLICK TO DECODE
        </p>
        <p className="text-[11px] font-mono text-text-muted mt-0.5">
          The complete algorithm in one equation — click each coloured part
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

        {/* Execution order callout */}
        <div className="rounded-lg bg-surface-sunken border border-border-subtle p-4">
          <p className="text-[10px] font-mono text-text-muted tracking-wider mb-2">EXECUTION ORDER (right → left):</p>
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="px-2 py-1 rounded bg-violet-100 text-violet-700 border border-violet-200">① H⊗³|000⟩</span>
            <span className="text-text-muted">→</span>
            <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 border border-amber-200">② Oracle U_ω</span>
            <span className="text-text-muted">→</span>
            <span className="px-2 py-1 rounded bg-sky-100 text-sky-700 border border-sky-200">③ Diffusion U_s</span>
            <span className="text-text-muted">→</span>
            <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">repeat k=2×</span>
            <span className="text-text-muted">→</span>
            <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">Measure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
