'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RotateCcw,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Split,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import {
  AssessResponse,
  CounterExample,
  DEFAULT_SOCRATIC_ASSESS_RESPONSE,
  fetchAssessResult,
} from '@/lib/types/grading';
import { CircuitModel, Operation } from '@/lib/contracts';
import { GateTile, CnotTargetCrosshairIcon } from '@/features/circuit/gate-glyph';

/**
 * High-precision read-only circuit canvas component.
 * Renders qubit wires, horizontal rails, and gate tiles for comparison.
 */
function ReadOnlyCircuitCanvas({
  circuit,
  isDiverged = false,
  divergenceStep,
  testId,
}: {
  circuit: CircuitModel;
  isDiverged?: boolean;
  divergenceStep?: number;
  testId: string;
}) {
  const maxColumn = Math.max(3, ...circuit.operations.map((op) => op.column + 1));
  const columns = Array.from({ length: maxColumn }, (_, i) => i);
  const qubits = Array.from({ length: circuit.qubitCount }, (_, i) => i);

  // Map operations by column and target/control qubit
  const getOpAt = (col: number) => circuit.operations.find((op) => op.column === col);

  return (
    <div
      className="relative rounded-lg border border-border-subtle bg-surface p-4 font-mono overflow-x-auto shadow-xs"
      data-testid={testId}
    >
      {/* Column indicators */}
      <div className="flex items-center gap-2 pb-2 border-b border-border-subtle mb-4 pl-16 text-[10px] text-text-tertiary">
        {columns.map((col) => (
          <div
            key={col}
            className={`w-12 text-center font-semibold ${
              isDiverged && divergenceStep === col + 1 ? 'text-danger font-bold' : ''
            }`}
          >
            Col {col}
          </div>
        ))}
      </div>

      <div className="space-y-6 relative">
        {qubits.map((qubitIndex) => (
          <div key={qubitIndex} className="flex items-center gap-3 relative min-w-[320px]">
            {/* Qubit label */}
            <div className="w-14 shrink-0 flex items-center gap-1.5 text-xs text-text-primary font-bold">
              <span className="px-2 py-0.5 rounded-full bg-surface-raised border border-border-medium text-accent">
                q[{qubitIndex}]
              </span>
              <span className="text-[10px] text-text-tertiary font-normal">|0⟩</span>
            </div>

            {/* Wire rail */}
            <div className="flex-1 relative flex items-center h-10">
              <div className="absolute inset-x-0 h-[2px] bg-border-medium z-0" />

              {/* Columns container */}
              <div className="relative z-10 flex items-center gap-2 w-full">
                {columns.map((colIndex) => {
                  const op = getOpAt(colIndex);
                  const isControl = op?.controls.includes(qubitIndex);
                  const isTarget = op?.targets.includes(qubitIndex);
                  const isDivergenceCol = isDiverged && divergenceStep === colIndex + 1;

                  return (
                    <div
                      key={colIndex}
                      className="w-12 h-10 flex items-center justify-center relative shrink-0"
                    >
                      {/* CNOT Control dot */}
                      {isControl && (
                        <div className="relative flex items-center justify-center">
                          <span
                            className={`w-3.5 h-3.5 rounded-full z-20 transition-all ${
                              isDivergenceCol ? 'bg-danger ring-2 ring-danger/30' : 'bg-accent'
                            }`}
                          />
                          {/* Vertical connector line */}
                          <div
                            className={`absolute w-[2px] z-10 ${
                              isDivergenceCol ? 'bg-danger' : 'bg-accent'
                            }`}
                            style={{
                              top: qubitIndex < (op?.targets[0] ?? 0) ? '50%' : 'auto',
                              bottom: qubitIndex > (op?.targets[0] ?? 0) ? '50%' : 'auto',
                              height: `${
                                Math.abs(qubitIndex - (op?.targets[0] ?? 0)) * 40 + 20
                              }px`,
                            }}
                          />
                        </div>
                      )}

                      {/* CNOT Target crosshair */}
                      {isTarget && op?.gate === 'CNOT' && (
                        <div className="relative flex items-center justify-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                              isDivergenceCol
                                ? 'bg-danger/10 border-danger text-danger ring-2 ring-danger/30'
                                : 'bg-accent/10 border-accent text-accent'
                            }`}
                          >
                            <CnotTargetCrosshairIcon className="w-5 h-5" strokeWidth={2.2} />
                          </div>
                        </div>
                      )}

                      {/* Single Qubit Gate */}
                      {isTarget && op && op.gate !== 'CNOT' && (
                        <div
                          className={`relative transition-transform ${
                            isDivergenceCol ? 'ring-2 ring-danger rounded' : ''
                          }`}
                        >
                          <GateTile gate={op.gate} size="sm" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssessLoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-8 animate-pulse">
      <div className="h-8 w-64 bg-surface-raised rounded-md" />
      <div className="h-4 w-96 bg-surface-raised rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-surface-raised rounded-lg" />
        <div className="h-64 bg-surface-raised rounded-lg" />
      </div>
      <div className="h-48 bg-surface-raised rounded-lg" />
    </div>
  );
}

function AssessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get('challengeId') || 'CH_BELL_ENTANGLE';
  const attemptId = searchParams.get('attemptId') || 'att_demo_01';

  const [assessment, setAssessment] = React.useState<AssessResponse>(
    DEFAULT_SOCRATIC_ASSESS_RESPONSE
  );
  const [isHintOpen, setIsHintOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchAssessResult(attemptId, challengeId).then(({ data }) => {
      if (isMounted) {
        setAssessment(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [challengeId, attemptId]);

  const studentCircuit = assessment.studentCircuit || DEFAULT_SOCRATIC_ASSESS_RESPONSE.studentCircuit!;
  const targetCircuit = assessment.targetCircuit || DEFAULT_SOCRATIC_ASSESS_RESPONSE.targetCircuit!;
  const counterExample: CounterExample =
    assessment.counterExample || DEFAULT_SOCRATIC_ASSESS_RESPONSE.counterExample!;

  const handleTryAgain = () => {
    // Navigate back to the circuit lab or origin challenge
    router.push('/lab');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8" data-testid="assess-page">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning" pip="amber">
              SOCRATIC COUNTEREXAMPLE
            </Badge>
            <Badge variant="outline" className="text-text-secondary font-mono text-[10px]">
              DETERMINISTIC GRADING ENGINE
            </Badge>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-text-primary">
            Quantum Invariant Assessment
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            Instead of a generic error message, the grading engine discovered the minimal counterexample
            state where your circuit diverges from quantum mechanical invariants.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={handleTryAgain}
            data-testid="assess-try-again-btn"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again in Lab</span>
          </Button>
        </div>
      </div>

      {/* Invariant Violation Banner */}
      <Card
        className="border-danger/30 bg-danger/5 shadow-xs overflow-hidden"
        data-testid="assess-invariant-banner"
      >
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-danger/15 flex items-center justify-center shrink-0 mt-0.5 text-danger">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-danger">
                    Invariant Violated: {counterExample.invariantViolated} (Entanglement Entropy)
                  </span>
                  <Badge variant="destructive" className="text-[10px]">
                    FAILED
                  </Badge>
                </div>
                <p
                  className="text-sm text-text-primary leading-relaxed"
                  data-testid="assess-invariant-explanation"
                >
                  {counterExample.explanation}
                </p>
              </div>
            </div>

            {/* Invariant Check Badges */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              {assessment.invariantsChecked.map((inv) => (
                <div
                  key={inv.invariantId}
                  className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-surface border border-border-subtle"
                >
                  {inv.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-danger shrink-0" />
                  )}
                  <span className="font-semibold text-text-primary">{inv.invariantId}:</span>
                  <span className="text-text-secondary">{inv.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Column Circuit Comparator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Student Circuit */}
        <Card
          className="border-border-subtle bg-surface shadow-xs"
          data-testid="assess-student-circuit"
        >
          <CardHeader className="pb-3 border-b border-border-subtle bg-surface-raised/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs font-mono">
                  YOUR SUBMISSION
                </Badge>
                <span className="text-xs font-mono text-text-secondary">
                  {studentCircuit.name}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] text-danger border-danger/30">
                Diverged at Step {counterExample.divergenceStep ?? 2}
              </Badge>
            </div>
            <CardTitle className="text-base text-text-primary flex items-center gap-2 mt-1">
              <Cpu className="w-4 h-4 text-text-secondary" />
              <span>Student Circuit Model</span>
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Contains Pauli-X gate on wire 0 followed by CNOT(0→1). Produces deterministic state |11⟩.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <ReadOnlyCircuitCanvas
              circuit={studentCircuit}
              isDiverged={true}
              divergenceStep={counterExample.divergenceStep ?? 2}
              testId="student-circuit-canvas"
            />
          </CardContent>
        </Card>

        {/* Right Column: Target Circuit */}
        <Card
          className="border-border-subtle bg-surface shadow-xs"
          data-testid="assess-target-circuit"
        >
          <CardHeader className="pb-3 border-b border-border-subtle bg-surface-raised/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-xs font-mono">
                  TARGET SPECIFICATION
                </Badge>
                <span className="text-xs font-mono text-text-secondary">
                  {targetCircuit.name}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] text-success border-success/30">
                Expected Bell State
              </Badge>
            </div>
            <CardTitle className="text-base text-text-primary flex items-center gap-2 mt-1">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Target Canonical Model</span>
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Canonical Bell pair: Hadamard (H) on wire 0 followed by CNOT(0→1). Maximally entangled S=1.00.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <ReadOnlyCircuitCanvas
              circuit={targetCircuit}
              isDiverged={false}
              testId="target-circuit-canvas"
            />
          </CardContent>
        </Card>
      </div>

      {/* Flight Recorder Divergence Panel */}
      <Card
        className="border-border-subtle bg-surface shadow-xs"
        data-testid="assess-divergence-panel"
      >
        <CardHeader className="pb-3 border-b border-border-subtle bg-surface-raised/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-mono">
                FLIGHT RECORDER
              </Badge>
              <span className="text-xs font-semibold text-text-primary">
                Divergence Point Analysis
              </span>
            </div>
            <span className="text-xs font-mono text-text-tertiary">
              Minimal Counterexample Input: {counterExample.inputState}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Input State */}
            <div className="p-3.5 rounded-lg border border-border-subtle bg-surface-raised/40 space-y-1">
              <div className="text-[11px] font-mono text-text-tertiary uppercase">
                Input Basis State
              </div>
              <div
                className="text-lg font-mono font-bold text-accent"
                data-testid="assess-input-state"
              >
                {counterExample.inputState}
              </div>
              <div className="text-[11px] text-text-secondary">
                Smallest diverging basis input
              </div>
            </div>

            {/* Divergence Step */}
            <div className="p-3.5 rounded-lg border border-border-subtle bg-surface-raised/40 space-y-1">
              <div className="text-[11px] font-mono text-text-tertiary uppercase">
                Divergence Point
              </div>
              <div
                className="text-lg font-mono font-bold text-danger flex items-center gap-1.5"
                data-testid="assess-divergence-step"
              >
                <Split className="w-4 h-4" />
                <span>
                  Step {counterExample.divergenceStep ?? 2}: {counterExample.gateName ?? 'CNOT'}
                </span>
              </div>
              <div className="text-[11px] text-text-secondary">
                First operation where outputs split
              </div>
            </div>

            {/* Student Output */}
            <div className="p-3.5 rounded-lg border border-danger/25 bg-danger/5 space-y-1">
              <div className="text-[11px] font-mono text-danger uppercase font-semibold">
                Your Output State
              </div>
              <div
                className="text-base font-mono font-bold text-danger"
                data-testid="assess-student-output"
              >
                {typeof counterExample.studentOutput === 'string'
                  ? counterExample.studentOutput
                  : JSON.stringify(counterExample.studentOutput)}
              </div>
              <div className="text-[11px] text-text-secondary">
                Deterministic product state (S = 0.00)
              </div>
            </div>

            {/* Target Output */}
            <div className="p-3.5 rounded-lg border border-success/25 bg-success/5 space-y-1">
              <div className="text-[11px] font-mono text-success uppercase font-semibold">
                Target Output State
              </div>
              <div
                className="text-base font-mono font-bold text-success"
                data-testid="assess-target-output"
              >
                {typeof counterExample.targetOutput === 'string'
                  ? counterExample.targetOutput
                  : JSON.stringify(counterExample.targetOutput)}
              </div>
              <div className="text-[11px] text-text-secondary">
                Maximally entangled Bell state (S = 1.00)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Socratic Hint Drawer & Action Footer */}
      <Card className="border-border-subtle bg-surface shadow-xs">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-border-medium"
                onClick={() => setIsHintOpen(!isHintOpen)}
                data-testid="assess-view-hint-btn"
              >
                <Lightbulb className="w-4 h-4 text-caution" />
                <span>{isHintOpen ? 'Hide Socratic Hint' : 'View Socratic Hint'}</span>
                {isHintOpen ? (
                  <ChevronUp className="w-4 h-4 text-text-tertiary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-tertiary" />
                )}
              </Button>

              <span className="text-xs text-text-secondary">
                Stuck? Expand the hint to understand the quantum mechanics behind the bug.
              </span>
            </div>

            <Button
              variant="default"
              className="flex items-center gap-2 self-start sm:self-auto"
              onClick={handleTryAgain}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Back to Circuit Builder</span>
            </Button>
          </div>

          {/* Collapsible Hint Drawer */}
          {isHintOpen && (
            <div
              className="mt-4 p-4 rounded-lg bg-surface-raised border border-border-subtle space-y-2 animate-in fade-in duration-200"
              data-testid="assess-hint-drawer"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <Info className="w-4 h-4 text-accent" />
                <span>Socratic Pedagogical Guidance</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {counterExample.hint ||
                  'A Bell state requires creating an equal superposition on the control qubit before applying CNOT. Replace the Pauli-X gate with a Hadamard (H) gate to allow constructive and destructive interference.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AssessPage() {
  return (
    <React.Suspense fallback={<AssessLoadingSkeleton />}>
      <AssessContent />
    </React.Suspense>
  );
}
