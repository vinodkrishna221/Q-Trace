'use client';

import * as React from 'react';
import { CircuitModel } from '@/lib/contracts';
import { useCircuitStore } from '@/lib/circuit-store';
import { GatePalette } from './gate-palette';
import { QubitWiresGrid } from './qubit-wire';
import { QiskitCodeEditor } from './qiskit-code-editor';
import { CircuitSharePanel } from './circuit-share-panel';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Play, CheckCircle2, RefreshCw, Zap, Share2 } from 'lucide-react';

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
  const [showSharePanel, setShowSharePanel] = React.useState(false);
  const isLocked = Boolean(readOnly || isSimulating);

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
        className="border-border-subtle bg-surface shadow-xs overflow-hidden"
        data-testid="circuit-workspace-readonly"
      >
        <CardHeader className="pb-3 border-b border-border-subtle bg-surface-raised/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-mono">
                {readOnly
                  ? 'STAGE 1 · CIRCUIT WORKSPACE (READ-ONLY)'
                  : isSimulating
                  ? 'STAGE 1 · SIMULATING (LOCKED)'
                  : 'STAGE 1 · CONSTRUCT & CODE'}
              </Badge>
              <span className="text-xs font-mono text-text-secondary" data-testid="circuit-name-badge">
                {circuit.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-text-tertiary">
                {circuit.qubitCount} Qubits · {circuit.classicalBitCount} Classical Bits · {circuit.operations.length} Gates
              </span>
              <Badge variant="outline" className="text-[10px] font-mono text-text-secondary">
                v{circuit.modelVersion}
              </Badge>
              <Button
                variant={showSharePanel ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowSharePanel(!showSharePanel)}
                disabled={isLocked}
                className="h-7 px-2.5 text-xs font-medium ml-1"
                data-testid="open-share-panel-btn"
                aria-expanded={showSharePanel}
              >
                <Share2 className="w-3.5 h-3.5 mr-1" />
                <span>Share &amp; Export</span>
              </Button>
            </div>
          </div>
          <CardTitle className="text-base text-text-primary flex items-center gap-2 mt-1">
            <Cpu className="w-4 h-4 text-accent" />
            <span>Synchronized Quantum Circuit Builder</span>
          </CardTitle>
          <CardDescription className="text-xs text-text-secondary">
            Drag gates onto qubit wires or edit code directly. The Circuit Model is the single synchronized source of truth.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 md:p-6 space-y-5">
          {/* Gate Palette */}
          {!isLocked && <GatePalette />}

          {/* Side-by-Side Instrument: Wires Grid (7 cols) + Qiskit Code Editor (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-4">
              <QubitWiresGrid readOnly={isLocked} />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <QiskitCodeEditor isReadOnly={isLocked} />
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-surface-raised/40 p-3 md:p-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Zap className="w-3.5 h-3.5 text-caution" />
            <span>
              Execution Target: <strong className="text-text-primary font-mono">Qiskit Aer (1024 shots)</strong>
            </span>
          </div>

          <Button
            onClick={handleRun}
            disabled={isLocked}
            data-testid="run-simulation-btn"
            variant={hasExecuted ? 'outline' : 'default'}
            className="font-medium text-xs gap-1.5"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                <span>Simulating on Aer...</span>
              </>
            ) : hasExecuted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-success" />
                <span>Re-run Simulation</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1 fill-white text-white" />
                <span>Run Simulation (Qiskit Aer)</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Share & Export Panel */}
      {showSharePanel && !isLocked && (
        <CircuitSharePanel
          onClose={() => setShowSharePanel(false)}
          onImportSuccess={() => setShowSharePanel(false)}
        />
      )}
    </div>
  );
}
