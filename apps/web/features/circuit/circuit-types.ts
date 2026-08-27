import { GateName, Operation, CircuitModel } from '@/lib/contracts';

export interface GateDefinition {
  gate: GateName;
  name: string;
  symbol: string;
  description: string;
  isMultiQubit?: boolean;
  colorClass: string;
  badgeClass: string;
  shortcutKey: string;
}

export const GATE_DEFINITIONS: Record<GateName, GateDefinition> = {
  H: {
    gate: 'H',
    name: 'Hadamard',
    symbol: 'H',
    description: 'Creates equal superposition (|0⟩ → (|0⟩+|1⟩)/√2)',
    shortcutKey: 'h',
    colorClass: 'border-accent text-accent bg-accent/15',
    badgeClass: 'border-accent/60 bg-accent/10 text-accent',
  },
  X: {
    gate: 'X',
    name: 'Pauli-X',
    symbol: 'X',
    description: 'Bit flip / NOT gate (|0⟩ ↔ |1⟩)',
    shortcutKey: 'x',
    colorClass: 'border-emerald-500 text-emerald-400 bg-emerald-500/15',
    badgeClass: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400',
  },
  Y: {
    gate: 'Y',
    name: 'Pauli-Y',
    symbol: 'Y',
    description: 'Bit & phase flip (|0⟩ → i|1⟩, |1⟩ → -i|0⟩)',
    shortcutKey: 'y',
    colorClass: 'border-amber-500 text-amber-400 bg-amber-500/15',
    badgeClass: 'border-amber-500/60 bg-amber-500/10 text-amber-400',
  },
  Z: {
    gate: 'Z',
    name: 'Pauli-Z',
    symbol: 'Z',
    description: 'Phase flip (|0⟩ → |0⟩, |1⟩ → -|1⟩)',
    shortcutKey: 'z',
    colorClass: 'border-cyan-500 text-cyan-400 bg-cyan-500/15',
    badgeClass: 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400',
  },
  CNOT: {
    gate: 'CNOT',
    name: 'Controlled-NOT',
    symbol: 'CX',
    description: 'Flips target qubit when control qubit is |1⟩',
    isMultiQubit: true,
    shortcutKey: 'c',
    colorClass: 'border-violet text-violet bg-violet/20',
    badgeClass: 'border-violet/60 bg-violet/10 text-violet',
  },
  MEASURE: {
    gate: 'MEASURE',
    name: 'Measure',
    symbol: 'M',
    description: 'Collapses qubit state into classical bit',
    shortcutKey: 'm',
    colorClass: 'border-line-bright text-ink bg-raised',
    badgeClass: 'border-line-bright bg-raised text-ink-dim',
  },
};

export const SUPPORTED_GATES_LIST: GateName[] = ['H', 'X', 'Y', 'Z', 'CNOT', 'MEASURE'];
