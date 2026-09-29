'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DiffusionReflect3D } from '@/features/learning/components/diffusion-reflect-3d';
import { GroverRotation2D } from '@/features/learning/components/grover-rotation-2d';
import { Clock, Layers, ArrowRight, ArrowLeft, ShieldCheck, BarChart3, HelpCircle, Waves, AlertTriangle } from 'lucide-react';

export default function GroverDiffusionLearnPage() {
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16" data-testid="learn-grover-diffusion-view">
      <PageHeader
        eyebrow={
          <>
            <Badge variant="default">INTERMEDIATE MODULE</Badge>
            <span className="flex items-center gap-1 font-mono text-xs text-text-secondary">
              <Clock className="w-3.5 h-3.5" />
              6 mins
            </span>
            <span className="font-mono text-xs text-text-muted">ID: grover-diffusion</span>
          </>
        }
        title="Amplitude Amplification & Inversion About the Mean"
        purpose="See how a physical reflection across the average water level catapults the secret state from underground to 94.5% certainty."
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

      {/* Intuitive Metaphor Intro Card */}
      <Card className="border border-line bg-card shadow-xs">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Waves className="w-5 h-5 text-sky-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-semibold text-text-primary">
                The Water Level Trampoline
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                In the previous chamber, the Oracle pulled our target coin <strong className="text-amber-400">upside-down</strong>. But its probability was still only 12.5%.
                How do we turn an upside-down mark into a guaranteed win?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-surface border border-line space-y-2">
              <div className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>The Average Line (The Mirror)</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Because 1 state is pulled underground, the average height of all 8 states drops slightly. Imagine this average as a glowing glass mirror slicing horizontally through all states.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <div className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>The Diffusion Flip</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                The Diffusion operator reflects every state across that mirror. States that were near the mirror barely move. But our underground target was far below—so when reflected, it bounces <strong className="text-emerald-400">sky high</strong>!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Learning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Interactive Simulators & Logic */}
        <div className="lg:col-span-8 space-y-6">
          {/* Primary 3D Visual: The 3D Water Level / Mean Reflection */}
          <DiffusionReflect3D />

          {/* 2D Geometric Rotation & Soufflé Warning */}
          <GroverRotation2D />
        </div>

        {/* Right Column: Diffusion Construction & Speedup Table */}
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
                <span>Unitary & Reversible: (U_s)† = U_s</span>
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
                    hint: 'Under-rotated! Reaches ~53.1% probability, well short of peak.',
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
                    hint: 'Classical fallacy! Grover does not check states one by one. 8 iterations causes complete chaotic over-rotation.',
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
