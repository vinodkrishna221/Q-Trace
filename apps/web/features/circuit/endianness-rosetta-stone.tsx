'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, BookOpen, Binary, Sparkles, Check, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EndiannessRosettaStoneProps {
  activeEngines?: string[];
  qubitCount?: number;
  className?: string;
  onToggleNotation?: (notation: 'qiskit' | 'cirq') => void;
  currentNotation?: 'qiskit' | 'cirq';
}

export function EndiannessRosettaStone({
  activeEngines = ['Qiskit Aer', 'PennyLane', 'Cirq'],
  qubitCount = 2,
  className,
  onToggleNotation,
  currentNotation: controlledNotation,
}: EndiannessRosettaStoneProps) {
  const [internalNotation, setInternalNotation] = React.useState<'qiskit' | 'cirq'>('qiskit');
  const activeNotation = controlledNotation !== undefined ? controlledNotation : internalNotation;

  const handleToggleNotation = () => {
    const nextNotation = activeNotation === 'qiskit' ? 'cirq' : 'qiskit';
    setInternalNotation(nextNotation);
    onToggleNotation?.(nextNotation);
  };

  return (
    <Card
      className={cn(
        'border-border-subtle bg-surface shadow-xs overflow-hidden',
        className
      )}
      data-testid="endianness-rosetta-stone"
    >
      <div className="p-4 md:p-5 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 text-accent">
              <Binary className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-text-primary">
                  Endianness Rosetta Stone
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono text-accent border-accent/30">
                  MULTI-FRAMEWORK CONVENTION
                </Badge>
              </div>
              <p className="text-xs text-text-secondary">
                Comparing basis ordering between Little-Endian (Qiskit) and Big-Endian (Cirq / PennyLane)
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleNotation}
            data-testid="bit-order-toggle-btn"
            className="font-mono text-xs gap-1.5 border-border-subtle hover:bg-surface-raised"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-accent" />
            <span>
              Flip Notation:{' '}
              <strong className="text-text-primary" data-testid="rosetta-active-notation">
                {activeNotation === 'qiskit' ? 'Qiskit Little-Endian (|q₁q₀⟩)' : 'Cirq Big-Endian (|q₀q₁⟩)'}
              </strong>
            </span>
          </Button>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Qiskit Panel */}
          <div
            data-testid="rosetta-qiskit-mapping"
            className={cn(
              'p-3.5 rounded-lg border transition-all text-xs space-y-2.5',
              activeNotation === 'qiskit'
                ? 'border-accent/40 bg-accent/5 ring-1 ring-accent/20'
                : 'border-border-subtle bg-surface-raised/40'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Qiskit Aer</span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                Little-Endian (|q₁q₀⟩)
              </Badge>
            </div>

            <div className="space-y-1 font-mono text-[11px] bg-surface p-2.5 rounded border border-border-subtle/70">
              <div className="flex justify-between items-center text-text-secondary">
                <span>Basis format:</span>
                <span className="text-text-primary font-bold">|q₁q₀⟩ (q₀ is rightmost / LSB)</span>
              </div>
              <div className="flex justify-between items-center text-text-secondary">
                <span>Bell State |Φ⁺⟩:</span>
                <span className="text-accent font-semibold">|00⟩ = 50% &nbsp; |11⟩ = 50%</span>
              </div>
              <div className="flex justify-between items-center text-text-secondary">
                <span>Outcome |01⟩:</span>
                <span className="text-text-primary font-mono">q₀=1, q₁=0</span>
              </div>
            </div>

            <p className="text-[11px] text-text-secondary leading-relaxed">
              Qiskit positions qubit 0 at index 0 on the far right (like standard binary integers where bit 0 is the 2⁰ unit).
            </p>
          </div>

          {/* Cirq & PennyLane Panel */}
          <div
            data-testid="rosetta-cirq-mapping"
            className={cn(
              'p-3.5 rounded-lg border transition-all text-xs space-y-2.5',
              activeNotation === 'cirq'
                ? 'border-accent/40 bg-accent/5 ring-1 ring-accent/20'
                : 'border-border-subtle bg-surface-raised/40'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Google Cirq &amp; PennyLane</span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                Big-Endian (|q₀q₁⟩)
              </Badge>
            </div>

            <div className="space-y-1 font-mono text-[11px] bg-surface p-2.5 rounded border border-border-subtle/70">
              <div className="flex justify-between items-center text-text-secondary">
                <span>Basis format:</span>
                <span className="text-text-primary font-bold">|q₀q₁⟩ (q₀ is leftmost / MSB)</span>
              </div>
              <div className="flex justify-between items-center text-text-secondary">
                <span>Bell State |Φ⁺⟩:</span>
                <span className="text-emerald-700 font-semibold">|00⟩ = 50% &nbsp; |11⟩ = 50% (identical)</span>
              </div>
              <div className="flex justify-between items-center text-text-secondary">
                <span>Outcome |10⟩:</span>
                <span className="text-text-primary font-mono">q₀=1, q₁=0 (same state!)</span>
              </div>
            </div>

            <p className="text-[11px] text-text-secondary leading-relaxed">
              Cirq &amp; PennyLane write qubits in register order: qubit 0 first, qubit 1 second. The physical state is identical!
            </p>
          </div>
        </div>

        {/* Translation Table */}
        <div className="rounded-lg border border-border-subtle bg-surface-raised/30 p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-primary flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-accent" />
              <span>Computational Basis State Translation Matrix</span>
            </span>
            <span className="text-[10px] font-mono text-text-tertiary">
              2-Qubit Permutation Symmetry
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-center">
            <div className="p-2 rounded bg-surface border border-border-subtle">
              <div className="text-[10px] text-text-tertiary">Qiskit |00⟩</div>
              <div className="text-text-primary font-bold">↕ |00⟩</div>
              <div className="text-[10px] text-emerald-600">Cirq |00⟩</div>
            </div>
            <div className="p-2 rounded bg-surface border border-border-subtle">
              <div className="text-[10px] text-text-tertiary">Qiskit |01⟩</div>
              <div className="text-text-primary font-bold">↕ |10⟩</div>
              <div className="text-[10px] text-emerald-600">Cirq |10⟩</div>
            </div>
            <div className="p-2 rounded bg-surface border border-border-subtle">
              <div className="text-[10px] text-text-tertiary">Qiskit |10⟩</div>
              <div className="text-text-primary font-bold">↕ |01⟩</div>
              <div className="text-[10px] text-emerald-600">Cirq |01⟩</div>
            </div>
            <div className="p-2 rounded bg-surface border border-border-subtle">
              <div className="text-[10px] text-text-tertiary">Qiskit |11⟩</div>
              <div className="text-text-primary font-bold">↕ |11⟩</div>
              <div className="text-[10px] text-emerald-600">Cirq |11⟩</div>
            </div>
          </div>

          <p className="text-[11px] text-text-secondary leading-snug pt-1">
            <strong>Key Insight:</strong> For symmetric entangled states like |Φ⁺⟩ = (|00⟩ + |11⟩)/√2, both conventions produce identical basis strings. For asymmetric states, Q-Trace automatically normalizes statevectors so evidence remains mathematically consistent across engines.
          </p>
        </div>
      </div>
    </Card>
  );
}
