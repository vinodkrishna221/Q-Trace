'use client';

import * as React from 'react';
import { SimulationRun } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Activity, ShieldCheck, CheckCircle2, Info, Layers, Eye, Table as TableIcon } from 'lucide-react';
import { BlochSphereView } from './bloch-sphere-view';

interface ProbabilityHistogramViewProps {
  simulationRun: SimulationRun;
  disablePlotly?: boolean;
}

export function ProbabilityHistogramView({
  simulationRun,
  disablePlotly = false,
}: ProbabilityHistogramViewProps) {
  const { probabilities, counts, shots, adapter, conformance, durationMs, stateTrace } = simulationRun;
  const [forceStaticFallback, setForceStaticFallback] = React.useState<boolean>(disablePlotly);

  React.useEffect(() => {
    if (disablePlotly) {
      setForceStaticFallback(true);
    }
  }, [disablePlotly]);

  // Last step of state trace for reduced qubits
  const latestTraceStep = stateTrace && stateTrace.length > 0
    ? stateTrace[stateTrace.length - 1]
    : null;

  const reducedQubits = latestTraceStep?.reducedQubits || [
    { qubit: 0, bloch: { x: 0.0, y: 0.0, z: 0.0 }, purity: 0.5, label: 'MIXED_SUBSYSTEM' as const },
    { qubit: 1, bloch: { x: 0.0, y: 0.0, z: 0.0 }, purity: 0.5, label: 'MIXED_SUBSYSTEM' as const },
  ];

  // All known 2-qubit basis states
  const basisKeys = ['00', '01', '10', '11'];

  return (
    <div className="space-y-6" data-testid="visual-evidence-suite">
      <Card
        className="border-line bg-panel shadow-xl overflow-hidden"
        data-testid="visual-evidence-card"
      >
        <CardHeader className="pb-3 border-b border-line bg-raised/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-mono">
                STEP 3 · VISUAL EVIDENCE
              </Badge>
              <Badge
                variant="outline"
                data-testid="simulation-status-badge"
                className="text-xs font-mono text-evidence border-evidence/40 bg-evidence/10 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                {simulationRun.status} ({adapter})
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-ink-faint">
                {shots} shots · {durationMs}ms latency
              </span>

              <button
                type="button"
                data-testid="toggle-histogram-mode"
                aria-pressed={forceStaticFallback}
                onClick={() => setForceStaticFallback(!forceStaticFallback)}
                className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded bg-raised border border-line hover:border-line-bright text-ink-dim hover:text-ink transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {forceStaticFallback ? (
                  <>
                    <Layers className="w-3 h-3 text-accent" />
                    <span>Mode: Static Fallback (Active)</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 text-evidence" />
                    <span>Mode: Dynamic Render</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <CardTitle className="text-base text-ink flex items-center gap-2 mt-1">
            <BarChart3 className="w-4 h-4 text-evidence" />
            <span>State Probabilities & Measurement Histogram</span>
          </CardTitle>
          <CardDescription className="text-xs text-ink-dim">
            Comparing verified ideal state amplitudes with sampled measurement statistics.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Panel 1: Ideal State Probabilities */}
            <div className="rounded-lg border border-line bg-abyss p-4 space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-accent" />
                  Ideal Basis Probabilities P(|ψ⟩)
                </span>
                <span className="text-[10px] text-ink-faint">Exact Statevector</span>
              </div>

              <div className="space-y-3">
                {basisKeys.map((basis) => {
                  const prob = probabilities[basis] ?? 0;
                  const percent = (prob * 100).toFixed(1);
                  const isPresent = prob > 0.001;

                  return (
                    <div
                      key={basis}
                      className={`space-y-1 ${isPresent ? '' : 'opacity-50'}`}
                      data-testid={`basis-prob-${basis}`}
                    >
                      <div className="flex justify-between text-xs">
                        <span className={`font-bold ${isPresent ? 'text-accent' : 'text-ink-dim'}`}>
                          |{basis}⟩
                        </span>
                        <span className="text-ink-dim font-mono">
                          {percent}% (P = {prob.toFixed(3)})
                        </span>
                      </div>
                      <div className="w-full h-4 bg-raised rounded overflow-hidden border border-line">
                        <div
                          className={`h-full rounded transition-all duration-500 ${
                            isPresent ? 'bg-accent shadow-glow' : 'bg-line-bright'
                          }`}
                          style={{ width: `${Math.max(prob * 100, 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel 2: Sampled Measurement Counts */}
            <div className="rounded-lg border border-line bg-abyss p-4 space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-evidence" />
                  Sampled Measurement Histogram
                </span>
                <span className="text-[10px] text-ink-faint">{shots} Shots</span>
              </div>

              <div className="space-y-3">
                {basisKeys.map((basis) => {
                  const count = counts[basis] ?? 0;
                  const percent = shots > 0 ? ((count / shots) * 100).toFixed(1) : '0.0';
                  const isPresent = count > 0;

                  return (
                    <div
                      key={basis}
                      className={`space-y-1 ${isPresent ? '' : 'opacity-50'}`}
                      data-testid={`count-${basis}`}
                    >
                      <div className="flex justify-between text-xs">
                        <span className={`font-bold ${isPresent ? 'text-evidence' : 'text-ink-dim'}`}>
                          &apos;{basis}&apos;
                        </span>
                        <span className="text-ink-dim font-mono">
                          {count} counts ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-4 bg-raised rounded overflow-hidden border border-line">
                        <div
                          className={`h-full rounded transition-all duration-500 ${
                            isPresent ? 'bg-evidence shadow-glow' : 'bg-line-bright'
                          }`}
                          style={{ width: `${Math.max(shots > 0 ? (count / shots) * 100 : 0, 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Static Table Fallback View (Rendered when forceStaticFallback is active or as complementary data) */}
          {forceStaticFallback && (
            <div
              className="rounded-lg border border-line bg-abyss/90 p-4 space-y-3 font-mono text-xs"
              data-testid="static-evidence-table"
            >
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-bold text-ink flex items-center gap-1.5">
                  <TableIcon className="w-3.5 h-3.5 text-accent" />
                  <span>State Evidence Data Table (Static Fallback)</span>
                </span>
                <span className="text-[10px] text-ink-faint">Aer Statevector + 1024 Shot Counts</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" aria-label="Quantum State Evidence Data Table">
                  <caption className="sr-only">Quantum State Basis Probabilities and Measurement Counts</caption>
                  <thead>
                    <tr className="border-b border-line text-ink-dim text-[11px]">
                      <th scope="col" className="py-2 px-2.5 font-semibold">Basis State |ψ⟩</th>
                      <th scope="col" className="py-2 px-2.5 font-semibold">Ideal Probability P</th>
                      <th scope="col" className="py-2 px-2.5 font-semibold">Sampled Counts</th>
                      <th scope="col" className="py-2 px-2.5 font-semibold">Empirical %</th>
                      <th scope="col" className="py-2 px-2.5 font-semibold">Correlation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40 text-xs">
                    {basisKeys.map((k) => {
                      const p = probabilities[k] ?? 0;
                      const c = counts[k] ?? 0;
                      const emp = shots > 0 ? ((c / shots) * 100).toFixed(1) : '0.0';
                      const isSupport = p > 0.001;

                      return (
                        <tr key={k} className={isSupport ? 'bg-accent/5' : 'opacity-60'}>
                          <th scope="row" className="py-2 px-2.5 font-bold text-ink">|{k}⟩</th>
                          <td className="py-2 px-2.5 text-accent font-semibold">{p.toFixed(4)}</td>
                          <td className="py-2 px-2.5 text-evidence font-medium">{c}</td>
                          <td className="py-2 px-2.5 text-ink-dim">{emp}%</td>
                          <td className="py-2 px-2.5">
                            {isSupport ? (
                              <Badge variant="outline" className="text-[9px] font-mono text-accent border-accent/40">
                                ACTIVE SUPPORT
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-ink-faint font-mono">ZERO PROBABILITY</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-raised/40 p-4 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-ink-dim">
            <Info className="w-3.5 h-3.5 text-accent" />
            <span className="italic">
              Mathematical representation, not physical trajectory.
            </span>
          </div>

          {conformance && (
            <Badge
              variant="outline"
              data-testid="conformance-badge"
              className="text-[11px] font-mono text-evidence bg-evidence/10 border-evidence/40 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-evidence" />
              <span>
                {conformance.adapter} Conformance: {conformance.passed ? 'PASS' : 'FAIL'} (Δ = {conformance.maxProbabilityDelta})
              </span>
            </Badge>
          )}
        </CardFooter>
      </Card>

      {/* Reduced-Qubit Bloch Subsystem Representation (Separate Panel with Separate Labels) */}
      <BlochSphereView
        reducedQubits={reducedQubits}
        stepLabel={latestTraceStep?.label || 'Final State'}
        disablePlotly={forceStaticFallback}
      />
    </div>
  );
}
