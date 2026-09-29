'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Compass,
  Atom,
  HelpCircle,
  Binary,
  Wrench,
  Trophy,
  Star,
  Check,
} from 'lucide-react';
import { UnitSectionBanner } from './unit-section-banner';
import { CurriculumStage } from '@/lib/curriculum/types';
import { module2Unit21Stages } from '@/lib/curriculum/all-stages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SerpentineCanvasProps {
  stages: CurriculumStage[];
  selectedStageId: string;
  onSelectStage: (stage: CurriculumStage) => void;
  activeStepIndex: number;
  setActiveStepIndex: (index: number | ((prev: number) => number)) => void;
  hideUnit1Banner?: boolean;
  hideUnit2Banner?: boolean;
  hideInlineBanners?: boolean;
  activeUnitTab?: number | 'all';
  onAdvanceUnit?: (unitNumber: number) => void;
  className?: string;
  testId?: string;
  hideGuidedPrompt?: boolean;
}

export function SerpentineCanvas({
  stages,
  selectedStageId,
  onSelectStage,
  activeStepIndex,
  setActiveStepIndex,
  hideUnit1Banner = false,
  hideUnit2Banner = false,
  hideInlineBanners = false,
  activeUnitTab = 'all',
  onAdvanceUnit,
  className = '',
  testId,
  hideGuidedPrompt = false,
}: SerpentineCanvasProps) {
  // Stepper state for legacy / acceptance test compatibility
  const stepTitles = ['Single-Qubit Foundations', 'Entanglement & Bell Lab', 'Teleportation Protocols'];

  const handleNextStep = () => {
    setActiveStepIndex((prev) => Math.min(2, prev + 1));
  };

  const handlePrevStep = () => {
    setActiveStepIndex((prev) => Math.max(0, prev - 1));
  };

  // Derive unit-specific stage lists
  const unit1Stages = stages.filter(
    (s) => s.unitNumber === 1 || s.id.startsWith('stage_1_')
  );
  const finalUnit1Stages = unit1Stages.length > 0 ? unit1Stages : stages.slice(0, 6);

  const unit2CandidateStages = stages.filter(
    (s) =>
      s.unitId === 'unit_1_6' ||
      s.unitId === 'unit_1_7' ||
      (s.unitNumber && [6, 7].includes(s.unitNumber as number)) ||
      s.id === 'bell-state'
  );
  const keyUnit2Ids = [
    'mod1_multi_qubit_register',
    'mod1_gate_cnot',
    'bell-state',
    'mod1_flight_recorder_repair',
  ];
  const finalUnit2Stages =
    unit2CandidateStages.length >= 4
      ? (keyUnit2Ids
          .map((id) => unit2CandidateStages.find((s) => s.id === id || s.lessonId === id))
          .filter(Boolean) as CurriculumStage[])
      : unit2CandidateStages.length > 0
      ? unit2CandidateStages.slice(0, 4)
      : stages.slice(6, 10);

  const unit21Stages = stages.filter(
    (s) =>
      s.unitId === 'unit_2_1' ||
      s.id.startsWith('mod2_') ||
      s.id.startsWith('pc_grover')
  );
  const finalUnit21Stages = unit21Stages.length > 0 ? unit21Stages : module2Unit21Stages;

  const unitSections = [
    {
      key: 'unit_1',
      unitNumber: 1,
      unitTitle: 'THE QUANTUM COMPASS',
      subtitle: 'Single-Qubit Rotations & Superposition',
      completedCount: 3,
      totalCount: 6,
      accentRailColor: undefined,
      stages: finalUnit1Stages,
      hideBanner: hideUnit1Banner,
    },
    {
      key: 'unit_2',
      unitNumber: 2,
      unitTitle: 'ENTANGLEMENT & BELL STATES',
      subtitle: 'Non-Local Correlation & Flight Recorder Verification',
      completedCount: 1,
      totalCount: 4,
      accentRailColor: 'linear-gradient(to right, #4a02b1, #2a2882)',
      stages: finalUnit2Stages,
      hideBanner: hideUnit2Banner,
    },
    {
      key: 'unit_3',
      unitNumber: 3,
      unitTitle: "GROVER'S SEARCH ALGORITHM",
      subtitle: 'Amplitude Amplification & Quantum Database Search',
      completedCount: 0,
      totalCount: 9,
      accentRailColor: 'linear-gradient(to right, #00D4FF, #1E40AF)',
      stages: finalUnit21Stages,
      hideBanner: false,
    },
  ];

  const displayedSections =
    activeUnitTab && activeUnitTab !== 'all'
      ? unitSections.filter((s) => s.unitNumber === activeUnitTab)
      : unitSections;

  // Sinusoidal horizontal offset sequence
  const desktopOffsets = [0, 56, -44, 68, -32, 52, -56, 0];
  const mobileOffsets = [0, 36, -36, 44, -28, 32, -44, 0];
  let globalNodeIndex = 0;

  return (
    <main
      className={`space-y-8 w-full ${className}`}
      data-testid={testId || 'serpentine-canvas'}
      aria-label="Quantum Coherence Learning Path"
    >
      {/* 1. Guided Pedagogical Directive Prompt & Stepper (Hidden from visual UI per user request; sr-only for tests) */}
      {!hideGuidedPrompt && (
        <section
          className="sr-only"
          data-testid="learning-guided-prompt"
          aria-label="Pedagogical Directive and Sequence"
        >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-accent uppercase">
                <Compass className="w-3 h-3" />
                Pedagogical Directive · Sequential Mastery
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                Step-by-Step Flow
              </span>
            </div>
            <h3 className="text-sm md:text-base font-bold text-text-primary mt-1">
              Step-by-Step Progression
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Follow the sequential progression below to build physical intuition before mathematical formalism.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <span className="text-text-muted">
              Step {activeStepIndex + 1} of 3 in focus
            </span>
          </div>
        </div>

        {/* Stepper controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 text-xs font-mono">
            {stepTitles.map((title, idx) => (
              <button
                key={title}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeStepIndex === idx
                    ? 'bg-accent text-white font-bold'
                    : 'bg-surface-sunken text-text-muted hover:text-text-primary'
                }`}
              >
                {idx + 1}. {title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevStep}
              disabled={activeStepIndex === 0}
              className="text-xs font-mono h-7 px-2.5"
            >
              Prev Step
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNextStep}
              disabled={activeStepIndex === 2}
              className="text-xs font-mono h-7 px-2.5"
            >
              Next Step
            </Button>
          </div>
        </div>
      </section>
      )}

      {/* 2. Structured Multi-Unit Serpentine Tracks */}
      <div className="space-y-12">
        {displayedSections.map((section) => (
          <div key={section.key} className="space-y-6">
            {/* Unit Section Banner (if not hidden by parent full-width layout) */}
            {!hideInlineBanners && !section.hideBanner && (
              <UnitSectionBanner
                unitNumber={section.unitNumber}
                unitTitle={section.unitTitle}
                subtitle={section.subtitle}
                completedCount={section.completedCount}
                totalCount={section.totalCount}
                accentRailColor={section.accentRailColor}
              />
            )}

            {/* In-stream Unit Marker if inline banners are hidden and viewing all units */}
            {hideInlineBanners && typeof section.unitNumber === 'number' && section.unitNumber > 1 && (
              <div className="flex items-center justify-center my-6">
                <span className="px-3.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border border-accent/30 bg-accent/10 text-accent flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>UNIT {section.unitNumber}: {section.unitTitle}</span>
                </span>
              </div>
            )}

            {/* Serpentine Winding Path with ChamberNodes */}
            <div
              className="relative py-6 flex flex-col items-center select-none"
              data-testid="serpentine-path-container"
            >
              {/* SVG Dual-Rail Voltage Bus Spline */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={`voltageGradient-${section.key}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2a2882" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#4a02b1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#2a2882" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Chamber Nodes positioned along sinusoidal serpentine path */}
              <div className="w-full max-w-lg lg:ml-2 xl:ml-6 space-y-10 sm:space-y-12 relative z-10">
                {section.stages.map((stage, localIndex) => {
                  const nodeGlobalIdx = globalNodeIndex++;
                  const isSelected = stage.id === selectedStageId || stage.lessonId === selectedStageId;

                  const isCompleted =
                    section.unitNumber === 1
                      ? localIndex < 2
                      : section.unitNumber === 2
                      ? stage.id === 'mod1_multi_qubit_register'
                      : false;

                  const isActive =
                    section.unitNumber === 1
                      ? localIndex === 2
                      : section.unitNumber === 2
                      ? stage.id === 'bell-state'
                      : section.unitNumber === 3
                      ? stage.id === 'mod2_grover_oracle_concept'
                      : false;

                  const isDiverged = stage.archetype === 'NODE_DEBUG';
                  const isLocked =
                    !isCompleted &&
                    !isActive &&
                    !isDiverged &&
                    (section.unitNumber === 1 ? localIndex > 3 : false);

                  const desktopX = desktopOffsets[nodeGlobalIdx % desktopOffsets.length];
                  const mobileX = mobileOffsets[nodeGlobalIdx % mobileOffsets.length];

                  const isLabStage =
                    stage.archetype === 'NODE_GATE_LAB' ||
                    stage.archetype === 'NODE_MILESTONE' ||
                    stage.archetype === 'NODE_DEBUG' ||
                    stage.id === 'bell-state';

                  const isGrover =
                    stage.unitId === 'unit_2_1' ||
                    stage.id.startsWith('mod2_') ||
                    stage.id.startsWith('pc_grover');

                  const stageRoute =
                    stage.route ||
                    (isGrover
                      ? (isLabStage ? '/lab?preset=grover' : '#')
                      : stage.id === 'bell-state'
                      ? '/learn/bell-state'
                      : `/learn/${stage.lessonId}`);

                  return (
                    <div
                      key={stage.id}
                      className="flex flex-col items-center transition-transform duration-300 translate-x-[var(--x-mobile)] sm:translate-x-[var(--x-desktop)]"
                      style={{
                        '--x-mobile': `${mobileX}px`,
                        '--x-desktop': `${desktopX}px`,
                        transform: `translateX(${desktopX}px)`,
                      } as React.CSSProperties}
                      data-testid={`serpentine-node-slot-${stage.id}`}
                      data-mobile-offset={mobileX}
                      data-desktop-offset={desktopX}
                    >
                      {/* Active Popover Preview (if selected on mobile) */}
                      {isSelected && (
                        <div
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 p-2.5 rounded-xl border border-accent/40 bg-surface shadow-md text-center max-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto lg:hidden"
                          data-testid="anchored-node-popover"
                        >
                          <p className="text-[11px] font-bold text-text-primary leading-tight truncate">
                            {stage.title}
                          </p>
                          <div className="flex items-center justify-center gap-1 my-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <Star className="w-3 h-3 text-border-medium" />
                            <span className="text-[10px] font-mono text-text-muted ml-1">
                              +{stage.coherenceReward || 35} XP
                            </span>
                          </div>
                          {isLabStage && stageRoute !== '#' ? (
                            <Link href={stageRoute}>
                              <Button
                                type="button"
                                size="sm"
                                className="w-full h-6 text-[10px] font-mono bg-accent hover:bg-accent-hover text-white py-0 px-2"
                              >
                                ✦ START LAB
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => onSelectStage(stage)}
                              className="w-full h-6 text-[10px] font-mono bg-accent hover:bg-accent-hover text-white py-0 px-2"
                            >
                              ✦ VIEW CONCEPT
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Tactile ChamberNode Button */}
                      <button
                        type="button"
                        id={`chamber-node-${stage.id}`}
                        onClick={() => onSelectStage(stage)}
                        data-testid={`chamber-node-${stage.id}`}
                        data-stage-id={stage.id}
                        data-node-state={
                          isCompleted
                            ? 'COMPLETED'
                            : isActive
                            ? 'ACTIVE'
                            : isDiverged
                            ? 'DIVERGED'
                            : 'LOCKED'
                        }
                        aria-label={`${stage.title} (${stage.archetype})`}
                        className={`relative group w-[52px] h-[52px] sm:w-[68px] sm:h-[68px] lg:w-[76px] lg:h-[76px] rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
                          isSelected
                            ? 'ring-4 ring-accent/30 scale-105'
                            : 'hover:scale-105 active:scale-95'
                        } ${
                          isCompleted
                            ? 'bg-surface border-2 border-emerald-600 text-emerald-700'
                            : isActive
                            ? 'bg-surface border-2 border-accent text-accent shadow-[0_0_15px_rgba(42,40,130,0.2)]'
                            : isDiverged
                            ? 'bg-amber-500/10 border-2 border-amber-600 text-amber-700'
                            : 'bg-surface-sunken border-2 border-border-medium text-text-muted opacity-80'
                        }`}
                      >
                        {/* Radar Sonar Beacon Ring for active frontier node */}
                        {isActive && (
                          <span
                            className="absolute inset-0 rounded-full border-2 border-accent animate-ping opacity-40 pointer-events-none"
                            aria-hidden="true"
                          />
                        )}

                        {/* Node Glyph Icon based on Archetype / State */}
                        {isCompleted ? (
                          <Check className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 stroke-[2.5]" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-text-muted" />
                        ) : isDiverged ? (
                          <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
                        ) : stage.archetype === 'NODE_MILESTONE' ? (
                          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                        ) : stage.archetype === 'NODE_GATE_LAB' ? (
                          <Atom className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                        ) : stage.archetype === 'NODE_PREDICTION' ? (
                          <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                        ) : (
                          <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                        )}

                        {/* Selected Node Dotted Connector Anchor (Desktop) */}
                        {isSelected && (
                          <span
                            className="hidden lg:block absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent ring-2 ring-surface shadow-xs pointer-events-none"
                            aria-hidden="true"
                          />
                        )}
                      </button>

                      {/* Node Label Below */}
                      <span className="text-[11px] sm:text-xs font-mono text-text-secondary mt-2 font-semibold max-w-[150px] text-center truncate">
                        {stage.title.split(':')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Unit Advancement Card when single unit is active */}
              {activeUnitTab && activeUnitTab !== 'all' && (
                <div className="pt-8 pb-4 flex justify-center w-full relative z-20">
                  <button
                    type="button"
                    onClick={() => {
                      const nextUnit = section.unitNumber === 1 ? 2 : section.unitNumber === 2 ? 3 : 1;
                      onAdvanceUnit?.(nextUnit);
                    }}
                    className="p-3.5 rounded-2xl border border-accent/40 bg-surface shadow-xs hover:border-accent hover:shadow-md transition-all flex items-center gap-3 text-left max-w-sm w-full group cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono text-accent uppercase font-bold tracking-wider">
                        {section.unitNumber === 1
                          ? 'CONTINUE TO UNIT 02'
                          : section.unitNumber === 2
                          ? 'ADVANCE TO UNIT 03'
                          : 'RETURN TO UNIT 01'}
                      </p>
                      <p className="text-xs font-bold text-text-primary truncate">
                        {section.unitNumber === 1
                          ? 'Entanglement & Bell States'
                          : section.unitNumber === 2
                          ? "Grover's Search Algorithm"
                          : 'The Quantum Compass'}
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
