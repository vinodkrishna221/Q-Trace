'use client';

import * as React from 'react';
import { X, BookOpen, Compass, Binary, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { renderMathText } from '@/lib/math-renderer';
import { cn } from '@/lib/utils';

export interface UnitGuidebookModalProps {
  open: boolean;
  onClose: () => void;
  unitNumber?: number | string;
  unitTitle?: string;
  className?: string;
}

interface GateCheatsheet {
  name: string;
  symbol: string;
  matrixTex: string;
  transformTex: string;
  blochEffect: string;
  property: string;
  category: 'Single-Qubit' | 'Phase' | 'Multi-Qubit';
}

const GATE_CHEATSHEETS: GateCheatsheet[] = [
  {
    name: 'Pauli-X (NOT / Bit-Flip)',
    symbol: 'X',
    matrixTex: 'X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}',
    transformTex: 'X|0\\rangle = |1\\rangle, \\quad X|1\\rangle = |0\\rangle',
    blochEffect: 'Rotates 180° (\\pi rad) around the X-axis. Flips North Pole |0⟩ to South Pole |1⟩.',
    property: 'Hermitian and unitary: X = X^\\dagger = X^{-1} \\implies X^2 = I (self-inverse).',
    category: 'Single-Qubit',
  },
  {
    name: 'Hadamard (Superposition Creator)',
    symbol: 'H',
    matrixTex: 'H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}',
    transformTex: 'H|0\\rangle = |+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}, \\quad H|1\\rangle = |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}',
    blochEffect: 'Rotates 90° around Y-axis then 180° around X-axis. Maps poles to the equator.',
    property: 'Unitary and self-inverse: H^2 = I. Double application restores deterministic initial state.',
    category: 'Single-Qubit',
  },
  {
    name: 'Pauli-Z (Phase-Flip)',
    symbol: 'Z',
    matrixTex: 'Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}',
    transformTex: 'Z|0\\rangle = |0\\rangle, \\quad Z|1\\rangle = -|1\\rangle',
    blochEffect: 'Rotates 180° around the Z-axis. Leaves latitude intact while inverting relative phase.',
    property: 'Z|+\\rangle = |-\\rangle. Phase flip is invisible to computational measurement, but changes interference.',
    category: 'Phase',
  },
  {
    name: 'Phase Gate S (Quarter-Turn)',
    symbol: 'S',
    matrixTex: 'S = \\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix}',
    transformTex: 'S|0\\rangle = |0\\rangle, \\quad S|1\\rangle = i|1\\rangle',
    blochEffect: 'Rotates 90° (\\pi/2 rad) around the Z-axis into the imaginary plane.',
    property: 'Square root of Z: S^2 = Z. Adds a +90° relative phase shift.',
    category: 'Phase',
  },
  {
    name: 'Phase Gate T (Eighth-Turn)',
    symbol: 'T',
    matrixTex: 'T = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{pmatrix}',
    transformTex: 'T|0\\rangle = |0\\rangle, \\quad T|1\\rangle = e^{i\\pi/4}|1\\rangle',
    blochEffect: 'Rotates 45° (\\pi/4 rad) around the Z-axis.',
    property: 'Square root of S: T^2 = S. Together with H and CNOT, enables universal quantum computing.',
    category: 'Phase',
  },
];

export function UnitGuidebookModal({
  open,
  onClose,
  unitNumber = 1,
  unitTitle = 'THE QUANTUM COMPASS',
  className,
}: UnitGuidebookModalProps) {
  const [activeTab, setActiveTab] = React.useState<'all' | 'gates' | 'dirac' | 'bloch'>('all');
  const drawerRef = React.useRef<HTMLDivElement>(null);

  // Close on Escape key
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guidebook-title"
      data-testid="unit-guidebook-modal"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        data-testid="guidebook-backdrop"
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          'relative z-50 flex h-full w-full max-w-2xl flex-col border-l border-border-medium bg-surface text-text-primary shadow-2xl transition-all duration-300 ease-out',
          className
        )}
      >
        {/* Drawer Header */}
        <div className="flex flex-col gap-2 border-b border-border-subtle bg-surface-raised/40 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-accent uppercase">
                <BookOpen className="h-3 w-3" />
                UNIT {unitNumber} GUIDEBOOK
              </span>
              <span className="rounded-full bg-surface-active px-2 py-0.5 text-[10px] font-mono text-text-muted">
                CHEATSHEET
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close guidebook"
              data-testid="guidebook-close-button"
              className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-active hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <h2 id="guidebook-title" className="text-base font-semibold tracking-tight text-text-primary">
              {unitTitle}
            </h2>
            <p className="text-xs text-text-secondary">
              High-yield gate truth tables, Dirac formulas, Born rule normalization, and Bloch sphere geometry.
            </p>
          </div>

          {/* Quick Filter Navigation */}
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1" role="tablist">
            {[
              { id: 'all', label: 'All References' },
              { id: 'gates', label: 'Gate Truth Tables (X, H, Z, S, T)' },
              { id: 'dirac', label: 'Dirac & Born Rule' },
              { id: 'bloch', label: 'Bloch Sphere Coordinates' },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] font-medium transition-all select-none whitespace-nowrap cursor-pointer',
                  activeTab === tab.id
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-surface border border-border-subtle text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Scientific Honesty Notice */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-raised/30 p-3.5 text-xs text-text-secondary">
            <Sparkles className="mt-0.5 h-4 w-4 text-accent shrink-0" />
            <p className="leading-relaxed">
              <span className="font-semibold text-text-primary">Scientific Honesty Protocol:</span> Quantum statevectors
              and Bloch coordinates are <span className="italic">mathematical representations</span> of probability
              amplitudes, not physical trajectories. Measurement collapses continuous superpositions irreversibly into
              definite eigenvalues.
            </p>
          </div>

          {/* Section: Gate Truth Tables */}
          {(activeTab === 'all' || activeTab === 'gates') && (
            <section className="space-y-4" data-testid="section-gates">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                <Binary className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-text-primary">
                  High-Yield Gate Truth Tables & Unitary Matrices
                </h3>
              </div>

              <div className="grid gap-3">
                {GATE_CHEATSHEETS.map((gate) => (
                  <div
                    key={gate.symbol}
                    className="group rounded-xl border border-border-subtle bg-surface p-4 shadow-xs transition-colors hover:border-border-medium"
                    data-testid={`gate-card-${gate.symbol.toLowerCase()}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 font-mono text-xs font-bold text-accent">
                          {gate.symbol}
                        </span>
                        <h4 className="text-xs font-semibold text-text-primary">{gate.name}</h4>
                      </div>
                      <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-medium text-text-muted">
                        {gate.category}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Matrix */}
                      <div className="rounded-lg bg-surface-sunken/50 p-2.5">
                        <span className="block text-[10px] font-semibold text-text-muted uppercase mb-1">
                          Unitary Matrix Operator
                        </span>
                        <div className="font-mono text-xs text-text-primary">
                          {renderMathText(`$$${gate.matrixTex}$$`)}
                        </div>
                      </div>

                      {/* State Transformation */}
                      <div className="rounded-lg bg-surface-raised/40 p-2.5">
                        <span className="block text-[10px] font-semibold text-text-muted uppercase mb-1">
                          Basis State Action
                        </span>
                        <div className="font-mono text-xs text-text-primary">
                          {renderMathText(`$${gate.transformTex}$`)}
                        </div>
                      </div>

                      {/* Bloch Sphere & Algebraic Property */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-text-secondary pt-1">
                        <div>
                          <span className="font-medium text-text-primary">Bloch Sphere Effect: </span>
                          {gate.blochEffect}
                        </div>
                        <div>
                          <span className="font-medium text-text-primary">Algebraic Property: </span>
                          {gate.property}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Dirac Notation & Formulas */}
          {(activeTab === 'all' || activeTab === 'dirac') && (
            <section className="space-y-4" data-testid="section-dirac">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                <Layers className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Dirac Bra-Ket Notation & Probability Formulas
                </h3>
              </div>

              <div className="space-y-3">
                {/* Statevector Expansion */}
                <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-xs">
                  <h4 className="text-xs font-semibold text-text-primary mb-1">
                    Statevector Superposition Definition
                  </h4>
                  <p className="text-xs text-text-secondary mb-2">
                    A single-qubit pure state is a linear combination of basis kets parameterized by complex amplitudes:
                  </p>
                  <div className="rounded-lg bg-surface-sunken/60 p-2.5 font-mono text-xs">
                    {renderMathText('$$|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle, \\quad \\alpha, \\beta \\in \\mathbb{C}$$')}
                  </div>
                </div>

                {/* Normalization & Born Rule */}
                <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-xs">
                  <h4 className="text-xs font-semibold text-text-primary mb-1">
                    The Born Rule & Normalization Constraint
                  </h4>
                  <p className="text-xs text-text-secondary mb-2">
                    The square of the absolute probability amplitude yields the exact physical probability of measuring that eigenstate:
                  </p>
                  <div className="space-y-2 rounded-lg bg-surface-sunken/60 p-2.5 font-mono text-xs">
                    <div>
                      {renderMathText('$$P(0) = |\\alpha|^2, \\quad P(1) = |\\beta|^2$$')}
                    </div>
                    <div className="border-t border-border-subtle pt-2">
                      <span className="block text-[10px] font-sans font-semibold text-text-muted uppercase mb-1">
                        Conservation of Probability
                      </span>
                      {renderMathText('$$|\\alpha|^2 + |\\beta|^2 = 1.0$$')}
                    </div>
                  </div>
                </div>

                {/* Canonical Basis Vectors */}
                <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-xs">
                  <h4 className="text-xs font-semibold text-text-primary mb-2">
                    Standard Basis Representations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-surface-raised/50 p-2.5">
                      <span className="block text-[10px] font-semibold text-text-muted uppercase mb-1">
                        Computational Z-Basis
                      </span>
                      {renderMathText('$$|0\\rangle = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}, \\quad |1\\rangle = \\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$$')}
                    </div>
                    <div className="rounded-lg bg-surface-raised/50 p-2.5">
                      <span className="block text-[10px] font-semibold text-text-muted uppercase mb-1">
                        Hadamard X-Basis
                      </span>
                      {renderMathText('$$|+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}, \\quad |-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$$')}
                    </div>
                  </div>
                </div>

                {/* Inner Product / Bra-Ket */}
                <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-xs">
                  <h4 className="text-xs font-semibold text-text-primary mb-1">
                    Inner Product (Probability Overlap)
                  </h4>
                  <p className="text-xs text-text-secondary mb-2">
                    The bracket <span className="font-mono">{'⟨ϕ|ψ⟩'}</span> computes the projection amplitude between states:
                  </p>
                  <div className="rounded-lg bg-surface-sunken/60 p-2.5 font-mono text-xs">
                    {renderMathText('$$\\langle\\phi|\\psi\\rangle = \\phi_0^* \\psi_0 + \\phi_1^* \\psi_1$$')}
                  </div>
                  <div className="mt-2 text-[11px] text-text-secondary">
                    Orthogonality: {renderMathText('$\\langle 0|1\\rangle = 0$')}, {renderMathText('$\\langle +|-\\rangle = 0$')}. Orthonormality guarantees zero false-positive overlap between opposite basis states.
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Section: Bloch Sphere Summary */}
          {(activeTab === 'all' || activeTab === 'bloch') && (
            <section className="space-y-4" data-testid="section-bloch">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                <Compass className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-text-primary">
                  The Bloch Sphere: The Quantum Compass
                </h3>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-semibold text-text-primary">
                  Unit Sphere Parameterization
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Any pure single-qubit state corresponds to a point on the surface of a unit sphere in 3D Euclidean space
                  with polar angle <span className="font-mono">θ</span> (latitude) and azimuthal angle <span className="font-mono">ϕ</span> (longitude):
                </p>
                <div className="rounded-lg bg-surface-sunken/60 p-2.5 font-mono text-xs">
                  {renderMathText('$$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$$')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs pt-1">
                  <div className="rounded-lg bg-surface-raised/40 p-2.5 space-y-1">
                    <span className="font-semibold text-text-primary">Latitude θ (0 ≤ θ ≤ π):</span>
                    <p className="text-[11px] text-text-secondary">
                      Controls measurement probability split.
                      <br />• θ = 0: North Pole (|0⟩, 100% 0)
                      <br />• θ = π: South Pole (|1⟩, 100% 1)
                      <br />• θ = π/2: Equator (50/50 equal superposition)
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-raised/40 p-2.5 space-y-1">
                    <span className="font-semibold text-text-primary">Longitude ϕ (0 ≤ ϕ &lt; 2π):</span>
                    <p className="text-[11px] text-text-secondary">
                      Controls relative quantum phase around the Z-axis.
                      <br />• ϕ = 0: State |+⟩ along positive X-axis
                      <br />• ϕ = π: State |-⟩ along negative X-axis
                      <br />• ϕ = π/2: State |+i⟩ along positive Y-axis
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border-subtle/70 bg-surface-sunken/40 p-3 text-[11px] text-text-secondary">
                  <span className="font-semibold text-text-primary">Crucial Intuition:</span> Changes in longitude ϕ along
                  the equator preserve the 50/50 measurement probabilities, but encode relative phase that dictates how
                  states interfere under subsequent Hadamard or phase-sensitive rotations.
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="flex items-center justify-between border-t border-border-subtle bg-surface-raised/30 px-6 py-4">
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-evidence-success" />
            <span>Q-Trace Grounded Quantum Curriculum</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors cursor-pointer"
          >
            Dismiss Cheatsheet
          </button>
        </div>
      </div>
    </div>
  );
}
