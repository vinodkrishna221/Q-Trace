'use client';

import * as React from 'react';
import { CircuitModel } from '@/lib/contracts';
import { useCircuitStore } from '@/lib/circuit-store';
import { GatePalette } from './gate-palette';
import { QubitWiresGrid } from './qubit-wire';
import { QiskitCodeEditor } from './qiskit-code-editor';
import { CircuitSharePanel } from './circuit-share-panel';
import { apiClient } from '@/lib/api-client';
import { LintWarning, lintCircuitLocally } from './circuit-linter';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Play, CheckCircle2, RefreshCw, Zap, Share2, Plus, Minus, AlertTriangle, ChevronDown, ChevronUp, Code2, Copy, Check } from 'lucide-react';

interface InteractiveCircuitWorkspaceProps {
  initialCircuit?: CircuitModel;
  isSimulating?: boolean;
  hasExecuted?: boolean;
  onRunSimulation?: (circuit: CircuitModel) => void;
  readOnly?: boolean;
}

interface CodeDrawerProps {
  isReadOnly: boolean;
  lintWarnings: LintWarning[];
}

function CodeDrawer({ isReadOnly, lintWarnings }: CodeDrawerProps) {
  const [open, setOpen] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const { code, isCodeModified } = useCircuitStore();
  const lineCount = code.split('\n').length;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900 shadow-md" data-testid="code-drawer" data-dark="true">
      {/* Drawer trigger bar: unified high-contrast header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); } }}
        className="w-full flex flex-wrap items-center justify-between px-4 py-3 cursor-pointer group bg-slate-900 hover:bg-slate-850 transition-colors select-none"
        aria-expanded={open}
        aria-label="Toggle Qiskit code panel"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <Code2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span className="text-xs font-mono font-semibold text-slate-100 tracking-wide">
            Synchronized Qiskit (Python)
          </span>
          <span className="text-[11px] font-mono font-semibold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shadow-2xs">
            {lineCount} lines
          </span>
          {isReadOnly ? (
            <Badge variant="outline" className="text-[10px] font-mono py-0.5 px-2 text-slate-200 border-slate-700 bg-slate-800 font-semibold">
              Read-Only
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className={`text-[10px] font-mono py-0.5 px-2 font-semibold ${
                isCodeModified
                  ? 'text-amber-300 border-amber-500/50 bg-amber-950/60'
                  : 'text-emerald-300 border-emerald-500/50 bg-emerald-950/60'
              }`}
            >
              {isCodeModified ? 'Unsaved Edits' : 'Synced ✓'}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] font-mono py-0.5 px-2 text-sky-300 border-sky-500/40 bg-sky-950/50 font-semibold">
            Qiskit 2.3 · Aer 0.17
          </Badge>
          {lintWarnings.length > 0 && (
            <Badge variant="outline" className="text-[10px] font-mono py-0.5 px-2 text-amber-300 border-amber-500/50 bg-amber-950/60 font-semibold">
              ⚠ {lintWarnings.length} warning{lintWarnings.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={handleCopy}
            data-testid="copy-drawer-btn"
            className="h-7 px-2.5 text-[11px] font-mono border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1 text-slate-300" />
                <span>Copy</span>
              </>
            )}
          </Button>

          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-200 group-hover:text-white transition-colors pl-2 border-l border-slate-700/80">
            <span>{open ? 'Collapse ▲' : 'View Code ▼'}</span>
          </div>
        </div>
      </div>

      {/* Code Editor body: always kept in DOM with unified header and capped height */}
      <div className={open ? 'border-t border-slate-800 block' : 'hidden'}>
        <QiskitCodeEditor isReadOnly={isReadOnly} lintWarnings={lintWarnings} hideHeader={true} />
      </div>
    </div>
  );
}

export function InteractiveCircuitWorkspace({
  initialCircuit,
  isSimulating = false,
  hasExecuted = false,
  onRunSimulation,
  readOnly = false,
}: InteractiveCircuitWorkspaceProps) {
  const { circuit, setCircuit, setQubitCount } = useCircuitStore();
  const [showSharePanel, setShowSharePanel] = React.useState(false);
  const [lintWarnings, setLintWarnings] = React.useState<LintWarning[]>([]);
  const isLocked = Boolean(readOnly || isSimulating);

  // Initialize store with initialCircuit if provided on mount
  React.useEffect(() => {
    if (initialCircuit) {
      setCircuit(initialCircuit);
    }
  }, [initialCircuit, setCircuit]);

  // Debounced 300ms call to linter on every circuit change
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.lintCircuit(circuit);
        setLintWarnings(res.data.lintWarnings || []);
      } catch {
        const fallbackWarnings = lintCircuitLocally(circuit);
        setLintWarnings(fallbackWarnings);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [circuit]);

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
              <div className="flex items-center gap-1.5 bg-surface-raised/70 px-2 py-0.5 rounded border border-border-subtle/60 text-[11px] font-mono text-text-tertiary">
                <span data-testid="qubit-count-display">{circuit.qubitCount} Qubits</span>
                {!isLocked && (
                  <span className="inline-flex items-center gap-0.5 ml-1">
                    <button
                      type="button"
                      data-testid="decrease-qubits-btn"
                      disabled={circuit.qubitCount <= 1}
                      onClick={() => setQubitCount(circuit.qubitCount - 1)}
                      className="w-4 h-4 rounded flex items-center justify-center hover:bg-surface-sunken disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Decrease qubit count"
                      aria-label="Decrease qubit count"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      data-testid="increase-qubits-btn"
                      disabled={circuit.qubitCount >= 5}
                      onClick={() => setQubitCount(circuit.qubitCount + 1)}
                      className="w-4 h-4 rounded flex items-center justify-center hover:bg-surface-sunken disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Increase qubit count"
                      aria-label="Increase qubit count"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                <span className="text-text-muted">·</span>
                <span>{circuit.classicalBitCount} Bits</span>
                <span className="text-text-muted">·</span>
                <span>{circuit.operations.length} Gates</span>
              </div>

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
            Drag gates onto qubit wires or edit code directly. Supports single-qubit, phase rotations, and multi-wire controlled gates (CNOT, CZ, CCX).
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 md:p-6 space-y-5">
          {/* Gate Palette */}
          {!isLocked && <GatePalette />}

          {/* Real-time Invariant Lint Warnings */}
          {lintWarnings.length > 0 && (
            <div
              data-testid="circuit-lint-warnings-banner"
              className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-in fade-in duration-200"
            >
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">Quantum Invariant Warnings ({lintWarnings.length}):</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {lintWarnings.map((w, idx) => (
                  <div
                    key={`ws-pill-${idx}`}
                    data-testid="lint-warning-pill"
                    data-rule={w.rule}
                    data-column={w.column}
                    data-qubit={w.qubit}
                    className="group relative cursor-pointer"
                  >
                    <Badge
                      variant="outline"
                      className="bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/50 hover:bg-amber-500/30 text-[11px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors shadow-xs"
                      title={w.message}
                    >
                      <span className="text-amber-500">⚠</span>
                      <span className="font-bold">{w.rule}</span>
                      {w.qubit !== null && <span>· q[{w.qubit}]</span>}
                      <span>· Col {w.column}</span>
                    </Badge>
                    {/* Tooltip Expansion */}
                    <div
                      role="tooltip"
                      className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-2.5 bg-slate-900 text-slate-100 text-[11px] font-sans rounded-md shadow-xl border border-slate-700 pointer-events-none"
                    >
                      <div className="font-mono font-bold text-amber-400 mb-1 flex items-center justify-between">
                        <span>{w.rule} [{w.severity}]</span>
                        <span className="text-slate-400 text-[10px]">Col {w.column} · q[{w.qubit}]</span>
                      </div>
                      <div className="text-slate-200 leading-snug">{w.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Circuit Wires Grid — full width now */}
          <QubitWiresGrid readOnly={isLocked} lintWarnings={lintWarnings} />

          {/* Qiskit Code — collapsible drawer below the circuit */}
          <CodeDrawer isReadOnly={isLocked} lintWarnings={lintWarnings} />
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
