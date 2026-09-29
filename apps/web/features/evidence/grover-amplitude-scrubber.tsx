'use client';

import * as React from 'react';
import { StateTraceStep, CircuitModel } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Activity,
  Layers,
} from 'lucide-react';

/**
 * Detect if circuit is identified as Grover algorithm
 * Heuristic per docs/FEATURES-SPEC.md § 1.4: circuit uses CCX and Hadamard
 */
export function isGroverCircuit(c?: CircuitModel | null): boolean {
  if (!c || !c.operations) return false;
  const hasCCX = c.operations.some((op) => op.gate === 'CCX');
  const hasH = c.operations.some((op) => op.gate === 'H');
  return hasCCX && hasH;
}

/**
 * Standard 3-Qubit Grover Search (|101⟩ target) benchmark preset
 * Uses CCX (Toffoli) and Hadamard per Stage 2.1.8 curriculum spec
 */
export const GROVER_CIRCUIT: CircuitModel = {
  id: 'cm_grover_seed',
  name: 'Grover Search (|101⟩ Target)',
  qubitCount: 3,
  classicalBitCount: 3,
  operations: [
    { opId: 'op_gh_0', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_gh_1', gate: 'H', targets: [1], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_gh_2', gate: 'H', targets: [2], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_gx_1', gate: 'X', targets: [1], controls: [], classicalTargets: [], column: 1 },
    { opId: 'op_gccx_1', gate: 'CCX', targets: [2], controls: [0, 1], classicalTargets: [], column: 2 },
    { opId: 'op_gx_2', gate: 'X', targets: [1], controls: [], classicalTargets: [], column: 3 },
    { opId: 'op_gdh_1', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 4 },
    { opId: 'op_gdh_2', gate: 'H', targets: [1], controls: [], classicalTargets: [], column: 4 },
    { opId: 'op_gdh_3', gate: 'H', targets: [2], controls: [], classicalTargets: [], column: 4 },
    { opId: 'op_gdx_1', gate: 'X', targets: [0], controls: [], classicalTargets: [], column: 5 },
    { opId: 'op_gdx_2', gate: 'X', targets: [1], controls: [], classicalTargets: [], column: 5 },
    { opId: 'op_gdx_3', gate: 'X', targets: [2], controls: [], classicalTargets: [], column: 5 },
    { opId: 'op_gdccx_1', gate: 'CCX', targets: [2], controls: [0, 1], classicalTargets: [], column: 6 },
    { opId: 'op_gdx_4', gate: 'X', targets: [0], controls: [], classicalTargets: [], column: 7 },
    { opId: 'op_gdx_5', gate: 'X', targets: [1], controls: [], classicalTargets: [], column: 7 },
    { opId: 'op_gdx_6', gate: 'X', targets: [2], controls: [], classicalTargets: [], column: 7 },
    { opId: 'op_gdh_4', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 8 },
    { opId: 'op_gdh_5', gate: 'H', targets: [1], controls: [], classicalTargets: [], column: 8 },
    { opId: 'op_gdh_6', gate: 'H', targets: [2], controls: [], classicalTargets: [], column: 8 },
    { opId: 'op_gm_0', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 9 },
    { opId: 'op_gm_1', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 9 },
    { opId: 'op_gm_2', gate: 'MEASURE', targets: [2], controls: [], classicalTargets: [2], column: 9 },
  ],
  source: 'SEED',
  openQasm3:
    'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[3] q;\nbit[3] c;\nh q[0];\nh q[1];\nh q[2];\nx q[1];\nccx q[0], q[1], q[2];\nx q[1];\nh q[0];\nh q[1];\nh q[2];\nx q[0];\nx q[1];\nx q[2];\nccx q[0], q[1], q[2];\nx q[0];\nx q[1];\nx q[2];\nh q[0];\nh q[1];\nh q[2];\nc[0] = measure q[0];\nc[1] = measure q[1];\nc[2] = measure q[2];\n',
  modelVersion: 1,
  ownerLearnerProfileId: null,
  createdAt: '2026-08-23T05:27:00Z',
  updatedAt: '2026-08-23T05:27:00Z',
};

export interface GroverAmplitudeScrubberProps {
  stateTrace: StateTraceStep[];
  markedState?: string;
  onStepChange?: (stepIndex: number) => void;
  initialStepIndex?: number;
  className?: string;
}

/**
 * Standard 5-step canonical Grover state trace for 3 qubits (|101⟩ target)
 * Used as fallback / reference when real simulation runs without full 8-basis amplitudes
 */
export const CANONICAL_GROVER_STEPS: StateTraceStep[] = [
  {
    stepIndex: 0,
    operationId: 'grover_step_0',
    label: 'Equal Superposition (H^⊗3)',
    basisProbabilities: {
      '000': 0.125, '001': 0.125, '010': 0.125, '011': 0.125,
      '100': 0.125, '101': 0.125, '110': 0.125, '111': 0.125,
    },
    amplitudes: {
      '000': { re: 0.3536, im: 0.0 }, '001': { re: 0.3536, im: 0.0 },
      '010': { re: 0.3536, im: 0.0 }, '011': { re: 0.3536, im: 0.0 },
      '100': { re: 0.3536, im: 0.0 }, '101': { re: 0.3536, im: 0.0 },
      '110': { re: 0.3536, im: 0.0 }, '111': { re: 0.3536, im: 0.0 },
    },
    reducedQubits: [],
  },
  {
    stepIndex: 1,
    operationId: 'grover_step_1',
    label: 'Oracle Phase Flip (Marking |101⟩)',
    basisProbabilities: {
      '000': 0.125, '001': 0.125, '010': 0.125, '011': 0.125,
      '100': 0.125, '101': 0.125, '110': 0.125, '111': 0.125,
    },
    amplitudes: {
      '000': { re: 0.3536, im: 0.0 }, '001': { re: 0.3536, im: 0.0 },
      '010': { re: 0.3536, im: 0.0 }, '011': { re: 0.3536, im: 0.0 },
      '100': { re: 0.3536, im: 0.0 }, '101': { re: -0.3536, im: 0.0 },
      '110': { re: 0.3536, im: 0.0 }, '111': { re: 0.3536, im: 0.0 },
    },
    reducedQubits: [],
  },
  {
    stepIndex: 2,
    operationId: 'grover_step_2',
    label: 'Diffusion (Inversion About Mean)',
    basisProbabilities: {
      '000': 0.031, '001': 0.031, '010': 0.031, '011': 0.031,
      '100': 0.031, '101': 0.531, '110': 0.031, '111': 0.031,
    },
    amplitudes: {
      '000': { re: 0.1768, im: 0.0 }, '001': { re: 0.1768, im: 0.0 },
      '010': { re: 0.1768, im: 0.0 }, '011': { re: 0.1768, im: 0.0 },
      '100': { re: 0.1768, im: 0.0 }, '101': { re: 0.7289, im: 0.0 },
      '110': { re: 0.1768, im: 0.0 }, '111': { re: 0.1768, im: 0.0 },
    },
    reducedQubits: [],
  },
  {
    stepIndex: 3,
    operationId: 'grover_step_3',
    label: 'Oracle Phase Flip (Iteration 2)',
    basisProbabilities: {
      '000': 0.031, '001': 0.031, '010': 0.031, '011': 0.031,
      '100': 0.031, '101': 0.531, '110': 0.031, '111': 0.031,
    },
    amplitudes: {
      '000': { re: 0.1768, im: 0.0 }, '001': { re: 0.1768, im: 0.0 },
      '010': { re: 0.1768, im: 0.0 }, '011': { re: 0.1768, im: 0.0 },
      '100': { re: 0.1768, im: 0.0 }, '101': { re: -0.7289, im: 0.0 },
      '110': { re: 0.1768, im: 0.0 }, '111': { re: 0.1768, im: 0.0 },
    },
    reducedQubits: [],
  },
  {
    stepIndex: 4,
    operationId: 'grover_step_4',
    label: 'Diffusion (Inversion About Mean — Peak Amplification)',
    basisProbabilities: {
      '000': 0.008, '001': 0.008, '010': 0.008, '011': 0.008,
      '100': 0.008, '101': 0.945, '110': 0.008, '111': 0.008,
    },
    amplitudes: {
      '000': { re: 0.0884, im: 0.0 }, '001': { re: 0.0884, im: 0.0 },
      '010': { re: 0.0884, im: 0.0 }, '011': { re: 0.0884, im: 0.0 },
      '100': { re: 0.0884, im: 0.0 }, '101': { re: 0.9723, im: 0.0 },
      '110': { re: 0.0884, im: 0.0 }, '111': { re: 0.0884, im: 0.0 },
    },
    reducedQubits: [],
  },
];

/**
 * Determine the marked state |ω⟩ from props or state trace inspection
 */
export function detectMarkedState(steps: StateTraceStep[], fallback: string = '101'): string {
  if (!steps || steps.length === 0) return fallback;

  // Look for any step where an amplitude is negative (oracle phase flip)
  for (const step of steps) {
    if (!step.amplitudes) continue;
    for (const [state, amp] of Object.entries(step.amplitudes)) {
      if (amp.re < -0.05) {
        return state;
      }
    }
  }

  // Look at final step for peak probability state
  const lastStep = steps[steps.length - 1];
  if (lastStep?.basisProbabilities) {
    let maxProb = 0;
    let maxState = fallback;
    for (const [state, prob] of Object.entries(lastStep.basisProbabilities)) {
      if (prob > maxProb) {
        maxProb = prob;
        maxState = state;
      }
    }
    if (maxProb > 0.4) return maxState;
  }

  return fallback;
}

/**
 * Extract or generate basis states (e.g. 8 states for 3 qubits: '000' ... '111')
 */
export function getBasisStates(step?: StateTraceStep, defaultQubitCount: number = 3): string[] {
  if (step?.amplitudes && Object.keys(step.amplitudes).length > 0) {
    const keys = Object.keys(step.amplitudes);
    // Sort lexicographically
    return keys.sort();
  }

  const n = defaultQubitCount;
  const count = Math.pow(2, n);
  const states: string[] = [];
  for (let i = 0; i < count; i++) {
    states.push(i.toString(2).padStart(n, '0'));
  }
  return states;
}

/**
 * Extract signed amplitude value for a given basis state
 */
export function getSignedAmplitude(step: StateTraceStep | undefined, state: string): number {
  if (!step?.amplitudes) return 0;
  const amp = step.amplitudes[state];
  if (!amp) return 0;

  // In Grover, phase flips produce real signed amplitudes (amp.re)
  // If complex phase exists, use real projection or signed magnitude
  if (typeof amp.re === 'number') {
    if (Math.abs(amp.im) > 1e-4 && Math.abs(amp.re) < 1e-4) {
      return amp.im;
    }
    return amp.re;
  }
  return 0;
}

/**
 * Compute the arithmetic mean amplitude ᾱ = (1/N) ∑ α_i across all basis states
 */
export function computeMeanAmplitude(step: StateTraceStep | undefined, basisStates: string[]): number {
  if (!step || basisStates.length === 0) return 0;
  let sum = 0;
  for (const s of basisStates) {
    sum += getSignedAmplitude(step, s);
  }
  return sum / basisStates.length;
}

/**
 * Provide human-friendly educational description for Grover step
 */
export function getGroverStepDescription(
  step: StateTraceStep,
  markedState: string,
  stepIndex: number,
  totalSteps: number
): { title: string; category: string; description: string } {
  const label = step.label || '';
  const amp = getSignedAmplitude(step, markedState);

  if (amp < -0.05) {
    return {
      title: 'Oracle Phase Flip',
      category: 'Phase Inversion',
      description: `The oracle marks target |${markedState}⟩ by inverting its sign (${amp.toFixed(3)}), while other basis states remain unaffected. This phase flip pulls the mean amplitude ᾱ downward.`,
    };
  }

  if (amp > 0.5) {
    return {
      title: 'Diffusion (Inversion About Mean)',
      category: 'Amplitude Amplification',
      description: `The diffusion operator reflects all amplitudes about the average height ᾱ. The negative marked arrow shoots upward to ${amp.toFixed(3)}, while non-marked states are suppressed.`,
    };
  }

  if (stepIndex === 0 || label.toLowerCase().includes('superposition') || label.toLowerCase().includes('initial')) {
    return {
      title: 'Equal Superposition',
      category: 'Initialization',
      description: `Hadamard gates applied to all qubits create an equal superposition: each of the 2^n basis states starts with identical amplitude 1/√N ≈ 0.354 (equal probability).`,
    };
  }

  if (label.toLowerCase().includes('diffusion') || label.toLowerCase().includes('inversion')) {
    return {
      title: 'Diffusion (Inversion About Mean)',
      category: 'Amplitude Amplification',
      description: `Reflection about the mean ᾱ transforms each amplitude α_i → 2ᾱ - α_i, amplifying the marked state through constructive quantum wave interference.`,
    };
  }

  if (label.toLowerCase().includes('oracle') || label.toLowerCase().includes('mark')) {
    return {
      title: 'Oracle Phase Flip',
      category: 'Phase Inversion',
      description: `Grover phase oracle applies a -1 phase factor to the marked state without measuring or collapsing the query register.`,
    };
  }

  return {
    title: label || `Execution Step ${stepIndex + 1}`,
    category: 'State Evolution',
    description: `Intermediate quantum statevector after operation. Amplitudes and phase relationships advance through the Grover search sequence.`,
  };
}

export function GroverAmplitudeScrubber({
  stateTrace,
  markedState: rawMarkedState,
  onStepChange,
  initialStepIndex = 0,
  className = '',
}: GroverAmplitudeScrubberProps) {
  // Use real stateTrace if available, or fall back to canonical Grover steps if trace is empty
  const activeSteps = React.useMemo(() => {
    if (stateTrace && stateTrace.length > 0) {
      // Check if trace has at least one step with non-trivial amplitudes
      const hasAmps = stateTrace.some(
        (s) => s.amplitudes && Object.keys(s.amplitudes).length >= 4
      );
      if (hasAmps) return stateTrace;
    }
    return CANONICAL_GROVER_STEPS;
  }, [stateTrace]);

  const targetMarkedState = React.useMemo(() => {
    if (rawMarkedState) {
      return rawMarkedState.replace(/[|⟩\s]/g, '');
    }
    return detectMarkedState(activeSteps, '101');
  }, [rawMarkedState, activeSteps]);

  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(() => {
    const clamped = Math.max(0, Math.min(initialStepIndex, activeSteps.length - 1));
    return clamped;
  });

  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);

  // Sync when activeSteps changes
  React.useEffect(() => {
    if (currentStepIndex >= activeSteps.length) {
      setCurrentStepIndex(Math.max(0, activeSteps.length - 1));
    }
  }, [activeSteps.length, currentStepIndex]);

  // Handle external step selection
  const handleStepChange = React.useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, activeSteps.length - 1));
      setCurrentStepIndex(clamped);
      if (onStepChange) {
        onStepChange(clamped);
      }
    },
    [activeSteps.length, onStepChange]
  );

  // Auto-play animation loop
  React.useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1 >= activeSteps.length ? 0 : prev + 1;
        if (onStepChange) onStepChange(next);
        return next;
      });
    }, 1400);

    return () => clearInterval(timer);
  }, [isPlaying, activeSteps.length, onStepChange]);

  const currentStep = activeSteps[currentStepIndex] || activeSteps[0];
  const basisStates = React.useMemo(() => getBasisStates(currentStep, 3), [currentStep]);
  const meanAmplitude = React.useMemo(
    () => computeMeanAmplitude(currentStep, basisStates),
    [currentStep, basisStates]
  );

  const markedAmp = getSignedAmplitude(currentStep, targetMarkedState);
  const markedProb =
    currentStep?.basisProbabilities?.[targetMarkedState] ??
    Math.min(1.0, markedAmp * markedAmp);

  const stepMeta = getGroverStepDescription(
    currentStep,
    targetMarkedState,
    currentStepIndex,
    activeSteps.length
  );

  // SVG Chart Geometry
  const svgWidth = 760;
  const svgHeight = 290;
  const margin = { top: 35, right: 75, bottom: 65, left: 55 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom; // 190px
  const zeroY = margin.top + chartHeight / 2; // 130px (amplitude = 0.0)
  const scale = chartHeight / 2; // 95px per 1.0 amplitude unit

  // Mean amplitude y-coordinate
  const meanY = Math.max(
    margin.top,
    Math.min(margin.top + chartHeight, zeroY - meanAmplitude * scale)
  );

  const slotWidth = chartWidth / Math.max(1, basisStates.length);
  const barWidth = Math.min(48, Math.max(20, slotWidth * 0.62));

  return (
    <Card
      className={`border-border-subtle bg-surface shadow-md overflow-hidden ${className}`}
      data-testid="grover-amplitude-scrubber"
    >
      <CardHeader className="pb-3 border-b border-border-subtle bg-surface-raised/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs font-mono bg-accent text-white">
              GROVER AMPLITUDE SCRUBBER
            </Badge>
            <Badge
              variant="outline"
              data-testid="marked-state-badge"
              className="text-xs font-mono border-[#00D4FF]/40 text-[#008ba3] bg-[#00D4FF]/10 flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-[#00D4FF]" />
              <span>Target: |{targetMarkedState}⟩</span>
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono text-text-secondary"
              data-testid="step-counter-text"
            >
              Step {currentStepIndex + 1} of {activeSteps.length}
            </span>
            <Badge
              variant="outline"
              data-testid="scrubber-phase-badge"
              className="text-[11px] font-mono border-border-subtle text-text-primary"
            >
              {stepMeta.category}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
          <div>
            <CardTitle className="text-base text-text-primary flex items-center gap-2">
              <Sliders className="w-4 h-4 text-accent" />
              <span data-testid="scrubber-step-title">{stepMeta.title}</span>
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary mt-0.5">
              Interactive timeline visualizer tracking negative phase flips &amp; inversion about the mean.
            </CardDescription>
          </div>

          {/* Quick telemetry readout */}
          <div className="flex items-center gap-3 text-xs font-mono pt-1 sm:pt-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-raised border border-border-subtle">
              <span className="text-text-muted">P(|{targetMarkedState}⟩):</span>
              <strong
                data-testid="marked-probability-value"
                className="text-[#008ba3] font-semibold"
              >
                {(markedProb * 100).toFixed(1)}%
              </strong>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-raised border border-border-subtle">
              <span className="text-text-muted">Mean ᾱ:</span>
              <strong
                data-testid="mean-amplitude-value"
                className="text-amber-700 font-semibold"
              >
                {meanAmplitude >= 0 ? '+' : ''}
                {meanAmplitude.toFixed(3)}
              </strong>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Timeline Range Scrubber & Controls */}
        <div className="p-3 rounded-lg bg-surface-raised border border-border-subtle space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStepChange(currentStepIndex - 1)}
                disabled={currentStepIndex <= 0}
                aria-label="Previous step"
                data-testid="scrubber-prev-btn"
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
                data-testid="scrubber-play-toggle"
                className="h-8 px-2.5 text-xs font-mono gap-1.5"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-accent" />
                    <span>Auto Play</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStepChange(currentStepIndex + 1)}
                disabled={currentStepIndex >= activeSteps.length - 1}
                aria-label="Next step"
                data-testid="scrubber-next-btn"
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsPlaying(false);
                  handleStepChange(0);
                }}
                aria-label="Reset to step 0"
                data-testid="scrubber-reset-btn"
                className="h-8 w-8 p-0 text-text-muted hover:text-text-primary"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Step badges clickable strip */}
            <div
              className="flex items-center gap-1 overflow-x-auto py-0.5"
              role="tablist"
              aria-label="Execution steps"
            >
              {activeSteps.map((step, idx) => {
                const isSelected = idx === currentStepIndex;
                const isOracle = step.label?.toLowerCase().includes('oracle') || idx === 1 || idx === 3;
                return (
                  <button
                    key={`step-pill-${step.stepIndex ?? idx}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`Step ${idx + 1}: ${step.label || 'Grover step'}`}
                    data-testid={`step-pill-${idx}`}
                    onClick={() => handleStepChange(idx)}
                    className={`h-7 px-2.5 rounded-full text-xs font-mono transition-all flex items-center gap-1 cursor-pointer outline-none ${
                      isSelected
                        ? 'bg-accent text-white font-medium shadow-xs ring-2 ring-accent/30'
                        : isOracle
                        ? 'bg-[#00D4FF]/10 text-[#006f85] border border-[#00D4FF]/30 hover:bg-[#00D4FF]/20'
                        : 'bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-active'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="hidden md:inline text-[10px] opacity-85">
                      {isOracle ? 'Oracle' : idx === 0 ? 'Init' : 'Diff'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Range Input */}
          <div className="space-y-1.5">
            <div className="relative flex items-center">
              <input
                type="range"
                min={0}
                max={Math.max(0, activeSteps.length - 1)}
                value={currentStepIndex}
                onChange={(e) => handleStepChange(Number(e.target.value))}
                aria-label="Grover execution timeline scrubber"
                aria-valuemin={0}
                aria-valuemax={Math.max(0, activeSteps.length - 1)}
                aria-valuenow={currentStepIndex}
                aria-valuetext={`Step ${currentStepIndex + 1}: ${stepMeta.title}`}
                data-testid="grover-range-slider"
                className="w-full h-2 bg-surface-active rounded-lg appearance-none cursor-pointer accent-[#2a2882] focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-text-muted px-0.5">
              <span>Start (Equal Superposition)</span>
              <span className="text-accent font-medium">Scrub to observe wave interference</span>
              <span>Final (Amplified Marked State)</span>
            </div>
          </div>
        </div>

        {/* Signed Amplitude Bar Chart (SVG) */}
        <div
          className="relative rounded-lg border border-border-subtle bg-surface p-2 sm:p-3 overflow-hidden"
          data-testid="amplitude-chart-container"
        >
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[580px] max-h-[340px]"
              role="img"
              aria-label={`Signed amplitude bar chart for Grover step ${currentStepIndex + 1}`}
              data-testid="grover-amplitude-svg"
            >
              <defs>
                {/* Glow filter for Electric Cyan marked state */}
                <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00D4FF" floodOpacity="0.45" />
                </filter>
                <linearGradient id="markedCyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="100%" stopColor="#00A3C4" />
                </linearGradient>
                <linearGradient id="cobaltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[-1.0, -0.5, 0.5, 1.0].map((v) => {
                const y = zeroY - v * scale;
                return (
                  <g key={`grid-line-${v}`}>
                    <line
                      x1={margin.left}
                      y1={y}
                      x2={margin.left + chartWidth}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.08"
                      strokeDasharray="2 3"
                    />
                    <text
                      x={margin.left - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="10"
                      fontFamily="monospace"
                      fill="currentColor"
                      fillOpacity="0.45"
                    >
                      {v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Solid Zero Baseline Axis */}
              <line
                x1={margin.left - 6}
                y1={zeroY}
                x2={margin.left + chartWidth + 6}
                y2={zeroY}
                stroke="currentColor"
                strokeOpacity="0.30"
                strokeWidth="1.5"
                data-testid="zero-axis-line"
              />
              <text
                x={margin.left - 8}
                y={zeroY + 3.5}
                textAnchor="end"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                fill="currentColor"
                fillOpacity="0.75"
              >
                0.0
              </text>

              {/* Dashed Mean Amplitude Line (ᾱ) */}
              <g data-testid="mean-amplitude-line-group">
                <line
                  x1={margin.left}
                  y1={meanY}
                  x2={margin.left + chartWidth}
                  y2={meanY}
                  stroke="#D97706"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                  data-testid="mean-amplitude-line"
                />
                <rect
                  x={margin.left + chartWidth + 6}
                  y={meanY - 10}
                  width="62"
                  height="20"
                  rx="4"
                  fill="#FEF3C7"
                  stroke="#F59E0B"
                  strokeWidth="1"
                />
                <text
                  x={margin.left + chartWidth + 37}
                  y={meanY + 3.5}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="#92400E"
                  data-testid="mean-amplitude-label"
                >
                  ᾱ={meanAmplitude.toFixed(2)}
                </text>
              </g>

              {/* Signed Amplitude Bars */}
              {basisStates.map((state, idx) => {
                const isMarked = state === targetMarkedState;
                const alpha = getSignedAmplitude(currentStep, state);
                const prob =
                  currentStep?.basisProbabilities?.[state] ?? Math.min(1.0, alpha * alpha);

                const slotCenter = margin.left + idx * slotWidth + slotWidth / 2;
                const barX = slotCenter - barWidth / 2;

                // Compute bar y and height based on sign
                let barY: number;
                let barHeight: number;
                const magnitude = Math.abs(alpha);
                const computedHeight = Math.max(2, magnitude * scale);

                if (alpha >= 0) {
                  barY = zeroY - computedHeight;
                  barHeight = computedHeight;
                } else {
                  barY = zeroY;
                  barHeight = computedHeight;
                }

                // Bar color per spec:
                // Marked state: Electric Cyan (#00D4FF)
                // Non-marked states: Cobalt (#1E40AF)
                const fillColor = isMarked ? '#00D4FF' : '#1E40AF';
                const strokeColor = isMarked ? '#00B4D8' : '#172554';

                // Text label position
                const textY = alpha >= 0 ? barY - 6 : barY + barHeight + 12;

                return (
                  <g
                    key={`basis-bar-${state}`}
                    data-testid={`basis-bar-${state}`}
                    data-marked={isMarked ? 'true' : 'false'}
                    data-amplitude={alpha.toFixed(4)}
                  >
                    {/* The Amplitude Bar */}
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      rx={3}
                      ry={3}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isMarked ? 1.5 : 1}
                      filter={isMarked ? 'url(#cyanGlow)' : undefined}
                      className="transition-all duration-300"
                    />

                    {/* Amplitude value text above or below bar */}
                    <text
                      x={slotCenter}
                      y={textY}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight={isMarked ? 'bold' : 'normal'}
                      fill={isMarked ? '#008ba3' : '#1E40AF'}
                      data-testid={`amplitude-val-${state}`}
                    >
                      {alpha >= 0 ? `+${alpha.toFixed(3)}` : alpha.toFixed(3)}
                    </text>

                    {/* Basis State Ket Label */}
                    <text
                      x={slotCenter}
                      y={svgHeight - 32}
                      textAnchor="middle"
                      fontSize={isMarked ? '12' : '11'}
                      fontFamily="monospace"
                      fontWeight={isMarked ? 'bold' : 'normal'}
                      fill={isMarked ? '#008ba3' : 'currentColor'}
                      data-testid={`ket-label-${state}`}
                    >
                      |{state}⟩
                    </text>

                    {/* State Probability */}
                    <text
                      x={slotCenter}
                      y={svgHeight - 16}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fill="currentColor"
                      fillOpacity={isMarked ? '0.9' : '0.45'}
                    >
                      {(prob * 100).toFixed(1)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Color legend footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-xs inline-block"
                  style={{ backgroundColor: '#00D4FF' }}
                />
                <span className="text-text-primary font-medium">
                  Marked Target |{targetMarkedState}⟩ (Electric Cyan #00D4FF)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-xs inline-block"
                  style={{ backgroundColor: '#1E40AF' }}
                />
                <span className="text-text-secondary">
                  Non-Marked States (Cobalt #1E40AF)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-amber-700">
              <span className="w-5 h-0.5 border-t-2 border-dashed border-amber-600 inline-block" />
              <span>Dashed Line: Mean Amplitude ᾱ</span>
            </div>
          </div>
        </div>

        {/* Pedagogical Explanation Callout */}
        <div
          className="rounded-lg bg-surface-raised border border-border-subtle p-3.5 flex items-start gap-3 text-xs"
          data-testid="pedagogical-explanation-box"
        >
          <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-semibold text-text-primary flex items-center gap-2">
              <span>{stepMeta.title}</span>
              <span className="text-text-muted font-normal">({stepMeta.category})</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {stepMeta.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GroverAmplitudeScrubber;
