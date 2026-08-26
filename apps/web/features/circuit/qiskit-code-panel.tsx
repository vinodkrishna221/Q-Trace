'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code2, Copy, Check, Terminal } from 'lucide-react';

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

export function QiskitCodePanel({
  code = DEFAULT_BELL_QISKIT,
  isReadOnly = true,
}: QiskitCodePanelProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card
      className="border-line bg-panel shadow-xl overflow-hidden"
      data-testid="qiskit-code-panel"
    >
      <CardHeader className="py-2.5 px-4 bg-raised/50 border-b border-line flex flex-row items-center justify-between space-y-0">
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

      <CardContent className="p-0">
        <div className="p-4 bg-abyss font-mono text-xs text-ink-dim overflow-x-auto leading-relaxed border-b border-line">
          <pre data-testid="qiskit-code-content" className="text-accent/90">
            <code>{code}</code>
          </pre>
        </div>
        <div className="py-2 px-4 bg-raised/30 text-[11px] text-ink-faint font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-ink-dim" />
            <span>AST validation: SAFE_SUBSET</span>
          </span>
          <span>PennyLane default.qubit compatible</span>
        </div>
      </CardContent>
    </Card>
  );
}
