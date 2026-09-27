'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  Star,
  Check,
  Zap,
} from 'lucide-react';
import { useRoleStore } from '@/lib/role-store';
import { DEMO_LEARNER_PROFILES, DEMO_LEARNING_PATHS, DEMO_MODULES } from '@/lib/fixtures';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { allCurriculumStages } from '@/lib/curriculum/all-stages';
import { CurriculumStage } from '@/lib/curriculum/types';
import { LeftQuestRail } from '@/features/learning/components/left-quest-rail';
import { RightStageInspector } from '@/features/learning/components/right-stage-inspector';
import { SerpentineCanvas } from '@/features/learning/components/serpentine-canvas';
import { StageBottomSheet } from '@/features/learning/components/stage-bottom-sheet';
import { MobileBottomNav } from '@/features/learning/components/mobile-bottom-nav';

export default function LearnIndexPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();
  const isMeera = activeRole?.id === 'role_meera' || activeLearnerProfile?.role === 'PHYSICS_TO_CODE';
  const learnerName = activeRole?.name || activeLearnerProfile?.displayName || (isMeera ? 'Meera' : 'Aarav');
  const entryBand = activeLearningPath?.entryBand || (isMeera ? 'THEORY_TO_CODE' : 'FOUNDATIONS');
  const recommendationReason =
    activeLearningPath?.recommendationReason ||
    (isMeera
      ? 'Fast-track directly to Bell correlation and Qiskit verification.'
      : 'Complete the Bell-state lab after the superposition checkpoint.');

  // Canonical curriculum order: Superposition -> Measurement -> Bell State
  const moduleSlugOrder = ['superposition', 'measurement', 'bell-state'];
  const modules = moduleSlugOrder
    .map((slug) => DEMO_MODULES[slug])
    .filter(Boolean);

  // Active step index for legacy stepper suite
  const [activeStepIndex, setActiveStepIndex] = React.useState(0);

  // Mobile Bottom Sheet state for touch/mobile deep inspection
  const [isBottomSheetOpen, setIsBottomSheetOpen] = React.useState(false);

  // Selected stage for the Right Stage Inspector drawer
  // Defaults to the Bell State hero lab or first stage
  const [selectedStage, setSelectedStage] = React.useState<CurriculumStage>(() => {
    return (
      allCurriculumStages.find((s) => s.id === 'bell-state') ||
      allCurriculumStages[0]
    );
  });

  const stepObjectives = [
    {
      step: 1,
      slug: 'superposition',
      keyConcept: 'Statevectors & Bloch Rotations',
      summary: 'Explore superposition via single-qubit rotations with interactive Bloch sphere projections.',
    },
    {
      step: 2,
      slug: 'measurement',
      keyConcept: 'Born Rule & Wavefunction Collapse',
      summary: 'Calculate measurement probabilities, test shot distributions, and observe state collapse.',
    },
    {
      step: 3,
      slug: 'bell-state',
      keyConcept: 'Two-Qubit Entanglement & Flight Recorder',
      summary: 'Synthesize the canonical Bell pair, verify quantum correlations, and diagnose misconceptions.',
    },
  ];

  return (
    <div
      className="min-h-screen bg-surface-canvas text-text-primary antialiased selection:bg-accent/20 pb-20 lg:pb-8"
      data-testid="learn-catalogue-page"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Learner Context Metadata Bar (hidden from visual UI; sr-only for accessibility/tests) */}
        <div
          className="sr-only"
          data-testid="learner-context-bar"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-xs">
              {learnerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-sm text-text-primary"
                  data-testid="catalogue-learner-name"
                >
                  {learnerName}
                </span>
                <Badge
                  variant="outline"
                  data-testid="entry-band-badge"
                  className="text-[10px] font-mono border-accent/40 bg-accent/10 text-accent uppercase"
                >
                  {entryBand}
                </Badge>
                <Badge
                  variant="secondary"
                  data-testid="path-mode-badge"
                  className="text-[10px] font-mono text-text-muted"
                >
                  {isMeera ? 'Theory-to-Code Track (1 Module)' : 'Foundations Track (3 Modules)'}
                </Badge>
              </div>
              <p
                className="text-xs text-text-secondary mt-0.5"
                data-testid="path-recommendation-reason"
              >
                {recommendationReason}
              </p>
            </div>
          </div>
        </div>

        {/* 3-ZONE DESKTOP PRIMARY ARCHITECTURE */}
        {/* Left Rail (Col 3) + Center Serpentine Canvas (Col 6) + Right Stage Inspector (Col 3) */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          data-testid="learn-desktop-3zone-layout"
        >
          {/* ZONE 1: Left Rail (3 cols on desktop) */}
          <div className="lg:col-span-3 w-full order-2 lg:order-1">
            <LeftQuestRail
              currentSlug={selectedStage?.lessonId || 'bell-state'}
              isMeera={isMeera}
            />
          </div>

          {/* ZONE 2: Center Serpentine Path & Canvas (6 cols on desktop) */}
          <div className="lg:col-span-6 w-full order-1 lg:order-2 space-y-6">
            <SerpentineCanvas
              stages={allCurriculumStages}
              selectedStageId={selectedStage?.id || 'bell-state'}
              onSelectStage={(stage) => {
                setSelectedStage(stage);
                setIsBottomSheetOpen(true);
              }}
              activeStepIndex={activeStepIndex}
              setActiveStepIndex={setActiveStepIndex}
            />

            {/* Structured Module Catalogue Cards (Preserves acceptance test compatibility) */}
            <div className="space-y-4 pt-4" data-testid="modules-catalogue-grid">
              <div className="flex items-center gap-2 pb-1 border-b border-border-subtle">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                  Core Curriculum Catalog
                </span>
              </div>

              {modules.map((mod, index) => {
                const isHero = mod.slug === 'bell-state';
                const isWaivedForMeera = isMeera && !isHero;
                const isCurrentFocus = activeStepIndex === index;
                const objective = stepObjectives[index];

                return (
                  <Card
                    key={mod.id}
                    data-testid={`module-card-${mod.slug}`}
                    className={`flex flex-col transition-all relative overflow-hidden ${
                      isCurrentFocus
                        ? 'border-accent shadow-glow-soft bg-surface ring-1 ring-accent/30'
                        : isHero
                        ? 'border-accent/40 bg-surface'
                        : isWaivedForMeera
                        ? 'border-border-subtle bg-surface/60 opacity-85'
                        : 'border-border-subtle bg-surface hover:border-border-medium'
                    }`}
                  >
                    {isCurrentFocus && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-violet to-accent" />
                    )}

                    <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={isHero ? 'default' : 'secondary'} className="text-[10px] font-mono">
                            {mod.level}
                          </Badge>
                          {isCurrentFocus && (
                            <Badge
                              variant="outline"
                              className="text-[9px] font-mono border-accent/60 text-accent bg-accent/10 animate-pulse"
                            >
                              ACTIVE STEP
                            </Badge>
                          )}
                        </div>
                        <span className="text-text-muted text-xs flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {mod.estimatedMinutes} min
                        </span>
                      </div>

                      {/* Step / Fast-Track Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isHero ? (
                          <Badge
                            variant="outline"
                            data-testid="hero-module-badge"
                            className="text-[10px] font-mono tracking-widest text-accent border-accent/40 bg-accent/10 flex items-center gap-1"
                          >
                            <Star className="w-3 h-3 fill-current" />
                            <span>HERO LAB · {isMeera ? 'FAST-TRACK FOCUS' : 'STEP 3'}</span>
                          </Badge>
                        ) : isMeera ? (
                          <Badge
                            variant="outline"
                            data-testid={`waived-badge-${mod.slug}`}
                            className="text-[10px] font-mono text-violet border-violet/40 bg-violet/10 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>THEORY CREDITED</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            data-testid={`step-badge-${mod.slug}`}
                            className="text-[10px] font-mono text-text-secondary border-border-medium"
                          >
                            <span>STEP {index + 1} OF 3</span>
                          </Badge>
                        )}

                        <span className="text-[11px] font-mono text-text-muted">
                          {objective.keyConcept}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-base text-text-primary leading-snug">
                          {mod.title}
                        </h3>
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                          {objective.summary}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle">
                        <p className="text-xs text-text-muted font-mono">
                          Skills: {mod.skillIds.map((s) => s.replace('skill_', '')).join(', ')}
                        </p>

                        <div className="flex items-center gap-2">
                          <Link href={`/learn/${mod.slug}`}>
                            <Button
                              variant={isHero || isCurrentFocus ? 'default' : 'outline'}
                              size="sm"
                              className="gap-2 h-8 text-xs font-mono"
                              data-testid={`launch-module-${mod.slug}`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>
                                {isHero
                                  ? 'Launch Hero Lab'
                                  : isMeera
                                  ? 'Review Theory'
                                  : `Start Step ${index + 1}`}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* ZONE 3: Right Stage Inspector (3 cols on desktop) */}
          <div className="lg:col-span-3 w-full order-3">
            <RightStageInspector
              selectedStage={selectedStage}
              className="sticky top-20"
            />
          </div>
        </div>
      </div>

      {/* Mobile Spring Bottom Sheet Modal (75vh) */}
      <StageBottomSheet
        stage={selectedStage}
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />

      {/* Fixed Mobile Bottom 4-Tab Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
