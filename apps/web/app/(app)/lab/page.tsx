'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Code, Layers, Database } from 'lucide-react';
import { DEMO_STARTER_CIRCUIT } from '@/lib/fixtures';

const GATE_PALETTE = [
  { gate: 'H', label: 'Hadamard', hint: 'superposition' },
  { gate: 'X', label: 'Pauli-X', hint: 'bit flip' },
  { gate: 'CNOT', label: 'Controlled-NOT', hint: 'entangle' },
  { gate: 'MEASURE', label: 'Measure', hint: 'collapse to bit' },
];

const GENERATED_QISKIT = `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])`;

export default function LabPage() {
  return (
    <div className="space-y-8" data-testid="lab-view">
      <PageHeader
        eyebrow={<Badge variant="default">CIRCUIT WORKSPACE</Badge>}
        title="Quantum Circuit Lab"
        purpose="Construct circuits on the wire grid and read verified simulator evidence — the Circuit Model is the single source of truth."
        actions={
          <Button className="gap-1.5">
            <Play className="w-3.5 h-3.5" />
            <span>Simulate (Aer)</span>
          </Button>
        }
      />

      {/* lab-bench archetype: palette 3 · grid 6 · inspector 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gate rail */}
        <Card className="lg:col-span-3 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono tracking-widest text-ink-dim">
              GATE PALETTE
            </CardTitle>
            <CardDescription className="text-xs">
              Click-to-place arrives with the builder card; grid below shows the seeded Bell circuit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {GATE_PALETTE.map((g) => (
              <div
                key={g.gate}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-line bg-abyss hover:border-accent/40 transition-colors cursor-default"
              >
                <span
                  className={`flex h-9 w-12 items-center justify-center rounded-md border font-mono text-sm font-bold ${
                    g.gate === 'CNOT'
                      ? 'border-violet/60 bg-violet/10 text-violet'
                      : g.gate === 'MEASURE'
                        ? 'border-line-bright bg-raised text-ink-dim'
                        : 'border-accent/60 bg-accent/10 text-accent'
                  }`}
                >
                  {g.gate === 'MEASURE' ? 'M' : g.gate}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-ink">{g.label}</span>
                  <span className="text-[10px] font-mono text-ink-faint">{g.hint}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Wire grid — the instrument */}
        <Card className="lg:col-span-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              <span>{DEMO_STARTER_CIRCUIT.name}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Operations ordered by column · rendered from the Circuit Model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative rounded-lg bg-abyss border border-line p-6 md:p-8"
              role="img"
              aria-label="Bell circuit: Hadamard on qubit 0, CNOT with control on qubit 0 and target on qubit 1, then both qubits measured into classical bits 0 and 1"
            >
              {/* vertical entanglement link between the two wires */}
              <div
                className="absolute left-[46%] top-[calc(50%-1.75rem)] bottom-[calc(50%-1.75rem)] w-px bg-violet/70"
                aria-hidden
              />
              <div className="space-y-14">
                {/* q[0] wire */}
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="w-10 text-accent font-bold">q[0]</span>
                  <div className="relative flex-1 h-px bg-line-bright">
                    <div className="absolute inset-0 flex items-center justify-between px-[8%]">
                      <span className="px-2.5 py-1.5 bg-accent/15 border border-accent/60 text-accent rounded-md font-bold shadow-glow">
                        H
                      </span>
                      <span className="relative z-10 h-3.5 w-3.5 rounded-full bg-accent border-2 border-accent shadow-glow" title="CNOT control" />
                      <span className="px-2.5 py-1.5 bg-raised border border-line-bright text-ink-dim rounded-md" title="Measure into c[0]">
                        M → c[0]
                      </span>
                    </div>
                  </div>
                </div>
                {/* q[1] wire */}
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="w-10 text-accent font-bold">q[1]</span>
                  <div className="relative flex-1 h-px bg-line-bright">
                    <div className="absolute inset-0 flex items-center justify-between px-[8%]">
                      <span className="w-[52px]" aria-hidden />
                      <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-violet bg-abyss text-violet text-base font-bold" title="CNOT target">
                        ⊕
                      </span>
                      <span className="px-2.5 py-1.5 bg-raised border border-line-bright text-ink-dim rounded-md" title="Measure into c[1]">
                        M → c[1]
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center text-[10px] font-mono tracking-widest text-violet">
                ┆ CNOT(0 → 1) · entanglement link ┆
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspector */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono tracking-widest text-ink-dim flex items-center gap-2">
                  <Code className="w-3.5 h-3.5 text-accent" />
                  <span>GENERATED QISKIT</span>
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">READ-ONLY</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="p-3 bg-abyss rounded-lg border border-line font-mono text-xs leading-relaxed overflow-x-auto">
{GENERATED_QISKIT.split('\n').map((line, i) => (
  <div key={i} className={
    line.startsWith('from') || line.startsWith('qc =')
      ? 'text-ink-faint'
      : line.includes('cx')
        ? 'text-violet'
        : 'text-accent'
  }>{line}</div>
))}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-mono tracking-widest text-ink-dim flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-accent" />
                <span>CIRCUIT METADATA</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs font-mono">
              {[
                ['Qubits', String(DEMO_STARTER_CIRCUIT.qubitCount)],
                ['Classical bits', String(DEMO_STARTER_CIRCUIT.classicalBitCount)],
                ['Interchange', 'OpenQASM 3.0'],
                ['Source', DEMO_STARTER_CIRCUIT.source],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center border-b border-line/60 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-ink-faint">{k}</span>
                  <span className="text-ink">{v}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
