'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRoleStore } from '@/lib/role-store';
import { PriorKnowledgeBadge } from '@/features/learning/prior-knowledge-badge';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuantumStateRing3D } from '@/features/learning/components/quantum-state-ring-3d';
import { OracleFormulaMicroscope } from '@/features/learning/components/oracle-formula-microscope';
import { PhaseInversionMirror } from '@/features/learning/components/phase-inversion-mirror';
import { CcxGateSimulation } from '@/features/learning/components/ccx-gate-simulation';
import {
  Clock,
  Cpu,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Layers,
} from 'lucide-react';

export default function GroverOracleLearnPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16" data-testid="learn-grover-oracle-view">
      <PageHeader
        eyebrow={
          <>
            <Badge variant="default">INTERMEDIATE MODULE</Badge>
            <span className="flex items-center gap-1 font-mono text-xs text-text-secondary">
              <Clock className="w-3.5 h-3.5" />
              6 mins
            </span>
            <span className="font-mono text-xs text-text-muted">ID: grover-oracle</span>
          </>
        }
        title="The Phase Oracle & Toffoli Gate (CCX)"
        purpose="Learn how quantum oracles tag target basis states with phase inversion without collapsing the superposition."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/learn">
              <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Modules</span>
              </Button>
            </Link>
            <Link href="/learn/diffusion">
              <Button variant="default" size="sm" className="gap-1.5 font-mono text-xs" data-testid="next-to-diffusion-btn">
                <span>Next: Amplitude Diffusion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Hidden accessible Prior Knowledge Badge */}
      <div className="sr-only" aria-hidden="true">
        <PriorKnowledgeBadge
          activeRole={activeRole}
          learnerProfile={activeLearnerProfile}
          learningPath={activeLearningPath}
        />
      </div>

      {/* Beginner-Friendly Intuitive Metaphor Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 text-text-primary shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 border border-amber-500/30">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-sans font-bold text-amber-950">
                Intuitive Concept: The 8 Mystery Chests Metaphor
              </h2>
              <Badge variant="outline" className="text-[10px] font-mono border-amber-600/30 text-amber-700 bg-amber-50/50">
                START HERE
              </Badge>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Imagine 8 identical closed treasure chests floating in space (<span className="font-mono text-text-primary">|000⟩</span> through <span className="font-mono text-text-primary">|111⟩</span>). One chest contains gold (<span className="font-mono text-text-primary">|101⟩</span>). In classical computing, you have to open chests one by one (taking up to 8 checks). In quantum computing, all 8 chests exist at the same time in superposition.
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              <strong>The catch:</strong> If you open any chest right now, the superposition collapses and the other 7 chests disappear forever! Instead, the <strong>Quantum Oracle</strong> leaves all chests closed and simply flips the winning chest <em>upside down</em> (multiplies its quantum amplitude by <span className="font-mono text-text-primary">-1</span>).
            </p>
            <div className="mt-2 flex items-center gap-2 pt-1 font-mono text-[11px] text-amber-800">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              <span>Key Secret: To an outside observer, an upside-down chest has the exact same size (12.5% chance). The tag is hidden in the phase until Diffusion!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Learning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visualizers, Formula Microscope & Simulators */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Interactive 3D Quantum State Ring */}
          <QuantumStateRing3D />

          {/* 2. Interactive Formula Microscope */}
          <OracleFormulaMicroscope />

          {/* 3. 2D Signed Amplitude Mirror */}
          <PhaseInversionMirror />

          {/* 4. Interactive Toffoli (CCX) Gate Simulator */}
          <CcxGateSimulation />
        </div>

        {/* Right Column: Qiskit Code, Checkpoint & Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Oracle Circuit Card */}
          <Card className="border-border-subtle bg-surface shadow-xs">
            <CardHeader className="py-3 px-4 bg-surface-raised/40 border-b border-border-subtle">
              <CardTitle className="text-xs font-mono tracking-wider text-text-primary font-semibold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                <span>PHASE ORACLE CIRCUIT · |101⟩</span>
              </CardTitle>
              <CardDescription className="text-[11px] font-mono text-text-muted">
                3 qubits · Qiskit Aer Verified
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="rounded-lg bg-surface-sunken p-3.5 border border-border-subtle font-mono text-xs space-y-3">
                <div className="text-[11px] text-text-muted"># Qiskit Implementation</div>
                <pre className="text-[11px] text-text-primary overflow-x-auto leading-relaxed">
{`from qiskit import QuantumCircuit
qc = QuantumCircuit(3)

# 1. Flip q1 for |101> pattern
# (converts 1-0-1 into 1-1-1)
qc.x(1)

# 2. Phase-flip via CCZ or CCX
# target fires only on 1-1-1
qc.h(2)
qc.ccx(0, 1, 2)
qc.h(2)

# 3. Un-flip q1 (restore state)
qc.x(1)`}
                </pre>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono bg-surface-raised/60 p-2 rounded border border-border-subtle">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phase tag magnitude: -1.0 on |101⟩</span>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Checkpoint Card */}
          <Card className="border-border-subtle bg-surface shadow-xs">
            <CardHeader className="py-3 px-4 bg-surface-raised/40 border-b border-border-subtle">
              <CardTitle className="text-xs font-mono tracking-wider text-text-primary font-semibold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-accent" />
                <span>ORACLE CHECKPOINT</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-text-secondary leading-relaxed">
                If you measure all 3 qubits immediately after the oracle phase flip, what will you observe?
              </p>

              <div className="space-y-2">
                {[
                  {
                    id: 'opt_1',
                    text: 'State |101⟩ with 100% certainty',
                    correct: false,
                    hint: 'Incorrect. The oracle only changes phase (sign), not measurement probability.',
                  },
                  {
                    id: 'opt_2',
                    text: 'A completely random 1/8 (12.5%) distribution across all 8 states',
                    correct: true,
                    hint: 'Correct! |(-1)/√8|² = 1/8. The phase change is invisible until the diffusion operator!',
                  },
                  {
                    id: 'opt_3',
                    text: 'All states collapse to |000⟩',
                    correct: false,
                    hint: 'Incorrect. Measurement samples according to Born probabilities.',
                  },
                ].map((opt) => {
                  const isSelected = selectedAnswer === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedAnswer(opt.id)}
                      className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? opt.correct
                            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-800'
                            : 'border-amber-600 bg-amber-500/10 text-amber-800'
                          : 'border-border-subtle bg-surface-raised/40 text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] opacity-70">
                          {isSelected ? (opt.correct ? '✓' : '✗') : '○'}
                        </span>
                        <span className="font-medium">{opt.text}</span>
                      </div>
                      {isSelected && (
                        <p className="text-[11px] mt-1 pl-4 opacity-90 font-sans">{opt.hint}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Three Golden Rules Card */}
          <Card className="border-border-subtle bg-surface shadow-xs">
            <CardHeader className="py-3 px-4 bg-surface-raised/40 border-b border-border-subtle">
              <CardTitle className="text-xs font-mono tracking-wider text-text-primary font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <span>3 GOLDEN RULES OF ORACLES</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs text-text-secondary leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-mono text-accent font-bold text-[11px]">1.</span>
                <span><strong>Phase is stealthy:</strong> Multiplying amplitude by -1 changes the sign, but the Born probability $|-α|^2 = |α|^2$ stays identical.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-accent font-bold text-[11px]">2.</span>
                <span><strong>No early measurement:</strong> Peeking into the quantum register causes immediate wave function collapse, destroying quantum speedup.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-accent font-bold text-[11px]">3.</span>
                <span><strong>Diffusion is the partner:</strong> The Oracle places the phase tag; Amplitude Diffusion converts that phase tag into a massive probability spike.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
