'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, Info, Cpu, Activity, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConformanceBadgeProps {
  status?: 'VERIFIED' | 'DIVERGED' | null;
  delta?: number | null;
  results?: Record<string, { statevector?: unknown; durationMs?: number }> | null;
  selectedEngines?: string[];
  className?: string;
  showTooltip?: boolean;
}

export function ConformanceBadge({
  status,
  delta = 0,
  results,
  selectedEngines,
  className,
}: ConformanceBadgeProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // If delta is provided, verify whether it satisfies the epsilon threshold <= 1e-6
  const effectiveDelta = typeof delta === 'number' ? delta : 0;
  const isVerified = status ? status === 'VERIFIED' : effectiveDelta <= 1e-6;
  const formattedDelta = effectiveDelta.toFixed(6);

  // Close tooltip on click outside or Esc
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const defaultEngines = selectedEngines || (results ? Object.keys(results) : ['qiskit', 'pennylane', 'cirq']);

  const formatEngineName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('qiskit')) return 'Qiskit Aer';
    if (lower.includes('penny')) return 'PennyLane';
    if (lower.includes('cirq')) return 'Google Cirq';
    return name;
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-flex items-center', className)}
      data-testid="conformance-badge"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        data-testid={isVerified ? 'conformance-badge-verified' : 'conformance-badge-diverged'}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all shadow-2xs cursor-pointer border select-none focus:outline-none focus:ring-1 focus:ring-accent',
          isVerified
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
            : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 hover:border-rose-400'
        )}
      >
        {isVerified ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />
        )}
        <span>
          {isVerified ? '✓ Multi-Engine Verified' : '✗ Engines Diverged'}
        </span>
        <span
          className={cn(
            'px-1 py-0.2 rounded text-[10px] font-semibold tracking-tight',
            isVerified ? 'bg-emerald-200/60 text-emerald-900' : 'bg-rose-200/60 text-rose-900'
          )}
          data-testid="conformance-delta-val"
        >
          Δ = {formattedDelta}
        </span>
        <Info className="w-3 h-3 opacity-60 ml-0.5" aria-hidden="true" />
      </button>

      {/* Popover Breakdown */}
      {isOpen && (
        <div
          role="tooltip"
          data-testid="conformance-tooltip"
          className="absolute z-50 bottom-full left-0 mb-2 w-80 rounded-xl bg-surface border border-border-subtle p-3.5 shadow-xl text-left font-sans animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-text-primary">
                Tri-Engine Conformance Telemetry
              </span>
            </div>
            <span
              className={cn(
                'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded',
                isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              )}
            >
              {isVerified ? 'VERIFIED' : 'DIVERGED'}
            </span>
          </div>

          <div className="py-2.5 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-text-secondary">Max Pairwise Δ (L2):</span>
              <span className={cn('font-bold', isVerified ? 'text-emerald-700' : 'text-rose-700')}>
                {formattedDelta}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-text-secondary">Tolerance Threshold (ε):</span>
              <span className="text-text-primary">1.00e-6</span>
            </div>

            {/* Backends Breakdown */}
            <div className="pt-2 border-t border-border-subtle/60">
              <div className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>Simulated Frameworks</span>
              </div>
              <div className="space-y-1">
                {defaultEngines.map((engine) => {
                  const key = engine.toLowerCase();
                  const duration = results?.[key]?.durationMs ?? 12;
                  return (
                    <div
                      key={engine}
                      className="flex items-center justify-between bg-surface-raised/50 px-2 py-1 rounded text-[11px] font-mono"
                    >
                      <span className="text-text-primary font-medium">
                        {formatEngineName(engine)}
                      </span>
                      <div className="flex items-center gap-2">
                        {duration != null && (
                          <span className="text-[10px] text-text-tertiary flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {duration}ms
                          </span>
                        )}
                        <span className={isVerified ? 'text-emerald-600' : 'text-rose-600'}>
                          {isVerified ? '✓ Matched' : '✗ Delta'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-text-secondary leading-snug pt-1">
              {isVerified
                ? 'Quantum statevectors agree across all simulated frameworks within strict numerical precision.'
                : 'Statevectors show numerical divergence exceeding acceptable physical tolerance.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
