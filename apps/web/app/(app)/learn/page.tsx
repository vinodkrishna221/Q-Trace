'use client';

import * as React from 'react';
import Link from 'next/link';
import { DEMO_MODULES } from '@/lib/fixtures';
import { useRoleStore } from '@/lib/role-store';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoleSwitcher } from '@/components/ui/role-switcher';
import { LearnSidebar } from '@/features/learning/learn-sidebar';
import {
  BookOpen,
  Clock,
  ArrowRight,
  ArrowLeft,
  Star,
  Compass,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Check,
  ChevronRight,
  Lightbulb,
  Workflow,
  Zap,
} from 'lucide-react';

export default function LearnIndexPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();

  // Canonical curriculum order: Superposition -> Measurement -> Bell State
  const moduleSlugOrder = ['superposition', 'measurement', 'bell-state'];
  const modules = moduleSlugOrder
    .map((slug) => DEMO_MODULES[slug])
    .filter(Boolean);

  const isAarav = activeRole.id === 'role_aarav' || activeLearnerProfile?.role === 'BEGINNER_CSE';
  const isMeera = activeRole.id === 'role_meera' || activeLearnerProfile?.role === 'PHYSICS_TO_CODE';

  // For Meera, default active step is Hero Lab (Step 3); for Aarav, Step 1
  const [activeStepIndex, setActiveStepIndex] = React.useState<number>(isMeera ? 2 : 0);

  // Synchronize when role switches
  React.useEffect(() => {
    setActiveStepIndex(isMeera ? 2 : 0);
  }, [isMeera]);

  const entryBand = activeLearningPath?.entryBand || (isMeera ? 'THEORY_TO_CODE' : 'FOUNDATIONS');
  const recommendationReason =
    activeLearningPath?.recommendationReason ||
    (isMeera
      ? 'Fast-track directly to Bell correlation and Qiskit verification.'
      : 'Complete the Bell-state lab after the superposition checkpoint.');

  const stepObjectives = [
    {
      summary: 'Master how single-qubit Hadamard operations rotate state vectors from |0⟩ to equal superpositions |+⟩.',
      keyConcept: 'Unitary State Evolution & Bloch Equator',
    },
    {
      summary: 'Formulate predictive hypotheses on measurement outcomes and observe Born-rule probabilistic collapse.',
      keyConcept: 'Projective Measurement & State Collapse',
    },
    {
      summary: 'Synthesize two-qubit entanglement via CNOT, analyze joint probabilities, and inspect non-local correlations.',
      keyConcept: 'Two-Qubit Entangled Bell Pair |Φ⁺⟩',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12" data-testid="learn-catalogue-page">
      <PageHeader
        eyebrow={<Badge variant="default">LEARNING PATH</Badge>}
        title="Quantum Learning Modules"
        purpose="A structured path from superposition to entanglement — every module guarded by a prediction checkpoint."
        actions={<RoleSwitcher />}
      />

      {/* Adaptive Learning Path Entry Banner */}
      <div
        className="rounded-xl border border-line bg-panel p-5 space-y-3 shadow-md"
        data-testid="learning-path-entry-banner"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono text-ink-dim">Active Learner Profile:</span>
            <span className="font-bold text-ink text-sm" data-testid="catalogue-learner-name">
              {activeRole.name}
            </span>
            <Badge
              variant="outline"
              data-testid="entry-band-badge"
              className={`text-xs font-mono font-bold ${
                isMeera
                  ? 'border-violet/50 text-violet bg-violet/10'
                  : 'border-accent/50 text-accent bg-accent/10'
              }`}
            >
              {entryBand}
            </Badge>
          </div>

          <Badge variant="secondary" className="text-xs font-mono" data-testid="path-mode-badge">
            {isMeera ? 'Theory-to-Code Track (1 Module)' : 'Foundations Track (3 Modules)'}
          </Badge>
        </div>

        <div className="text-xs text-ink-dim bg-abyss p-3 rounded-lg border border-line flex items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span data-testid="path-recommendation-reason">{recommendationReason}</span>
          </div>
          <span className="text-[10px] text-ink-faint hidden sm:inline">
            Path ID: {activeLearningPath?.id || (isMeera ? 'path_meera_code' : 'path_aarav_foundations')}
          </span>
        </div>
      </div>

      {/* Main Grid: Sidebar (3 cols) + Stepper & Step-by-Step Curriculum (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Rail: Bell Correlation & Future Algorithms Roadmap */}
        <div className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
          <LearnSidebar
            currentSlug={modules[activeStepIndex]?.slug || 'bell-state'}
            isMeera={isMeera}
          />
        </div>

        {/* Right Main Column: Guided Prompt + Step-by-Step Interactive Learning Flow */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6 order-1 lg:order-2">
          {/* 1. Required Pedagogical Guidance Prompt Card */}
          <div
            className="rounded-xl border border-accent/40 bg-gradient-to-b from-panel to-abyss p-5 space-y-3 shadow-glow-soft relative overflow-hidden"
            data-testid="learning-guided-prompt"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 border border-accent text-accent">
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                  Pedagogical Directive · Sequential Mastery
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-accent/40 text-accent">
                STEP-BY-STEP FLOW
              </Badge>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-ink-dim">
              <p className="text-ink font-medium">
                Quantum concepts are counter-intuitive. Follow the sequential progression below so you can build
                rock-solid mental models before simulating complex algorithms:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-abyss/80 border border-line rounded p-2.5">
                  <span className="text-accent font-semibold block mb-0.5">1. Superposition</span>
                  <span className="text-ink-faint">Single qubit basis rotation. No entanglement yet.</span>
                </div>
                <div className="bg-abyss/80 border border-line rounded p-2.5">
                  <span className="text-accent font-semibold block mb-0.5">2. Measurement</span>
                  <span className="text-ink-faint">Wavefunction collapse & probabilistic sampling.</span>
                </div>
                <div className="bg-abyss/80 border border-line rounded p-2.5">
                  <span className="text-accent font-semibold block mb-0.5">3. Bell Correlation</span>
                  <span className="text-ink-faint">Non-local correlation & Flight Recorder diagnosis.</span>
                </div>
              </div>
              <div className="text-[11px] text-ink-faint pt-1 border-t border-line/60 flex items-center justify-between">
                <span>
                  {isMeera
                    ? 'Physics Background: Foundations are credited — you may jump straight to Step 3.'
                    : 'Recommendation: Complete each step sequentially to unlock full conceptual mastery.'}
                </span>
                <span className="text-accent font-mono text-[10px] flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Step {activeStepIndex + 1} of 3 in focus
                </span>
              </div>
            </div>
          </div>

          {/* 2. Interactive Step-by-Step Controller (One by One Progression) */}
          <div className="rounded-xl border border-line bg-panel p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-line/60">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                  Step-by-Step Progression
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="h-7 text-xs font-mono gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Prev Step</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeStepIndex === modules.length - 1}
                  onClick={() => setActiveStepIndex((prev) => Math.min(modules.length - 1, prev + 1))}
                  className="h-7 text-xs font-mono gap-1"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {modules.map((mod, idx) => {
                const isActive = activeStepIndex === idx;
                const isPassed = activeStepIndex > idx;
                const isHero = mod.slug === 'bell-state';

                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-accent bg-accent/10 shadow-glow text-ink'
                        : isPassed
                        ? 'border-line-bright bg-abyss text-ink-dim hover:border-accent/40'
                        : 'border-line bg-abyss/40 text-ink-faint hover:border-line-bright'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                        isActive
                          ? 'bg-accent text-abyss shadow-glow'
                          : isPassed
                          ? 'bg-evidence/20 border border-evidence/50 text-evidence'
                          : 'border border-line-bright bg-raised text-ink-faint'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-ink-faint uppercase tracking-wider">
                        {isHero ? 'Hero Lab' : `Step 0${idx + 1}`}
                      </div>
                      <div className="text-xs font-semibold truncate text-ink">
                        {mod.title.split(' ')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. The 3-Module Catalogue Step Sequence */}
          <div className="space-y-4" data-testid="modules-catalogue-grid">
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
                      ? 'border-accent shadow-glow-soft bg-panel ring-1 ring-accent/30'
                      : isHero
                      ? 'border-accent/40 bg-panel'
                      : isWaivedForMeera
                      ? 'border-line/60 bg-panel/40 opacity-85'
                      : 'border-line bg-panel hover:border-line-bright'
                  }`}
                >
                  {isCurrentFocus && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-violet to-accent" />
                  )}

                  <CardContent className="p-5 md:p-6 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={isHero ? 'default' : 'secondary'}>{mod.level}</Badge>
                        {isCurrentFocus && (
                          <Badge variant="outline" className="text-[10px] font-mono border-accent/60 text-accent bg-accent/10 animate-pulse">
                            ACTIVE STEP
                          </Badge>
                        )}
                      </div>
                      <span className="text-ink-faint text-xs flex items-center gap-1 font-mono">
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
                          className="text-[10px] font-mono text-ink-dim border-line-bright"
                        >
                          <span>STEP {index + 1} OF 3</span>
                        </Badge>
                      )}

                      <span className="text-[11px] font-mono text-ink-faint">
                        {objective.keyConcept}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-semibold text-base md:text-lg text-ink leading-snug">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-ink-dim mt-1.5 leading-relaxed">
                        {objective.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line/60">
                      <p className="text-xs text-ink-dim font-mono">
                        Skills: {mod.skillIds.map((s) => s.replace('skill_', '')).join(', ')}
                      </p>

                      <div className="flex items-center gap-2">
                        {!isCurrentFocus && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveStepIndex(index)}
                            className="text-xs font-mono text-ink-dim hover:text-ink h-8"
                          >
                            Focus Step
                          </Button>
                        )}
                        <Link href={`/learn/${mod.slug}`}>
                          <Button
                            variant={isHero || isCurrentFocus ? 'default' : 'outline'}
                            size="sm"
                            className="gap-2 h-8"
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
      </div>
    </div>
  );
}
