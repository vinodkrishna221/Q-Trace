'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Zap,
  Clock,
  Gauge,
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
  HelpCircle,
  Shield,
  Layers,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CurriculumStage } from '@/lib/curriculum/types';
import { cn } from '@/lib/utils';

export interface RightStageInspectorProps {
  selectedStage: CurriculumStage | null;
  onEnterChamber?: (stage: CurriculumStage) => void;
  className?: string;
  testId?: string;
}

export function RightStageInspector({
  selectedStage,
  onEnterChamber,
  className = '',
  testId,
}: RightStageInspectorProps) {
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);
  const [completedConceptIds, setCompletedConceptIds] = React.useState<Set<string>>(new Set());

  // Reset selected prediction option when stage changes
  React.useEffect(() => {
    setSelectedOptionId(null);
  }, [selectedStage?.id]);

  if (!selectedStage) {
    return (
      <aside
        className={`w-full p-5 rounded-2xl border border-border-subtle bg-surface text-text-muted text-center space-y-2 ${className}`}
        data-testid={testId || 'stage-inspector-panel'}
      >
        <p className="text-xs font-mono">Select a Chamber Node to view telemetry</p>
      </aside>
    );
  }

  const {
    stageNumber,
    unitNumber,
    archetype,
    title,
    estimatedMinutes,
    coherenceReward,
    analogyHook,
    conceptSummary,
    predictionCheckpoint,
    route,
    cnotTruthTable,
    bellSynthesis,
    gateTruthTable,
    speedupTable,
    groverMath,
  } = selectedStage;

  // Derive difficulty from unit/stage
  const safeUnitNumber = unitNumber ?? 1;
  const difficulty =
    safeUnitNumber >= 8 ? 'Advanced' : safeUnitNumber >= 6 ? 'Intermediate' : 'Introductory';

  // Format archetype badge
  const archetypeLabel = archetype
    .replace('NODE_', '')
    .replace('_', ' ');

  const isGrover =
    selectedStage.unitId === 'unit_2_1' ||
    selectedStage.id.startsWith('mod2_') ||
    selectedStage.id.startsWith('pc_grover');

  const isLabStage =
    archetype === 'NODE_GATE_LAB' ||
    archetype === 'NODE_MILESTONE' ||
    archetype === 'NODE_DEBUG' ||
    selectedStage.id === 'bell-state';

  const isConceptCompleted = completedConceptIds.has(selectedStage.id);

  const handleCompleteConcept = () => {
    setCompletedConceptIds((prev) => new Set([...prev, selectedStage.id]));
    onEnterChamber?.(selectedStage);
  };

  // Generate dynamic Qiskit preview based on stage
  const qiskitCode =
    isGrover
      ? `# Grover 3-Qubit Search (|101> Marked State)\nfrom qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3, 3)\nqc.h([0, 1, 2])        # Equal superposition\nqc.cz(0, 2)            # Phase oracle (mark |101>)\nqc.h([0, 1, 2])        # Diffusion start\nqc.x([0, 1, 2])\nqc.ccx(0, 1, 2)        # Multi-controlled Toffoli\nqc.x([0, 1, 2])\nqc.h([0, 1, 2])        # Inversion complete\nqc.measure_all()`
      : selectedStage.id === 'bell-state'
      ? `from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)\nqc.h(0)          # Superposition on q0\nqc.cx(0, 1)      # Entangle q0 -> q1\nqc.measure_all() # |Phi+> state`
      : selectedStage.id.includes('cnot')
      ? `from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.cx(0, 1)      # Controlled-X gate`
      : selectedStage.id.includes('hadamard') || selectedStage.id.includes('superposition')
      ? `from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.h(0)          # Rotate |0> -> |+>`
      : selectedStage.id.includes('teleportation')
      ? `from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3, 2)\nqc.h(1)\nqc.cx(1, 2)      # Bell pair (q1, q2)\nqc.cx(0, 1)\nqc.h(0)\nqc.measure([0, 1], [0, 1])`
      : `from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.x(0)          # Pauli-X bit flip`;

  const targetRoute =
    route ||
    (isGrover
      ? '/learn/grover'
      : selectedStage.id === 'bell-state'
      ? '/learn/bell-state'
      : selectedStage.lessonId && selectedStage.lessonId !== selectedStage.id
      ? `/learn/${selectedStage.lessonId}`
      : undefined);

  return (
    <aside
      className={`space-y-4 w-full select-none ${className}`}
      data-testid={testId || 'stage-inspector-panel'}
      aria-label="Selected Stage Telemetry Inspector"
    >
      <Card
        key={selectedStage.id}
        className="relative border border-border-subtle bg-surface shadow-md overflow-hidden transition-all duration-300 animate-in fade-in-60 slide-in-from-left-4"
      >
        {/* Dotted Arrow Receiver Anchor (Desktop) */}
        <div
          className="hidden lg:block absolute -left-1.5 top-5 w-3 h-3 rounded-full bg-accent ring-2 ring-surface shadow-xs pointer-events-none"
          aria-hidden="true"
        />

        {/* Header Ribbon */}
        <CardHeader className="p-4 pb-3 border-b border-border-subtle bg-surface-raised/40 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-accent uppercase">
              STAGE {stageNumber ? String(stageNumber).padStart(2, '0') : '01'} INSPECTION
            </span>
            <Badge
              variant="outline"
              className="text-[9px] font-mono border-accent/40 bg-accent/10 text-accent uppercase px-1.5 py-0"
              data-testid="inspector-archetype-badge"
            >
              {archetypeLabel}
            </Badge>
          </div>

          <CardTitle
            className="text-sm md:text-base font-bold text-text-primary leading-tight"
            data-testid="inspector-stage-title"
          >
            {title}
          </CardTitle>

          {analogyHook && (
            <p className="text-[11px] text-text-secondary italic leading-relaxed pt-0.5">
              "{analogyHook}"
            </p>
          )}
        </CardHeader>

        <CardContent className="p-4 sm:p-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: Telemetry & Concepts */}
            <div className="space-y-4">
              {/* 1. Deep Telemetry Matrix */}
              <div className="grid grid-cols-2 gap-2" data-testid="inspector-telemetry-grid">
                <div className="p-2.5 rounded-lg bg-surface-sunken border border-border-subtle">
                  <span className="block text-[9px] font-mono text-text-muted uppercase">Difficulty</span>
                  <span className="font-semibold text-text-primary text-[11px] flex items-center gap-1 mt-0.5">
                    <Gauge className="w-3.5 h-3.5 text-accent" />
                    {difficulty}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-sunken border border-border-subtle">
                  <span className="block text-[9px] font-mono text-text-muted uppercase">Est. Time</span>
                  <span className="font-semibold text-text-primary text-[11px] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    ~{estimatedMinutes || 4} min
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-sunken border border-border-subtle">
                  <span className="block text-[9px] font-mono text-text-muted uppercase">Coherence Yield</span>
                  <span className="font-semibold text-violet-700 dark:text-violet-400 text-[11px] flex items-center gap-1 mt-0.5">
                    <Zap className="w-3.5 h-3.5 fill-violet-600 text-violet-600" />
                    +{coherenceReward || 35} Joules
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-sunken border border-border-subtle">
                  <span className="block text-[9px] font-mono text-text-muted uppercase">Shield Restore</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px] flex items-center gap-1 mt-0.5">
                    <Shield className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                    +15% Coherence
                  </span>
                </div>
              </div>

              {/* 2. Concept Summary Telemetry Box */}
              {conceptSummary && (
                <div
                  className="p-3 rounded-xl border border-border-subtle bg-surface-sunken/60 text-text-secondary leading-relaxed text-[11px] space-y-1"
                  data-testid="inspector-concept-summary"
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted block">
                    Conceptual Telemetry
                  </span>
                  <p>{conceptSummary}</p>
                </div>
              )}

              {/* 3. Key Concepts */}
              <div className="space-y-1.5" data-testid="inspector-key-concepts">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
                  Key Concepts Grounded
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {isGrover ? (
                    <>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-accent/10 border border-accent/25 text-accent font-medium">
                        Phase Oracle
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/10 border border-violet-500/25 text-violet-700 font-medium">
                        Inversion About Mean
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-surface-sunken border border-border-subtle text-text-secondary font-medium">
                        Toffoli CCX
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 font-medium">
                        O(√N) Speedup
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-accent/10 border border-accent/25 text-accent font-medium">
                        Superposition
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/10 border border-violet-500/25 text-violet-700 font-medium">
                        Unitary Inversion
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-surface-sunken border border-border-subtle text-text-secondary font-medium">
                        Born Rule
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 4. Prerequisite Status */}
              <div className="space-y-1.5 pt-1" data-testid="inspector-prerequisites">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
                  Prerequisite Status
                </span>
                <div className="space-y-1 text-[11px] font-mono">
                  {isGrover ? (
                    <>
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Unit 01: Superposition & Inversion [Mastered]</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Unit 02: Multi-Qubit & CNOT [Mastered]</span>
                      </div>
                      <div className="flex items-center gap-2 text-accent">
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-accent flex items-center justify-center text-[9px]">
                          •
                        </span>
                        <span>Unit 03: Grover Search & Amplitude Amplification [Active]</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Concept 01: Compass [Mastered]</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Gate 02: Pauli-X [Mastered]</span>
                      </div>
                      <div className="flex items-center gap-2 text-accent">
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-accent flex items-center justify-center text-[9px]">
                          •
                        </span>
                        <span>Checkpoint 03: Ready</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 5. Scientific Honesty Callout */}
              <div className="p-2.5 rounded-lg border border-border-subtle bg-surface-raised/40 text-[10px] text-text-muted flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span className="italic leading-tight">
                  "Mathematical representation, not physical trajectory."
                </span>
              </div>
            </div>

            {/* Right Column: Code, Checkpoint & CTA */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Gate Truth Table (if available, e.g. CCX Toffoli) */}
                {gateTruthTable && (
                  <div
                    className="p-3 rounded-xl border border-accent/25 bg-accent/5 space-y-2"
                    data-testid="inspector-truth-table"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-accent">
                      <span>{gateTruthTable.gate} Truth Table</span>
                      <span className="text-text-muted">
                        {gateTruthTable.controls} controls, {gateTruthTable.targets} target
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                      {gateTruthTable.truthTable.map((row, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-2 py-1 rounded bg-surface border border-border-subtle"
                        >
                          <span className="text-text-muted">{row.input}</span>
                          <span className="text-text-muted text-[8px]">➔</span>
                          <span
                            className={
                              row.input !== row.output
                                ? 'text-accent font-bold'
                                : 'text-text-secondary'
                            }
                          >
                            {row.output}
                          </span>
                        </div>
                      ))}
                    </div>
                    {gateTruthTable.universality && (
                      <p className="text-[9px] font-mono text-text-muted pt-0.5">
                        {gateTruthTable.universality}
                      </p>
                    )}
                  </div>
                )}

                {/* Speedup Complexity Table (if available, e.g. Grover Speedup) */}
                {speedupTable && (
                  <div
                    className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 space-y-2"
                    data-testid="inspector-speedup-table"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      <span>Speedup Matrix: O(√N) vs Classical O(N)</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px] font-mono text-left">
                        <thead>
                          <tr className="border-b border-border-subtle text-text-muted">
                            <th className="py-1">Items</th>
                            <th className="py-1">Classical Avg</th>
                            <th className="py-1 text-emerald-600 font-bold">Grover (k)</th>
                            <th className="py-1 text-right">P(Success)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {speedupTable.items.map((itemCount, i) => (
                            <tr key={i} className="border-b border-border-subtle/40">
                              <td className="py-1 font-semibold">{itemCount}</td>
                              <td className="py-1 text-text-muted">
                                {speedupTable.classicalAvg[i]}
                              </td>
                              <td className="py-1 text-emerald-600 font-bold">
                                {speedupTable.groverIterations[i]}
                              </td>
                              <td className="py-1 text-right text-text-primary">
                                {(speedupTable.successProbability[i] * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Prediction Checkpoint with Interactive Selection */}
                {predictionCheckpoint && (
                  <div
                    className="p-3 rounded-xl border border-accent/30 bg-accent/5 space-y-2.5"
                    data-testid="inspector-checkpoint-preview"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-accent uppercase">
                      <HelpCircle className="w-3.5 h-3.5 text-accent" />
                      <span>Prediction Checkpoint</span>
                    </div>
                    <p className="text-[11px] text-text-primary font-medium leading-snug">
                      {predictionCheckpoint.prompt}
                    </p>
                    <div className="space-y-1.5 pt-0.5">
                      {predictionCheckpoint.options.slice(0, 3).map((opt) => {
                        const isSelected = selectedOptionId === opt.id;
                        const isCorrect = opt.correct;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedOptionId(opt.id)}
                            className={cn(
                              'p-2 rounded-lg border text-[10px] font-mono cursor-pointer transition-all flex flex-col gap-1',
                              isSelected
                                ? isCorrect
                                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                                  : 'border-rose-400 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                                : 'border-border-subtle bg-surface text-text-secondary hover:border-border-medium hover:bg-surface-raised'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'w-3 h-3 rounded-full border flex items-center justify-center shrink-0',
                                  isSelected
                                    ? isCorrect
                                      ? 'border-emerald-600 bg-emerald-600 text-white'
                                      : 'border-rose-500 bg-rose-500 text-white'
                                    : 'border-border-medium bg-surface'
                                )}
                              >
                                {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                              </div>
                              <span className="font-semibold leading-snug">
                                {'label' in opt ? opt.label : opt.text}
                              </span>
                            </div>
                            {isSelected && 'explanation' in opt && Boolean(opt.explanation) && (
                              <p className="pl-5 text-[9px] text-text-secondary font-sans leading-normal">
                                {String(opt.explanation)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Qiskit Preview Block */}
                <div className="space-y-1.5" data-testid="inspector-qiskit-preview">
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                    <span className="flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5 text-accent" />
                      Qiskit Aer Runtime Snippet
                    </span>
                    <span>1024 shots</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-surface-sunken border border-border-subtle font-mono text-[10px] text-text-primary overflow-x-auto leading-relaxed">
                    <code>{qiskitCode}</code>
                  </pre>
                </div>
              </div>

              {/* Action Button: Conditional Lab vs In-Situ Concept */}
              <div className="pt-2">
                {targetRoute ? (
                  <Link href={targetRoute} className="w-full block">
                    <Button
                      type="button"
                      className="w-full gap-2 bg-accent hover:bg-accent-hover text-white font-mono text-xs font-semibold py-3 h-11 shadow-sm transition-transform active:scale-[0.98]"
                      data-testid="enter-chamber-button"
                      onClick={() => onEnterChamber?.(selectedStage)}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>ENTER CHAMBER</span>
                      <span className="text-[10px] opacity-85 font-normal">
                        {isLabStage ? '· LAUNCH LAB ➔' : '· ENTER LESSON ➔'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    type="button"
                    className={cn(
                      'w-full gap-2 font-mono text-xs font-semibold py-3 h-11 shadow-sm transition-all active:scale-[0.98]',
                      isConceptCompleted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-accent hover:bg-accent-hover text-white'
                    )}
                    data-testid="enter-chamber-button"
                    onClick={handleCompleteConcept}
                  >
                    {isConceptCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ENTER CHAMBER</span>
                        <span className="text-[10px] opacity-90 font-normal">
                          · CONCEPT GROUNDED ✓
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current" />
                        <span>ENTER CHAMBER</span>
                        <span className="text-[10px] opacity-85 font-normal">
                          · COMPLETE CONCEPT
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
                <p className="text-[10px] font-mono text-text-muted text-center mt-1.5">
                  [Press ↵ to Launch]
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
