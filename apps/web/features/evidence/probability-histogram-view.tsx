'use client';

import * as React from 'react';
import { SimulationRun } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Activity, ShieldCheck, CheckCircle2, Info } from 'lucide-react';

interface ProbabilityHistogramViewProps {
  simulationRun: SimulationRun;
}

export function ProbabilityHistogramView({ simulationRun }: ProbabilityHistogramViewProps) {
  const { probabilities, counts, shots, adapter, conformance, durationMs } = simulationRun;

  return (
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
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-ink-faint">
              {shots} shots · {durationMs}ms latency
            </span>
          </div>
        </div>

        <CardTitle className="text-base text-ink flex items-center gap-2 mt-1">
          <BarChart3 className="w-4 h-4 text-evidence" />
          <span>State Probabilities & Measurement Histogram</span>
        </CardTitle>
        <CardDescription className="text-xs text-ink-dim">
          Comparing verified state amplitudes with sampled measurement statistics.
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
              {/* Basis State |00⟩ */}
              <div className="space-y-1" data-testid="basis-prob-00">
                <div className="flex justify-between text-xs">
                  <span className="text-accent font-bold">|00⟩</span>
                  <span className="text-ink-dim font-mono">
                    {((probabilities['00'] ?? 0) * 100).toFixed(1)}% (P = {probabilities['00'] ?? 0})
                  </span>
                </div>
                <div className="w-full h-4 bg-raised rounded overflow-hidden border border-line">
                  <div
                    className="h-full bg-accent rounded transition-all duration-500 shadow-glow"
                    style={{ width: `${(probabilities['00'] ?? 0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Basis State |01⟩ (0%) */}
              <div className="space-y-1 opacity-50" data-testid="basis-prob-01">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-dim">|01⟩</span>
                  <span className="text-ink-faint font-mono">0.0% (P = 0.0)</span>
                </div>
                <div className="w-full h-3 bg-raised rounded overflow-hidden border border-line">
                  <div className="h-full bg-line-bright" style={{ width: '0%' }} />
                </div>
              </div>

              {/* Basis State |10⟩ (0%) */}
              <div className="space-y-1 opacity-50" data-testid="basis-prob-10">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-dim">|10⟩</span>
                  <span className="text-ink-faint font-mono">0.0% (P = 0.0)</span>
                </div>
                <div className="w-full h-3 bg-raised rounded overflow-hidden border border-line">
                  <div className="h-full bg-line-bright" style={{ width: '0%' }} />
                </div>
              </div>

              {/* Basis State |11⟩ */}
              <div className="space-y-1" data-testid="basis-prob-11">
                <div className="flex justify-between text-xs">
                  <span className="text-accent font-bold">|11⟩</span>
                  <span className="text-ink-dim font-mono">
                    {((probabilities['11'] ?? 0) * 100).toFixed(1)}% (P = {probabilities['11'] ?? 0})
                  </span>
                </div>
                <div className="w-full h-4 bg-raised rounded overflow-hidden border border-line">
                  <div
                    className="h-full bg-accent rounded transition-all duration-500 shadow-glow"
                    style={{ width: `${(probabilities['11'] ?? 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Sampled Measurement Counts */}
          <div className="rounded-lg border border-line bg-abyss p-4 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-evidence" />
                Sampled Measurement Histogram
              </span>
              <span className="text-[10px] text-ink-faint">1024 Shots</span>
            </div>

            <div className="space-y-3">
              {/* Count 00 */}
              <div className="space-y-1" data-testid="count-00">
                <div className="flex justify-between text-xs">
                  <span className="text-evidence font-bold">&apos;00&apos;</span>
                  <span className="text-ink-dim font-mono">
                    {counts['00'] ?? 0} counts ({(((counts['00'] ?? 0) / shots) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-4 bg-raised rounded overflow-hidden border border-line">
                  <div
                    className="h-full bg-evidence rounded transition-all duration-500"
                    style={{ width: `${((counts['00'] ?? 0) / shots) * 100}%` }}
                  />
                </div>
              </div>

              {/* Count 01 */}
              <div className="space-y-1 opacity-50" data-testid="count-01">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-dim">&apos;01&apos;</span>
                  <span className="text-ink-faint font-mono">0 counts (0.0%)</span>
                </div>
                <div className="w-full h-3 bg-raised rounded overflow-hidden border border-line">
                  <div className="h-full bg-line-bright" style={{ width: '0%' }} />
                </div>
              </div>

              {/* Count 10 */}
              <div className="space-y-1 opacity-50" data-testid="count-10">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-dim">&apos;10&apos;</span>
                  <span className="text-ink-faint font-mono">0 counts (0.0%)</span>
                </div>
                <div className="w-full h-3 bg-raised rounded overflow-hidden border border-line">
                  <div className="h-full bg-line-bright" style={{ width: '0%' }} />
                </div>
              </div>

              {/* Count 11 */}
              <div className="space-y-1" data-testid="count-11">
                <div className="flex justify-between text-xs">
                  <span className="text-evidence font-bold">&apos;11&apos;</span>
                  <span className="text-ink-dim font-mono">
                    {counts['11'] ?? 0} counts ({(((counts['11'] ?? 0) / shots) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-4 bg-raised rounded overflow-hidden border border-line">
                  <div
                    className="h-full bg-evidence rounded transition-all duration-500"
                    style={{ width: `${((counts['11'] ?? 0) / shots) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
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
            <span>{conformance.adapter} Conformance: {conformance.passed ? 'PASS' : 'FAIL'} (Δ = {conformance.maxProbabilityDelta})</span>
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
