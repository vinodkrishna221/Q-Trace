'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRoleStore } from '@/lib/role-store';
import { PriorKnowledgeBadge } from '@/features/learning/prior-knowledge-badge';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DiffusionMeanScrubber } from '@/features/learning/components/diffusion-mean-scrubber';
import { GroverRotation2D } from '@/features/learning/components/grover-rotation-2d';
import { DiffusionAmplitudeVisualizer } from '@/features/learning/components/diffusion-amplitude-visualizer';
import { DiffusionFormulaDecoder } from '@/features/learning/components/diffusion-formula-decoder';
import { SouffleOverRotationMeter } from '@/features/learning/components/souffle-over-rotation-meter';
import { LearnPageTutor, DIFFUSION_PAGE_CONTEXT } from '@/features/learning/components/learn-page-tutor';
import {
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';

export default function GroverDiffusionLearnPage() {
  const { activeRole, activeLearnerProfile, activeLearningPath } = useRoleStore();
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16" data-testid="learn-grover-diffusion-view">
      <PageHeader
        eyebrow={
          <>
            <Badge variant="default">INTERMEDIATE MODULE</Badge>
            <span className="flex items-center gap-1 font-mono text-xs text-text-secondary">
              <Clock className="w-3.5 h-3.5" />
              8 mins
            </span>
            <span className="font-mono text-xs text-text-muted">ID: grover-diffusion</span>
          </>
        }
        title="Amplitude Amplification & Inversion About the Mean"
        purpose="Reflect quantum amplitudes about their average to catapult the marked state from 12.5% to 94.5% probability."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/learn/oracle">
              <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev: Phase Oracle</span>
              </Button>
            </Link>
            <Link href="/learn/grover">
              <Button variant="default" size="sm" className="gap-1.5 font-mono text-xs" data-testid="next-to-grover-btn">
                <span>Next: Grover Hero Chamber</span>
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
            <TrendingUp className="w-4 h-4 text-accent" />
            <span>THE PUZZLE: THE BROKEN SEESAW</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            After the oracle runs, you have 8 identical-looking bars — except one of them secretly went negative.
            Probabilities are based on <strong className="text-text-primary">|amplitude|²</strong>, so the negative bar looks{' '}
            <em>exactly the same</em> as all the positive ones. The oracle marked the treasure chest, but you still can't
            tell which one it is.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            The <strong className="text-text-primary">Diffusion Operator</strong> exploits this asymmetry. By reflecting
            every amplitude across their average, it transforms the tiny asymmetry (one bar slightly more negative) into a
            massive probability spike. One iteration takes |101⟩ from 12.5% → 78%, two iterations reaches 94.5%.
          </p>
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 flex gap-3">
            <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-sm text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Key intuition:</strong> Reflection about the mean is like a see-saw.
              A bar that's far <em>below</em> the average bounces far <em>above</em> when flipped. The oracle created
              the imbalance; diffusion exploits it.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── STEP 1: AMPLITUDE BAR CHART ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-semibold text-text-muted tracking-widest uppercase px-1">
          Step 1 · Watch the Amplitudes Move
        </h2>
        <DiffusionAmplitudeVisualizer />
        <p className="text-[11px] text-text-muted font-mono px-1">
          ↑ Click through the 3 phases. Watch the dashed <strong>mean line</strong> (ᾱ) drop after the oracle, then see
          how reflection catapults |101⟩ from −0.354 to +0.884.
        </p>
      </section>

      {/* ── STEP 2: FORMULA DECODER ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-semibold text-text-muted tracking-widest uppercase px-1">
          Step 2 · Decode the Diffusion Formula
        </h2>
        <DiffusionFormulaDecoder />
      </section>

      {/* ── STEP 3: SOUFFLÉ DANGER METER ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-semibold text-text-muted tracking-widest uppercase px-1">
          Step 3 · The Soufflé Pitfall — Over-Rotation Danger
        </h2>
        <SouffleOverRotationMeter />
      </section>

      {/* ── MAIN GRID: Scrubber + Rotation + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive simulators */}
        <div className="lg:col-span-8 space-y-6">
          <section className="space-y-2">
            <h2 className="text-xs font-mono font-semibold text-text-muted tracking-widest uppercase px-1">
              Step 4 · 3-Step Geometric Reflection Scrubber
            </h2>
            <DiffusionMeanScrubber />
          </section>

          <section className="space-y-2">
            <h2 className="text-xs font-mono font-semibold text-text-muted tracking-widest uppercase px-1">
              Step 5 · 2D Subspace Rotation Visualizer
            </h2>
            <GroverRotation2D />
          </section>
        </div>

        {/* Right Column: Code + Speedup Table + Checkpoint */}
        <div className="lg:col-span-4 space-y-6">
          {/* Diffusion Circuit Specs */}
          <Card className="border-border-subtle bg-surface shadow-xs">
            <CardHeader className="py-3 px-4 bg-surface-raised/40 border-b border-border-subtle">
              <CardTitle className="text-xs font-mono tracking-wider text-text-primary font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <span>DIFFUSION OPERATOR · U_s</span>
              </CardTitle>
              <CardDescription className="text-[11px] font-mono text-text-muted">
                Constructed via H · X · CCX · X · H
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="rounded-lg bg-surface-sunken p-3.5 border border-border-subtle font-mono text-xs space-y-2">
                <div className="text-[11px] text-text-muted"># Diffusion Layer in Qiskit</div>
                <pre className="text-[11px] text-text-primary overflow-x-auto leading-relaxed">
{`# 1. Hadamard on all qubits
qc.h([0, 1, 2])

# 2. X on all qubits
qc.x([0, 1, 2])

# 3. Multi-controlled phase flip
qc.h(2)
qc.ccx(0, 1, 2)
qc.h(2)

# 4. Invert back
qc.x([0, 1, 2])
qc.h([0, 1, 2])`}
                </pre>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono bg-surface-raised/60 p-2 rounded border border-border-subtle">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unitary & Hermitian: (U_s)† = U_s</span>
              </div>
            </CardContent>
          </Card>

          {/* Grover Speedup Table */}
          <Card className="border-border-subtle bg-surface shadow-xs">
            <CardHeader className="py-3 px-4 bg-surface-raised/40 border-b border-border-subtle">
              <CardTitle className="text-xs font-mono tracking-wider text-text-primary font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                <span>QUANTUM SPEEDUP TABLE</span>
              </CardTitle>
              <CardDescription className="text-[11px] font-mono text-text-muted">
                O(√N) vs Classical O(N)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 font-mono text-xs">
              <div className="rounded-lg border border-border-subtle overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-raised text-[10px] text-text-muted border-b border-border-subtle">
                      <th className="p-2">Items (N)</th>
                      <th className="p-2">Classical Avg</th>
                      <th className="p-2">Grover</th>
                      <th className="p-2">P(|ω⟩)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-[11px]">
                    <tr>
                      <td className="p-2 font-semibold">4 (2 qubits)</td>
                      <td className="p-2 text-text-muted">2</td>
                      <td className="p-2 text-accent font-bold">1</td>
                      <td className="p-2 text-emerald-600">100%</td>
                    </tr>
                    <tr className="bg-accent/5">
                      <td className="p-2 font-semibold text-accent">8 (3 qubits)</td>
                      <td className="p-2 text-text-muted">4</td>
                      <td className="p-2 text-accent font-bold">2</td>
                      <td className="p-2 text-emerald-600 font-bold">94.5%</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">16 (4 qubits)</td>
                      <td className="p-2 text-text-muted">8</td>
                      <td className="p-2 text-accent font-bold">3</td>
                      <td className="p-2 text-emerald-600">96.1%</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">64 (6 qubits)</td>
                      <td className="p-2 text-text-muted">32</td>
                      <td className="p-2 text-accent font-bold">6</td>
                      <td className="p-2 text-emerald-600">98.7%</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">1,024</td>
                      <td className="p-2 text-text-muted">512</td>
                      <td className="p-2 text-accent font-bold">25</td>
                      <td className="p-2 text-emerald-600">99.9%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Iteration Checkpoint Card */}
          <Card className="border-border-subtle bg-surface shadow-xs">
            <CardHeader className="py-3 px-4 bg-surface-raised/40 border-b border-border-subtle">
              <CardTitle className="text-xs font-mono tracking-wider text-text-primary font-semibold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-accent" />
                <span>ITERATION COUNT CHECKPOINT</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-text-secondary leading-relaxed">
                For a 3-qubit database search (N=8 states), how many Grover iterations should you perform?
              </p>

              <div className="space-y-2">
                {[
                  {
                    id: 'opt_1',
                    text: '1 iteration',
                    correct: false,
                    hint: 'Under-rotated! Reaches ~78.1% probability, well short of peak.',
                  },
                  {
                    id: 'opt_2',
                    text: '2 iterations (⌊(π/4)√8⌋ = 2)',
                    correct: true,
                    hint: 'Correct! Exactly 2 iterations rotates the state to 94.5% fidelity.',
                  },
                  {
                    id: 'opt_3',
                    text: '8 iterations (one for each state)',
                    correct: false,
                    hint: 'Classical fallacy! 8 iterations causes complete chaotic over-rotation.',
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
      <LearnPageTutor pageContext={DIFFUSION_PAGE_CONTEXT} />
    </div>
  );
}
