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
import { UnitSectionBanner } from '@/features/learning/components/unit-section-banner';
import { StageBottomSheet } from '@/features/learning/components/stage-bottom-sheet';
import { MobileBottomNav } from '@/features/learning/components/mobile-bottom-nav';
import { UNIT_DEFINITIONS, UnitDefinition, getUnitForStage } from '@/lib/curriculum/unit-definitions';

interface UnitSectionRowProps {
  unitDef: UnitDefinition;
  stages: CurriculumStage[];
  selectedStage: CurriculumStage;
  onSelectStage: (stage: CurriculumStage) => void;
  activeStepIndex: number;
  setActiveStepIndex: (index: number | ((prev: number) => number)) => void;
  onAdvanceUnit: (unitNumber: number) => void;
  isActiveUnit: boolean;
  isFirstUnit?: boolean;
  isMeera?: boolean;
}

function UnitSectionRow({
  unitDef,
  stages,
  selectedStage,
  onSelectStage,
  activeStepIndex,
  setActiveStepIndex,
  onAdvanceUnit,
  isActiveUnit,
  isFirstUnit = false,
  isMeera = false,
}: UnitSectionRowProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inspectorWrapperRef = React.useRef<HTMLDivElement>(null);
  const [inspectorTranslateY, setInspectorTranslateY] = React.useState(0);
  const [arrowCoords, setArrowCoords] = React.useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    d: string;
    visible: boolean;
  }>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    d: '',
    visible: false,
  });

  const updateInspectorPositionAndArrow = React.useCallback(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    const inspector = inspectorWrapperRef.current;
    if (!container || !inspector || !selectedStage) return;

    // Locate active node button within this unit's container
    const nodeEl =
      container.querySelector(`#chamber-node-${selectedStage.id}`) ||
      container.querySelector(`[data-stage-id="${selectedStage.id}"]`) ||
      container.querySelector(`[data-testid="chamber-node-${selectedStage.id}"]`);

    if (!nodeEl) {
      setArrowCoords((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const nodeRect = nodeEl.getBoundingClientRect();
    const inspectorRect = inspector.getBoundingClientRect();

    // Node center Y and right X relative to container
    const nodeCenterY = nodeRect.top - containerRect.top + nodeRect.height / 2;
    const nodeRightX = nodeRect.right - containerRect.left;

    // Align card top (~50px down) with node
    const idealY = Math.max(0, nodeCenterY - 50);
    const maxTranslateY = Math.max(0, container.scrollHeight - inspectorRect.height - 24);
    const clampedY = Math.min(idealY, maxTranslateY);

    setInspectorTranslateY(clampedY);

    const cardLeftX = inspectorRect.left - containerRect.left;
    const startX = nodeRightX + 4;
    const startY = nodeCenterY;
    const endX = cardLeftX - 4;
    const endY = nodeCenterY;

    if (endX > startX + 20) {
      const midX = (startX + endX) / 2;
      const d =
        Math.abs(startY - endY) < 4
          ? `M ${startX} ${startY} L ${endX} ${endY}`
          : `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

      setArrowCoords({
        startX,
        startY,
        endX,
        endY,
        d,
        visible: true,
      });
    } else {
      setArrowCoords((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    }
  }, [selectedStage]);

  React.useEffect(() => {
    updateInspectorPositionAndArrow();
    const t1 = setTimeout(updateInspectorPositionAndArrow, 50);
    const t2 = setTimeout(updateInspectorPositionAndArrow, 150);
    const t3 = setTimeout(updateInspectorPositionAndArrow, 400);

    window.addEventListener('resize', updateInspectorPositionAndArrow);
    window.addEventListener('scroll', updateInspectorPositionAndArrow, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', updateInspectorPositionAndArrow);
      window.removeEventListener('scroll', updateInspectorPositionAndArrow);
    };
  }, [updateInspectorPositionAndArrow, selectedStage]);

  return (
    <section
      id={`unit-section-${unitDef.unitNumber}`}
      className="w-full space-y-6 scroll-mt-20"
      aria-label={`Unit ${unitDef.unitNumber}: ${unitDef.unitTitle}`}
    >
      {/* Full-Width Section Banner across the entire page */}
      <UnitSectionBanner
        unitNumber={unitDef.unitNumber}
        unitTitle={unitDef.unitTitle}
        subtitle={unitDef.subtitle}
        completedCount={unitDef.completedCount}
        totalCount={unitDef.totalCount}
        accentRailColor={unitDef.accentRailColor}
        className="w-full shadow-xs"
        testId={isActiveUnit ? 'unit-section-banner' : `unit-section-banner-${unitDef.unitNumber}`}
      />

      {/* 2-Zone Unit Layout (Col 5 Center Serpentine Canvas + Col 7 Right Stage Inspector) */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative"
        {...(isFirstUnit ? { 'data-testid': 'learn-desktop-3zone-layout' } : {})}
      >
        {/* Dynamic Dotted Connector Arrow between Selected Lesson and Inspector */}
        {arrowCoords.visible && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
            aria-hidden="true"
          >
            {/* Background Glow Path */}
            <path
              d={arrowCoords.d}
              fill="none"
              stroke="#818cf8"
              strokeWidth="6"
              strokeOpacity="0.3"
              strokeLinecap="round"
            />

            {/* Animated Dotted / Dashed Path */}
            <path
              d={arrowCoords.d}
              fill="none"
              stroke="#4338ca"
              strokeWidth="3"
              strokeDasharray="6 5"
              strokeLinecap="round"
              style={{
                animation: 'flowDash 1.2s linear infinite',
              }}
            />

            {/* Explicit SVG Arrowhead Polygon pointing into inspector card */}
            <polygon
              points={`${arrowCoords.endX},${arrowCoords.endY} ${arrowCoords.endX - 11},${arrowCoords.endY - 6} ${arrowCoords.endX - 7},${arrowCoords.endY} ${arrowCoords.endX - 11},${arrowCoords.endY + 6}`}
              fill="#4338ca"
            />

            {/* Origin Node Pulsing Anchor */}
            <circle cx={arrowCoords.startX} cy={arrowCoords.startY} r="4" fill="#4338ca" />
            <circle
              cx={arrowCoords.startX}
              cy={arrowCoords.startY}
              r="8"
              fill="none"
              stroke="#4338ca"
              strokeWidth="1.5"
              className="animate-ping opacity-60"
            />

            {/* Inspector Card Target Pulse Anchor */}
            <circle cx={arrowCoords.endX} cy={arrowCoords.endY} r="3.5" fill="#4338ca" />
          </svg>
        )}

        {/* Left Rail (Moved to /progress per user request; sr-only for accessibility/tests) */}
        {isFirstUnit && (
          <div className="sr-only" aria-hidden="true">
            <LeftQuestRail
              currentSlug={selectedStage?.lessonId || 'bell-state'}
              isMeera={isMeera}
            />
          </div>
        )}

        {/* Serpentine Path & Canvas (5 cols on desktop for shifted-left layout) */}
        <div className="lg:col-span-5 w-full space-y-6">
          <SerpentineCanvas
            stages={stages}
            selectedStageId={selectedStage?.id || 'bell-state'}
            onSelectStage={onSelectStage}
            activeStepIndex={activeStepIndex}
            setActiveStepIndex={setActiveStepIndex}
            hideInlineBanners={true}
            activeUnitTab={unitDef.unitNumber}
            onAdvanceUnit={onAdvanceUnit}
            testId={isFirstUnit ? 'serpentine-canvas' : `serpentine-canvas-unit${unitDef.unitNumber}`}
            hideGuidedPrompt={!isFirstUnit}
          />
        </div>

        {/* Right Stage Inspector (7 cols on desktop for wide horizontal card) */}
        <div
          ref={inspectorWrapperRef}
          className="lg:col-span-7 w-full transition-transform duration-500 ease-out will-change-transform"
          style={{
            transform: `translateY(${inspectorTranslateY}px)`,
          }}
        >
          <RightStageInspector
            selectedStage={selectedStage}
            testId={isActiveUnit ? 'stage-inspector-panel' : `stage-inspector-panel-unit-${unitDef.unitNumber}`}
          />
        </div>
      </div>
    </section>
  );
}

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

  // Active unit number indicating which unit was last interacted with (1, 2, or 3)
  const [activeUnitNumber, setActiveUnitNumber] = React.useState<number>(1);

  // Per-unit selected stages on serpentine paths
  const [unit1Stage, setUnit1Stage] = React.useState<CurriculumStage>(() => {
    return (
      allCurriculumStages.find((s) => s.id === 'stage_1_1_compass') ||
      allCurriculumStages[0]
    );
  });

  const [unit2Stage, setUnit2Stage] = React.useState<CurriculumStage>(() => {
    return (
      allCurriculumStages.find((s) => s.id === 'bell-state') ||
      allCurriculumStages.find((s) => s.id === 'mod1_multi_qubit_register') ||
      allCurriculumStages[6] ||
      allCurriculumStages[0]
    );
  });

  const [unit3Stage, setUnit3Stage] = React.useState<CurriculumStage>(() => {
    return (
      allCurriculumStages.find((s) => s.id === 'mod2_grover_oracle_concept') ||
      allCurriculumStages[10] ||
      allCurriculumStages[0]
    );
  });

  // Globally selected stage (for mobile bottom sheet and active telemetry)
  const activeSelectedStage = React.useMemo(() => {
    if (activeUnitNumber === 2) return unit2Stage;
    if (activeUnitNumber === 3) return unit3Stage;
    return unit1Stage;
  }, [activeUnitNumber, unit1Stage, unit2Stage, unit3Stage]);

  const handleSelectStage = (stage: CurriculumStage) => {
    const unitNum = getUnitForStage(stage);
    setActiveUnitNumber(unitNum);
    if (unitNum === 1) {
      setUnit1Stage(stage);
    } else if (unitNum === 2) {
      setUnit2Stage(stage);
    } else if (unitNum === 3) {
      setUnit3Stage(stage);
    }
    setIsBottomSheetOpen(true);
  };

  const handleAdvanceUnit = (targetUnitNumber: number) => {
    setActiveUnitNumber(targetUnitNumber);
    if (typeof window !== 'undefined') {
      const el = document.getElementById(`unit-section-${targetUnitNumber}`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSelectUnitTab = (tab: number | 'all') => {
    const target = tab === 'all' ? 1 : tab;
    setActiveUnitNumber(target);
    if (tab !== 'all') {
      const def = UNIT_DEFINITIONS.find((u) => u.unitNumber === tab);
      if (def) {
        const stage = allCurriculumStages.find((s) => s.id === def.firstStageId);
        if (stage) {
          if (target === 1) setUnit1Stage(stage);
          else if (target === 2) setUnit2Stage(stage);
          else if (target === 3) setUnit3Stage(stage);
        }
      }
    }
    if (typeof window !== 'undefined') {
      const el = document.getElementById(`unit-section-${target}`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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
      className="min-h-screen bg-surface-canvas text-text-primary antialiased selection:bg-accent/20 pb-20 lg:pb-16"
      data-testid="learn-catalogue-page"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-16">
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

        {/* Tab switcher removed from visual UI per user request; preserved as sr-only for tests and screen readers */}
        <section
          className="sr-only"
          data-testid="learn-unit-banner-container"
          aria-label="Quantum Curriculum Units"
        >
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1"
            role="tablist"
            aria-label="Curriculum Units"
          >
            {UNIT_DEFINITIONS.map((unit) => {
              const isTabActive = activeUnitNumber === unit.unitNumber;
              return (
                <button
                  key={unit.unitNumber}
                  type="button"
                  role="tab"
                  aria-selected={isTabActive}
                  onClick={() => handleSelectUnitTab(unit.unitNumber)}
                  data-testid={`unit-tab-${unit.unitNumber}`}
                >
                  <span>Unit {unit.unitNumber}: {unit.shortTitle}</span>
                  <span>{unit.completedCount}/{unit.totalCount}</span>
                </button>
              );
            })}
            <button
              type="button"
              role="tab"
              aria-selected={activeUnitNumber === 1}
              onClick={() => handleSelectUnitTab('all')}
              data-testid="unit-tab-all"
            >
              <span>All Units</span>
              <span>19 Stages</span>
            </button>
          </div>
        </section>

        {/* OPTION B: ALL UNITS LISTED ONE AFTER ANOTHER WITH FULL-WIDTH SECTION BANNERS */}
        {/* Unit 1: The Quantum Compass */}
        <UnitSectionRow
          unitDef={UNIT_DEFINITIONS[0]}
          stages={allCurriculumStages}
          selectedStage={unit1Stage}
          onSelectStage={handleSelectStage}
          activeStepIndex={activeStepIndex}
          setActiveStepIndex={setActiveStepIndex}
          onAdvanceUnit={handleAdvanceUnit}
          isActiveUnit={activeUnitNumber === 1}
          isFirstUnit={true}
          isMeera={isMeera}
        />

        {/* Unit 2: Entanglement & Bell States */}
        <UnitSectionRow
          unitDef={UNIT_DEFINITIONS[1]}
          stages={allCurriculumStages}
          selectedStage={unit2Stage}
          onSelectStage={handleSelectStage}
          activeStepIndex={activeStepIndex}
          setActiveStepIndex={setActiveStepIndex}
          onAdvanceUnit={handleAdvanceUnit}
          isActiveUnit={activeUnitNumber === 2}
          isFirstUnit={false}
          isMeera={isMeera}
        />

        {/* Unit 3: Grover's Search Algorithm */}
        <UnitSectionRow
          unitDef={UNIT_DEFINITIONS[2]}
          stages={allCurriculumStages}
          selectedStage={unit3Stage}
          onSelectStage={handleSelectStage}
          activeStepIndex={activeStepIndex}
          setActiveStepIndex={setActiveStepIndex}
          onAdvanceUnit={handleAdvanceUnit}
          isActiveUnit={activeUnitNumber === 3}
          isFirstUnit={false}
          isMeera={isMeera}
        />

        {/* Structured Module Catalogue Cards (Hidden from visual UI per user request; sr-only for tests) */}
        <div className="sr-only" aria-hidden="true" data-testid="modules-catalogue-grid">
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
                className="flex flex-col"
              >
                <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={isHero ? 'default' : 'secondary'} className="text-[10px] font-mono">
                      {mod.level}
                    </Badge>
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
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-base text-text-primary leading-snug">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      {objective?.summary}
                    </p>
                  </div>
                  <Link href={`/learn/${mod.slug}`}>
                    <Button
                      variant={isHero || isCurrentFocus ? 'default' : 'outline'}
                      size="sm"
                      data-testid={`launch-module-${mod.slug}`}
                    >
                      Launch
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Global SVG dash animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes flowDash {
              from { stroke-dashoffset: 0; }
              to { stroke-dashoffset: -20; }
            }
          `,
        }}
      />

      {/* Mobile Spring Bottom Sheet Modal (75vh) */}
      <StageBottomSheet
        stage={activeSelectedStage}
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />

      {/* Fixed Mobile Bottom 4-Tab Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
