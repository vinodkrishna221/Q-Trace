'use client';

import * as React from 'react';
import { GateName } from '@/lib/contracts';
import { GATE_DEFINITIONS, SUPPORTED_GATES_LIST } from './circuit-types';
import { useCircuitStore } from '@/lib/circuit-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RotateCcw, Trash2, MousePointerClick, HelpCircle, Layers } from 'lucide-react';
import { GateTile } from './gate-glyph';

interface GatePaletteProps {
  onDragStart?: (gate: GateName) => void;
}

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
    <Card className="border-border-subtle bg-surface shadow-xs" data-testid="gate-palette-card">
      <CardHeader className="py-3 px-4 bg-surface-raised/40 border-b border-border-subtle">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <CardTitle className="text-xs font-mono tracking-wider text-text-primary font-semibold">
              GATE PALETTE
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Redundant buttons removed per user request */}
          </div>
        </div>
        <CardDescription className="text-[11px] text-text-secondary mt-1">
          Click a gate to arm click-to-place, drag onto wires, or select a wire cell and type the keyboard shortcut.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3">
        <div
          className="flex flex-wrap justify-center sm:justify-start gap-2"
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
                className={`group flex items-center justify-center p-2 rounded-lg border transition-all duration-150 relative cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? 'ring-2 ring-accent border-accent bg-accent/10 shadow-xs'
                    : 'border-border-subtle bg-surface hover:border-border-medium hover:bg-surface-raised/70 hover:shadow-sm'
                }`}
                aria-pressed={isSelected}
                title={`${def.name} gate (Shortcut: ${def.shortcutKey.toUpperCase()})`}
                aria-label={`${def.name} gate (shortcut: ${def.shortcutKey.toUpperCase()})`}
              >
                {/* Compact Gate Badge Tile */}
                <GateTile
                  gate={gateKey}
                  size="md"
                  className="group-hover:scale-105 transition-transform"
                />

                {isSelected && (
                  <span
                    data-testid="armed-badge"
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center text-[9px] font-bold shadow-xs ring-2 ring-surface"
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
