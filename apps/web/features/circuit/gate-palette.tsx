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
  H: 'group-hover:border-accent group-hover:text-accent group-hover:bg-accent/10',
  X: 'group-hover:border-emerald-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-500/10',
  Y: 'group-hover:border-amber-500 group-hover:text-amber-700 dark:group-hover:text-amber-400 group-hover:bg-amber-500/10',
  Z: 'group-hover:border-cyan-500 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 group-hover:bg-cyan-500/10',
  CNOT: 'group-hover:border-violet group-hover:text-violet group-hover:bg-violet/10',
  MEASURE: 'group-hover:border-line-bright group-hover:text-caution group-hover:bg-raised',
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
    <Card className="border-line bg-panel shadow-sm" data-testid="gate-palette-card">
      <CardHeader className="py-3 px-4 bg-raised/40 border-b border-line">
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
              className="h-7 px-2 text-[11px] font-mono border-line text-ink-dim hover:text-ink hover:border-accent/40 focus-visible:ring-2 focus-visible:ring-accent"
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
              className="h-7 px-2 text-[11px] font-mono border-line text-ink-dim hover:text-caution hover:border-caution/40 focus-visible:ring-2 focus-visible:ring-accent"
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
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all duration-150 relative cursor-pointer select-none group outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-abyss ${
                  isSelected
                    ? 'ring-2 ring-accent border-accent bg-accent/20 shadow-glow'
                    : 'border-line bg-abyss hover:border-line-bright hover:bg-raised/60'
                }`}
                aria-pressed={isSelected}
                aria-label={`${def.name} gate (shortcut: ${def.shortcutKey.toUpperCase()})`}
              >
                {/* Gate Badge */}
                <div
                  className={`w-10 h-10 rounded-md border-2 flex items-center justify-center font-mono font-bold text-sm mb-1.5 transition-all duration-150 group-hover:scale-105 ${
                    isSelected
                      ? def.colorClass
                      : `border-line-bright text-ink bg-raised/40 ${GATE_HOVER_CLASSES[gateKey]}`
                  }`}
                >
                  {def.gate === 'CNOT' ? '⊕' : def.gate === 'MEASURE' ? 'M' : def.symbol}
                </div>

                {/* Gate Name & Shortcut */}
                <span className="text-xs font-semibold text-ink leading-tight">
                  {def.name}
                </span>
                <span className="text-[10px] font-mono text-ink-faint mt-0.5 flex items-center gap-1">
                  key: <kbd className="px-1 py-0.2 rounded bg-raised border border-line text-ink-dim font-bold">{def.shortcutKey}</kbd>
                </span>

                {isSelected && (
                  <span
                    data-testid="armed-badge"
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center text-[9px] font-bold shadow"
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
            className="mt-3 p-2 rounded bg-accent/10 border border-accent/30 text-xs font-mono text-accent flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 animate-pulse" />
              <span>Armed: Click any cell on the grid to place <strong>{selectedGateToPlace}</strong>.</span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => selectGateToPlace(null)}
              className="h-5 px-1.5 text-[10px] text-accent hover:bg-accent/20"
            >
              Cancel (Esc)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
