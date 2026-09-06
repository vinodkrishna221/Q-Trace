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
    if (key === 'h') {
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
      className="relative rounded-lg border border-line bg-abyss p-4 md:p-6 font-mono overflow-x-auto select-none"
      data-testid="qubit-wires-grid"
    >
      {/* Column Headers */}
      <div
        className="grid gap-2 text-[10px] text-ink-faint pb-2 border-b border-line mb-4"
        style={{
          gridTemplateColumns: `80px repeat(${totalColumns}, minmax(80px, 1fr))`,
        }}
      >
        <div className="text-center font-semibold text-ink-dim">WIRE</div>
        {columnsList.map((col) => (
          <div
            key={`col-header-${col}`}
            className="text-center font-mono py-0.5 px-1 bg-raised/30 rounded border border-line/40"
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

          // Compute column percentage / offset
          const colWidthPercent = 100 / (totalColumns + 1);
          // 80px label offset + column offset
          return (
            <div
              key={`cnot-line-${op.opId}`}
              data-testid={`cnot-vertical-link-${op.opId}`}
              className="absolute w-[2px] bg-violet pointer-events-none z-0 border-l border-r border-violet/50 shadow-glow"
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
                <span className="px-1.5 py-0.5 rounded bg-raised border border-line-bright text-accent">
                  q[{qubitIndex}]
                </span>
                <span className="text-[10px] text-ink-faint font-normal">|0⟩</span>
              </div>

              {/* Wire horizontal line */}
              <div className="absolute left-16 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-line-bright z-0" />

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

                  return (
                    <div
                      key={`cell-${qubitIndex}-${col}`}
                      data-testid={`wire-cell-${qubitIndex}-${col}`}
                      tabIndex={0}
                      role="button"
                      aria-label={`Qubit ${qubitIndex} column ${col} ${
                        op ? `${op.gate} gate` : 'empty cell'
                      }`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleCellDrop(e, qubitIndex, col)}
                      onClick={() => handleCellClick(qubitIndex, col)}
                      onKeyDown={(e) => handleCellKeyDown(e, qubitIndex, col)}
                      className={`h-14 rounded-md border flex items-center justify-center relative transition-all duration-150 group outline-none ${
                        isSelected
                          ? 'border-accent ring-2 ring-accent/60 bg-accent/10'
                          : op
                            ? 'border-transparent bg-abyss/80'
                            : 'border-dashed border-line/50 hover:border-accent/60 hover:bg-raised/40 focus:border-accent focus:ring-1 focus:ring-accent'
                      }`}
                    >
                      {/* If cell has a gate operation */}
                      {op && isControl && (
                        <div
                          data-testid="gate-cnot-control"
                          className="w-5 h-5 rounded-full bg-violet border-2 border-violet ring-2 ring-violet/40 flex items-center justify-center text-[10px] text-abyss font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform"
                          title={`CNOT Control on q[${qubitIndex}] -> q[${op.targets[0]}]`}
                        >
                          ●
                        </div>
                      )}

                      {op && isTarget && op.gate === 'CNOT' && (
                        <div
                          data-testid={op.opId ? `gate-${op.opId}` : 'gate-cnot-target'}
                          className="w-10 h-10 rounded-full bg-violet/20 border-2 border-violet text-violet flex items-center justify-center font-bold text-lg shadow-lg cursor-pointer hover:scale-105 transition-transform"
                          title={`CNOT Target on q[${qubitIndex}] (control q[${op.controls[0]}])`}
                        >
                          ⊕
                        </div>
                      )}

                      {op && isTarget && op.gate === 'H' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="w-12 h-12 rounded-md bg-accent/15 border-2 border-accent text-accent flex flex-col items-center justify-center font-bold text-sm shadow-glow cursor-pointer hover:scale-105 transition-transform"
                        >
                          <span>H</span>
                          <span className="text-[8px] text-accent/80 font-normal">Hadamard</span>
                        </div>
                      )}

                      {op && isTarget && op.gate === 'X' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="w-12 h-12 rounded-md bg-emerald-500/15 border-2 border-emerald-500 text-emerald-400 flex flex-col items-center justify-center font-bold text-sm shadow cursor-pointer hover:scale-105 transition-transform"
                        >
                          <span>X</span>
                          <span className="text-[8px] text-emerald-400/80 font-normal">Pauli-X</span>
                        </div>
                      )}

                      {op && isTarget && op.gate === 'Y' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="w-12 h-12 rounded-md bg-amber-500/15 border-2 border-amber-500 text-amber-400 flex flex-col items-center justify-center font-bold text-sm shadow cursor-pointer hover:scale-105 transition-transform"
                        >
                          <span>Y</span>
                          <span className="text-[8px] text-amber-400/80 font-normal">Pauli-Y</span>
                        </div>
                      )}

                      {op && isTarget && op.gate === 'Z' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="w-12 h-12 rounded-md bg-cyan-500/15 border-2 border-cyan-500 text-cyan-400 flex flex-col items-center justify-center font-bold text-sm shadow cursor-pointer hover:scale-105 transition-transform"
                        >
                          <span>Z</span>
                          <span className="text-[8px] text-cyan-400/80 font-normal">Pauli-Z</span>
                        </div>
                      )}

                      {op && isTarget && op.gate === 'MEASURE' && (
                        <div
                          data-testid={`gate-${op.opId}`}
                          className="w-12 h-12 rounded-md bg-raised border-2 border-line-bright text-ink flex flex-col items-center justify-center text-xs font-bold shadow cursor-pointer hover:scale-105 transition-transform"
                        >
                          <span className="text-caution">MEASURE</span>
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
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-raised border border-line-bright text-ink-dim hover:text-caution hover:bg-abyss flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-20"
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
          className="flex items-center gap-4 relative pt-2 border-t border-line"
          data-testid="classical-wire"
        >
          <div className="w-16 shrink-0 flex items-center gap-1.5 text-xs text-ink-dim font-bold">
            <span className="px-1.5 py-0.5 rounded bg-raised border border-line text-ink">
              c[{classicalCount}]
            </span>
            <span className="text-[10px] text-ink-faint font-normal">/{classicalCount}</span>
          </div>
          <div className="absolute left-16 right-0 top-1/2 -translate-y-1/2 h-[3px] border-b-2 border-line-bright border-double z-0" />
          <div className="w-full text-right pr-4 text-[10px] text-ink-faint">
            Classical register ({classicalCount} bits)
          </div>
        </div>
      </div>
    </div>
  );
}
