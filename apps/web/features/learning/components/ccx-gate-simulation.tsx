'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, RotateCcw, Sparkles, Check, ArrowRight } from 'lucide-react';

export function CcxGateSimulation() {
  const [q0, setQ0] = React.useState<0 | 1>(1);
  const [q1, setQ1] = React.useState<0 | 1>(1);
  const [q2, setQ2] = React.useState<0 | 1>(0);
  const [isOracleMode, setIsOracleMode] = React.useState<boolean>(false);

  // CCX logic: target (q2) flips if and only if both controls (q0 and q1) are 1
  const targetFlipped = q0 === 1 && (isOracleMode ? q1 === 0 : q1 === 1);
  const outputQ2 = (q2 ^ (targetFlipped ? 1 : 0)) as 0 | 1;

  const currentInputBitstring = `${q0}${q1}${q2}`;
  const currentOutputBitstring = `${q0}${q1}${outputQ2}`;

  const truthTable = React.useMemo(() => {
    const rows = [];
    for (let c0 = 0; c0 <= 1; c0++) {
      for (let c1 = 0; c1 <= 1; c1++) {
        for (let t = 0; t <= 1; t++) {
          const fires = c0 === 1 && (isOracleMode ? c1 === 0 : c1 === 1);
          const outT = t ^ (fires ? 1 : 0);
          rows.push({
            c0,
            c1,
            t,
            outT,
            inState: `|${c0}${c1}${t}⟩`,
            outState: `|${c0}${c1}${outT}⟩`,
            isFlipped: fires,
          });
        }
      }
    }
    return rows;
  }, [isOracleMode]);

  return (
    <Card className="border border-border-subtle bg-surface shadow-xs overflow-hidden" data-testid="ccx-simulation-card">
      <CardHeader className="py-3.5 px-4 bg-surface-raised/40 border-b border-border-subtle flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-sans font-semibold text-text-primary flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent" />
            <span>Toffoli (CCX) Gate Interactive Simulator</span>
          </CardTitle>
          <CardDescription className="text-xs text-text-muted mt-0.5">
            Test the quantum 3-qubit AND gate and see when the target qubit flips.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOracleMode(!isOracleMode)}
            className={`h-7 text-xs font-mono gap-1.5 ${
              isOracleMode ? 'bg-accent/10 border-accent/40 text-accent font-semibold' : 'text-text-secondary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOracleMode ? 'Mode: Oracle |101⟩' : 'Mode: Standard CCX'}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ0(1);
              setQ1(1);
              setQ2(0);
              setIsOracleMode(false);
            }}
            className="h-7 px-2 text-xs text-text-muted hover:text-text-primary"
            title="Reset to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Top: Switch Controls & Live Wire Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Input Switches */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider">
              Input Register States
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border-subtle bg-surface-raised/50">
                <span className="font-mono text-xs text-text-primary font-medium">Control 0 (q[0])</span>
                <button
                  type="button"
                  onClick={() => setQ0((prev) => (prev === 0 ? 1 : 0))}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                    q0 === 1 ? 'bg-accent text-white' : 'bg-surface-active text-text-secondary'
                  }`}
                  data-testid="toggle-q0"
                >
                  |{q0}⟩
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border-subtle bg-surface-raised/50">
                <span className="font-mono text-xs text-text-primary font-medium">Control 1 (q[1])</span>
                <button
                  type="button"
                  onClick={() => setQ1((prev) => (prev === 0 ? 1 : 0))}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                    q1 === 1 ? 'bg-accent text-white' : 'bg-surface-active text-text-secondary'
                  }`}
                  data-testid="toggle-q1"
                >
                  |{q1}⟩
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border-subtle bg-surface-raised/50">
                <span className="font-mono text-xs text-text-primary font-medium">Target (q[2])</span>
                <button
                  type="button"
                  onClick={() => setQ2((prev) => (prev === 0 ? 1 : 0))}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                    q2 === 1 ? 'bg-accent text-white' : 'bg-surface-active text-text-secondary'
                  }`}
                  data-testid="toggle-q2"
                >
                  |{q2}⟩
                </button>
              </div>
            </div>

            <div className="text-[11px] font-sans text-text-muted leading-relaxed">
              {isOracleMode ? (
                <span>
                  <strong>Oracle Mode:</strong> An inverter (X gate) on q[1] causes CCX to trigger when input matches{' '}
                  <code className="text-accent font-mono font-bold">|101⟩</code>.
                </span>
              ) : (
                <span>
                  CCX flips the target qubit <code className="font-mono">q[2]</code> only when{' '}
                  <strong>both</strong> <code className="font-mono">q[0]=1</code> and{' '}
                  <code className="font-mono">q[1]=1</code>.
                </span>
              )}
            </div>
          </div>

          {/* Middle: Interactive Wire Circuit Display */}
          <div className="lg:col-span-8 rounded-xl border border-border-subtle bg-surface-raised/30 p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-text-muted">
              <span>Circuit Execution Canvas</span>
              <span className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    targetFlipped ? 'bg-emerald-500 animate-pulse' : 'bg-text-muted/40'
                  }`}
                />
                <span className={targetFlipped ? 'text-emerald-600 font-semibold' : 'text-text-muted'}>
                  {targetFlipped ? 'GATE FIRED (TARGET INVERTED)' : 'GATE IDLE (NO FLIP)'}
                </span>
              </span>
            </div>

            <div className="space-y-6 py-2 px-2 font-mono text-xs">
              {/* Wire 0 */}
              <div className="flex items-center gap-3">
                <span className="w-12 font-semibold text-accent">q[0]: |{q0}⟩</span>
                <div className="relative flex-1 h-0.5 bg-border-strong">
                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span
                      className={`inline-block w-3.5 h-3.5 rounded-full transition-transform ${
                        q0 === 1 ? 'bg-accent ring-2 ring-accent/30 scale-110' : 'bg-border-strong'
                      }`}
                    />
                  </div>
                </div>
                <span className="w-12 text-right font-semibold text-text-primary">|{q0}⟩</span>
              </div>

              {/* Wire 1 */}
              <div className="flex items-center gap-3">
                <span className="w-12 font-semibold text-accent">q[1]: |{q1}⟩</span>
                <div className="relative flex-1 h-0.5 bg-border-strong">
                  {/* Vertical connector line */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-6 bottom-[-24px] w-0.5 bg-accent/60" />

                  {isOracleMode && (
                    <div className="absolute left-1/4 -translate-x-1/2 -translate-y-1/2">
                      <span className="px-1.5 py-0.5 bg-surface border border-accent text-accent font-bold rounded text-[10px]">
                        X
                      </span>
                    </div>
                  )}

                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span
                      className={`inline-block w-3.5 h-3.5 rounded-full transition-transform ${
                        (isOracleMode ? q1 === 0 : q1 === 1)
                          ? 'bg-accent ring-2 ring-accent/30 scale-110'
                          : 'bg-border-strong'
                      }`}
                    />
                  </div>

                  {isOracleMode && (
                    <div className="absolute right-1/4 translate-x-1/2 -translate-y-1/2">
                      <span className="px-1.5 py-0.5 bg-surface border border-accent text-accent font-bold rounded text-[10px]">
                        X
                      </span>
                    </div>
                  )}
                </div>
                <span className="w-12 text-right font-semibold text-text-primary">|{q1}⟩</span>
              </div>

              {/* Wire 2 */}
              <div className="flex items-center gap-3">
                <span className="w-12 font-semibold text-accent">q[2]: |{q2}⟩</span>
                <div className="relative flex-1 h-0.5 bg-border-strong">
                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-xs border transition-colors ${
                        targetFlipped
                          ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500/30'
                          : 'bg-surface text-text-secondary border-border-strong'
                      }`}
                    >
                      ⊕
                    </span>
                  </div>
                </div>
                <span
                  className={`w-12 text-right font-semibold ${
                    targetFlipped ? 'text-emerald-600 font-bold' : 'text-text-primary'
                  }`}
                >
                  |{outputQ2}⟩
                </span>
              </div>
            </div>

            {/* In/Out Bitstring Result Banner */}
            <div className="p-3 rounded-lg border border-border-subtle bg-surface flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">Quantum State Mapping:</span>
              <div className="flex items-center gap-2 font-bold">
                <span className="text-text-primary">|{currentInputBitstring}⟩</span>
                <ArrowRight className="w-3.5 h-3.5 text-accent" />
                <span className={targetFlipped ? 'text-emerald-600' : 'text-text-primary'}>
                  |{currentOutputBitstring}⟩
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Synchronized 8-Row Truth Table */}
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs">
            <span className="font-sans font-semibold text-text-secondary uppercase tracking-wider">
              {isOracleMode ? 'Oracle |101⟩ Truth Table' : 'Full 3-Qubit CCX Truth Table'}
            </span>
            <span className="font-mono text-[11px] text-text-muted">Highlighting current state</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            {truthTable.map((row, idx) => {
              const isCurrent = row.c0 === q0 && row.c1 === q1 && row.t === q2;
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border transition-all ${
                    isCurrent
                      ? 'border-accent bg-accent/10 shadow-xs ring-1 ring-accent'
                      : 'border-border-subtle bg-surface-raised/40 text-text-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isCurrent ? 'text-accent' : 'text-text-primary'}`}>
                      {row.inState}
                    </span>
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                    <span
                      className={`font-semibold ${
                        row.isFlipped ? 'text-emerald-600 font-bold' : isCurrent ? 'text-text-primary' : ''
                      }`}
                    >
                      {row.outState}
                    </span>
                  </div>
                  {row.isFlipped && (
                    <div className="text-[10px] text-emerald-600 font-sans mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Target Flipped</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
