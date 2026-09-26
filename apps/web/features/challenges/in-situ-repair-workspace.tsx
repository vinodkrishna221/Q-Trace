'use client';

import * as React from 'react';
import { CircuitModel, Operation, SimulationRun, GateName } from '@/lib/contracts';
import { DEMO_BRIDGE_STARTER_CIRCUIT, DEMO_BROKEN_CIRCUIT, DEMO_SIMULATION_RUN } from '@/lib/fixtures';
import { apiClient, simulateFallbackCircuit, fallbackSimulationRuns } from '@/lib/api-client';
import { generateOpenQasm3 } from '@/features/circuit/circuit-qasm-exporter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Cpu,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Plus,
  Trash2,
} from 'lucide-react';

interface InSituRepairWorkspaceProps {
  initialCircuit?: CircuitModel;
  challengeId?: string;
  expectedStates?: string[];
  onCircuitChange?: (circuit: CircuitModel) => void;
  onSimulationRun?: (simulationRun: SimulationRun) => void;
  readOnly?: boolean;
}

export function InSituRepairWorkspace({
  initialCircuit = DEMO_BRIDGE_STARTER_CIRCUIT,
  challengeId = 'ch_bell_psi_plus',
  expectedStates = ['01', '10'],
  onCircuitChange,
  onSimulationRun,
  readOnly = false,
}: InSituRepairWorkspaceProps) {
  const isBridge = challengeId === 'ch_bell_psi_plus';

  const defaultStarter = React.useMemo(() => {
    if (challengeId === 'ch_bell_repair') return DEMO_BROKEN_CIRCUIT;
    if (challengeId === 'ch_bell_psi_plus') return DEMO_BRIDGE_STARTER_CIRCUIT;
    return initialCircuit;
  }, [challengeId, initialCircuit]);

  const [circuit, setCircuit] = React.useState<CircuitModel>(initialCircuit);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [lastSimRun, setLastSimRun] = React.useState<SimulationRun | null>(null);

  // Sync when challengeId or starter circuit changes externally
  React.useEffect(() => {
    setCircuit(initialCircuit);
    setLastSimRun(null);
  }, [challengeId, initialCircuit.id]);

  const updateCircuitOperations = (newOps: Operation[]) => {
    const updatedCircuit: CircuitModel = {
      ...circuit,
      operations: newOps,
      modelVersion: 1,
      openQasm3: generateOpenQasm3({ ...circuit, operations: newOps }),
      updatedAt: new Date().toISOString(),
    };
    setCircuit(updatedCircuit);
    setLastSimRun(null);
    onCircuitChange?.(updatedCircuit);
  };

  // Add gate at specific qubit and column
  const handleAddGate = (gate: GateName, qubit: number, column: number) => {
    if (readOnly) return;
    // Remove any existing gate at this exact qubit and column
    const filtered = circuit.operations.filter(
      (op) =>
        !(
          op.column === column &&
          (op.targets.includes(qubit) || op.controls.includes(qubit))
        )
    );
    const controls =
      gate === 'CNOT'
        ? [qubit === 0 ? 1 : 0]
        : [];
    const newOp: Operation = {
      opId: `op_insitu_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      gate,
      targets: [qubit],
      controls,
      classicalTargets: [],
      column,
    };
    updateCircuitOperations([...filtered, newOp]);
  };

  // Remove gate at specific qubit and column
  const handleRemoveGate = (qubit: number, column: number) => {
    if (readOnly) return;
    const filtered = circuit.operations.filter(
      (op) =>
        !(
          op.column === column &&
          (op.targets.includes(qubit) || op.controls.includes(qubit))
        )
    );
    updateCircuitOperations(filtered);
  };

  // Reset to starter circuit
  const handleReset = () => {
    if (readOnly) return;
    setCircuit(defaultStarter);
    onCircuitChange?.(defaultStarter);
    setLastSimRun(null);
  };

  // Run local or Aer simulation
  const handleTestCircuit = async () => {
    setIsSimulating(true);
    try {
      const simResult = await apiClient.runSimulation({
        learnerProfileId: 'lp_aarav',
        moduleId: 'mod_bell',
        circuitModel: circuit,
        predictionResponse: { checkpointId: 'pc_bell_outcomes', answer: 'CORRELATED_00_11' },
        primaryAdapter: 'QISKIT_AER',
        shots: 1024,
      });
      setLastSimRun(simResult.data);
      onSimulationRun?.(simResult.data);
    } catch {
      const simulated = simulateFallbackCircuit(circuit, 1024);
      const runId = `sr_repair_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const simRun: SimulationRun = {
        ...DEMO_SIMULATION_RUN,
        id: runId,
        circuitModelId: circuit.id,
        probabilities: simulated.probabilities,
        counts: simulated.counts,
        stateTrace: simulated.stateTrace,
        createdAt: new Date().toISOString(),
      };
      fallbackSimulationRuns.set(runId, simRun);
      setLastSimRun(simRun);
      onSimulationRun?.(simRun);
    } finally {
      setIsSimulating(false);
    }
  };

  // Compute live match status
  const currentProbs = lastSimRun?.probabilities || {};
  const activeSupportStates = Object.entries(currentProbs)
    .filter(([_, p]) => p > 0.001)
    .map(([s]) => s)
    .sort();
  const sortedExpected = [...expectedStates].sort();
  const isTargetAchieved =
    lastSimRun !== null &&
    activeSupportStates.length === sortedExpected.length &&
    activeSupportStates.every((s, i) => s === sortedExpected[i]);

  const getGateAt = (qubit: number, column: number) =>
    circuit.operations.find(
      (op) =>
        op.column === column &&
        (op.targets.includes(qubit) || op.controls.includes(qubit))
    );

  return (
    <div
      className="space-y-4 rounded-xl border border-line bg-abyss/80 p-4 md:p-5 shadow-inner"
      data-testid="in-situ-repair-workspace"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-ink">
            {isBridge ? 'In-Situ Bridge Circuit Canvas' : 'In-Situ Repair Circuit Canvas'}
          </span>
          <Badge variant="outline" className="text-[10px] font-mono border-accent/40 text-accent">
            {isBridge ? 'Bridge Stage 2' : 'Remedial Repair'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={readOnly}
            className="h-7 px-2 text-xs font-mono text-ink-dim hover:text-ink gap-1 cursor-pointer"
            data-testid="reset-insitu-circuit-btn"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Seed</span>
          </Button>
        </div>
      </div>

      {/* Quick Gate Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel/60 p-2.5 rounded-lg border border-line/60">
        <div className="flex items-center gap-2 text-xs text-ink-dim font-mono">
          <span className="text-ink font-semibold">Available Gates:</span>
          {isBridge ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddGate('X', 1, 2)}
                disabled={readOnly}
                className="h-7 px-2.5 text-xs font-mono border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent gap-1 cursor-pointer"
                data-testid="place-x-gate-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Place Pauli-X on q[1] (Col 2)</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddGate('X', 0, 2)}
                disabled={readOnly}
                className="h-7 px-2.5 text-xs font-mono border-line text-ink-dim hover:text-ink gap-1 cursor-pointer"
                data-testid="place-x-gate-q0-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Place X on q[0]</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddGate('H', 0, 0)}
                disabled={readOnly}
                className="h-7 px-2.5 text-xs font-mono border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent gap-1 cursor-pointer"
                data-testid="place-h-gate-q0-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Place H on q[0] (Col 0)</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddGate('CNOT', 1, 1)}
                disabled={readOnly}
                className="h-7 px-2.5 text-xs font-mono border-line text-ink-dim hover:text-ink gap-1 cursor-pointer"
                data-testid="place-cnot-gate-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Place CNOT on q[1] (Col 1)</span>
              </Button>
            </>
          )}
        </div>
        <span className="text-[11px] font-mono text-ink-faint">
          Target: {expectedStates.map((s) => `|${s}⟩`).join(' + ')}
        </span>
      </div>

      {/* 2-Wire Interactive Circuit Diagram */}
      <div
        className="rounded-lg bg-abyss p-4 border border-line space-y-6 font-mono text-xs select-none overflow-x-auto min-w-0"
        data-testid="insitu-circuit-grid"
      >
        <div className="min-w-[340px] space-y-6">
          {[0, 1].map((wire) => {
            const cnotOp = circuit.operations.find((op) => op.gate === 'CNOT');

            return (
              <div key={wire} className="flex items-center gap-3">
                <span className="w-10 text-accent font-bold text-xs shrink-0">q[{wire}]</span>

                <div className="relative flex-1 h-9 flex items-center">
                  {/* Horizontal wire background */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-border-medium" />

                  {/* 4 Columns (0: H/prep, 1: CNOT, 2: Slot for X gate, 3: Measure) */}
                  <div className="relative z-10 w-full grid grid-cols-4 items-center">
                    {/* Column 0 */}
                    <div className="flex justify-center">
                      {(() => {
                        const op = getGateAt(wire, 0);
                        if (op?.gate === 'H') {
                          return (
                            <div className="flex items-center gap-1 group">
                              <span
                                className="px-3 py-1 bg-gate-h/20 border border-gate-h text-gate-h rounded-full font-bold shadow-xs text-xs"
                                data-testid={`insitu-gate-h-q${wire}`}
                              >
                                H
                              </span>
                              {!readOnly && (
                                <button
                                  onClick={() => handleRemoveGate(wire, 0)}
                                  className="p-0.5 rounded-full hover:bg-danger/20 text-danger opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Remove H gate"
                                  data-testid={`remove-h-gate-q${wire}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        }
                        if (op?.gate === 'CNOT') {
                          return op.controls.includes(wire) ? (
                            <div className="h-4 w-4 rounded-full bg-gate-cnot border-2 border-gate-cnot shadow-xs flex items-center justify-center" />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-gate-cnot/20 border-2 border-gate-cnot text-gate-cnot font-bold flex items-center justify-center text-sm shadow-xs">
                              ⊕
                            </div>
                          );
                        }
                        if (op?.gate === 'X') {
                          return (
                            <span className="px-3 py-1 bg-gate-pauli-x/20 border border-gate-pauli-x text-gate-pauli-x rounded-full font-bold shadow-xs text-xs">
                              X
                            </span>
                          );
                        }
                        if (wire === 0) {
                          return (
                            <button
                              onClick={() => handleAddGate('H', 0, 0)}
                              disabled={readOnly}
                              className="h-7 px-3 rounded-full border border-dashed border-accent/60 bg-accent/5 hover:bg-accent/15 text-accent text-[11px] font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="Click to place Hadamard (H) gate on q[0]"
                              data-testid="empty-slot-q0-col0"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+H</span>
                            </button>
                          );
                        }
                        return (
                          <span className="w-8 h-8 rounded-full border border-dashed border-border-subtle/40 flex items-center justify-center text-[10px] text-ink-faint">
                            —
                          </span>
                        );
                      })()}
                    </div>

                    {/* Column 1 (CNOT / Intermediate Gate) */}
                    <div className="flex justify-center">
                      {(() => {
                        const op = getGateAt(wire, 1);
                        if (op?.gate === 'CNOT') {
                          return op.controls.includes(wire) ? (
                            <div className="h-4 w-4 rounded-full bg-gate-cnot border-2 border-gate-cnot shadow-xs flex items-center justify-center" />
                          ) : (
                            <div className="flex items-center gap-1 group">
                              <div className="h-7 w-7 rounded-full bg-gate-cnot/20 border-2 border-gate-cnot text-gate-cnot font-bold flex items-center justify-center text-sm shadow-xs">
                                ⊕
                              </div>
                              {!readOnly && (
                                <button
                                  onClick={() => handleRemoveGate(wire, 1)}
                                  className="p-0.5 rounded-full hover:bg-danger/20 text-danger opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Remove CNOT gate"
                                  data-testid={`remove-cnot-gate-q${wire}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        }
                        if (op?.gate === 'H') {
                          return (
                            <span className="px-3 py-1 bg-gate-h/20 border border-gate-h text-gate-h rounded-full font-bold shadow-xs text-xs">
                              H
                            </span>
                          );
                        }
                        if (op?.gate === 'X') {
                          return (
                            <span className="px-3 py-1 bg-gate-pauli-x/20 border border-gate-pauli-x text-gate-pauli-x rounded-full font-bold shadow-xs text-xs">
                              X
                            </span>
                          );
                        }
                        if (wire === 1) {
                          return (
                            <button
                              onClick={() => handleAddGate('CNOT', 1, 1)}
                              disabled={readOnly}
                              className="h-7 px-3 rounded-full border border-dashed border-gate-cnot/60 bg-gate-cnot/5 hover:bg-gate-cnot/15 text-gate-cnot text-[11px] font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="Click to place CNOT gate (control q[0], target q[1])"
                              data-testid="empty-slot-q1-col1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+CX</span>
                            </button>
                          );
                        }
                        return (
                          <span className="w-8 h-8 rounded-full border border-dashed border-border-subtle/40 flex items-center justify-center text-[10px] text-ink-faint">
                            —
                          </span>
                        );
                      })()}
                    </div>

                  {/* Column 2 (In-Situ Challenge Slot: Placement Area) */}
                  <div className="flex justify-center">
                    {(() => {
                      const op = getGateAt(wire, 2);
                      if (op) {
                        return (
                          <div className="flex items-center gap-1 group">
                            <span
                              className="px-3.5 py-1 bg-gate-pauli-x/20 border border-gate-pauli-x text-gate-pauli-x rounded-full font-bold shadow-xs text-xs"
                              data-testid={`insitu-gate-q${wire}`}
                            >
                              {op.gate}
                            </span>
                            {!readOnly && (
                              <button
                                onClick={() => handleRemoveGate(wire, 2)}
                                className="p-0.5 rounded-full hover:bg-danger/20 text-danger opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                title="Remove gate"
                                data-testid={`remove-gate-q${wire}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      }
                      if (isBridge) {
                        return (
                          <button
                            onClick={() => handleAddGate('X', wire, 2)}
                            disabled={readOnly}
                            className="h-7 w-12 rounded border border-dashed border-accent/60 bg-accent/5 hover:bg-accent/15 text-accent text-[11px] font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title={`Click to place Pauli-X gate on q[${wire}]`}
                            data-testid={`empty-slot-q${wire}`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>+X</span>
                          </button>
                        );
                      }
                      return (
                        <span className="w-8 h-8 rounded border border-dashed border-line/40 flex items-center justify-center text-[10px] text-ink-faint">
                          —
                        </span>
                      );
                    })()}
                  </div>

                  {/* Column 3 (Measurement) */}
                  <div className="flex justify-center">
                    <span className="px-2 py-0.5 bg-raised border border-line-bright text-ink-dim rounded text-xs">
                      M
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Test Circuit Controls & Real-Time Probability Readout */}
      <div className="pt-2 border-t border-line/60 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            onClick={handleTestCircuit}
            disabled={isSimulating}
            size="sm"
            variant="outline"
            className="h-8 text-xs font-mono font-semibold border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent gap-1.5 cursor-pointer"
            data-testid="test-insitu-circuit-btn"
          >
            {isSimulating ? (
              <>
                <Zap className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Aer...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-accent text-accent" />
                <span>Test Circuit (Qiskit Aer)</span>
              </>
            )}
          </Button>

          {lastSimRun && (
            <div className="flex items-center gap-2">
              {isTargetAchieved ? (
                <div
                  className="flex items-center gap-1.5 text-xs font-mono text-evidence bg-evidence/10 px-2.5 py-1 rounded border border-evidence/40"
                  data-testid="insitu-target-achieved-badge"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isBridge
                      ? 'Target State Prepared (|01⟩ + |10⟩)'
                      : 'Target State Prepared (|00⟩ + |11⟩)'}
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1.5 text-xs font-mono text-caution bg-caution/10 px-2.5 py-1 rounded border border-caution/40"
                  data-testid="insitu-target-pending-badge"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    {isBridge
                      ? 'Pending: Place X gate to transform into |Ψ+⟩'
                      : 'Pending: Place H on q[0] to restore Bell correlation (|00⟩ + |11⟩)'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Probability Breakdown */}
        {lastSimRun && (
          <div
            className="grid grid-cols-4 gap-2 bg-panel/40 p-2.5 rounded-lg border border-line text-center font-mono text-xs"
            data-testid="insitu-probabilities-bar"
          >
            {['00', '01', '10', '11'].map((state) => {
              const prob = currentProbs[state] || 0.0;
              const isTargetState = expectedStates.includes(state);
              return (
                <div
                  key={state}
                  className={`p-1.5 rounded border ${
                    prob > 0.01
                      ? isTargetState
                        ? 'border-evidence/60 bg-evidence/10 text-evidence font-bold'
                        : 'border-caution/60 bg-caution/10 text-caution'
                      : 'border-line/40 bg-abyss/40 text-ink-faint'
                  }`}
                >
                  <div className="text-[11px]">|{state}⟩</div>
                  <div className="text-xs">{(prob * 100).toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
