import { Operation, CircuitModel } from '@/lib/contracts';

export type GateName = 'H' | 'X' | 'Y' | 'Z' | 'CNOT' | 'MEASURE' | 'CCX' | 'CZ' | 'S' | 'T';

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
    colorClass: 'border-gate-h text-gate-h bg-gate-h/15',
    badgeClass: 'border-gate-h/60 bg-gate-h/10 text-gate-h',
  },
  X: {
    gate: 'X',
    name: 'Pauli-X',
    symbol: 'X',
    description: 'Bit flip / NOT gate (|0⟩ ↔ |1⟩)',
    shortcutKey: 'x',
    colorClass: 'border-gate-pauli-x text-gate-pauli-x bg-gate-pauli-x/15',
    badgeClass: 'border-gate-pauli-x/60 bg-gate-pauli-x/10 text-gate-pauli-x',
  },
  Y: {
    gate: 'Y',
    name: 'Pauli-Y',
    symbol: 'Y',
    description: 'Bit & phase flip (|0⟩ → i|1⟩, |1⟩ → -i|0⟩)',
    shortcutKey: 'y',
    colorClass: 'border-gate-pauli-y text-gate-pauli-y bg-gate-pauli-y/15',
    badgeClass: 'border-gate-pauli-y/60 bg-gate-pauli-y/10 text-gate-pauli-y',
  },
  Z: {
    gate: 'Z',
    name: 'Pauli-Z',
    symbol: 'Z',
    description: 'Phase flip (|0⟩ → |0⟩, |1⟩ → -|1⟩)',
    shortcutKey: 'z',
    colorClass: 'border-gate-pauli-z text-gate-pauli-z bg-gate-pauli-z/15',
    badgeClass: 'border-gate-pauli-z/60 bg-gate-pauli-z/10 text-gate-pauli-z',
  },
  CNOT: {
    gate: 'CNOT',
    name: 'Controlled-NOT',
    symbol: 'CX',
    description: 'Flips target qubit when control qubit is |1⟩',
    isMultiQubit: true,
    shortcutKey: 'c',
    colorClass: 'border-gate-cnot text-gate-cnot bg-gate-cnot/20',
    badgeClass: 'border-gate-cnot/60 bg-gate-cnot/10 text-gate-cnot',
  },
  CZ: {
    gate: 'CZ',
    name: 'Controlled-Z',
    symbol: 'CZ',
    description: 'Applies Pauli-Z to target qubit when control is |1⟩',
    isMultiQubit: true,
    shortcutKey: 'z',
    colorClass: 'border-gate-pauli-z text-gate-pauli-z bg-gate-pauli-z/20',
    badgeClass: 'border-gate-pauli-z/60 bg-gate-pauli-z/10 text-gate-pauli-z',
  },
  CCX: {
    gate: 'CCX',
    name: 'Toffoli (CCX)',
    symbol: 'CCX',
    description: 'Controlled-Controlled-NOT; flips target when both controls are |1⟩',
    isMultiQubit: true,
    shortcutKey: 't',
    colorClass: 'border-gate-cnot text-gate-cnot bg-gate-cnot/20',
    badgeClass: 'border-gate-cnot/60 bg-gate-cnot/10 text-gate-cnot',
  },
  S: {
    gate: 'S',
    name: 'Phase (S)',
    symbol: 'S',
    description: 'π/2 phase rotation around Z axis (|1⟩ → i|1⟩)',
    shortcutKey: 's',
    colorClass: 'border-gate-pauli-z text-gate-pauli-z bg-gate-pauli-z/15',
    badgeClass: 'border-gate-pauli-z/60 bg-gate-pauli-z/10 text-gate-pauli-z',
  },
  T: {
    gate: 'T',
    name: 'π/8 (T)',
    symbol: 'T',
    description: 'π/4 phase rotation around Z axis (|1⟩ → e^(iπ/4)|1⟩)',
    shortcutKey: 't',
    colorClass: 'border-accent text-accent bg-accent/15',
    badgeClass: 'border-accent/60 bg-accent/10 text-accent',
  },
  MEASURE: {
    gate: 'MEASURE',
    name: 'Measure',
    symbol: 'M',
    description: 'Collapses qubit state into classical bit',
    shortcutKey: 'm',
    colorClass: 'border-border-medium text-ink-primary bg-surface-raised',
    badgeClass: 'border-border-medium bg-surface-raised text-ink-secondary',
  },
};

export const SUPPORTED_GATES_LIST: GateName[] = ['H', 'X', 'Y', 'Z', 'CNOT', 'MEASURE'];
