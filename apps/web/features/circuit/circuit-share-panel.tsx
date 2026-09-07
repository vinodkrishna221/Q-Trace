'use client';

import * as React from 'react';
import { CircuitModel } from '@/lib/contracts';
import { useCircuitStore } from '@/lib/circuit-store';
import { generateOpenQasm3, downloadTextFile } from './circuit-qasm-exporter';
import {
  exportCircuitModelJson,
  importCircuitModelJson,
  normalizeCircuitModel,
} from './circuit-serializer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Share2,
  Download,
  Copy,
  Check,
  Upload,
  AlertCircle,
  FileCode2,
  FileJson,
  Layers,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { DEMO_STARTER_CIRCUIT } from '@/lib/fixtures';

interface CircuitSharePanelProps {
  onClose?: () => void;
  onImportSuccess?: (circuit: CircuitModel) => void;
}

export function CircuitSharePanel({ onClose, onImportSuccess }: CircuitSharePanelProps) {
  const { circuit, setCircuit } = useCircuitStore();
  const [activeTab, setActiveTab] = React.useState('export');

  // Copy states
  const [copiedQasm, setCopiedQasm] = React.useState(false);
  const [copiedJson, setCopiedJson] = React.useState(false);

  // Import states
  const [importText, setImportText] = React.useState('');
  const [importError, setImportError] = React.useState<string | null>(null);
  const [importSuccess, setImportSuccess] = React.useState<string | null>(null);

  // Derived exports
  const openQasm3Code = React.useMemo(() => generateOpenQasm3(circuit), [circuit]);
  const circuitJson = React.useMemo(() => exportCircuitModelJson(circuit, true), [circuit]);

  const handleCopyQasm = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(openQasm3Code);
        setCopiedQasm(true);
        setTimeout(() => setCopiedQasm(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleCopyJson = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(circuitJson);
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleDownloadQasm = () => {
    const filename = `${(circuit.name || 'circuit').toLowerCase().replace(/\s+/g, '_')}.qasm`;
    downloadTextFile(filename, openQasm3Code, 'text/plain;charset=utf-8');
  };

  const handleDownloadJson = () => {
    const filename = `${(circuit.name || 'circuit').toLowerCase().replace(/\s+/g, '_')}.json`;
    downloadTextFile(filename, circuitJson, 'application/json;charset=utf-8');
  };

  const handleImport = () => {
    setImportError(null);
    setImportSuccess(null);

    const result = importCircuitModelJson(importText);
    if (!result.success) {
      setImportError(result.error);
      return;
    }

    // Set circuit in store
    setCircuit(result.circuit);
    setImportSuccess(
      `Successfully loaded "${result.circuit.name}" (${result.circuit.qubitCount} qubits, ${result.circuit.operations.length} gates).`
    );
    onImportSuccess?.(result.circuit);
  };

  const handleLoadSampleBell = () => {
    const sample = exportCircuitModelJson(DEMO_STARTER_CIRCUIT, true);
    setImportText(sample);
    setImportError(null);
    setImportSuccess(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setImportText(content);
        setImportError(null);
        setImportSuccess(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card
      className="border-accent/40 bg-panel shadow-2xl overflow-hidden animate-in fade-in-50 duration-200"
      data-testid="circuit-share-panel"
    >
      <CardHeader className="pb-3 border-b border-line bg-raised/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-[10px] font-mono tracking-wide bg-accent text-abyss">
              LOCAL ARTIFACT SHARING
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono text-ink-dim border-line">
              OpenQASM 3.0 &amp; Circuit JSON
            </Badge>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-ink-dim hover:text-ink"
              data-testid="close-share-panel-btn"
              aria-label="Close share panel"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <CardTitle className="text-base text-ink flex items-center gap-2 mt-1">
          <Share2 className="w-4 h-4 text-accent" />
          <span>Circuit Artifact Sharing &amp; Ecosystem Export</span>
        </CardTitle>
        <CardDescription className="text-xs text-ink-dim">
          Export verified circuit definitions for teammates or quantum toolchains. Local artifact sharing preserves privacy with zero cloud accounts or fake multiplayer claims.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-4">
            <TabsTrigger value="export" data-testid="tab-export" className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export &amp; Share
            </TabsTrigger>
            <TabsTrigger value="import" data-testid="tab-import" className="text-xs">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Import Artifact
            </TabsTrigger>
            <TabsTrigger value="interop" data-testid="tab-collab-info" className="text-xs">
              <Info className="w-3.5 h-3.5 mr-1.5" />
              Standards &amp; Info
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: EXPORT & SHARE */}
          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* OpenQASM 3.0 Card */}
              <div className="rounded-lg border border-line bg-raised/30 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-accent" />
                      <span className="text-xs font-semibold text-ink">OpenQASM 3.0 Export</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono text-ink-dim">
                      Standard
                    </Badge>
                  </div>
                  <p className="text-[11px] text-ink-dim mb-2">
                    Interoperable with Qiskit, PennyLane, Amazon Braket, and hardware control systems.
                  </p>
                  <pre
                    className="p-2.5 rounded bg-abyss text-[11px] font-mono text-ink-dim border border-line/50 overflow-x-auto max-h-40 leading-relaxed select-all"
                    data-testid="qasm-preview"
                  >
                    {openQasm3Code}
                  </pre>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-line/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyQasm}
                    className="flex-1 text-xs"
                    data-testid="copy-qasm-btn"
                  >
                    {copiedQasm ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-evidence" />
                        <span className="text-evidence">Copied QASM!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        <span>Copy QASM 3</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDownloadQasm}
                    className="flex-1 text-xs font-medium"
                    data-testid="download-qasm-btn"
                  >
                    <Download className="w-3.5 h-3.5 mr-1 text-abyss" />
                    <span>Download .qasm</span>
                  </Button>
                </div>
              </div>

              {/* Circuit Model JSON Card */}
              <div className="rounded-lg border border-line bg-raised/30 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-evidence" />
                      <span className="text-xs font-semibold text-ink">Circuit Model JSON</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono text-ink-dim">
                      Canonical v1
                    </Badge>
                  </div>
                  <p className="text-[11px] text-ink-dim mb-2">
                    Complete normalized circuit snapshot with gate targets, controls, and columns.
                  </p>
                  <pre
                    className="p-2.5 rounded bg-abyss text-[11px] font-mono text-ink-dim border border-line/50 overflow-x-auto max-h-40 leading-relaxed select-all"
                    data-testid="json-preview"
                  >
                    {circuitJson}
                  </pre>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-line/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyJson}
                    className="flex-1 text-xs"
                    data-testid="copy-json-btn"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-evidence" />
                        <span className="text-evidence">Copied JSON!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDownloadJson}
                    className="flex-1 text-xs font-medium"
                    data-testid="download-json-btn"
                  >
                    <Download className="w-3.5 h-3.5 mr-1 text-abyss" />
                    <span>Download .json</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: IMPORT ARTIFACT */}
          <TabsContent value="import" className="space-y-4">
            <div className="rounded-lg border border-line bg-raised/30 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-accent" />
                  <span className="text-xs font-semibold text-ink">Import Circuit Model JSON</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSampleBell}
                    className="h-7 text-[11px]"
                    data-testid="load-sample-bell-btn"
                  >
                    <Sparkles className="w-3 h-3 mr-1 text-accent" />
                    Load Sample Bell State
                  </Button>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json,.qasm,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      data-testid="import-file-input"
                    />
                    <span className="inline-flex items-center justify-center rounded-md border border-line bg-raised px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-raised/80">
                      <Upload className="w-3 h-3 mr-1" />
                      Upload File
                    </span>
                  </label>
                </div>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste canonical CircuitModel JSON here..."
                rows={6}
                className="w-full rounded-md border border-line bg-abyss p-3 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
                data-testid="import-json-textarea"
              />

              {importError && (
                <div
                  className="p-3 rounded border border-danger/40 bg-danger/10 text-danger text-xs flex items-start gap-2"
                  data-testid="import-error-banner"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold block">Validation Failed:</strong>
                    <span>{importError}</span>
                  </div>
                </div>
              )}

              {importSuccess && (
                <div
                  className="p-3 rounded border border-evidence/40 bg-evidence/10 text-evidence text-xs flex items-start gap-2"
                  data-testid="import-success-banner"
                >
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold block">Import Successful:</strong>
                    <span>{importSuccess}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="font-medium text-xs"
                  data-testid="import-circuit-btn"
                >
                  <Upload className="w-3.5 h-3.5 mr-1 text-abyss" />
                  <span>Import &amp; Load into Workspace</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: STANDARDS & COLLAB INFO */}
          <TabsContent value="interop" className="space-y-4">
            <div className="rounded-lg border border-line bg-raised/30 p-4 space-y-3 text-xs text-ink-dim">
              <div className="flex items-center gap-2 text-ink font-semibold">
                <Layers className="w-4 h-4 text-accent" />
                <span>Deterministic Circuit Model &amp; Ecosystem Standards</span>
              </div>
              <p>
                Q-Trace implements a deterministic, verified Circuit Model for educational quantum computing. Circuits are represented using:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-[11px]">
                <li>
                  <strong className="text-ink">OpenQASM 3.0 Standard:</strong> Fully compatible with <code className="text-accent font-mono">stdgates.inc</code> syntax (<code className="text-ink font-mono">h</code>, <code className="text-ink font-mono">x</code>, <code className="text-ink font-mono">y</code>, <code className="text-ink font-mono">z</code>, <code className="text-ink font-mono">cx</code>, <code className="text-ink font-mono">measure</code>).
                </li>
                <li>
                  <strong className="text-ink">Canonical JSON Serialization:</strong> Normalized operations with zero column conflicts, sorted by wire index and execution order.
                </li>
                <li>
                  <strong className="text-ink">Local Artifact Sharing:</strong> Collaboration is artifact-based. Share files directly with peers, mentors, or judges without requiring internet access or central cloud synchronization.
                </li>
              </ul>
              <div className="p-2.5 rounded bg-abyss border border-line/40 text-[11px] text-ink-faint flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Zero fake multiplayer claims: Q-Trace focuses on deep individual mental models and reproducible quantum state traces.</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
