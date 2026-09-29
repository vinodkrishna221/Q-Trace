'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OracleCoinFlip3D } from '@/features/learning/components/oracle-coin-flip-3d';
import { CcxGateSimulation } from '@/features/learning/components/ccx-gate-simulation';
import { Clock, Cpu, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, HelpCircle, CheckCircle2, KeyRound, Box } from 'lucide-react';

export default function GroverOracleLearnPage() {
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
        purpose="Discover how a quantum computer secretly tags a target item by flipping it upside down—without looking inside or collapsing the wave."
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

      {/* Intuitive Story Intro Card */}
      <Card className="border border-line bg-card shadow-xs">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Box className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-semibold text-text-primary">
                The Mystery of the 8 Secret Coins
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Imagine 8 identical coins placed in front of you. Exactly one coin holds the secret prize (for example, coin <span className="font-mono text-accent font-semibold">|101⟩</span>).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-surface border border-line space-y-2">
              <div className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Classical Computer</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Has no choice but to inspect coin #1, then coin #2, then #3... one by one. In the worst case, it has to check all 8 boxes.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 space-y-2">
              <div className="text-xs font-mono font-semibold text-accent uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-accent" />
                <span>Quantum Computer & The Oracle</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Puts all 8 coins into a <strong>superposition</strong> at once. Then, it uses the <strong>Oracle</strong>: a magic scanner that recognizes the winner and secretly <strong className="text-text-primary">flips it upside-down</strong> (Phase Inversion: +1 → -1).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Learning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Interactive Simulators & Logic */}
        <div className="lg:col-span-8 space-y-6">
          {/* Primary 3D Visual: The 3D Quantum Coin Flip */}
          <OracleCoinFlip3D />

          {/* Intuitive Hardware Circuit Bridge: The 3-Key Vault */}
          <Card className="border border-line bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-line bg-surface/30">
              <div className="flex items-center gap-2 text-xs font-mono text-accent">
                <KeyRound className="w-4 h-4" />
                <span>HOW THE CIRCUIT DOES IT</span>
              </div>
              <CardTitle className="text-base text-text-primary">
                The 3-Key Quantum Vault (Toffoli / CCX Gate)
              </CardTitle>
              <CardDescription className="text-xs text-text-secondary">
                How does a quantum circuit flip <em>only</em> coin |101⟩ without guessing? Think of it like a vault with 3 locks.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="text-xs text-text-secondary leading-relaxed space-y-2">
                <p>
                  To trigger an action only when the state is <strong className="text-text-primary font-mono">|101⟩</strong> (q0=1, q1=0, q2=1):
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Key 0 (<code className="font-mono text-text-primary">q0</code>) is already <strong className="font-mono text-emerald-400">1</strong>.</li>
                  <li>Key 1 (<code className="font-mono text-text-primary">q1</code>) is a <strong className="font-mono">0</strong>, so an <strong>X gate</strong> (NOT) flips it to <strong className="font-mono text-emerald-400">1</strong>.</li>
                  <li>Key 2 (<code className="font-mono text-text-primary">q2</code>) is already <strong className="font-mono text-emerald-400">1</strong>.</li>
                </ul>
                <p>
                  When all three keys are simultaneously <strong className="text-emerald-400 font-mono">1</strong>, the <strong>Toffoli (CCX) gate</strong> trips its wire and inverts the phase! Test the switches below:
                </p>
              </div>

              {/* Interactive Toffoli Gate Component */}
              <CcxGateSimulation />
            </CardContent>
          </Card>
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
                    hint: 'Incorrect. The oracle only flipped the sign upside down (-1). Its size (probability) is still only 12.5%.',
                  },
                  {
                    id: 'opt_2',
                    text: 'A completely random 1/8 (12.5%) distribution across all 8 states',
                    correct: true,
                    hint: 'Correct! |(-0.35)|² = 12.5%. Flipping a coin upside-down does not make it more likely to be picked until the Diffusion step amplifies it!',
                  },
                  {
                    id: 'opt_3',
                    text: 'All states collapse to |000⟩',
                    correct: false,
                    hint: 'Incorrect. Measurement samples uniformly according to probability.',
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
