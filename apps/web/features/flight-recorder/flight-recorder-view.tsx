'use client';

import * as React from 'react';
import { DiagnoseResponse, StateTraceStep } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, AlertOctagon, Compass, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface FlightRecorderViewProps {
  diagnosis: DiagnoseResponse;
  stateTrace: StateTraceStep[];
  onSelectStep?: (stepIndex: number) => void;
}

export function FlightRecorderView({
  diagnosis,
  stateTrace,
  onSelectStep,
}: FlightRecorderViewProps) {
  const { misconceptionSignal, replay } = diagnosis;
  const [activeStepIndex, setActiveStepIndex] = React.useState<number>(
    misconceptionSignal.firstDivergenceStep ?? 1
  );

  const handleStepClick = (stepIndex: number) => {
    setActiveStepIndex(stepIndex);
    if (onSelectStep) {
      onSelectStep(stepIndex);
    }
  };

  const currentTraceStep = stateTrace.find((s) => s.stepIndex === activeStepIndex) ?? stateTrace[0];
  const currentReplay = replay.find((r) => r.stepIndex === activeStepIndex);

  return (
    <Card
      className="border-line bg-panel shadow-2xl overflow-hidden"
      data-testid="flight-recorder-card"
    >
      <CardHeader className="pb-3 border-b border-line bg-raised/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs font-mono">
              STEP 4 · QUANTUM FLIGHT RECORDER
            </Badge>
            <Badge variant="outline" className="text-xs font-mono text-caution border-caution/40 bg-caution/10 flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" />
              Divergence Detected
            </Badge>
          </div>
          <span className="text-[11px] font-mono text-ink-faint">ID: {misconceptionSignal.id}</span>
        </div>

        <CardTitle className="text-base text-ink flex items-center gap-2 mt-1">
          <Radio className="w-4 h-4 text-accent animate-pulse" />
          <span>State Trace Replay & Misconception Diagnosis</span>
        </CardTitle>
        <CardDescription className="text-xs text-ink-dim">
          Replaying simulator-verified state evolution gate by gate to isolate where learner intuition diverged.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-6">
        {/* Misconception Signal Banner */}
        <div
          className="rounded-lg border border-caution/50 bg-caution/10 p-4 space-y-3"
          data-testid="misconception-signal-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-caution/20 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-caution" />
              <span className="text-xs font-bold text-caution uppercase tracking-wider">
                Misconception Signal:
              </span>
              <span
                data-testid="misconception-code"
                className="text-xs font-mono font-bold text-caution px-2 py-0.5 rounded bg-abyss border border-caution/40"
              >
                {misconceptionSignal.code}
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono text-caution border-caution/40">
              Confidence: {(misconceptionSignal.confidence * 100).toFixed(0)}% (Deterministic Rule)
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-abyss p-2.5 rounded border border-line space-y-1">
              <span className="text-ink-faint text-[11px] block">Learner Prediction (Hypothesis):</span>
              <span className="text-danger font-bold flex items-center gap-1.5">
                ✕ {misconceptionSignal.evidence.prediction}
              </span>
              <span className="text-[10px] text-ink-dim block font-sans">
                Assumed individual 50/50 measurement without entanglement
              </span>
            </div>

            <div className="bg-abyss p-2.5 rounded border border-line space-y-1">
              <span className="text-ink-faint text-[11px] block">Verified Simulation Behavior:</span>
              <span className="text-evidence font-bold flex items-center gap-1.5">
                ✓ {misconceptionSignal.evidence.verifiedBehavior}
              </span>
              <span className="text-[10px] text-ink-dim block font-sans">
                Non-local correlation: outcomes match on 100% of shots
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-caution pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-caution animate-ping" />
              <span>First Conceptual Divergence Point:</span>
              <strong data-testid="first-divergence-step" className="font-mono underline decoration-caution">
                Step {misconceptionSignal.firstDivergenceStep} (After CNOT)
              </strong>
            </span>
          </div>
        </div>

        {/* Replay Controls & Steps Scrubber */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              State Trace Steps Replay
            </span>
            <span className="text-[10px] text-ink-faint font-mono">
              Immutable Trace Indexes (0..{stateTrace.length - 1})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stateTrace.map((step) => {
              const isSelected = activeStepIndex === step.stepIndex;
              const isDivergence = step.stepIndex === misconceptionSignal.firstDivergenceStep;
              const stepReplay = replay.find((r) => r.stepIndex === step.stepIndex);

              return (
                <button
                  key={step.stepIndex}
                  type="button"
                  data-testid={`step-btn-${step.stepIndex}`}
                  onClick={() => handleStepClick(step.stepIndex)}
                  className={`p-3.5 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'border-accent bg-accent/10 ring-1 ring-accent text-ink shadow-glow'
                      : 'border-line bg-abyss text-ink-dim hover:border-line-bright hover:text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold ${
                          isSelected
                            ? 'bg-accent text-abyss font-bold'
                            : 'bg-raised text-ink-dim'
                        }`}
                      >
                        Step {step.stepIndex}
                      </span>
                      <span className="text-xs font-semibold text-ink">{step.label}</span>
                    </div>

                    {isDivergence && (
                      <span className="text-[10px] font-mono text-caution px-1.5 py-0.5 rounded bg-caution/15 border border-caution/40">
                        DIVERGENCE
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-ink-dim font-sans font-medium mb-2">
                    {stepReplay?.headline}
                  </div>

                  <div className="text-[11px] text-ink-faint space-y-0.5 border-t border-line pt-1.5">
                    <div>
                      Basis: {Object.entries(step.basisProbabilities)
                        .map(([basis, p]) => `${basis}: ${(p * 100).toFixed(0)}%`)
                        .join(', ')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Inspection of the Active Trace Step */}
        {currentTraceStep && (
          <div className="rounded-lg border border-line bg-abyss p-4 space-y-4 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
              <span className="text-xs font-bold text-ink flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-accent" />
                <span>Active Step Details: {currentTraceStep.label}</span>
              </span>
              <div
                data-testid="evidence-keys-list"
                className="flex items-center gap-1 text-[10px] text-ink-faint"
              >
                <span>Evidence keys:</span>
                {currentReplay?.evidenceKeys.map((key) => (
                  <code
                    key={key}
                    className="px-1.5 py-0.5 rounded bg-raised border border-line text-accent"
                  >
                    {key}
                  </code>
                ))}
              </div>
            </div>

            {/* Subsystem Bloch state analysis */}
            <div className="space-y-2">
              <span className="text-[11px] text-ink-dim font-sans font-medium block">
                Individual Qubit Subsystem States (Reduced Density Matrices):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTraceStep.reducedQubits.map((rq) => {
                  const isMixed = rq.label === 'MIXED_SUBSYSTEM';

                  return (
                    <div
                      key={rq.qubit}
                      className={`p-3 rounded-lg border ${
                        isMixed
                          ? 'border-violet/40 bg-violet/10 text-violet'
                          : 'border-accent/40 bg-accent/10 text-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-ink">Qubit q[{rq.qubit}] Subsystem</span>
                        <span
                          data-testid={`subsystem-label-${rq.qubit}`}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isMixed
                              ? 'bg-violet/20 text-violet border border-violet/50'
                              : 'bg-accent/20 text-accent border border-accent/50'
                          }`}
                        >
                          {rq.label}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-ink-dim space-y-0.5">
                        <div>Purity: <strong className={isMixed ? 'text-caution' : 'text-evidence'}>{rq.purity}</strong></div>
                        <div className="text-[10px] text-ink-faint">
                          Bloch vector: (x: {rq.bloch.x}, y: {rq.bloch.y}, z: {rq.bloch.z})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-raised/40 p-4 border-t border-line text-[11px] text-ink-dim flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-ink-dim">
          <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
          <span>
            Bloch vector purity &lt; 1 labeled <strong className="text-violet font-mono">MIXED_SUBSYSTEM</strong> (represents reduced subsystem, not entangled whole).
          </span>
        </div>
        <span className="text-ink-faint font-mono">Deterministic Engine v1</span>
      </CardFooter>
    </Card>
  );
}
