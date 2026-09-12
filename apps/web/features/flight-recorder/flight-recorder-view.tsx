'use client';

import * as React from 'react';
import { DiagnoseResponse, StateTraceStep, TutorExplanation } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Radio,
  AlertOctagon,
  Compass,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  CheckCheck,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { renderMathText } from '@/lib/math-renderer';

interface FlightRecorderViewProps {
  diagnosis: DiagnoseResponse;
  stateTrace: StateTraceStep[];
  onSelectStep?: (stepIndex: number) => void;
  tutorResponse?: TutorExplanation | null;
  isTutorLoading?: boolean;
  learnerRole?: string;
}

export function FlightRecorderView({
  diagnosis,
  stateTrace,
  onSelectStep,
  tutorResponse,
  isTutorLoading,
  learnerRole,
}: FlightRecorderViewProps) {
  const { misconceptionSignal, replay } = diagnosis;

  // Determine if this is a correct prediction:
  // Checked from API response flag, signal flag, or matching prediction/verifiedBehavior
  const isCorrect = Boolean(
    diagnosis.isCorrectPrediction ||
      misconceptionSignal.isCorrectPrediction ||
      (misconceptionSignal.evidence?.prediction &&
        misconceptionSignal.evidence.prediction === misconceptionSignal.evidence.verifiedBehavior)
  );

  const [activeStepIndex, setActiveStepIndex] = React.useState<number>(
    isCorrect ? (stateTrace[0]?.stepIndex ?? 0) : (misconceptionSignal.firstDivergenceStep ?? 1)
  );

  React.useEffect(() => {
    setActiveStepIndex(
      isCorrect ? (stateTrace[0]?.stepIndex ?? 0) : (misconceptionSignal.firstDivergenceStep ?? 1)
    );
  }, [diagnosis.misconceptionSignal?.id, isCorrect, misconceptionSignal?.firstDivergenceStep, stateTrace]);

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
            {isCorrect ? (
              <Badge
                variant="outline"
                className="text-xs font-mono text-evidence border-evidence/40 bg-evidence/10 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-evidence" />
                Hypothesis Confirmed
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs font-mono text-caution border-caution/40 bg-caution/10 flex items-center gap-1"
              >
                <AlertOctagon className="w-3 h-3" />
                Divergence Detected
              </Badge>
            )}
          </div>
          <span className="text-[11px] font-mono text-ink-faint">ID: {misconceptionSignal.id}</span>
        </div>

        <CardTitle className="text-base text-ink flex items-center gap-2 mt-1">
          <Radio className="w-4 h-4 text-accent animate-pulse" />
          <span>State Trace Replay & Misconception Diagnosis</span>
        </CardTitle>
        <CardDescription className="text-xs text-ink-dim">
          {isCorrect
            ? 'Replaying simulator-verified state evolution gate by gate. Your prediction aligns with verified quantum behavior.'
            : 'Replaying simulator-verified state evolution gate by gate to isolate where learner intuition diverged.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-6">
        {/* Misconception Signal or Confirmed Hypothesis Banner */}
        {isCorrect ? (
          <div
            className="rounded-lg border border-evidence/50 bg-evidence/10 p-4 space-y-3"
            data-testid="misconception-signal-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-evidence/20 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-evidence" />
                <span className="text-xs font-bold text-evidence uppercase tracking-wider">
                  Hypothesis Confirmed:
                </span>
                <span
                  data-testid="hypothesis-confirmed-badge"
                  className="text-xs font-mono font-bold text-evidence px-2 py-0.5 rounded bg-abyss border border-evidence/40"
                >
                  NO MISCONCEPTION DETECTED
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-evidence border-evidence/40">
                Confidence: 100% (Deterministic Match)
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-abyss p-2.5 rounded border border-line space-y-1">
                <span className="text-ink-faint text-[11px] block">Learner Prediction (Hypothesis):</span>
                <span className="text-evidence font-bold flex items-center gap-1.5">
                  ✓ {misconceptionSignal.evidence?.prediction ?? 'CORRELATED_00_11'}
                </span>
                <span className="text-[10px] text-ink-dim block font-sans">
                  {misconceptionSignal.evidence?.predictionDescription ??
                    'Correctly predicted entangled Bell state correlation'}
                </span>
              </div>

              <div className="bg-abyss p-2.5 rounded border border-line space-y-1">
                <span className="text-ink-faint text-[11px] block">Verified Simulation Behavior:</span>
                <span className="text-evidence font-bold flex items-center gap-1.5">
                  ✓ {misconceptionSignal.evidence?.verifiedBehavior ?? 'CORRELATED_00_11'}
                </span>
                <span className="text-[10px] text-ink-dim block font-sans">
                  {misconceptionSignal.evidence?.verifiedBehaviorDescription ??
                    'Non-local correlation: outcomes match on 100% of shots'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-evidence pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-evidence" />
                <span>Status:</span>
                <strong data-testid="no-divergence-status" className="font-mono text-evidence">
                  ✓ Hypothesis Confirmed — No Misconception Detected
                </strong>
              </span>
            </div>
          </div>
        ) : (
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
                  {misconceptionSignal.evidence?.predictionDescription ??
                    (tutorResponse?.summary ? 'Analyzed by Socratic Tutor' : misconceptionSignal.code)}
                </span>
              </div>

              <div className="bg-abyss p-2.5 rounded border border-line space-y-1">
                <span className="text-ink-faint text-[11px] block">Verified Simulation Behavior:</span>
                <span className="text-evidence font-bold flex items-center gap-1.5">
                  ✓ {misconceptionSignal.evidence.verifiedBehavior}
                </span>
                <span className="text-[10px] text-ink-dim block font-sans">
                  {misconceptionSignal.evidence?.verifiedBehaviorDescription ??
                    'Non-local correlation: outcomes match on 100% of shots'}
                </span>
              </div>
            </div>

            {misconceptionSignal.firstDivergenceStep !== null && misconceptionSignal.firstDivergenceStep !== undefined && (
              <div className="flex items-center justify-between text-xs text-caution pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-caution animate-ping" />
                  <span>First Conceptual Divergence Point:</span>
                  <strong data-testid="first-divergence-step" className="font-mono underline decoration-caution">
                    Step {misconceptionSignal.firstDivergenceStep}{' '}
                    {(() => {
                      const divStep = stateTrace.find(
                        (s) => s.stepIndex === misconceptionSignal.firstDivergenceStep
                      );
                      return divStep?.label ? `(${divStep.label})` : '';
                    })()}
                  </strong>
                </span>
              </div>
            )}
          </div>
        )}

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
              const isDivergence = !isCorrect && step.stepIndex === misconceptionSignal.firstDivergenceStep;
              const stepReplay = replay.find((r) => r.stepIndex === step.stepIndex);

              return (
                <button
                  key={step.stepIndex}
                  type="button"
                  data-testid={`step-btn-${step.stepIndex}`}
                  aria-current={isSelected ? 'step' : undefined}
                  aria-label={`Step ${step.stepIndex}: ${step.label}${isDivergence ? ' (First Conceptual Divergence)' : ''}`}
                  onClick={() => handleStepClick(step.stepIndex)}
                  className={`p-3.5 rounded-lg border text-left font-mono transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent ${
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

                    {isCorrect ? (
                      <span className="text-[10px] font-mono text-evidence px-1.5 py-0.5 rounded bg-evidence/15 border border-evidence/40">
                        VERIFIED
                      </span>
                    ) : isDivergence ? (
                      <span className="text-[10px] font-mono text-caution px-1.5 py-0.5 rounded bg-caution/15 border border-caution/40">
                        DIVERGENCE
                      </span>
                    ) : null}
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

        {/* Dynamic Inline AI Tutor Explanation for Detected Misconceptions */}
        {!isCorrect && isTutorLoading && (
          <div
            className="rounded-lg border border-accent/30 bg-raised/30 p-4 space-y-3 animate-pulse"
            data-testid="tutor-loading-skeleton"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent animate-spin" />
                <span className="text-xs font-mono font-semibold text-accent">
                  Generating AI Pedagogical Guidance...
                </span>
              </div>
              <span className="text-[10px] font-mono text-ink-faint">
                Evidence-Bound Socratic Engine
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-line/60 rounded w-3/4" />
              <div className="h-3 bg-line/40 rounded w-full" />
              <div className="h-3 bg-line/30 rounded w-4/5" />
            </div>
          </div>
        )}

        {!isCorrect && !isTutorLoading && tutorResponse && (
          <div
            className="rounded-lg border border-accent/40 bg-abyss p-4 space-y-4 font-sans"
            data-testid="inline-tutor-container"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs font-mono bg-accent/20 text-accent border border-accent/40">
                  AI SOCRATIC GUIDANCE
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono flex items-center gap-1 ${
                    tutorResponse.fallbackUsed
                      ? 'text-caution border-caution/40 bg-caution/10'
                      : 'text-accent border-accent/40 bg-accent/10'
                  }`}
                  data-testid="inline-tutor-badge"
                >
                  <ShieldCheck className="w-3 h-3" />
                  {tutorResponse.fallbackUsed
                    ? `Deterministic Fallback (${tutorResponse.model})`
                    : `Live OpenRouter (${tutorResponse.model})`}
                </Badge>
                {learnerRole && (
                  <Badge variant="outline" className="text-[10px] font-mono text-ink-dim border-line">
                    {learnerRole === 'PHYSICS_TO_CODE' ? 'Formal Physics' : 'Intuitive CSE'}
                  </Badge>
                )}
              </div>
              <span className="text-[11px] font-mono text-ink-faint">
                Intent: {tutorResponse.intent}
              </span>
            </div>

            {/* Socratic Insight Summary */}
            <div
              data-testid="inline-tutor-summary"
              className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs md:text-sm text-ink space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wide">
                <Lightbulb className="w-3.5 h-3.5 text-accent" />
                <span>Pedagogical Analysis</span>
              </div>
              <p className="text-ink font-medium leading-relaxed">
                {renderMathText(tutorResponse.summary)}
              </p>
            </div>

            {/* Trace Steps Breakdown */}
            {tutorResponse.steps.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-ink font-mono flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-accent" />
                  Grounded Trace Steps Breakdown
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {tutorResponse.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-line bg-raised/40 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-accent font-mono">{step.title}</span>
                        <div className="flex gap-1">
                          {step.evidenceKeys.map((key) => (
                            <code
                              key={key}
                              className="text-[9px] font-mono text-ink-dim bg-abyss px-1.5 py-0.5 rounded border border-line"
                            >
                              {key}
                            </code>
                          ))}
                        </div>
                      </div>
                      <p className="text-ink-dim font-sans text-[11px] leading-normal">{renderMathText(step.body)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simulator-Bound Numerical Claims */}
            {tutorResponse.numericalClaims.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-ink font-mono flex items-center gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5 text-evidence" />
                  Simulator-Bound Numerical Claims
                </span>
                <div className="rounded-lg border border-line bg-raised/30 overflow-hidden text-xs font-mono">
                  <div className="grid grid-cols-2 p-2 bg-raised text-ink-dim font-bold border-b border-line text-[11px]">
                    <span>Claimed Mathematical Value</span>
                    <span>Grounded Evidence Key</span>
                  </div>
                  {tutorResponse.numericalClaims.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-2 p-2 border-b border-line last:border-0 items-center text-[11px]"
                    >
                      <span className="text-evidence font-bold">{renderMathText(item.claim)}</span>
                      <span className="text-ink-dim text-[10px]">{item.evidenceKey}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Note */}
            <div className="flex items-center gap-1.5 text-[10px] text-ink-faint pt-1 border-t border-line">
              <AlertCircle className="w-3 h-3 text-accent shrink-0" />
              <span>{tutorResponse.safetyNote}</span>
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
