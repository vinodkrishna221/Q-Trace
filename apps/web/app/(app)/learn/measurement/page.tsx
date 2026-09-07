'use client';

import * as React from 'react';
import Link from 'next/link';
import { DEMO_MODULES } from '@/lib/fixtures';
import { useRoleStore } from '@/lib/role-store';
import { PriorKnowledgeBadge } from '@/features/learning/prior-knowledge-badge';
import { ConceptBlocks } from '@/features/learning/concept-blocks';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Cpu, ArrowRight, ArrowLeft, BarChart3, Sparkles } from 'lucide-react';

export default function MeasurementLearnPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();
  const moduleData = DEMO_MODULES['measurement'];

  const contentBlocksWithMath = [
    ...(moduleData.contentBlocks || []),
    {
      type: 'FORMULA' as const,
      latex: 'P(x) = |\\langle x | \\psi \\rangle|^2, \\quad \\sum_{x} P(x) = 1',
    },
    {
      type: 'CALLOUT' as const,
      tone: 'CAUTION' as const,
      body: 'Measurement collapses a superposition irreversibly into a computational basis state. Quantum algorithms extract probability distributions by running repeated shots on quantum hardware or simulators.',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12" data-testid="learn-measurement-view">
      <PageHeader
        eyebrow={
          <>
            <Badge variant="default">{moduleData.level} MODULE</Badge>
            <span className="flex items-center gap-1 font-mono text-xs text-ink-dim">
              <Clock className="w-3.5 h-3.5" />
              {moduleData.estimatedMinutes} mins
            </span>
            <span className="font-mono text-xs text-ink-faint">ID: {moduleData.id}</span>
          </>
        }
        title={moduleData.title}
        purpose="Understand wave function collapse, the Born probability rule, and sampling statistics in quantum circuits."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/learn/superposition">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev: Superposition</span>
              </Button>
            </Link>
            <Link href="/learn/bell-state">
              <Button variant="default" size="sm" className="gap-1.5" data-testid="next-module-btn">
                <span>Next: Bell State Hero Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Prior Knowledge Badge */}
      <PriorKnowledgeBadge
        activeRole={activeRole}
        learnerProfile={activeLearnerProfile}
        learningPath={activeLearningPath}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ConceptBlocks contentBlocks={contentBlocksWithMath} />
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card data-testid="measurement-preview-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-evidence" />
                <span>Measurement Sampling</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Born Rule & State Collapse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-abyss p-4 border border-line font-mono text-xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 text-accent font-semibold">q[0]</span>
                  <div className="relative flex-1 h-px bg-line-bright">
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-around">
                      <span className="px-2 py-0.5 bg-raised border border-line-bright text-ink-dim rounded">
                        M
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-[10px] text-evidence font-mono">
                  c[0] = measure q[0] → {`{0: 50%, 1: 50%}`}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-ink-dim font-mono bg-abyss p-2 rounded border border-line">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Skill: {moduleData.skillIds.join(', ')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
