'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRoleStore } from '@/lib/role-store';
import { PriorKnowledgeBadge } from '@/features/learning/prior-knowledge-badge';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CcxGateSimulation } from '@/features/learning/components/ccx-gate-simulation';
import { PhaseInversionMirror } from '@/features/learning/components/phase-inversion-mirror';
import { QuantumChestRing3D } from '@/features/learning/components/quantum-chest-ring-3d';
import { InteractiveFormulaDecoder } from '@/features/learning/components/interactive-formula-decoder';
import { LearnPageTutor, ORACLE_PAGE_CONTEXT } from '@/features/learning/components/learn-page-tutor';
import {
  Clock,
  Cpu,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  HelpCircle,
  PackageOpen,
  Lightbulb,
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
              8 mins
            </span>
            <span className="font-mono text-xs text-text-muted">ID: grover-oracle</span>
          </>
        }
        title="The Phase Oracle & Toffoli Gate (CCX)"
        purpose="Learn how quantum oracles tag target states with a phase flip — and why that flip stays completely invisible until amplification."
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

      {/* ── HOOK: THE STORY ── */}
      <Card className="border-border-subtle bg-surface shadow-xs">
        <CardHeader className="py-3 px-4 bg-surface-raised/40 border-b border-border-subtle">
          <CardTitle className="text-xs font-mono tracking-wider text-text-primary font-semibold flex items-center gap-2">
            <PackageOpen className="w-4 h-4 text-accent" />
            <span>THE PUZZLE: 8 MYSTERY CHESTS</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Imagine 8 locked chests. One of them holds a diamond — but you can only check them one at a time.
            Classically, you'd open up to 8 chests before finding it. That's{' '}
            <span className="font-mono font-semibold text-text-primary">O(N)</span> time.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Grover's algorithm does something wild: it can <em>physically tilt</em> the probability of finding the correct chest
            by running a quantum search. The key ingredient? A <strong className="text-text-primary">Phase Oracle</strong> — a
            special quantum operation that secretly marks the treasure chest without opening it.
          </p>
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 flex gap-3">
            <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-sm text-text-secondary leading-relaxed">
              <strong className="text-text-primary">The twist:</strong> The oracle flips the <em>phase</em> (sign) of the
              marked state's amplitude. Measurement probabilities depend on |amplitude|² so the sign cancels out — the mark
              is <em>completely invisible</em> to measurement. It only becomes useful once the Diffusion operator runs next.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── 3D INTERACTIVE: CHEST RING ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-semibold text-text-muted tracking-widest uppercase px-1">
          Step 1 · See the Oracle in Action
        </h2>
        <QuantumChestRing3D markedState="101" />
        <p className="text-[11px] text-text-muted font-mono px-1">
          ↑ Click <strong>Apply Oracle</strong>, then <strong>Measure Now</strong> repeatedly. Notice: the marked chest flips but
          measurement is still perfectly random. This is phase kickback — invisible until diffusion!
        </p>
      </section>

      {/* ── FORMULA DECODER ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-semibold text-text-muted tracking-widest uppercase px-1">
          Step 2 · Decode the Oracle Formula
        </h2>
        <InteractiveFormulaDecoder />
      </section>

      {/* ── MAIN GRID: Mirror + CCX + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive simulators */}
        <div className="lg:col-span-8 space-y-6">
          <section className="space-y-2">
            <h2 className="text-xs font-mono font-semibold text-text-muted tracking-widest uppercase px-1">
              Step 3 · Phase Inversion Mirror
            </h2>
            <PhaseInversionMirror />
          </section>

          <section className="space-y-2">
            <h2 className="text-xs font-mono font-semibold text-text-muted tracking-widest uppercase px-1">
              Step 4 · CCX Gate Simulator (Toffoli)
            </h2>
            <CcxGateSimulation />
          </section>
        </div>

        {/* Right Column: Code + Checkpoint */}
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

      {/* ── PAGE-AWARE AI TUTOR ── */}
      <LearnPageTutor pageContext={ORACLE_PAGE_CONTEXT} />
    </div>
  );
}
