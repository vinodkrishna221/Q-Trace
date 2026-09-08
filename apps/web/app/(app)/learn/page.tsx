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
import { BookOpen, Clock, ArrowRight, Star, Compass, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LearnIndexPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();

  // Canonical curriculum order: Superposition -> Measurement -> Bell State
  const moduleSlugOrder = ['superposition', 'measurement', 'bell-state'];
  const modules = moduleSlugOrder
    .map((slug) => DEMO_MODULES[slug])
    .filter(Boolean);

  const isAarav = activeRole.id === 'role_aarav' || activeLearnerProfile?.role === 'BEGINNER_CSE';
  const isMeera = activeRole.id === 'role_meera' || activeLearnerProfile?.role === 'PHYSICS_TO_CODE';

  const entryBand = activeLearningPath?.entryBand || (isMeera ? 'THEORY_TO_CODE' : 'FOUNDATIONS');
  const recommendationReason =
    activeLearningPath?.recommendationReason ||
    (isMeera
      ? 'Fast-track directly to Bell correlation and Qiskit verification.'
      : 'Complete the Bell-state lab after the superposition checkpoint.');

  return (
    <div className="space-y-8 max-w-5xl mx-auto" data-testid="learn-catalogue-page">
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

      {/* 3-Module Catalogue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="modules-catalogue-grid">
        {modules.map((mod, index) => {
          const isHero = mod.slug === 'bell-state';
          const isWaivedForMeera = isMeera && !isHero;

          return (
            <Card
              key={mod.id}
              data-testid={`module-card-${mod.slug}`}
              className={`flex flex-col transition-colors ${
                isHero
                  ? 'border-accent/50 shadow-glow-soft bg-panel'
                  : isWaivedForMeera
                  ? 'border-line/60 bg-panel/40 opacity-80'
                  : 'hover:border-line-bright bg-panel'
              }`}
            >
              <CardContent className="p-6 flex flex-col gap-4 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={isHero ? 'default' : 'secondary'}>{mod.level}</Badge>
                  <span className="text-ink-faint text-xs flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {mod.estimatedMinutes} min
                  </span>
                </div>

                {/* Step / Fast-Track Badges */}
                <div className="flex items-center gap-2">
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
                </div>

                <h3 className="font-display font-semibold text-base text-ink leading-snug">
                  {mod.title}
                </h3>

                <p className="text-xs text-ink-dim font-mono">
                  Skills: {mod.skillIds.map((s) => s.replace('skill_', '')).join(', ')}
                </p>

                <div className="mt-auto pt-2">
                  <Link href={`/learn/${mod.slug}`} className="w-full block">
                    <Button
                      variant={isHero ? 'default' : 'outline'}
                      size="sm"
                      className="w-full gap-2"
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
