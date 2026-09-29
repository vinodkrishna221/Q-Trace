'use client';

import * as React from 'react';
import { GateName } from '@/lib/contracts';
import { GATE_DEFINITIONS, GATE_FAMILIES } from './circuit-types';
import { useCircuitStore } from '@/lib/circuit-store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MousePointerClick, Layers } from 'lucide-react';
import { GateTile } from './gate-glyph';

interface GatePaletteProps {
  onDragStart?: (gate: GateName) => void;
}

export function GatePalette({ onDragStart }: GatePaletteProps) {
  const {
    selectedGateToPlace,
    selectGateToPlace,
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
      <CardHeader className="py-2.5 px-4 bg-surface-raised/40 border-b border-border-subtle">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <CardTitle className="text-xs font-mono tracking-wider text-text-primary font-semibold">
              GATE PALETTE
            </CardTitle>
          </div>
        </div>
        <CardDescription className="text-[11px] text-text-secondary mt-0.5">
          Organized by quantum gate family. Drag onto wires or click to arm click-to-place on the circuit grid.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        {/* Family Groupings */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          role="toolbar"
          aria-label="Quantum Gate Palette"
        >
          {GATE_FAMILIES.map((family) => (
            <div
              key={family.id}
              data-testid={`gate-family-${family.id}`}
              className="flex flex-col gap-1.5 p-2 rounded-lg bg-surface-raised/30 border border-border-subtle/50"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-tertiary">
                  {family.name}
                </span>
                <span className="text-[9px] font-mono text-text-muted">
                  {family.gates.length} {family.gates.length === 1 ? 'gate' : 'gates'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {family.gates.map((gateKey) => {
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
                      className={`group flex items-center justify-center p-1.5 rounded-lg border transition-all duration-150 relative cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isSelected
                          ? 'ring-2 ring-accent border-accent bg-accent/15 shadow-xs scale-105 z-10'
                          : 'border-border-subtle bg-surface hover:border-border-medium hover:bg-surface-raised/80 hover:shadow-xs'
                      }`}
                      aria-pressed={isSelected}
                      title={`${def.name} gate (Shortcut: ${def.shortcutKey.toUpperCase()}) — ${def.description}`}
                      aria-label={`${def.name} gate (shortcut: ${def.shortcutKey.toUpperCase()})`}
                    >
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
            </div>
          ))}
        </div>

        {selectedGateToPlace && (
          <div
            data-testid="click-to-place-banner"
            className="p-2 rounded-lg bg-accent/10 border border-accent/30 text-xs font-mono text-accent flex items-center justify-between px-3 animate-fadeIn"
          >
            <span className="flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 animate-pulse" />
              <span>
                Armed: Click any cell on the grid to place <strong>{selectedGateToPlace}</strong> ({GATE_DEFINITIONS[selectedGateToPlace]?.name}).
              </span>
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
