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
import { LintWarning, mapWarningsToCodeLines } from './circuit-linter';

interface QiskitCodeEditorProps {
  isReadOnly?: boolean;
  lintWarnings?: LintWarning[];
  code?: string;
}

function renderHighlightedQiskitCode(
  code: string,
  offendingLines?: Map<number, LintWarning[]>
) {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const lineNum = lineIdx + 1;
    const warningsOnLine = offendingLines?.get(lineNum);
    const hasWarning = Boolean(warningsOnLine && warningsOnLine.length > 0);

    const commentIdx = line.indexOf('#');
    const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
    const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : null;

    const tokens: React.ReactNode[] = [];
    const tokenRegex =
      /(\b(?:from|import|def|return|as|with)\b)|(\bQuantumCircuit\b)|(\.(?:h|x|y|z|cx|measure)\b)|(\b\d+\b)|("[^"]*"|'[^']*')|([a-zA-Z_]\w*)|([^\s\w]+|\s+)/g;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(codePart)) !== null) {
      const [full, kw, cls, method, num, str, ident] = match;
      if (kw) {
        tokens.push(
          <span key={`kw-${lineIdx}-${tokens.length}`} className="text-violet-600 dark:text-violet-400 font-semibold">
            {kw}
          </span>
        );
      } else if (cls) {
        tokens.push(
          <span key={`cls-${lineIdx}-${tokens.length}`} className="text-sky-600 dark:text-sky-400 font-semibold">
            {cls}
          </span>
        );
      } else if (method) {
        tokens.push(
          <span key={`meth-${lineIdx}-${tokens.length}`} className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {method}
          </span>
        );
      } else if (num) {
        tokens.push(
          <span key={`num-${lineIdx}-${tokens.length}`} className="text-amber-700 dark:text-amber-400 font-medium">
            {num}
          </span>
        );
      } else if (str) {
        tokens.push(
          <span key={`str-${lineIdx}-${tokens.length}`} className="text-teal-600 dark:text-teal-400">
            {str}
          </span>
        );
      } else if (ident) {
        tokens.push(
          <span key={`id-${lineIdx}-${tokens.length}`} className="text-ink">
            {ident}
          </span>
        );
      } else {
        tokens.push(full);
      }
    }

    return (
      <div
        key={`line-${lineIdx}`}
        data-testid={hasWarning ? 'offending-code-line' : `code-line-${lineNum}`}
        data-line-number={lineNum}
        className={`leading-relaxed ${
          hasWarning
            ? 'underline decoration-wavy decoration-amber-500 underline-offset-4 text-amber-200'
            : ''
        }`}
        style={hasWarning ? { textDecoration: 'underline wavy #F59E0B' } : undefined}
        title={hasWarning ? warningsOnLine![0].message : undefined}
      >
        {tokens}
        {commentPart && (
          <span className="text-slate-400 dark:text-slate-500 italic">
            {commentPart}
          </span>
        )}
      </div>
    );
  });
}

export function QiskitCodeEditor({
  isReadOnly = false,
  lintWarnings = [],
  code: codeProp,
}: QiskitCodeEditorProps) {
  const {
    code: storeCode,
    updateCode,
    applyCodeEdit,
    revertCodeToCircuit,
    isCodeModified,
    parseError,
    parseSuccess,
    circuit,
  } = useCircuitStore();

  const code = codeProp ?? storeCode;
  const [copied, setCopied] = React.useState(false);
  const [localInput, setLocalInput] = React.useState(code);

  const offendingLines = React.useMemo(
    () => mapWarningsToCodeLines(localInput, lintWarnings),
    [localInput, lintWarnings]
  );

  // Sync local input with store code when store code changes externally (e.g. from visual builder)
  React.useEffect(() => {
    if (!isCodeModified) {
      setLocalInput(codeProp ?? storeCode);
    }
  }, [codeProp, storeCode, isCodeModified]);

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
            className="p-3 bg-red-500/10 dark:bg-red-950/40 border-b border-red-500/30 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-mono flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-red-900 dark:text-red-200">Parse &amp; Validation Error</div>
              <div className="text-[11px] text-red-700 dark:text-red-300/90">{parseError}</div>
              <div className="text-[10px] text-red-600 dark:text-red-400/80 mt-1">
                Note: The visual Circuit Model was preserved without changes. Fix the unsupported statement to synchronize.
              </div>
            </div>
          </div>
        )}

        {/* Success Sync Banner */}
        {parseSuccess && !parseError && !isCodeModified && (
          <div
            data-testid="code-parse-success"
            className="py-1.5 px-3 bg-emerald-500/10 dark:bg-emerald-950/30 border-b border-emerald-500/30 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Code successfully parsed and synchronized with Circuit Model.</span>
          </div>
        )}

        {/* Quantum Invariant Linter Notification Banner */}
        {lintWarnings.length > 0 && (
          <div
            data-testid="code-lint-warning-banner"
            className="p-3 bg-amber-500/10 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-mono flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 w-full">
              <div className="font-bold flex items-center justify-between">
                <span>Quantum Invariant Warning</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                  {lintWarnings.length} violation{lintWarnings.length > 1 ? 's' : ''} detected
                </span>
              </div>
              {lintWarnings.map((w, idx) => (
                <div key={idx} className="text-[11px] text-amber-700 dark:text-amber-300">
                  <span className="font-bold">[{w.rule}]</span> {w.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor text area / display */}
        <div className="relative bg-slate-950 border-b border-line">
          {isReadOnly ? (
            <div className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-slate-300">
              <pre data-testid="qiskit-code-content" className="font-mono">
                <code>{renderHighlightedQiskitCode(localInput, offendingLines)}</code>
              </pre>
            </div>
          ) : (
            <div className={`relative font-mono text-xs flex transition-all ${parseError ? 'animate-shake ring-1 ring-inset ring-red-500/50' : ''}`}>
              {/* Line Numbers Gutter */}
              <div
                className="w-12 bg-slate-900/50 border-r border-slate-800 text-slate-500 flex flex-col p-4 pt-[18px] text-right select-none font-mono text-[11px] leading-relaxed"
                data-testid="qiskit-editor-gutter"
              >
                {localInput.split('\n').map((_, i) => {
                  const lineNum = i + 1;
                  const warnings = offendingLines.get(lineNum);
                  const hasWarning = Boolean(warnings && warnings.length > 0);
                  return (
                    <div
                      key={i}
                      data-testid={`gutter-line-${lineNum}`}
                      className="flex items-center justify-end gap-1 h-[21px]"
                    >
                      {hasWarning && (
                        <span
                          data-testid="gutter-warning-icon"
                          title={warnings![0].message}
                          className="text-amber-400 font-bold text-[11px] animate-pulse cursor-help"
                          aria-label={`Warning on line ${lineNum}: ${warnings![0].rule}`}
                        >
                          ⚠
                        </span>
                      )}
                      <span>{lineNum}</span>
                    </div>
                  );
                })}
              </div>

              {/* Code editing and live AST view */}
              <div className="relative flex-1">
                <textarea
                  data-testid="qiskit-code-editor-input"
                  value={localInput}
                  onChange={handleChange}
                  spellCheck={false}
                  rows={Math.max(8, localInput.split('\n').length + 1)}
                  className="w-full p-4 bg-transparent text-sky-200 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-accent/40"
                  placeholder="Write Qiskit Python code..."
                  aria-label="Qiskit Python Code Editor"
                />

                {/* DOM representation with wavy underlines for inspection & visual AST tracking */}
                <div className="border-t border-slate-800/80 bg-slate-950/60 p-3">
                  <div className="text-[10px] text-slate-400 font-semibold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3 h-3 text-accent" />
                      <span>AST Live View &amp; Invariants</span>
                    </span>
                    {lintWarnings.length > 0 && (
                      <span className="text-amber-400 text-[10px] font-mono flex items-center gap-1">
                        <span>⚠</span>
                        <span>{lintWarnings.length} Invariant Warning{lintWarnings.length > 1 ? 's' : ''}</span>
                      </span>
                    )}
                  </div>
                  <pre data-testid="qiskit-code-content" className="font-mono text-xs leading-relaxed overflow-x-auto">
                    <code>{renderHighlightedQiskitCode(localInput, offendingLines)}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Editor controls bar */}
        {!isReadOnly && (
          <div className={`py-3 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-line transition-colors duration-300 ${isCodeModified ? 'bg-violet-500/10' : 'bg-raised/30'}`}>
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
                  Revert
                </Button>
              )}
              <Button
                size="sm"
                variant="default"
                onClick={handleApply}
                disabled={!isCodeModified}
                data-testid="apply-code-btn"
                className={`h-8 px-4 text-xs font-mono font-bold transition-all duration-300 relative overflow-hidden group ${
                  isCodeModified 
                    ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.5)] animate-pulse border-violet-400' 
                    : 'bg-surface-raised text-text-muted opacity-80'
                }`}
              >
                {!isCodeModified && (
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shimmer" />
                )}
                <span className="relative z-10 flex items-center">
                  <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${isCodeModified ? 'text-amber-300' : ''}`} />
                  {isCodeModified ? 'Sync to Circuit Model' : 'Code Synchronized'}
                </span>
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
