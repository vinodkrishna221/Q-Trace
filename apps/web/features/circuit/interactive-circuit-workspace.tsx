'use client';

import * as React from 'react';
import { CircuitModel } from '@/lib/contracts';
import { useCircuitStore } from '@/lib/circuit-store';
import { GatePalette } from './gate-palette';
import { QubitWiresGrid } from './qubit-wire';
import { QiskitCodeEditor } from './qiskit-code-editor';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Play, CheckCircle2, RefreshCw, Zap, SlidersHorizontal } from 'lucide-react';

interface InteractiveCircuitWorkspaceProps {
  initialCircuit?: CircuitModel;
  isSimulating?: boolean;
  hasExecuted?: boolean;
  onRunSimulation?: (circuit: CircuitModel) => void;
  readOnly?: boolean;
}

export function InteractiveCircuitWorkspace({
  initialCircuit,
  isSimulating = false,
  hasExecuted = false,
  onRunSimulation,
  readOnly = false,
}: InteractiveCircuitWorkspaceProps) {
  const { circuit, setCircuit } = useCircuitStore();

  // Initialize store with initialCircuit if provided on mount
  React.useEffect(() => {
    if (initialCircuit) {
      setCircuit(initialCircuit);
    }
  }, [initialCircuit, setCircuit]);

  const handleRun = () => {
    onRunSimulation?.(circuit);
  };

  return (
    <div className="space-y-6" data-testid="interactive-circuit-workspace">
      <Card
        className="border-line bg-panel shadow-xl overflow-hidden"
        data-testid="circuit-workspace-readonly"
      >
        <CardHeader className="pb-3 border-b border-line bg-raised/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-mono">
                {readOnly ? 'STEP 2 · CIRCUIT WORKSPACE (READ-ONLY)' : 'STEP 2 · INTERACTIVE CIRCUIT WORKSPACE'}
              </Badge>
              <span className="text-xs font-mono text-ink-dim" data-testid="circuit-name-badge">
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
            <span>Synchronized Quantum Circuit Builder</span>
          </CardTitle>
          <CardDescription className="text-xs text-ink-dim">
            Drag gates from the palette onto qubit wires, or select cells with keyboard shortcuts. The Circuit Model is the single editable truth.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 md:p-6 space-y-5">
          {/* Gate Palette */}
          {!readOnly && <GatePalette />}

          {/* Interactive Wires Grid */}
          <QubitWiresGrid readOnly={readOnly} />
        </CardContent>

        <CardFooter className="bg-raised/40 p-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-ink-dim">
            <Zap className="w-3.5 h-3.5 text-caution" />
            <span>
              Execution Target: <strong className="text-ink font-mono">Qiskit Aer 0.17 (1024 shots)</strong>
            </span>
          </div>

          <Button
            onClick={handleRun}
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

      {/* Synchronized Qiskit Code Panel & Editor */}
      <QiskitCodeEditor isReadOnly={readOnly} />
    </div>
  );
}
