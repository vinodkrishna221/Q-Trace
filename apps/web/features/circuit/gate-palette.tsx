'use client';

import * as React from 'react';
import { GateName } from '@/lib/contracts';
import { GATE_DEFINITIONS, SUPPORTED_GATES_LIST } from './circuit-types';
import { useCircuitStore } from '@/lib/circuit-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RotateCcw, Trash2, MousePointerClick, HelpCircle, Layers } from 'lucide-react';

interface GatePaletteProps {
  onDragStart?: (gate: GateName) => void;
}

const GATE_HOVER_CLASSES: Record<GateName, string> = {
  H: 'group-hover:border-gate-h group-hover:text-gate-h group-hover:bg-gate-h/10',
  X: 'group-hover:border-gate-pauli-x group-hover:text-gate-pauli-x group-hover:bg-gate-pauli-x/10',
  Y: 'group-hover:border-gate-pauli-y group-hover:text-gate-pauli-y group-hover:bg-gate-pauli-y/10',
  Z: 'group-hover:border-gate-pauli-z group-hover:text-gate-pauli-z group-hover:bg-gate-pauli-z/10',
  CNOT: 'group-hover:border-gate-cnot group-hover:text-gate-cnot group-hover:bg-gate-cnot/10',
  MEASURE: 'group-hover:border-border-strong group-hover:text-ink-primary group-hover:bg-surface-raised',
};

export function GatePalette({ onDragStart }: GatePaletteProps) {
  const {
    selectedGateToPlace,
    selectGateToPlace,
    resetToBellSeed,
    clearCircuit,
    circuit,
  } = useCircuitStore();

  // Global Escape key listener to disarm palette gate
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedGateToPlace) {
        selectGateToPlace(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGateToPlace, selectGateToPlace]);

  return (
    <Card className="border-border-subtle bg-surface shadow-sm" data-testid="gate-palette-card">
      <CardHeader className="py-3 px-4 bg-surface-raised/40 border-b border-border-subtle">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <CardTitle className="text-xs font-mono tracking-wider text-ink font-semibold">
              GATE PALETTE
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={resetToBellSeed}
              data-testid="reset-bell-circuit-btn"
              className="h-7 px-2 text-[11px] font-mono border-border-subtle text-ink-dim hover:text-ink hover:border-accent/40 focus-visible:ring-2 focus-visible:ring-accent"
              title="Reset to seeded Bell State circuit (H + CNOT) or load reference template"
            >
              <RotateCcw className="w-3 h-3 mr-1 text-accent" />
              Reset Bell Seed / Load Template
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearCircuit}
              data-testid="clear-circuit-btn"
              className="h-7 px-2 text-[11px] font-mono border-border-subtle text-ink-dim hover:text-caution hover:border-caution/40 focus-visible:ring-2 focus-visible:ring-accent"
              title="Clear all gates from circuit wires"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear Grid
            </Button>
          </div>
        </div>
        <CardDescription className="text-[11px] text-ink-dim mt-1">
          Click a gate to arm click-to-place, drag onto wires, or select a wire cell and type the keyboard shortcut.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3">
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2"
          role="toolbar"
          aria-label="Quantum Gate Palette"
        >
          {SUPPORTED_GATES_LIST.map((gateKey) => {
            const def = GATE_DEFINITIONS[gateKey];
            const isSelected = selectedGateToPlace === gateKey;

            return (
              <button
                key={gateKey}
                type="button"
                data-testid={`palette-gate-${gateKey.toLowerCase()}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', gateKey);
                  onDragStart?.(gateKey);
                }}
                onClick={() => {
                  selectGateToPlace(isSelected ? null : gateKey);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-150 relative cursor-pointer select-none group outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas ${
                  isSelected
                    ? 'ring-2 ring-accent border-accent bg-accent/20 shadow-glow'
                    : 'border-border-subtle bg-canvas hover:border-border-medium hover:bg-surface-raised/60'
                }`}
                aria-pressed={isSelected}
                aria-label={`${def.name} gate (shortcut: ${def.shortcutKey.toUpperCase()})`}
              >
                {/* Gate Badge */}
                <div
                  className={`w-[44px] h-[44px] rounded-md border flex items-center justify-center font-mono font-bold text-[14px] mb-1.5 transition-all duration-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.25)] group-hover:-translate-y-[1px] ${
                    isSelected
                      ? 'border-border-strong bg-surface text-text-primary'
                      : 'border-border-subtle bg-surface text-text-primary group-hover:border-border-strong'
                  }`}
                >
                  {def.gate === 'CNOT' ? '⊕' : def.gate === 'MEASURE' ? 'M' : def.symbol}
                </div>

                {/* Gate Name & Shortcut */}
                <span className="text-[8px] font-sans uppercase tracking-wider text-text-secondary leading-tight">
                  {def.name}
                </span>
                <span className="text-[10px] font-mono text-ink-faint mt-0.5 flex items-center gap-1">
                  key: <kbd className="px-1 py-0.5 rounded-sm bg-surface-sunken border border-border-subtle text-text-primary font-bold">{def.shortcutKey}</kbd>
                </span>

                {isSelected && (
                  <span
                    data-testid="armed-badge"
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-white dark:text-canvas flex items-center justify-center text-[9px] font-bold shadow-xs"
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedGateToPlace && (
          <div
            data-testid="click-to-place-banner"
            className="mt-3 p-2 rounded-full bg-accent/10 border border-accent/30 text-xs font-mono text-accent flex items-center justify-between px-3"
          >
            <span className="flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 animate-pulse" />
              <span>Armed: Click any cell on the grid to place <strong>{selectedGateToPlace}</strong>.</span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => selectGateToPlace(null)}
              className="h-5 px-2 text-[10px] text-accent hover:bg-accent/20"
            >
              Cancel (Esc)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
