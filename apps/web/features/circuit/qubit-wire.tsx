'use client';

import * as React from 'react';
import { useCircuitStore } from '@/lib/circuit-store';
import { GateName, Operation } from '@/lib/contracts';
import { GATE_DEFINITIONS } from './circuit-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Trash2 } from 'lucide-react';
import { GateTile, CnotTargetCrosshairIcon, MeasureGaugeIcon, CcxMultiTerminalIcon, CzMultiTerminalIcon } from './gate-glyph';

interface QubitWiresGridProps {
  maxColumnsDisplay?: number;
  readOnly?: boolean;
}

export function QubitWiresGrid({
  maxColumnsDisplay = 4,
  readOnly = false,
}: QubitWiresGridProps) {
  const {
    circuit,
    selectedGateToPlace,
    selectGateToPlace,
    addGate,
    removeGate,
    removeGateAt,
    selectOp,
    selectedOpId,
  } = useCircuitStore();

  const qubitCount = circuit.qubitCount || 2;
  const classicalCount = circuit.classicalBitCount || 2;

  // Determine total columns to render (at least max column used + 1, and minimum 4)
  const maxUsedColumn = circuit.operations.reduce(
    (max, op) => Math.max(max, op.column),
    -1
  );
  const totalColumns = Math.max(maxColumnsDisplay, maxUsedColumn + 2);
  const columnsList = Array.from({ length: totalColumns }, (_, i) => i);

  // Helper to find operations in a specific cell
  const getOpAt = (qubit: number, column: number): {
    op: Operation | undefined;
    isControl: boolean;
    isTarget: boolean;
  } => {
    // Find operation targeting this qubit at this column
    const targetOp = circuit.operations.find(
      (op) => op.column === column && op.targets.includes(qubit)
    );
    if (targetOp) {
      return { op: targetOp, isControl: false, isTarget: true };
    }

    // Find operation controlling this qubit at this column (CNOT, CZ, CCX)
    const controlOp = circuit.operations.find(
      (op) => op.column === column && op.controls.includes(qubit)
    );
    if (controlOp) {
      return { op: controlOp, isControl: true, isTarget: false };
    }

    return { op: undefined, isControl: false, isTarget: false };
  };

  // Find all multi-qubit operations (CNOT, CZ, CCX) to render vertical connecting lines
  const multiQubitOps = circuit.operations.filter(
    (op) => op.gate === 'CNOT' || op.gate === 'CZ' || op.gate === 'CCX'
  );

  // Handle cell click
  const handleCellClick = (qubit: number, column: number) => {
    if (readOnly) return;

    if (selectedGateToPlace) {
      // Place armed gate
      addGate(selectedGateToPlace, qubit, column);
    } else {
      const { op } = getOpAt(qubit, column);
      if (op) {
        selectOp(op.opId === selectedOpId ? null : op.opId);
      }
    }
  };

  // Handle cell drop (HTML5 drag & drop)
  const handleCellDrop = (e: React.DragEvent, qubit: number, column: number) => {
    if (readOnly) return;
    e.preventDefault();
    const gateKey = e.dataTransfer.getData('text/plain') as GateName;
    if (gateKey && GATE_DEFINITIONS[gateKey]) {
      addGate(gateKey, qubit, column);
    }
  };

  // Handle cell keyboard shortcuts
  const handleCellKeyDown = (
    e: React.KeyboardEvent,
    qubit: number,
    column: number
  ) => {
    if (readOnly) return;

    const key = e.key.toLowerCase();
    if (key === 'enter' || e.key === ' ') {
      e.preventDefault();
      handleCellClick(qubit, column);
    } else if (key === 'escape') {
      e.preventDefault();
      if (selectedGateToPlace) {
        selectGateToPlace(null);
      } else if (selectedOpId) {
        selectOp(null);
      }
    } else if (key === 'h') {
      e.preventDefault();
      addGate('H', qubit, column);
    } else if (key === 'x') {
      e.preventDefault();
      addGate('X', qubit, column);
    } else if (key === 'y') {
      e.preventDefault();
      addGate('Y', qubit, column);
    } else if (key === 'z') {
      e.preventDefault();
      addGate('Z', qubit, column);
    } else if (key === 's') {
      e.preventDefault();
      addGate('S', qubit, column);
    } else if (key === 't') {
      e.preventDefault();
      addGate('T', qubit, column);
    } else if (key === 'c') {
      e.preventDefault();
      addGate('CNOT', qubit, column);
    } else if (key === 'j') {
      e.preventDefault();
      addGate('CZ', qubit, column);
    } else if (key === 'o') {
      e.preventDefault();
      addGate('CCX', qubit, column);
    } else if (key === 'm') {
      e.preventDefault();
      addGate('MEASURE', qubit, column);
    } else if (key === 'delete' || key === 'backspace') {
      e.preventDefault();
      removeGateAt(qubit, column);
    } else if (key === 'arrowright') {
      e.preventDefault();
      const nextCell = document.querySelector<HTMLElement>(
        `[data-testid="wire-cell-${qubit}-${Math.min(totalColumns - 1, column + 1)}"]`
      );
      nextCell?.focus();
    } else if (key === 'arrowleft') {
      e.preventDefault();
      const prevCell = document.querySelector<HTMLElement>(
        `[data-testid="wire-cell-${qubit}-${Math.max(0, column - 1)}"]`
      );
      prevCell?.focus();
    } else if (key === 'arrowdown') {
      e.preventDefault();
      const lowerCell = document.querySelector<HTMLElement>(
        `[data-testid="wire-cell-${Math.min(qubitCount - 1, qubit + 1)}-${column}"]`
      );
      lowerCell?.focus();
    } else if (key === 'arrowup') {
      e.preventDefault();
      const upperCell = document.querySelector<HTMLElement>(
        `[data-testid="wire-cell-${Math.max(0, qubit - 1)}-${column}"]`
      );
      upperCell?.focus();
    }
  };

  return (
    <div
      className="relative rounded-xl border border-border-subtle bg-canvas p-4 md:p-6 font-mono overflow-x-auto select-none"
      data-testid="qubit-wires-grid"
    >
      {/* Column Headers */}
      <div
        className="grid gap-2 text-[10px] text-ink-faint pb-2 border-b border-border-subtle mb-4"
        style={{
          gridTemplateColumns: `80px repeat(${totalColumns}, minmax(80px, 1fr))`,
        }}
      >
        <div className="text-center font-semibold text-ink-dim">WIRE</div>
        {columnsList.map((col) => (
          <div
            key={`col-header-${col}`}
            className="text-center font-mono py-0.5 px-1 bg-surface-raised/30 rounded-full border border-border-subtle/40"
            data-testid={`column-header-${col}`}
          >
            Col {col}
          </div>
        ))}
      </div>

      {/* Qubit Wires Container */}
      <div className="space-y-6 relative min-w-[540px]">
        {/* Render Multi-Wire Vertical Connection Lines for CNOT, CZ, and CCX */}
        {multiQubitOps.map((op) => {
          const allQubits = [...op.controls, ...op.targets];
          if (allQubits.length < 2) return null;
          const minQ = Math.min(...allQubits);
          const maxQ = Math.max(...allQubits);
          const colIndex = op.column;

          const isCcx = op.gate === 'CCX';
          const isCz = op.gate === 'CZ';

          const linkTestId = isCcx
            ? `ccx-vertical-link-${op.opId}`
            : isCz
            ? `cz-vertical-link-${op.opId}`
            : `cnot-vertical-link-${op.opId}`;

          const colorClass = isCcx
            ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]'
            : isCz
            ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)]'
            : 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]';

          return (
            <div
              key={`${op.gate.toLowerCase()}-line-${op.opId}`}
              data-testid={linkTestId}
              className={`absolute w-[3px] pointer-events-none z-0 overflow-hidden ${colorClass}`}
              style={{
                top: `${minQ * 80 + 20}px`,
                height: `${(maxQ - minQ) * 80}px`,
                left: `calc(80px + (100% - 80px) * ${(colIndex + 0.5) / totalColumns})`,
                transform: 'translateX(-50%)',
              }}
              aria-hidden="true"
            >
              {/* Entanglement / Control Pulse Particle */}
              <div className="w-[3px] h-[30px] bg-white shadow-[0_0_10px_#fff,0_0_20px_#fff] animate-particle-flow" />
            </div>
          );
        })}

        {/* Individual Qubit Wires */}
        {Array.from({ length: qubitCount }, (_, qubitIndex) => {
          return (
            <div
              key={`qubit-wire-${qubitIndex}`}
              className="flex items-center gap-4 relative"
              data-testid={`qubit-wire-${qubitIndex}`}
            >
              {/* Qubit Label */}
              <div className="w-16 shrink-0 flex items-center gap-1.5 z-10">
                <span className="h-6 px-2 flex items-center justify-center bg-surface-sunken border border-border-subtle rounded-sm font-mono text-[11px] font-bold text-text-primary">
                  q[{qubitIndex}] |0⟩
                </span>
              </div>

              {/* Wire horizontal line */}
              <div className="absolute left-16 right-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-border-medium z-0" />

              {/* Cells for each column */}
              <div
                className="grid gap-2 w-full pl-2 z-10"
                style={{
                  gridTemplateColumns: `repeat(${totalColumns}, minmax(80px, 1fr))`,
                }}
              >
                {columnsList.map((col) => {
                  const { op, isControl, isTarget } = getOpAt(qubitIndex, col);
                  const isSelected = op && op.opId === selectedOpId;

                  const cellAriaLabel = op
                    ? isControl
                      ? `Qubit ${qubitIndex} column ${col}: ${op.gate} Control targeting qubit ${op.targets[0]}`
                      : isTarget
                        ? `Qubit ${qubitIndex} column ${col}: ${op.gate} Target`
                        : `Qubit ${qubitIndex} column ${col}: ${op.gate} gate`
                    : `Empty slot on qubit ${qubitIndex}, column ${col}`;

                  return (
                    <div
                      key={`cell-${qubitIndex}-${col}`}
                      data-testid={`wire-cell-${qubitIndex}-${col}`}
                      tabIndex={readOnly ? -1 : 0}
                      role="button"
                      aria-label={cellAriaLabel}
                      onClick={() => handleCellClick(qubitIndex, col)}
                      onKeyDown={(e) => handleCellKeyDown(e, qubitIndex, col)}
                      onDragOver={(e) => {
                        if (!readOnly) e.preventDefault();
                      }}
                      onDrop={(e) => handleCellDrop(e, qubitIndex, col)}
                      className={`h-14 rounded-xl border flex items-center justify-center relative transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas ${
                        isSelected
                          ? 'border-accent ring-2 ring-accent/60 bg-accent/10'
                          : op
                            ? 'border-transparent bg-transparent'
                            : 'border-dashed border-border-subtle/50 hover:border-accent hover:bg-accent/5 focus:border-accent focus:ring-1 focus:ring-accent'
                      }`}
                    >
                      {/* Control dot for CNOT */}
                      {op && isControl && op.gate === 'CNOT' && (
                        <div
                          data-testid="gate-cnot-control"
                          className="w-5 h-5 rounded-full bg-violet-600 border-2 border-white ring-2 ring-violet-500/40 flex items-center justify-center text-white shadow-xs cursor-pointer hover:scale-110 transition-transform z-10 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                          title={`CNOT Control on q[${qubitIndex}] -> q[${op.targets[0]}]`}
                          aria-label={`CNOT Control (targets q[${op.targets[0]}])`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span className="sr-only">CNOT Control</span>
                        </div>
                      )}

                      {/* Control dot for CZ */}
                      {op && isControl && op.gate === 'CZ' && (
                        <div
                          data-testid="gate-cz-control"
                          className="w-5 h-5 rounded-full bg-sky-600 border-2 border-white ring-2 ring-sky-500/40 flex items-center justify-center text-white shadow-xs cursor-pointer hover:scale-110 transition-transform z-10 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                          title={`CZ Control on q[${qubitIndex}] -> q[${op.targets[0]}]`}
                          aria-label={`CZ Control (targets q[${op.targets[0]}])`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span className="sr-only">CZ Control</span>
                        </div>
                      )}

                      {/* Control dot for CCX */}
                      {op && isControl && op.gate === 'CCX' && (
                        <div
                          data-testid="gate-ccx-control"
                          className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-500/40 flex items-center justify-center text-white shadow-xs cursor-pointer hover:scale-110 transition-transform z-10 shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                          title={`Toffoli Control on q[${qubitIndex}] -> q[${op.targets[0]}]`}
                          aria-label={`CCX Control (targets q[${op.targets[0]}])`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span className="sr-only">CCX Control</span>
                        </div>
                      )}

                      {/* CNOT Target Crosshair */}
                      {op && isTarget && op.gate === 'CNOT' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="animate-gate-dock w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform border border-violet-700 z-10 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                          title={`CNOT Target on q[${qubitIndex}] (control q[${op.controls[0]}])`}
                          aria-label={`CNOT Target (controlled by q[${op.controls[0]}])`}
                        >
                          <CnotTargetCrosshairIcon data-testid="gate-cnot-target" className="w-6 h-6 text-white" strokeWidth={2.4} />
                          <span className="sr-only">CNOT Target</span>
                        </div>
                      )}

                      {/* CCX Toffoli Target Crosshair */}
                      {op && isTarget && op.gate === 'CCX' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="animate-gate-dock w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform border border-blue-700 z-10 shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                          title={`Toffoli Target on q[${qubitIndex}] (controls q[${op.controls.join(', ')}])`}
                          aria-label={`Toffoli Target (controlled by q[${op.controls.join(', ')}])`}
                        >
                          <span data-testid="gate-ccx-target" className="flex items-center justify-center">
                            <CnotTargetCrosshairIcon className="w-6 h-6 text-white" strokeWidth={2.4} />
                          </span>
                          <span className="sr-only">CCX Target</span>
                        </div>
                      )}

                      {/* CZ Target Dot */}
                      {op && isTarget && op.gate === 'CZ' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="animate-gate-dock w-6 h-6 rounded-full bg-sky-600 border-2 border-white ring-2 ring-sky-500/40 flex items-center justify-center text-white shadow-xs cursor-pointer hover:scale-110 transition-transform z-10 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                          title={`CZ Target on q[${qubitIndex}] (controlled by q[${op.controls[0]}])`}
                          aria-label={`CZ Target (controlled by q[${op.controls[0]}])`}
                        >
                          <span data-testid="gate-cz-target" className="w-2 h-2 rounded-full bg-white" />
                          <span className="sr-only">CZ Target</span>
                        </div>
                      )}

                      {/* Single Qubit Gates: H, X, Y, Z, S, T */}
                      {op && isTarget && (op.gate === 'H' || op.gate === 'X' || op.gate === 'Y' || op.gate === 'Z' || op.gate === 'S' || op.gate === 'T') && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="animate-gate-dock cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[1.03] z-10 relative"
                          aria-label={`${GATE_DEFINITIONS[op.gate]?.name || op.gate} (${op.gate}) gate on q[${qubitIndex}]`}
                          title={`${GATE_DEFINITIONS[op.gate]?.name || op.gate} gate on q[${qubitIndex}]`}
                        >
                          <GateTile gate={op.gate} size="md" className="shadow-md" />
                          <span className="sr-only">{GATE_DEFINITIONS[op.gate]?.name}</span>
                          <span className="sr-only">{op.gate}</span>
                        </div>
                      )}

                      {/* Measurement Gate */}
                      {op && isTarget && op.gate === 'MEASURE' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="animate-gate-dock cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[1.03] relative z-10"
                          aria-label={`Measure gate on q[${qubitIndex}] into classical bit c[${op.classicalTargets[0] ?? qubitIndex}]`}
                          title={`Measure on q[${qubitIndex}] -> c[${op.classicalTargets[0] ?? qubitIndex}]`}
                        >
                          <GateTile gate="MEASURE" size="md" className="shadow-md" />
                          <span className="sr-only">MEASURE</span>
                          <span className="sr-only">Measure</span>
                          {/* Dynamic double-line downward arrow */}
                          <div 
                            className="absolute top-[42px] left-1/2 flex flex-col items-center -translate-x-1/2 pointer-events-none z-0 opacity-80"
                            style={{ height: `calc(${(qubitCount - qubitIndex) * 80 - 40}px)` }}
                          >
                            <div className="w-[4px] h-full border-x border-slate-400" />
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-500 -mt-[1px]" />
                          </div>
                        </div>
                      )}

                      {/* Remove Button on hover for placed gates */}
                      {op && !readOnly && isTarget && (
                        <button
                          type="button"
                          data-testid={`remove-gate-${op.opId}`}
                          onClick={(e) => {
                             e.stopPropagation();
                             removeGate(op.opId);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger text-white hover:bg-danger-hover hover:scale-110 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 focus-visible:opacity-100 transition-all z-20 cursor-pointer shadow-sm"
                          title="Remove gate"
                          aria-label={`Remove ${op.gate} gate`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}

                      {/* Empty slot placeholder with Ghost Drop Zone logic */}
                      {!op && !readOnly && (
                        <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {selectedGateToPlace ? (
                            <div className="opacity-40 scale-90 pointer-events-none">
                              {selectedGateToPlace === 'CNOT' ? (
                                <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center border border-violet-700">
                                  <CnotTargetCrosshairIcon className="w-6 h-6 text-white" strokeWidth={2.4} />
                                </div>
                              ) : selectedGateToPlace === 'CCX' ? (
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center border border-blue-700">
                                  <CnotTargetCrosshairIcon className="w-6 h-6 text-white" strokeWidth={2.4} />
                                </div>
                              ) : selectedGateToPlace === 'CZ' ? (
                                <div className="w-6 h-6 rounded-full bg-sky-600 border-2 border-white flex items-center justify-center text-white">
                                  <span className="w-2 h-2 rounded-full bg-white" />
                                </div>
                              ) : (
                                <GateTile gate={selectedGateToPlace} size="md" />
                              )}
                            </div>
                          ) : (
                            <Plus className="w-5 h-5 text-accent/50" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Classical Register Wire c[n] */}
        <div
          className="flex items-center gap-4 relative pt-2 border-t border-border-subtle"
          data-testid="classical-wire"
        >
          <div className="w-16 shrink-0 flex items-center gap-1.5 z-10">
            <span className="h-6 px-2 flex items-center justify-center bg-surface-sunken border border-border-subtle rounded-sm font-mono text-[11px] font-bold text-text-primary">
              c[{classicalCount}]
            </span>
          </div>
          <div className="absolute left-16 right-0 top-1/2 -translate-y-1/2 h-[4px] border-y border-text-muted opacity-50 z-0" />
          <div className="w-full text-right pr-4 text-[10px] text-ink-faint">
            Classical register ({classicalCount} bits)
          </div>
        </div>
      </div>
    </div>
  );
}
