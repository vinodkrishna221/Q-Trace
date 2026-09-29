'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRoleStore } from '@/lib/role-store';
import { PriorKnowledgeBadge } from '@/features/learning/prior-knowledge-badge';
import { ConceptBlocks } from '@/features/learning/concept-blocks';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CcxGateSimulation } from '@/features/learning/components/ccx-gate-simulation';
import { PhaseInversionMirror } from '@/features/learning/components/phase-inversion-mirror';
import { Clock, Cpu, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';
import { ContentBlock } from '@/lib/contracts';

export default function GroverOracleLearnPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);

  const contentBlocks: ContentBlock[] = [
    {
      type: 'TEXT',
      body: 'In classical computing, finding a secret item requires reading each memory address sequentially. Grover\'s quantum search uses an Oracle operator (U_ω) that marks the matching state with a phase inversion without measuring or collapsing the query register.',
    },
    {
      type: 'FORMULA',
      latex: 'U_\\omega |x\\rangle = (-1)^{f(x)} |x\\rangle = \\begin{cases} -|x\\rangle & \\text{if } x = \\omega \\text{ (Marked State)} \\\\ +|x\\rangle & \\text{if } x \\neq \\omega \\end{cases}',
    },
    {
      type: 'CALLOUT',
      tone: 'INFO',
      body: 'Phase Kickback Key Insight: The oracle negates the amplitude of the marked state |101⟩. Because measurement probabilities depend on |α|², the probability remains exactly 1/8 (12.5%). The mark is invisible until the Diffusion operator performs quantum interference!',
    },
    {
      type: 'TEXT',
      body: 'To construct a phase oracle for a 3-qubit state like |101⟩ (where q0=1, q1=0, q2=1), we use the Toffoli (CCX) gate. An X gate inverts q1 so that all three inputs become 1 only when the state is |101⟩, firing the gate and applying the phase flip.',
    },
    {
      type: 'CALLOUT',
      tone: 'CAUTION',
      body: 'Conceptual Pitfall: Never measure inside the oracle. Any measurement collapses the superposition into a single random bitstring, destroying quantum parallelism permanently.',
    },
  ];

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

      {/* Prior Knowledge Badge */}
      <PriorKnowledgeBadge
        activeRole={activeRole}
        learnerProfile={activeLearnerProfile}
        learningPath={activeLearningPath}
      />

      {/* Main Learning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Theory & Interactive Simulators */}
        <div className="lg:col-span-8 space-y-6">
          {/* Core Theory Concept Blocks */}
          <ConceptBlocks contentBlocks={contentBlocks} />

          {/* Interactive Phase Inversion Mirror */}
          <PhaseInversionMirror />

          {/* Interactive Toffoli (CCX) Gate Simulator */}
          <CcxGateSimulation />
        </div>

        {/* Right Column: Qiskit Code & Checkpoint Card */}
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
        </div>
      </div>
    </div>
  );
}
