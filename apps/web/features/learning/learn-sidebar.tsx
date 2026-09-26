'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Lock,
  Layers,
  ArrowUpRight,
  Workflow,
  Radio,
  Cpu,
  Binary,
  Atom,
} from 'lucide-react';

interface FutureAlgorithm {
  id: string;
  title: string;
  category: string;
  qubitCount: string;
  stage: string;
  description: string;
  coreGates: string[];
}

const FUTURE_ALGORITHMS: FutureAlgorithm[] = [
  {
    id: 'teleportation',
    title: 'Quantum Teleportation',
    category: 'Protocol',
    qubitCount: '3 Qubits',
    stage: 'Stage 2',
    description: 'Transfer an unknown quantum state using EPR Bell pair and 2 classical bits.',
    coreGates: ['H', 'CNOT', 'M'],
  },
  {
    id: 'superdense-coding',
    title: 'Superdense Coding',
    category: 'Protocol',
    qubitCount: '2 Qubits',
    stage: 'Stage 2',
    description: 'Transmit two classical bits by sending only one qubit of an entangled Bell pair.',
    coreGates: ['H', 'CNOT', 'X', 'Z'],
  },
  {
    id: 'deutsch-jozsa',
    title: 'Deutsch-Jozsa Algorithm',
    category: 'Oracle / Speedup',
    qubitCount: 'N+1 Qubits',
    stage: 'Stage 3',
    description: 'Determine if a boolean function is constant or balanced in a single quantum query.',
    coreGates: ['H', 'U_f'],
  },
  {
    id: 'grover-search',
    title: "Grover's Search",
    category: 'Search / Speedup',
    qubitCount: 'N Qubits',
    stage: 'Stage 3',
    description: 'Quadratic speedup O(√N) for unstructured database search via amplitude amplification.',
    coreGates: ['H', 'Oracle', 'Diffusion'],
  },
  {
    id: 'qft',
    title: 'Quantum Fourier Transform (QFT)',
    category: 'Transform / Phase',
    qubitCount: 'N Qubits',
    stage: 'Stage 4',
    description: 'Discrete Fourier transform mapping state amplitudes to phase; core subroutine for Shor.',
    coreGates: ['H', 'CPHASE', 'SWAP'],
  },
  {
    id: 'vqe',
    title: 'Variational Quantum Eigensolver (VQE)',
    category: 'NISQ / Chemistry',
    qubitCount: 'Multi-qubit',
    stage: 'Stage 4',
    description: 'Hybrid quantum-classical optimization finding ground state molecular Hamiltonian energies.',
    coreGates: ['Ry', 'Rz', 'CNOT'],
  },
];

interface LearnSidebarProps {
  currentSlug?: string;
  isMeera?: boolean;
}

export function LearnSidebar({ currentSlug = 'bell-state', isMeera = false }: LearnSidebarProps) {
  return (
    <aside
      className="space-y-6 w-full"
      data-testid="learn-sidebar"
      aria-label="Quantum Curriculum and Algorithm Directory"
    >
      {/* 1. Active Focus Card: Bell Correlation Hero Lab */}
      <Card className="border-accent/40 bg-panel shadow-glow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
        <CardHeader className="pb-3 border-b border-line/60">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="default" className="text-[10px] font-mono tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3 fill-current text-accent" />
              <span>PRIMARY BENCHMARK</span>
            </Badge>
            <span className="text-[10px] font-mono text-evidence flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-evidence animate-pulse" />
              LIVE LAB
            </span>
          </div>
          <CardTitle className="text-sm font-display font-semibold text-ink pt-1 flex items-center gap-2">
            <Atom className="w-4 h-4 text-accent" />
            <span>Bell State Correlation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <p className="text-ink-dim leading-relaxed">
            The canonical two-qubit entanglement lab: Hadamard on qubit 0, CNOT to qubit 1, with Flight Recorder
            divergence diagnosis.
          </p>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="bg-abyss border border-line rounded p-2">
              <span className="text-ink-faint block text-[10px]">STATE</span>
              <span className="text-accent font-semibold">|Φ⁺⟩ = (|00⟩+|11⟩)/√2</span>
            </div>
            <div className="bg-abyss border border-line rounded p-2">
              <span className="text-ink-faint block text-[10px]">CIRCUIT</span>
              <span className="text-violet font-semibold">2 Qubits · H+CNOT</span>
            </div>
          </div>

          <div className="pt-1">
            <Link
              href="/learn/bell-state"
              className="flex items-center justify-between p-2.5 rounded-lg bg-accent/10 border border-accent/40 text-accent font-mono font-medium hover:bg-accent/20 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Workflow className="w-3.5 h-3.5" />
                <span>Launch Bell Correlation Lab</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2. Step Hierarchy Navigator */}
      <Card className="border-line bg-panel">
        <CardHeader className="pb-3 border-b border-line/60">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-ink-dim flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>Curriculum Steps (Track 1)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          {/* Step 1 */}
          <Link
            href="/learn/superposition"
            className={`block p-2.5 rounded-lg border transition-all ${
              currentSlug === 'superposition'
                ? 'bg-accent/10 border-accent/50 text-ink shadow-glow'
                : 'bg-abyss/60 border-line hover:border-line-bright text-ink-dim'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-accent">STEP 01</span>
              {isMeera ? (
                <Badge variant="outline" className="text-[9px] font-mono text-violet border-violet/40 bg-violet/10">
                  CREDITED
                </Badge>
              ) : (
                <span className="text-[10px] font-mono text-ink-faint">~14m</span>
              )}
            </div>
            <div className="text-xs font-semibold text-ink mt-0.5">Superposition & Hadamard</div>
            <div className="text-[11px] text-ink-faint font-mono">1 Qubit · |0⟩ → |+⟩</div>
          </Link>

          {/* Step 2 */}
          <Link
            href="/learn/measurement"
            className={`block p-2.5 rounded-lg border transition-all ${
              currentSlug === 'measurement'
                ? 'bg-accent/10 border-accent/50 text-ink shadow-glow'
                : 'bg-abyss/60 border-line hover:border-line-bright text-ink-dim'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-accent">STEP 02</span>
              {isMeera ? (
                <Badge variant="outline" className="text-[9px] font-mono text-violet border-violet/40 bg-violet/10">
                  CREDITED
                </Badge>
              ) : (
                <span className="text-[10px] font-mono text-ink-faint">~12m</span>
              )}
            </div>
            <div className="text-xs font-semibold text-ink mt-0.5">Measurement & Probability</div>
            <div className="text-[11px] text-ink-faint font-mono">Collapse · Born Rule</div>
          </Link>

          {/* Step 3 */}
          <Link
            href="/learn/bell-state"
            className={`block p-2.5 rounded-lg border transition-all ${
              currentSlug === 'bell-state'
                ? 'bg-accent/15 border-accent text-ink shadow-glow'
                : 'bg-abyss/60 border-line hover:border-line-bright text-ink-dim'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-accent">STEP 03 · HERO</span>
              <span className="text-[10px] font-mono text-evidence">~18m</span>
            </div>
            <div className="text-xs font-semibold text-ink mt-0.5">Bell State & Entanglement</div>
            <div className="text-[11px] text-ink-faint font-mono">2 Qubits · Flight Recorder</div>
          </Link>
        </CardContent>
      </Card>

      {/* 3. Future Quantum Algorithms Roadmap */}
      <Card className="border-line bg-panel">
        <CardHeader className="pb-3 border-b border-line/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-ink-dim flex items-center gap-2">
              <Binary className="w-3.5 h-3.5 text-accent" />
              <span>Future Algorithms</span>
            </CardTitle>
            <Badge variant="secondary" className="text-[9px] font-mono">
              ROADMAP
            </Badge>
          </div>
          <p className="text-[11px] text-ink-faint pt-1">
            Upcoming benchmark circuits scheduled for future Q-Trace runtime updates.
          </p>
        </CardHeader>
        <CardContent className="p-3 space-y-2.5">
          {FUTURE_ALGORITHMS.map((algo) => (
            <div
              key={algo.id}
              className="p-2.5 rounded-lg border border-line bg-abyss/40 space-y-1.5 transition-colors hover:border-line-bright"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-ink-faint shrink-0" />
                  <span>{algo.title}</span>
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono border-line-bright text-ink-dim bg-raised px-1.5 py-0"
                >
                  {algo.stage}
                </Badge>
              </div>

              <p className="text-[11px] text-ink-dim leading-relaxed">{algo.description}</p>

              <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-ink-faint border-t border-line/40">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-accent/70" />
                  {algo.qubitCount}
                </span>
                <span>Gates: {algo.coreGates.join(', ')}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. Telemetry Note */}
      <div className="p-3 rounded-lg border border-line bg-abyss text-[11px] font-mono text-ink-faint flex items-start gap-2">
        <Radio className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
        <span>Q-Trace runtime verified with Qiskit Aer 1024 shots & statevector simulation.</span>
      </div>
    </aside>
  );
}
