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
import { Clock, Cpu, ArrowRight, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export default function SuperpositionLearnPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();
  const moduleData = DEMO_MODULES['superposition'];

  const contentBlocksWithMath = [
    ...(moduleData.contentBlocks || []),
    {
      type: 'FORMULA' as const,
      latex: '|\\psi\\rangle = H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}',
    },
    {
      type: 'CALLOUT' as const,
      tone: 'INFO' as const,
      body: 'Applying a Hadamard gate rotates the state vector from the Z-basis pole |0⟩ to the X-basis equator |+⟩ on the Bloch sphere with equal 50% probability amplitudes.',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12" data-testid="learn-superposition-view">
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
        purpose="Explore single-qubit states, the Hadamard transformation, and the transition from classical bits to quantum superposition."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/learn">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Modules</span>
              </Button>
            </Link>
            <Link href="/learn/measurement">
              <Button variant="default" size="sm" className="gap-1.5" data-testid="next-module-btn">
                <span>Next: Measurement</span>
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
          <Card data-testid="single-qubit-preview-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                <span>Superposition Circuit</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Single-qubit Hadamard wire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-abyss p-4 border border-line font-mono text-xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 text-accent font-semibold">q[0]</span>
                  <div className="relative flex-1 h-px bg-line-bright">
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-around">
                      <span className="px-2 py-0.5 -mt-px bg-accent/20 border border-accent text-accent rounded font-bold shadow-glow">
                        H
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-[10px] text-accent font-mono">
                  |+⟩ = (|0⟩ + |1⟩)/√2 · P(0) = 0.5, P(1) = 0.5
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
