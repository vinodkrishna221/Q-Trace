'use client';

import * as React from 'react';
import { CircuitModel } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Play, CheckCircle2, RefreshCw, Zap, Info } from 'lucide-react';

interface CircuitWorkspaceReadonlyProps {
  circuit: CircuitModel;
  isSimulating?: boolean;
  hasExecuted?: boolean;
  onRunSimulation: () => void;
}

export function CircuitWorkspaceReadonly({
  circuit,
  isSimulating = false,
  hasExecuted = false,
  onRunSimulation,
}: CircuitWorkspaceReadonlyProps) {
  return (
    <Card
      className="border-line bg-panel shadow-xl overflow-hidden"
      data-testid="circuit-workspace-readonly"
    >
      <CardHeader className="pb-3 border-b border-line bg-raised/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs font-mono">
              STEP 2 · CIRCUIT WORKSPACE (READ-ONLY)
            </Badge>
            <span className="text-xs font-mono text-ink-dim">
              {circuit.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-ink-faint">
              {circuit.qubitCount} Qubits · {circuit.classicalBitCount} Classical Bits · {circuit.operations.length} Gates
            </span>
            <Badge variant="outline" className="text-[10px] font-mono text-ink-dim">
              v{circuit.modelVersion}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-base text-ink flex items-center gap-2 mt-1">
          <Cpu className="w-4 h-4 text-accent" />
          <span>Synchronized Bell State Circuit Model</span>
        </CardTitle>
        <CardDescription className="text-xs text-ink-dim">
          Canonical two-wire circuit: Hadamard (H) on q[0] creates equal superposition; CNOT(0→1) correlates target q[1] with control q[0].
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4">
        {/* Visual Wires Grid */}
        <div className="relative rounded-lg border border-line bg-abyss p-4 md:p-6 font-mono overflow-x-auto">
          {/* Column indicators */}
          <div className="grid grid-cols-12 gap-2 text-[10px] text-ink-faint pb-2 border-b border-line mb-4 pl-16">
            <div className="col-span-3 text-center">Col 0: Superposition</div>
            <div className="col-span-4 text-center">Col 1: Entanglement</div>
            <div className="col-span-5 text-center">Col 2: Measurement</div>
          </div>

          <div className="space-y-6 relative">
            {/* Qubit Wire 0 */}
            <div
              className="flex items-center gap-4 relative min-w-[480px]"
              data-testid="qubit-wire-0"
            >
              <div className="w-16 shrink-0 flex items-center gap-1.5 text-xs text-ink font-bold">
                <span className="px-1.5 py-0.5 rounded bg-raised border border-line-bright text-accent">
                  q[0]
                </span>
                <span className="text-[10px] text-ink-faint font-normal">|0⟩</span>
              </div>

              {/* Wire line */}
              <div className="absolute left-16 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-line-bright z-0" />

              {/* Gates on Wire 0 */}
              <div className="grid grid-cols-12 gap-2 w-full pl-2 z-10">
                {/* Col 0: H */}
                <div className="col-span-3 flex justify-center">
                  <div
                    data-testid="gate-op_1"
                    className="w-12 h-12 rounded-md bg-accent/15 border-2 border-accent text-accent flex flex-col items-center justify-center font-bold text-sm shadow-glow"
                  >
                    <span>H</span>
                    <span className="text-[9px] text-accent/80 font-normal">Hadamard</span>
                  </div>
                </div>

                {/* Col 1: CNOT Control */}
                <div className="col-span-4 flex justify-center items-center">
                  <div
                    data-testid="gate-cnot-control"
                    className="w-5 h-5 rounded-full bg-violet border-2 border-violet ring-2 ring-violet/40 flex items-center justify-center text-[10px] text-abyss font-bold shadow-lg"
                    title="CNOT Control (q[0])"
                  >
                    ●
                  </div>
                </div>

                {/* Col 2: Measure q[0] -> c[0] */}
                <div className="col-span-5 flex justify-center">
                  <div
                    data-testid="gate-op_3"
                    className="w-12 h-12 rounded-md bg-raised border-2 border-line-bright text-ink flex flex-col items-center justify-center text-xs font-bold shadow"
                  >
                    <span className="text-caution">MEASURE</span>
                    <span className="text-[9px] text-ink-dim font-normal">→ c[0]</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CNOT Vertical Connection Line */}
            <div
              className="absolute left-[calc(16px+25%+14%)] top-6 bottom-6 w-[2px] bg-violet pointer-events-none z-0 border-l border-r border-violet/50"
              style={{ left: '46%' }}
              aria-hidden="true"
            />

            {/* Qubit Wire 1 */}
            <div
              className="flex items-center gap-4 relative min-w-[480px]"
              data-testid="qubit-wire-1"
            >
              <div className="w-16 shrink-0 flex items-center gap-1.5 text-xs text-ink font-bold">
                <span className="px-1.5 py-0.5 rounded bg-raised border border-line-bright text-accent">
                  q[1]
                </span>
                <span className="text-[10px] text-ink-faint font-normal">|0⟩</span>
              </div>

              {/* Wire line */}
              <div className="absolute left-16 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-line-bright z-0" />

              {/* Gates on Wire 1 */}
              <div className="grid grid-cols-12 gap-2 w-full pl-2 z-10">
                {/* Col 0: Empty / Identity */}
                <div className="col-span-3 flex justify-center items-center">
                  <div className="text-[10px] text-ink-faint font-mono">— I —</div>
                </div>

                {/* Col 1: CNOT Target (⊕) */}
                <div className="col-span-4 flex justify-center items-center">
                  <div
                    data-testid="gate-op_2"
                    className="w-10 h-10 rounded-full bg-violet/20 border-2 border-violet text-violet flex items-center justify-center font-bold text-lg shadow-lg"
                    title="CNOT Target (q[1])"
                  >
                    ⊕
                  </div>
                </div>

                {/* Col 2: Measure q[1] -> c[1] */}
                <div className="col-span-5 flex justify-center">
                  <div
                    data-testid="gate-op_4"
                    className="w-12 h-12 rounded-md bg-raised border-2 border-line-bright text-ink flex flex-col items-center justify-center text-xs font-bold shadow"
                  >
                    <span className="text-caution">MEASURE</span>
                    <span className="text-[9px] text-ink-dim font-normal">→ c[1]</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Classical Register Wire c[2] */}
            <div className="flex items-center gap-4 relative pt-2 border-t border-line min-w-[480px]">
              <div className="w-16 shrink-0 flex items-center gap-1.5 text-xs text-ink-dim font-bold">
                <span className="px-1.5 py-0.5 rounded bg-raised border border-line text-ink">
                  c[2]
                </span>
                <span className="text-[10px] text-ink-faint font-normal">/2</span>
              </div>
              <div className="absolute left-16 right-0 top-1/2 -translate-y-1/2 h-[3px] border-b-2 border-line-bright border-double z-0" />
              <div className="w-full text-right pr-4 text-[10px] text-ink-faint">
                Classical register (2 bits)
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-raised/40 p-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-ink-dim">
          <Zap className="w-3.5 h-3.5 text-caution" />
          <span>Execution Target: <strong className="text-ink font-mono">Qiskit Aer 0.17 (1024 shots)</strong></span>
        </div>

        <Button
          onClick={onRunSimulation}
          disabled={isSimulating}
          data-testid="run-simulation-btn"
          variant={hasExecuted ? 'outline' : 'default'}
          className="font-semibold"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              <span>Simulating on Aer...</span>
            </>
          ) : hasExecuted ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2 text-evidence" />
              <span>Re-run Simulation (Qiskit Aer)</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2 text-abyss fill-abyss" />
              <span>Run Simulation (Qiskit Aer)</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
