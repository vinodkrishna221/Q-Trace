'use client';

import * as React from 'react';
import { useCircuitStore } from '@/lib/circuit-store';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Code2,
  Copy,
  Check,
  Terminal,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface QiskitCodeEditorProps {
  isReadOnly?: boolean;
}

export function QiskitCodeEditor({ isReadOnly = false }: QiskitCodeEditorProps) {
  const {
    code,
    updateCode,
    applyCodeEdit,
    revertCodeToCircuit,
    isCodeModified,
    parseError,
    parseSuccess,
    circuit,
  } = useCircuitStore();

  const [copied, setCopied] = React.useState(false);
  const [localInput, setLocalInput] = React.useState(code);

  // Sync local input with store code when store code changes externally (e.g. from visual builder)
  React.useEffect(() => {
    if (!isCodeModified) {
      setLocalInput(code);
    }
  }, [code, isCodeModified]);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(localInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalInput(val);
    updateCode(val);
  };

  const handleApply = () => {
    applyCodeEdit(localInput);
  };

  const handleRevert = () => {
    revertCodeToCircuit();
    setLocalInput(code);
  };

  return (
    <Card
      className="border-line bg-panel shadow-xl overflow-hidden"
      data-testid="qiskit-code-panel"
    >
      <CardHeader className="py-2.5 px-4 bg-raised/50 border-b border-line flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-accent" />
          <CardTitle className="text-xs font-mono text-ink font-semibold">
            Synchronized Qiskit (Python)
          </CardTitle>
          {isReadOnly ? (
            <Badge variant="outline" className="text-[10px] font-mono text-ink-dim bg-abyss">
              Read-Only
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className={`text-[10px] font-mono ${
                isCodeModified
                  ? 'text-caution border-caution/40 bg-caution/10'
                  : 'text-accent border-accent/40 bg-accent/10'
              }`}
            >
              {isCodeModified ? 'Unsaved Edits' : 'Synchronized'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] font-mono text-evidence border-evidence/40 bg-evidence/10"
          >
            Qiskit 2.3 · Aer 0.17
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            data-testid="copy-qiskit-btn"
            className="h-7 px-2 text-[11px] font-mono border-line bg-raised text-ink-dim hover:text-ink"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-evidence" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Error Notification Banner */}
        {parseError && (
          <div
            data-testid="code-parse-error"
            className="p-3 bg-red-950/40 border-b border-red-800/60 text-red-300 text-xs font-mono flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-red-200">Parse & Validation Error</div>
              <div className="text-[11px] text-red-300/90">{parseError}</div>
              <div className="text-[10px] text-red-400/80 mt-1">
                Note: The visual Circuit Model was preserved without changes. Fix the unsupported statement to synchronize.
              </div>
            </div>
          </div>
        )}

        {/* Success Sync Banner */}
        {parseSuccess && !parseError && !isCodeModified && (
          <div
            data-testid="code-parse-success"
            className="py-1.5 px-3 bg-emerald-950/30 border-b border-emerald-800/40 text-emerald-300 text-[11px] font-mono flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Code successfully parsed and synchronized with Circuit Model.</span>
          </div>
        )}

        {/* Editor text area / display */}
        <div className="relative bg-abyss">
          {isReadOnly ? (
            <div className="p-4 font-mono text-xs text-ink-dim overflow-x-auto leading-relaxed border-b border-line">
              <pre data-testid="qiskit-code-content" className="text-accent/90">
                <code>{localInput}</code>
              </pre>
            </div>
          ) : (
            <div className="relative font-mono text-xs">
              <textarea
                data-testid="qiskit-code-editor-input"
                value={localInput}
                onChange={handleChange}
                spellCheck={false}
                rows={Math.max(8, localInput.split('\n').length + 1)}
                className="w-full p-4 bg-abyss text-accent font-mono text-xs leading-relaxed border-b border-line focus:outline-none focus:ring-1 focus:ring-accent resize-y selection:bg-accent/20"
                placeholder="Write Qiskit Python code..."
                aria-label="Qiskit Python Code Editor"
              />
              {/* Hidden pre for test query compatibility if needed */}
              <pre data-testid="qiskit-code-content" className="hidden" aria-hidden="true">
                <code>{localInput}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Editor controls bar */}
        {!isReadOnly && (
          <div className="py-2.5 px-4 bg-raised/30 border-b border-line flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-ink-faint font-mono">
              <Terminal className="w-3.5 h-3.5 text-ink-dim" />
              <span>AST parse-and-replace edit flow</span>
            </div>

            <div className="flex items-center gap-2">
              {isCodeModified && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRevert}
                  data-testid="reset-code-btn"
                  className="h-7 px-2.5 text-xs font-mono border-line text-ink-dim hover:text-ink"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Revert Edits
                </Button>
              )}
              <Button
                size="sm"
                variant="default"
                onClick={handleApply}
                disabled={!isCodeModified}
                data-testid="apply-code-btn"
                className="h-7 px-3 text-xs font-mono font-semibold bg-accent text-abyss hover:bg-accent/90"
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                Sync to Circuit Model
              </Button>
            </div>
          </div>
        )}

        <div className="py-2 px-4 bg-raised/20 text-[11px] text-ink-faint font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>Subset: H, X, Y, Z, CNOT, MEASURE</span>
          </span>
          <span>PennyLane default.qubit compatible</span>
        </div>
      </CardContent>
    </Card>
  );
}
