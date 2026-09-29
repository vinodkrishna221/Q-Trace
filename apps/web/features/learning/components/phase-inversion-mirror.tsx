'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw, Eye, Info, AlertCircle } from 'lucide-react';

export function PhaseInversionMirror() {
  const [markedTarget, setMarkedTarget] = React.useState<string>('101');
  const [isOracleApplied, setIsOracleApplied] = React.useState<boolean>(false);

  const basisStates = ['000', '001', '010', '011', '100', '101', '110', '111'];

  // Equal superposition initial amplitude: 1 / sqrt(8) ≈ 0.3536
  const initialAmp = 1 / Math.sqrt(8);

  const amplitudes = React.useMemo(() => {
    return basisStates.map((state) => {
      const isMarked = state === markedTarget;
      const signedAmp = isOracleApplied && isMarked ? -initialAmp : initialAmp;
      return {
        state,
        isMarked,
        amplitude: signedAmp,
        probability: Math.pow(signedAmp, 2),
      };
    });
  }, [markedTarget, isOracleApplied]);

  // Compute average amplitude: sum(amplitudes) / 8
  const meanAmplitude = React.useMemo(() => {
    const sum = amplitudes.reduce((acc, curr) => acc + curr.amplitude, 0);
    return sum / amplitudes.length;
  }, [amplitudes]);

  // Convert amplitude (-0.4 to +0.4) to percentage height for bar display
  const maxAbsAmp = 0.5;

  return (
    <Card className="border border-border-subtle bg-surface shadow-xs overflow-hidden" data-testid="phase-inversion-mirror-card">
      <CardHeader className="py-3.5 px-4 bg-surface-raised/40 border-b border-border-subtle flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-sans font-semibold text-text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>The Phase Oracle: Signed Amplitude Mirror</span>
          </CardTitle>
          <CardDescription className="text-xs text-text-muted mt-0.5">
            Marking the target state with a phase inversion without collapsing the superposition.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsOracleApplied(!isOracleApplied)}
            className={`h-7 text-xs font-mono gap-1.5 ${
              isOracleApplied
                ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold'
                : 'bg-accent hover:bg-accent/90 text-white'
            }`}
            data-testid="toggle-oracle-btn"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOracleApplied ? 'Undo Oracle' : 'Apply Oracle U_ω'}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOracleApplied(false);
              setMarkedTarget('101');
            }}
            className="h-7 px-2 text-xs text-text-muted hover:text-text-primary"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Top Control Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans text-text-secondary">Marked Target:</span>
            <div className="flex items-center gap-1">
              {['101', '011', '110'].map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setMarkedTarget(target)}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    markedTarget === target
                      ? 'bg-accent text-white'
                      : 'bg-surface-raised border border-border-subtle text-text-muted hover:text-text-primary'
                  }`}
                >
                  |{target}⟩
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-text-muted">
              Mean Amplitude (<span className="text-accent font-bold">ᾱ</span>):{' '}
              <strong className="text-text-primary">{meanAmplitude.toFixed(3)}</strong>
            </span>
            <span className="text-text-muted">
              Target Phase:{' '}
              <strong className={isOracleApplied ? 'text-amber-600' : 'text-emerald-600'}>
                {isOracleApplied ? '-1 (Inverted)' : '+1 (Normal)'}
              </strong>
            </span>
          </div>
        </div>

        {/* Amplitude Chart with Center Zero Axis */}
        <div className="space-y-2">
          <div className="relative h-64 w-full bg-surface-raised/40 rounded-xl border border-border-subtle p-4 flex flex-col justify-between overflow-hidden">
            {/* Y-Axis Labeling */}
            <div className="absolute left-2 inset-y-4 flex flex-col justify-between text-[10px] font-mono text-text-muted pointer-events-none z-10">
              <span>+0.50</span>
              <span>+0.25</span>
              <span>0.00</span>
              <span>-0.25</span>
              <span>-0.50</span>
            </div>

            {/* Zero Baseline */}
            <div className="absolute left-10 right-4 top-1/2 -translate-y-1/2 h-px bg-border-strong z-0" />

            {/* Dynamic Average Line (ᾱ) */}
            <div
              className="absolute left-10 right-4 h-0.5 border-t-2 border-dashed border-accent/80 transition-all duration-500 z-10"
              style={{
                top: `${((maxAbsAmp - meanAmplitude) / (2 * maxAbsAmp)) * 100}%`,
              }}
            >
              <span className="absolute right-0 -top-4 text-[10px] font-mono text-accent font-bold bg-surface px-1 rounded border border-accent/30 shadow-xs">
                ᾱ = {meanAmplitude.toFixed(3)}
              </span>
            </div>

            {/* 8 Amplitude Bars */}
            <div className="ml-10 h-full flex items-center justify-around z-10">
              {amplitudes.map((item) => {
                const isMarked = item.isMarked;
                const isNegative = item.amplitude < 0;
                const barHeightPercent = (Math.abs(item.amplitude) / maxAbsAmp) * 50;

                return (
                  <div key={item.state} className="flex flex-col items-center h-full justify-center w-10 relative">
                    {/* Top half (positive) */}
                    <div className="h-1/2 w-full flex flex-col justify-end items-center">
                      {!isNegative && (
                        <div
                          className={`w-6 rounded-t transition-all duration-500 flex items-start justify-center ${
                            isMarked
                              ? 'bg-accent/80 border-t-2 border-x-2 border-accent'
                              : 'bg-text-secondary/30 hover:bg-text-secondary/50'
                          }`}
                          style={{ height: `${barHeightPercent * 2}%` }}
                        >
                          <span className="text-[9px] font-mono text-text-primary -mt-3.5 font-semibold">
                            {item.amplitude.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom half (negative) */}
                    <div className="h-1/2 w-full flex flex-col justify-start items-center">
                      {isNegative && (
                        <div
                          className="w-6 rounded-b bg-amber-500/80 border-b-2 border-x-2 border-amber-600 transition-all duration-500 flex items-end justify-center shadow-xs"
                          style={{ height: `${barHeightPercent * 2}%` }}
                        >
                          <span className="text-[9px] font-mono text-amber-700 -mb-3.5 font-bold">
                            {item.amplitude.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* State Label */}
                    <div className="absolute bottom-[-18px] text-[10px] font-mono text-text-primary font-bold">
                      |{item.state}⟩
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Deep Conceptual Callout */}
        <div className="p-3.5 rounded-lg border border-border-subtle bg-surface-raised/60 flex items-start gap-3 text-xs leading-relaxed">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-sans font-semibold text-text-primary block">
              The Invisible Phase Tag (Measurement Invariance)
            </span>
            <p className="text-text-secondary">
              Notice that even after the oracle flips <code className="font-mono font-bold text-accent">|{markedTarget}⟩</code> to{' '}
              <code className="font-mono text-amber-600 font-bold">-0.354</code>, the probability{' '}
              <code className="font-mono">P = |-0.354|² = 12.5%</code> remains identical to all other states! Measuring the circuit
              at this stage would still yield completely random bitstrings.
            </p>
            <p className="text-text-muted text-[11px]">
              The oracle does not pull the answer out — it merely lowers the average line <code className="font-mono text-accent">ᾱ</code>{' '}
              so the upcoming Diffusion reflection can launch the marked state into dominant visibility.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
