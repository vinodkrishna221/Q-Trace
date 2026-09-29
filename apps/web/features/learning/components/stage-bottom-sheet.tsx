'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  X,
  Zap,
  Shield,
  Clock,
  Gauge,
  HelpCircle,
  Code2,
  CheckCircle2,
  Info,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CurriculumStage } from '@/lib/curriculum/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface StageBottomSheetProps {
  stage: CurriculumStage | null;
  isOpen: boolean;
  onClose: () => void;
  onEnterChamber?: (stage: CurriculumStage) => void;
  selectedPredictionOption?: string | null;
  onSelectPredictionOption?: (optionId: string) => void;
  className?: string;
}

export function StageBottomSheet({
  stage,
  isOpen,
  onClose,
  onEnterChamber,
  selectedPredictionOption,
  onSelectPredictionOption,
  className = '',
}: StageBottomSheetProps) {
  const [internalSelectedOption, setInternalSelectedOption] = React.useState<string | null>(null);
  const [dragStartY, setDragStartY] = React.useState<number | null>(null);
  const [dragCurrentY, setDragCurrentY] = React.useState<number | null>(null);

  // Sync internal selected option
  React.useEffect(() => {
    if (selectedPredictionOption !== undefined) {
      setInternalSelectedOption(selectedPredictionOption);
    } else {
      setInternalSelectedOption(null);
    }
  }, [selectedPredictionOption, stage?.id]);

  // Handle escape key to dismiss
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Touch gesture handlers for swipe-down to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
    setDragCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY !== null) {
      setDragCurrentY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    if (dragStartY !== null && dragCurrentY !== null) {
      const deltaY = dragCurrentY - dragStartY;
      if (deltaY > 60) {
        onClose();
      }
    }
    setDragStartY(null);
    setDragCurrentY(null);
  };

  if (!stage) return null;

  const {
    title,
    archetype,
    estimatedMinutes = 4,
    coherenceReward = 35,
    shieldReward = 15,
    analogyHook,
    conceptSummary,
    predictionCheckpoint,
    handsOnLab,
    unitNumber = 1,
    stageNumber = '03',
  } = stage;

  // Archetype human badge
  const archetypeLabels: Record<string, string> = {
    NODE_CONCEPT: 'Foundational Concept',
    NODE_PREDICTION: 'Prediction Directive',
    NODE_GATE_LAB: 'Unitary Gate Chamber',
    NODE_DEBUG: 'Flight Recorder Diagnostics',
    NODE_MILESTONE: 'Milestone Capstone Boss',
    NODE_BONUS: 'Algorithmic Bridge',
  };
  const archetypeLabel = archetypeLabels[archetype] || 'Quantum Chamber';

  const difficulty =
    archetype === 'NODE_MILESTONE'
      ? 'Hard (Capstone)'
      : archetype === 'NODE_DEBUG'
      ? 'Diagnostic'
      : archetype === 'NODE_GATE_LAB'
      ? 'Medium'
      : 'Foundational';

  const isLabStage =
    archetype === 'NODE_GATE_LAB' ||
    archetype === 'NODE_MILESTONE' ||
    archetype === 'NODE_DEBUG' ||
    stage.id === 'bell-state';

  const isGrover =
    stage.unitId === 'unit_2_1' ||
    stage.id.startsWith('mod2_') ||
    stage.id.startsWith('pc_grover');

  const targetRoute =
    stage.route ||
    (isGrover
      ? (isLabStage ? '/lab?preset=grover' : undefined)
      : stage.id === 'bell-state' || stage.lessonId === 'bell-state'
      ? '/learn/bell-state'
      : stage.lessonId && stage.lessonId !== stage.id
      ? `/learn/${stage.lessonId}`
      : undefined);

  // Fallback Qiskit Aer Snippet
  const qiskitCode =
    handsOnLab?.codeSnippet ||
    (isGrover
      ? `# Grover 3-Qubit Search (|101> Marked State)\nfrom qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3, 3)\nqc.h([0, 1, 2])        # Equal superposition\nqc.cz(0, 2)            # Phase oracle\nqc.h([0, 1, 2])        # Diffusion start\nqc.x([0, 1, 2])\nqc.ccx(0, 1, 2)        # Multi-controlled Toffoli\nqc.x([0, 1, 2])\nqc.h([0, 1, 2])        # Inversion complete\nqc.measure_all()`
      : `# Q-Trace Telemetry Simulation
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1024)
result = job.result()
counts = result.get_counts()`);

  const handleOptionSelect = (optionId: string) => {
    setInternalSelectedOption(optionId);
    onSelectPredictionOption?.(optionId);
  };

  const activeOptionId = selectedPredictionOption ?? internalSelectedOption;

  // Touch drag offset calculation for spring effect
  const dragDelta =
    dragStartY !== null && dragCurrentY !== null
      ? Math.max(0, dragCurrentY - dragStartY)
      : 0;

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-auto transition-opacity duration-300 lg:hidden ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
      data-testid="stage-bottom-sheet-wrapper"
    >
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        data-testid="bottom-sheet-backdrop"
      />

      {/* 2. Spring-Animated Bottom Sheet Container (75vh) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${title} stage details`}
        data-testid="stage-bottom-sheet"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isOpen
            ? `translateY(${dragDelta}px)`
            : 'translateY(100%)',
          transition: dragStartY !== null ? 'none' : 'transform 380ms cubic-bezier(0.175, 0.885, 0.32, 1.15)',
        }}
        className={`fixed inset-x-0 bottom-0 z-50 h-[75vh] max-h-[75vh] bg-surface rounded-t-3xl border-t border-border-default shadow-2xl flex flex-col overflow-hidden will-change-transform ${className}`}
      >
        {/* 3. Drag Handle Pill */}
        <div
          className="pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing shrink-0 select-none"
          onClick={onClose}
          data-testid="sheet-drag-handle"
          aria-label="Drag down or tap to dismiss"
        >
          <div className="w-12 h-1.5 rounded-full bg-border-medium hover:bg-border-focus transition-colors" />
        </div>

        {/* 4. Sheet Header & Stage Meta */}
        <div className="px-5 pt-1 pb-3 border-b border-border-subtle shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-accent/40 bg-accent/10 text-accent uppercase tracking-wider font-semibold"
                data-testid="sheet-stage-badge"
              >
                STAGE {unitNumber}.{stageNumber} • {archetypeLabel}
              </Badge>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-sunken transition-colors cursor-pointer"
              aria-label="Close bottom sheet"
              data-testid="bottom-sheet-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2
            className="text-base sm:text-lg font-bold text-text-primary leading-tight mt-1.5"
            data-testid="sheet-stage-title"
          >
            {title}
          </h2>

          {(analogyHook || conceptSummary) && (
            <p className="text-xs text-text-secondary leading-relaxed mt-1 line-clamp-2">
              {analogyHook ? `"${analogyHook}"` : conceptSummary}
            </p>
          )}
        </div>

        {/* 5. Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {/* Deep Telemetry Matrix */}
          <div className="grid grid-cols-2 gap-2" data-testid="sheet-telemetry-grid">
            <div className="p-2.5 rounded-xl bg-surface-sunken border border-border-subtle flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-muted uppercase">Difficulty</span>
              <span className="font-semibold text-text-primary text-xs flex items-center gap-1">
                <Gauge className="w-3 h-3 text-accent" />
                {difficulty}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-sunken border border-border-subtle flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-muted uppercase">Est. Time</span>
              <span className="font-semibold text-text-primary text-xs flex items-center gap-1">
                <Clock className="w-3 h-3 text-accent" />
                ~{estimatedMinutes} min
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-sunken border border-border-subtle flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-muted uppercase">Coherence Yield</span>
              <span className="font-semibold text-violet-700 dark:text-violet-400 text-xs flex items-center gap-1">
                <Zap className="w-3 h-3 fill-violet-600 text-violet-600" />
                +{coherenceReward} XP
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-sunken border border-border-subtle flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-muted uppercase">Shield Restore</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1">
                <Shield className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                +{shieldReward}% Coherence
              </span>
            </div>
          </div>

          {/* Key Concepts Grounded Badges */}
          <div className="space-y-1.5" data-testid="sheet-key-concepts">
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block font-semibold">
              Key Concepts Grounded
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-accent/10 border border-accent/25 text-accent font-medium">
                Superposition
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/10 border border-violet-500/25 text-violet-700 dark:text-violet-300 font-medium">
                Unitary Inversion
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-surface-sunken border border-border-subtle text-text-secondary font-medium">
                Born Rule
              </span>
            </div>
          </div>

          {/* Prediction Checkpoint with Interactive Radio Options */}
          {predictionCheckpoint && (
            <div
              className="p-3.5 rounded-2xl border border-accent/30 bg-accent/5 space-y-2.5"
              data-testid="bottom-sheet-prediction-checkpoint"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-accent uppercase">
                <HelpCircle className="w-3.5 h-3.5 text-accent" />
                <span>Prediction Checkpoint</span>
              </div>
              <p className="text-xs text-text-primary font-medium leading-snug">
                {predictionCheckpoint.prompt}
              </p>

              {/* Radio options */}
              <div
                className="space-y-1.5 pt-1"
                role="radiogroup"
                aria-label={predictionCheckpoint.prompt}
                data-testid="bottom-sheet-prediction-options"
              >
                {predictionCheckpoint.options.map((opt) => {
                  const optId = opt.id;
                  const optLabel = 'label' in opt && opt.label ? opt.label : opt.text;
                  const isChecked = activeOptionId === optId;

                  return (
                    <label
                      key={optId}
                      data-testid={`sheet-prediction-option-${optId}`}
                      onClick={() => handleOptionSelect(optId)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'border-accent bg-accent/10 text-accent font-medium shadow-2xs ring-1 ring-accent/30'
                          : 'border-border-subtle bg-surface text-text-secondary hover:border-border-medium hover:bg-surface-raised'
                      }`}
                    >
                      <input
                        type="radio"
                        name="stage-prediction-radio"
                        value={optId}
                        checked={isChecked}
                        onChange={() => handleOptionSelect(optId)}
                        className="sr-only"
                      />
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked ? 'border-accent bg-accent' : 'border-border-strong bg-surface'
                        }`}
                      >
                        {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="flex-1 leading-snug">{optLabel}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Qiskit Aer Snippet Preview */}
          <div className="space-y-1.5" data-testid="sheet-qiskit-preview">
            <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
              <span className="flex items-center gap-1 font-semibold">
                <Code2 className="w-3 h-3 text-accent" />
                Qiskit Aer Execution Snippet
              </span>
              <span>1024 shots</span>
            </div>
            <pre className="p-3 rounded-xl bg-surface-sunken border border-border-subtle font-mono text-[10px] text-text-primary overflow-x-auto leading-relaxed">
              <code>{qiskitCode}</code>
            </pre>
          </div>

          {/* Scientific Honesty Callout */}
          <div className="p-2.5 rounded-xl border border-border-subtle bg-surface-raised/40 text-[10px] text-text-muted flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <span className="italic leading-tight">
              "Mathematical representation, not physical trajectory."
            </span>
          </div>
        </div>

        {/* 6. Footer: 48px Thumb Action CTA */}
        <div className="p-4 border-t border-border-subtle bg-surface shrink-0">
          {isLabStage && targetRoute ? (
            <Link href={targetRoute} className="w-full block">
              <Button
                type="button"
                className="w-full h-12 gap-2 bg-accent hover:bg-accent-hover text-white font-mono text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-[0.98] rounded-xl flex items-center justify-center cursor-pointer"
                data-testid="mobile-enter-chamber-btn"
                onClick={() => onEnterChamber?.(stage)}
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>✦ ENTER CHAMBER & RUN CIRCUIT</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button
              type="button"
              className="w-full h-12 gap-2 bg-accent hover:bg-accent-hover text-white font-mono text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-[0.98] rounded-xl flex items-center justify-center cursor-pointer"
              data-testid="mobile-enter-chamber-btn"
              onClick={() => {
                onEnterChamber?.(stage);
                onClose();
              }}
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>✦ ENTER CHAMBER · MASTER CONCEPT</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
