'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code2, Copy, Check, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface QiskitCodePanelProps {
  code?: string;
  isReadOnly?: boolean;
}

const DEFAULT_BELL_QISKIT = `from qiskit import QuantumCircuit

# Initialize 2-qubit, 2-classical-bit quantum circuit
qc = QuantumCircuit(2, 2)

# Column 0: Superposition on qubit 0
qc.h(0)

# Column 1: Entangle qubit 1 conditioned on qubit 0
qc.cx(0, 1)

# Column 2: Measure both qubits into classical bits
qc.measure([0, 1], [0, 1])
`;

// Very lightweight syntax coloring — no external dependency
function colorLine(line: string): React.ReactNode {
  // Comment lines
  if (/^\s*#/.test(line)) {
    // Section comments (# Column N: ...) get accent color
    if (/^#\s*(Column|Initialize|Measure|Oracle|Diffusion)/i.test(line.trim())) {
      return <span className="text-sky-400/80 italic">{line}</span>;
    }
    return <span className="text-slate-500 italic">{line}</span>;
  }

  // Import / from lines
  if (/^from |^import /.test(line)) {
    return <span className="text-violet-400">{line}</span>;
  }

  // qc.method(...) lines
  const gateMatch = line.match(/^(\s*)(qc\.)([a-z]+)(\(.*\))/);
  if (gateMatch) {
    const [, indent, obj, method, args] = gateMatch;
    return (
      <span>
        {indent}
        <span className="text-slate-400">{obj}</span>
        <span className="text-amber-400 font-semibold">{method}</span>
        <span className="text-emerald-300/90">{args}</span>
      </span>
    );
  }

  // Assignment lines (qc = ...)
  if (/^qc\s*=/.test(line.trim())) {
    return <span className="text-cyan-300">{line}</span>;
  }

  // Blank lines / fallback
  return <span className="text-slate-300/60">{line}</span>;
}

const COLLAPSED_LINES = 8;

export function QiskitCodePanel({
  code = DEFAULT_BELL_QISKIT,
  isReadOnly = true,
}: QiskitCodePanelProps) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const lines = code.split('\n');
  const totalLines = lines.length;
  const visibleLines = expanded ? lines : lines.slice(0, COLLAPSED_LINES);
  const hiddenCount = totalLines - COLLAPSED_LINES;
  const canCollapse = totalLines > COLLAPSED_LINES;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card
      className="border-line bg-panel shadow-xl overflow-hidden flex flex-col"
      data-testid="qiskit-code-panel"
    >
      {/* Header */}
      <CardHeader className="py-2.5 px-4 bg-raised/50 border-b border-line flex flex-row items-center justify-between space-y-0 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-accent" />
          <CardTitle className="text-xs font-mono text-ink">
            Generated Qiskit (Python)
          </CardTitle>
          {isReadOnly && (
            <Badge variant="outline" className="text-[10px] font-mono text-ink-dim bg-abyss">
              Read-Only
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono text-evidence border-evidence/40 bg-evidence/10">
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

      <CardContent className="p-0 flex flex-col min-h-0">
        {/* Code area */}
        <div className="bg-abyss border-b border-line relative overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs font-mono leading-relaxed">
              <tbody>
                {visibleLines.map((line, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Line number gutter */}
                    <td className="select-none text-right pr-3 pl-3 py-0 text-slate-600 w-8 align-top text-[10px] leading-[1.6rem] border-r border-slate-800">
                      {i + 1}
                    </td>
                    {/* Code */}
                    <td className="pl-4 pr-4 py-0 whitespace-pre align-top leading-[1.6rem]">
                      {colorLine(line)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fade overlay when collapsed */}
          {!expanded && canCollapse && (
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none" />
          )}
        </div>

        {/* Expand / Collapse toggle */}
        {canCollapse && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-mono text-slate-500 hover:text-slate-300 bg-abyss hover:bg-white/5 transition-colors border-b border-line cursor-pointer"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                {hiddenCount} more lines — show full circuit
              </>
            )}
          </button>
        )}

        {/* Footer */}
        <div className="py-2 px-4 bg-raised/30 text-[10px] text-ink-faint font-mono flex items-center justify-between flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-ink-dim" />
            <span>AST validation: SAFE_SUBSET</span>
          </span>
          <span className="text-slate-600">{totalLines} lines · PennyLane compatible</span>
        </div>
      </CardContent>
    </Card>
  );
}
