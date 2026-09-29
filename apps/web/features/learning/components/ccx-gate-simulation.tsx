'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, RotateCcw, Sparkles, Check, ArrowRight, Lock, Unlock, KeyRound, Info } from 'lucide-react';

export function CcxGateSimulation() {
  const [q0, setQ0] = React.useState<0 | 1>(1);
  const [q1, setQ1] = React.useState<0 | 1>(0);
  const [q2, setQ2] = React.useState<0 | 1>(1);
  const [isOracleMode, setIsOracleMode] = React.useState<boolean>(true);

  // In Oracle Mode, target condition matches |101>: q0=1, q1=0, q2=1
  const isMatch = isOracleMode
    ? q0 === 1 && q1 === 0 && q2 === 1
    : q0 === 1 && q1 === 1;

  const targetFlipped = isOracleMode ? isMatch : q0 === 1 && q1 === 1;
  const outputQ2 = (q2 ^ (targetFlipped ? 1 : 0)) as 0 | 1;

  const currentInputBitstring = `${q0}${q1}${q2}`;
  const currentOutputBitstring = `${q0}${q1}${outputQ2}`;

  const truthTable = React.useMemo(() => {
    const rows = [];
    for (let c0 = 0; c0 <= 1; c0++) {
      for (let c1 = 0; c1 <= 1; c1++) {
        for (let t = 0; t <= 1; t++) {
          const fires = isOracleMode
            ? c0 === 1 && c1 === 0 && t === 1
            : c0 === 1 && c1 === 1;
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
      <CardHeader className="py-3.5 px-4 bg-surface-raised/40 border-b border-border-subtle flex flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle className="text-sm font-sans font-semibold text-text-primary flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-accent" />
            <span>The Quantum Lockbox: Toffoli (CCX) Gate Engine</span>
          </CardTitle>
          <CardDescription className="text-xs text-text-muted mt-0.5">
            How the oracle tests for the secret combination |101⟩ using multi-controlled quantum logic.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOracleMode(!isOracleMode)}
            className={`h-7 text-xs font-mono gap-1.5 ${
              isOracleMode ? 'bg-amber-500/10 border-amber-600/40 text-amber-700 font-bold' : 'text-text-secondary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOracleMode ? 'Target Lock: |101⟩' : 'Standard CCX (1-1-1)'}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ0(1);
              setQ1(0);
              setQ2(1);
              setIsOracleMode(true);
            }}
            className="h-7 px-2 text-xs text-text-muted hover:text-text-primary"
            title="Reset to winning state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Top: 3-Digit Tumbler Combination Lock UI */}
        <div className="p-4 rounded-xl border border-border-subtle bg-surface-sunken space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-text-primary">
              {isMatch ? (
                <Unlock className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-4 h-4 text-text-muted" />
              )}
              <span>COMBINATION LOCK STATUS:</span>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono font-bold ${
                isMatch
                  ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700'
                  : 'border-border-subtle text-text-muted'
              }`}
            >
              {isMatch ? '🔓 COMBINATION MATCHED! ORACLE FIRES' : '🔒 LOCKED (NO MATCH)'}
            </Badge>
          </div>

          {/* 3 Interactive Tumblers */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-border-subtle bg-surface text-center space-y-1.5">
              <span className="text-[10px] font-mono text-text-muted block">Qubit 0 (Wire q[0])</span>
              <button
                type="button"
                onClick={() => setQ0((prev) => (prev === 0 ? 1 : 0))}
                className={`w-full py-2 rounded-lg font-mono text-base font-bold transition-all cursor-pointer ${
                  q0 === 1 ? 'bg-accent text-white shadow-xs' : 'bg-surface-raised text-text-muted'
                }`}
                data-testid="toggle-q0"
              >
                |{q0}⟩
              </button>
              <span className="text-[10px] font-mono text-text-secondary">Expected: 1</span>
            </div>

            <div className="p-3 rounded-lg border border-border-subtle bg-surface text-center space-y-1.5">
              <span className="text-[10px] font-mono text-text-muted block">Qubit 1 (Wire q[1])</span>
              <button
                type="button"
                onClick={() => setQ1((prev) => (prev === 0 ? 1 : 0))}
                className={`w-full py-2 rounded-lg font-mono text-base font-bold transition-all cursor-pointer ${
                  (isOracleMode ? q1 === 0 : q1 === 1)
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-surface-raised text-text-muted'
                }`}
                data-testid="toggle-q1"
              >
                |{q1}⟩
              </button>
              <span className="text-[10px] font-mono text-text-secondary">
                {isOracleMode ? 'Expected: 0 (X inverts)' : 'Expected: 1'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border-subtle bg-surface text-center space-y-1.5">
              <span className="text-[10px] font-mono text-text-muted block">Qubit 2 (Wire q[2])</span>
              <button
                type="button"
                onClick={() => setQ2((prev) => (prev === 0 ? 1 : 0))}
                className={`w-full py-2 rounded-lg font-mono text-base font-bold transition-all cursor-pointer ${
                  q2 === 1 ? 'bg-accent text-white shadow-xs' : 'bg-surface-raised text-text-muted'
                }`}
                data-testid="toggle-q2"
              >
                |{q2}⟩
              </button>
              <span className="text-[10px] font-mono text-text-secondary">Expected: 1</span>
            </div>
          </div>
        </div>

        {/* Middle: Interactive Wire Circuit Display */}
        <div className="rounded-xl border border-border-subtle bg-surface-raised/30 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Live Quantum Gate Execution</span>
            <span className="flex items-center gap-1.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isMatch ? 'bg-emerald-500 animate-pulse' : 'bg-text-muted/40'
                }`}
              />
              <span className={isMatch ? 'text-emerald-600 font-semibold' : 'text-text-muted'}>
                {isMatch ? 'PHASE KICKBACK FIRED (-1 FLIP)' : 'ORACLE PASSIVE (NO INTERACTION)'}
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
                    <span className="px-1.5 py-0.5 bg-surface border border-accent text-accent font-bold rounded text-[10px] shadow-xs">
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
                    <span className="px-1.5 py-0.5 bg-surface border border-accent text-accent font-bold rounded text-[10px] shadow-xs">
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
                      isMatch
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
                  isMatch ? 'text-emerald-600 font-bold' : 'text-text-primary'
                }`}
              >
                |{outputQ2}⟩
              </span>
            </div>
          </div>

          {/* Current State Mapping Indicator */}
          <div className="p-3 rounded-lg border border-border-subtle bg-surface flex items-center justify-between font-mono text-xs">
            <span className="text-text-muted">Active Combination:</span>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-text-primary">|{currentInputBitstring}⟩</span>
              <ArrowRight className="w-3.5 h-3.5 text-accent" />
              <span className={isMatch ? 'text-emerald-600' : 'text-text-primary'}>
                {isMatch ? `(-1) · |${currentInputBitstring}⟩` : `(+1) · |${currentInputBitstring}⟩`}
              </span>
            </div>
          </div>
        </div>

        {/* Phase Kickback Plain-English Callout */}
        <div className="p-3.5 rounded-lg border border-accent/20 bg-accent/5 flex items-start gap-3 text-xs leading-relaxed">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-sans font-semibold text-text-primary block">
              The "Phase Kickback" Trick Explained
            </span>
            <p className="text-text-secondary">
              Normally, a CCX gate flips the target qubit from 0 to 1. But in Grover’s algorithm, the target qubit is initialized in the minus state <code className="font-mono">|-⟩ = (|0⟩ - |1⟩)/√2</code>.
              When the NOT gate flips <code className="font-mono">|0⟩ ↔ |1⟩</code>, the state becomes <code className="font-mono">-(|0⟩ - |1⟩)/√2</code>.
              The minus sign is literally <strong>"kicked back"</strong> to the entire control state <code className="font-mono font-bold text-accent">|101⟩</code>!
            </p>
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
                      <span>Winner Tagged!</span>
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
