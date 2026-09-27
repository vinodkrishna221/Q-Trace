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
import { LearningHUD } from './learning-hud';
import { UnitSectionBanner } from './unit-section-banner';
import { CurriculumStage } from '@/lib/curriculum/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SerpentineCanvasProps {
  stages: CurriculumStage[];
  selectedStageId: string;
  onSelectStage: (stage: CurriculumStage) => void;
  activeStepIndex: number;
  setActiveStepIndex: (index: number | ((prev: number) => number)) => void;
  className?: string;
}

export function SerpentineCanvas({
  stages,
  selectedStageId,
  onSelectStage,
  activeStepIndex,
  setActiveStepIndex,
  className = '',
}: SerpentineCanvasProps) {
  // Stepper state for legacy / acceptance test compatibility
  const stepTitles = ['Single-Qubit Foundations', 'Entanglement & Bell Lab', 'Teleportation Protocols'];

  const handleNextStep = () => {
    setActiveStepIndex((prev) => Math.min(2, prev + 1));
  };

  const handlePrevStep = () => {
    setActiveStepIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <main
      className={`space-y-6 w-full ${className}`}
      data-testid="serpentine-canvas"
      aria-label="Quantum Coherence Learning Path"
    >
      {/* 1. Sticky Top HUD */}
      <LearningHUD />

      {/* 2. Guided Pedagogical Directive Prompt & Stepper (Preserves acceptance test compatibility) */}
      <section
        className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-xs space-y-4"
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

      {/* 3. Unit 1 Banner: The Quantum Compass */}
      <UnitSectionBanner
        unitNumber={1}
        unitTitle="THE QUANTUM COMPASS"
        subtitle="Single-Qubit Rotations & Superposition"
        completedCount={3}
        totalCount={6}
      />

      {/* 4. Serpentine Winding Path with ChamberNodes */}
      <div
        className="relative py-8 flex flex-col items-center select-none"
        data-testid="serpentine-path-container"
      >
        {/* SVG Dual-Rail Voltage Bus Spline */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="voltageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a2882" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#4a02b1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2a2882" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* List of Chamber Nodes positioned along sinusoidal serpentine path */}
        <div className="w-full max-w-md mx-auto space-y-7 relative z-10">
          {stages.slice(0, 8).map((stage, index) => {
            const isSelected = stage.id === selectedStageId || stage.lessonId === selectedStageId;
            const isCompleted = index < 2;
            const isActive = index === 2 || stage.id === 'bell-state';
            const isDiverged = stage.archetype === 'NODE_DEBUG';
            const isLocked = index > 3 && !isActive && !isDiverged;

            // Sinusoidal horizontal offset:
            // Mobile (<640px): 44px arc per UI Spec Section 4
            // Desktop (%640px): 56px arc
            const desktopOffsets = [0, 48, -48, 56, -32, 40, -56, 0];
            const mobileOffsets = [0, 36, -36, 44, -28, 32, -44, 0];
            const desktopX = desktopOffsets[index % desktopOffsets.length];
            const mobileX = mobileOffsets[index % mobileOffsets.length];

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
                {/* Active Popover Preview (if selected) */}
                {isSelected && (
                  <div
                    className="mb-2 p-2.5 rounded-xl border border-accent/40 bg-surface shadow-md text-center max-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                    data-testid="anchored-node-popover"
                  >
                    <p className="text-[11px] font-bold text-text-primary leading-tight truncate">
                      {stage.title}
                    </p>
                    <div className="flex items-center justify-center gap-1 my-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <Star className="w-3 h-3 text-border-medium" />
                      <span className="text-[10px] font-mono text-text-muted ml-1">+{stage.coherenceReward || 35} XP</span>
                    </div>
                    <Link href={stage.route || (stage.id === 'bell-state' ? '/learn/bell-state' : `/learn/${stage.lessonId}`)}>
                      <Button
                        type="button"
                        size="sm"
                        className="w-full h-6 text-[10px] font-mono bg-accent hover:bg-accent-hover text-white py-0 px-2"
                      >
                        ✦ START
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Tactile ChamberNode Button (52px on mobile per UI Spec Section 4) */}
                <button
                  type="button"
                  onClick={() => onSelectStage(stage)}
                  data-testid={`chamber-node-${stage.id}`}
                  data-stage-id={stage.id}
                  data-node-state={isCompleted ? 'COMPLETED' : isActive ? 'ACTIVE' : isDiverged ? 'DIVERGED' : 'LOCKED'}
                  aria-label={`${stage.title} (${stage.archetype})`}
                  className={`relative group w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
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
                    <Check className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-text-muted" />
                  ) : isDiverged ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : stage.archetype === 'NODE_MILESTONE' ? (
                    <Trophy className="w-5 h-5 text-accent" />
                  ) : stage.archetype === 'NODE_GATE_LAB' ? (
                    <Atom className="w-5 h-5 text-accent" />
                  ) : stage.archetype === 'NODE_PREDICTION' ? (
                    <HelpCircle className="w-5 h-5 text-accent" />
                  ) : (
                    <Compass className="w-5 h-5 text-accent" />
                  )}
                </button>

                {/* Node Label Below */}
                <span className="text-[10px] font-mono text-text-secondary mt-1 font-semibold max-w-[120px] text-center truncate">
                  {stage.title.split(':')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Unit 2 Banner: Entanglement */}
      <UnitSectionBanner
        unitNumber={2}
        unitTitle="ENTANGLEMENT & BELL STATES"
        subtitle="Non-Local Correlation & Flight Recorder Verification"
        completedCount={1}
        totalCount={4}
        accentRailColor="linear-gradient(to right, #4a02b1, #2a2882)"
      />
    </main>
  );
}
