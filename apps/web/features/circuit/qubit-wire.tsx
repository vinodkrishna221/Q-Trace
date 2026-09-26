'use client';

import * as React from 'react';
import { useCircuitStore } from '@/lib/circuit-store';
import { GateName, Operation } from '@/lib/contracts';
import { GATE_DEFINITIONS } from './circuit-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Trash2 } from 'lucide-react';

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

    // Find CNOT operation controlling this qubit at this column
    const controlOp = circuit.operations.find(
      (op) => op.column === column && op.controls.includes(qubit)
    );
    if (controlOp) {
      return { op: controlOp, isControl: true, isTarget: false };
    }

    return { op: undefined, isControl: false, isTarget: false };
  };

  // Find all CNOT operations to render vertical connecting lines
  const cnotOps = circuit.operations.filter((op) => op.gate === 'CNOT');

  // Handle cell click
  const handleCellClick = (qubit: number, column: number) => {
    if (readOnly) return;

    if (selectedGateToPlace) {
      // Place armed gate
      addGate(selectedGateToPlace, qubit, column);
      // Optional: keep armed or disarm
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
    } else if (key === 'c') {
      e.preventDefault();
      addGate('CNOT', qubit, column);
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
        {/* Render CNOT Vertical Connection Lines */}
        {cnotOps.map((op) => {
          const ctrl = op.controls[0] ?? 0;
          const tgt = op.targets[0] ?? 1;
          const minQ = Math.min(ctrl, tgt);
          const maxQ = Math.max(ctrl, tgt);
          const colIndex = op.column;

          return (
            <div
              key={`cnot-line-${op.opId}`}
              data-testid={`cnot-vertical-link-${op.opId}`}
              className="absolute w-[2px] bg-gate-cnot pointer-events-none z-0 border-l border-r border-gate-cnot/50 shadow-xs"
              style={{
                top: `${minQ * 60 + 20}px`,
                height: `${(maxQ - minQ) * 60}px`,
                left: `calc(80px + (100% - 80px) * ${(colIndex + 0.5) / totalColumns})`,
                transform: 'translateX(-50%)',
              }}
              aria-hidden="true"
            />
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
              <div className="w-16 shrink-0 flex items-center gap-1.5 text-xs text-ink font-bold z-10">
                <span className="px-2 py-0.5 rounded-full bg-surface-raised border border-border-medium text-accent">
                  q[{qubitIndex}]
                </span>
                <span className="text-[10px] text-ink-faint font-normal">|0⟩</span>
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
                      ? `Qubit ${qubitIndex} column ${col}: CNOT Control targeting qubit ${op.targets[0]}`
                      : isTarget && op.gate === 'CNOT'
                        ? `Qubit ${qubitIndex} column ${col}: CNOT Target controlled by qubit ${op.controls[0]}`
                        : `Qubit ${qubitIndex} column ${col}: ${op.gate} (${GATE_DEFINITIONS[op.gate]?.name || op.gate}) gate`
                    : `Qubit ${qubitIndex} column ${col}: empty cell (press H, X, Y, Z, C, M to place gate)`;

                  return (
                    <div
                      key={`cell-${qubitIndex}-${col}`}
                      data-testid={`wire-cell-${qubitIndex}-${col}`}
                      tabIndex={0}
                      role="button"
                      aria-label={cellAriaLabel}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleCellDrop(e, qubitIndex, col)}
                      onClick={() => handleCellClick(qubitIndex, col)}
                      onKeyDown={(e) => handleCellKeyDown(e, qubitIndex, col)}
                      className={`h-14 rounded-xl border flex items-center justify-center relative transition-all duration-150 group outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas ${
                        isSelected
                          ? 'border-accent ring-2 ring-accent/60 bg-accent/10'
                          : op
                            ? 'border-transparent bg-canvas/80'
                            : 'border-dashed border-border-subtle/60 hover:border-accent/60 hover:bg-surface-raised/40 focus:border-accent focus:ring-1 focus:ring-accent'
                      }`}
                    >
                      {/* If cell has a gate operation */}
                      {op && isControl && (
                        <div
                          data-testid="gate-cnot-control"
                          className="w-6 h-6 rounded-full bg-gate-cnot border-2 border-gate-cnot ring-2 ring-gate-cnot/40 flex flex-col items-center justify-center text-[10px] text-white font-bold shadow-xs cursor-pointer hover:scale-110 transition-transform"
                          title={`CNOT Control on q[${qubitIndex}] -> q[${op.targets[0]}]`}
                          aria-label={`CNOT Control (targets q[${op.targets[0]}])`}
                        >
                          <span>●</span>
                          <span className="sr-only">CNOT Control</span>
                        </div>
                      )}

                      {op && isTarget && op.gate === 'CNOT' && (
                        <div
                          data-testid={op.opId ? `gate-${op.opId}` : 'gate-cnot-target'}
                          className="w-11 h-11 rounded-full bg-gate-cnot/20 border-2 border-gate-cnot text-gate-cnot flex flex-col items-center justify-center font-bold text-sm shadow-xs cursor-pointer hover:scale-105 transition-transform"
                          title={`CNOT Target on q[${qubitIndex}] (control q[${op.controls[0]}])`}
                          aria-label={`CNOT Target (controlled by q[${op.controls[0]}])`}
                        >
                          <span className="text-base leading-none">⊕</span>
                          <span className="text-[8px] font-mono text-gate-cnot tracking-tighter">CX</span>
                        </div>
                      )}

                      {op && isTarget && op.gate === 'H' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="w-12 h-9 rounded-full bg-gate-h/15 border-2 border-gate-h text-gate-h flex flex-col items-center justify-center font-bold text-sm shadow-xs cursor-pointer hover:scale-105 transition-transform"
                          aria-label={`Hadamard (H) gate on q[${qubitIndex}]`}
                        >
                          <span className="leading-tight">H</span>
                          <span className="text-[8px] text-gate-h font-semibold">Hadamard</span>
                        </div>
                      )}

                      {op && isTarget && op.gate === 'X' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="w-12 h-9 rounded-full bg-gate-pauli-x/15 border-2 border-gate-pauli-x text-gate-pauli-x flex flex-col items-center justify-center font-bold text-sm shadow-xs cursor-pointer hover:scale-105 transition-transform"
                          aria-label={`Pauli-X (X) gate on q[${qubitIndex}]`}
                        >
                          <span className="leading-tight">X</span>
                          <span className="text-[8px] text-gate-pauli-x font-semibold">Pauli-X</span>
                        </div>
                      )}

                      {op && isTarget && op.gate === 'Y' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="w-12 h-9 rounded-full bg-gate-pauli-y/15 border-2 border-gate-pauli-y text-gate-pauli-y flex flex-col items-center justify-center font-bold text-sm shadow-xs cursor-pointer hover:scale-105 transition-transform"
                          aria-label={`Pauli-Y (Y) gate on q[${qubitIndex}]`}
                        >
                          <span className="leading-tight">Y</span>
                          <span className="text-[8px] text-gate-pauli-y font-semibold">Pauli-Y</span>
                        </div>
                      )}

                      {op && isTarget && op.gate === 'Z' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="w-12 h-9 rounded-full bg-gate-pauli-z/15 border-2 border-gate-pauli-z text-gate-pauli-z flex flex-col items-center justify-center font-bold text-sm shadow-xs cursor-pointer hover:scale-105 transition-transform"
                          aria-label={`Pauli-Z (Z) gate on q[${qubitIndex}]`}
                        >
                          <span className="leading-tight">Z</span>
                          <span className="text-[8px] text-gate-pauli-z font-semibold">Pauli-Z</span>
                        </div>
                      )}

                      {op && isTarget && op.gate === 'MEASURE' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="w-12 h-9 rounded-full bg-surface-raised border-2 border-border-strong text-ink flex flex-col items-center justify-center text-xs font-bold shadow-xs cursor-pointer hover:scale-105 transition-transform"
                          aria-label={`Measure gate on q[${qubitIndex}] into classical bit c[${op.classicalTargets[0] ?? qubitIndex}]`}
                        >
                          <span className="text-caution font-bold">MEASURE</span>
                          <span className="text-[9px] text-ink-dim font-normal">
                            → c[{op.classicalTargets[0] ?? qubitIndex}]
                          </span>
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
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-surface-raised border border-border-medium text-ink-dim hover:text-caution hover:bg-canvas flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 focus-visible:opacity-100 transition-opacity z-20 cursor-pointer"
                          title="Remove gate"
                          aria-label={`Remove ${op.gate} gate`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}

                      {/* Empty slot placeholder */}
                      {!op && !readOnly && (
                        <div className="opacity-0 group-hover:opacity-60 text-ink-faint flex items-center justify-center">
                          <Plus className="w-3.5 h-3.5" />
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
          <div className="w-16 shrink-0 flex items-center gap-1.5 text-xs text-ink-dim font-bold">
            <span className="px-2 py-0.5 rounded-full bg-surface-raised border border-border-subtle text-ink">
              c[{classicalCount}]
            </span>
            <span className="text-[10px] text-ink-faint font-normal">/{classicalCount}</span>
          </div>
          <div className="absolute left-16 right-0 top-1/2 -translate-y-1/2 h-[3px] border-b-2 border-border-medium border-double z-0" />
          <div className="w-full text-right pr-4 text-[10px] text-ink-faint">
            Classical register ({classicalCount} bits)
          </div>
        </div>
      </div>
    </div>
  );
}
