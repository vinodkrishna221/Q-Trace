import { Operation, CircuitModel } from '@/lib/contracts';

export type GateName = 'H' | 'X' | 'Y' | 'Z' | 'CNOT' | 'MEASURE' | 'CCX' | 'CZ' | 'S' | 'T';

export type GateFamilyId = 'single' | 'phase' | 'controlled' | 'measure';

export interface GateFamily {
  id: GateFamilyId;
  name: string;
  description: string;
  gates: GateName[];
}

export const GATE_FAMILIES: GateFamily[] = [
  {
    id: 'single',
    name: 'Single Qubit',
    description: 'Superposition & Pauli rotations',
    gates: ['H', 'X', 'Y', 'Z'],
  },
  {
    id: 'phase',
    name: 'Phase',
    description: 'Z-axis phase rotations',
    gates: ['S', 'T'],
  },
  {
    id: 'controlled',
    name: 'Multi-Qubit',
    description: 'Entanglement & conditional logic',
    gates: ['CNOT', 'CZ', 'CCX'],
  },
  {
    id: 'measure',
    name: 'Measure',
    description: 'Measurement into classical register',
    gates: ['MEASURE'],
  },
];

export interface GateDefinition {
  gate: GateName;
  name: string;
  symbol: string;
  description: string;
  family: GateFamilyId;
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
    family: 'single',
    shortcutKey: 'h',
    colorClass: 'border-gate-h text-gate-h bg-gate-h/15',
    badgeClass: 'border-gate-h/60 bg-gate-h/10 text-gate-h',
  },
  X: {
    gate: 'X',
    name: 'Pauli-X',
    symbol: 'X',
    description: 'Bit flip / NOT gate (|0⟩ ↔ |1⟩)',
    family: 'single',
    shortcutKey: 'x',
    colorClass: 'border-gate-pauli-x text-gate-pauli-x bg-gate-pauli-x/15',
    badgeClass: 'border-gate-pauli-x/60 bg-gate-pauli-x/10 text-gate-pauli-x',
  },
  Y: {
    gate: 'Y',
    name: 'Pauli-Y',
    symbol: 'Y',
    description: 'Bit & phase flip (|0⟩ → i|1⟩, |1⟩ → -i|0⟩)',
    family: 'single',
    shortcutKey: 'y',
    colorClass: 'border-gate-pauli-y text-gate-pauli-y bg-gate-pauli-y/15',
    badgeClass: 'border-gate-pauli-y/60 bg-gate-pauli-y/10 text-gate-pauli-y',
  },
  Z: {
    gate: 'Z',
    name: 'Pauli-Z',
    symbol: 'Z',
    description: 'Phase flip (|0⟩ → |0⟩, |1⟩ → -|1⟩)',
    family: 'single',
    shortcutKey: 'z',
    colorClass: 'border-gate-pauli-z text-gate-pauli-z bg-gate-pauli-z/15',
    badgeClass: 'border-gate-pauli-z/60 bg-gate-pauli-z/10 text-gate-pauli-z',
  },
  S: {
    gate: 'S',
    name: 'Phase (S)',
    symbol: 'S',
    description: 'π/2 phase rotation around Z axis (|1⟩ → i|1⟩)',
    family: 'phase',
    shortcutKey: 's',
    colorClass: 'border-gate-pauli-z text-gate-pauli-z bg-gate-pauli-z/15',
    badgeClass: 'border-gate-pauli-z/60 bg-gate-pauli-z/10 text-gate-pauli-z',
  },
  T: {
    gate: 'T',
    name: 'π/8 (T)',
    symbol: 'T',
    description: 'π/4 phase rotation around Z axis (|1⟩ → e^(iπ/4)|1⟩)',
    family: 'phase',
    shortcutKey: 't',
    colorClass: 'border-accent text-accent bg-accent/15',
    badgeClass: 'border-accent/60 bg-accent/10 text-accent',
  },
  CNOT: {
    gate: 'CNOT',
    name: 'Controlled-NOT',
    symbol: 'CX',
    description: 'Flips target qubit when control qubit is |1⟩',
    family: 'controlled',
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
    family: 'controlled',
    isMultiQubit: true,
    shortcutKey: 'j',
    colorClass: 'border-gate-pauli-z text-gate-pauli-z bg-gate-pauli-z/20',
    badgeClass: 'border-gate-pauli-z/60 bg-gate-pauli-z/10 text-gate-pauli-z',
  },
  CCX: {
    gate: 'CCX',
    name: 'Toffoli (CCX)',
    symbol: 'CCX',
    description: 'Controlled-Controlled-NOT; flips target when both controls are |1⟩',
    family: 'controlled',
    isMultiQubit: true,
    shortcutKey: 'o',
    colorClass: 'border-gate-cnot text-gate-cnot bg-gate-cnot/20',
    badgeClass: 'border-gate-cnot/60 bg-gate-cnot/10 text-gate-cnot',
  },
  MEASURE: {
    gate: 'MEASURE',
    name: 'Measure',
    symbol: 'M',
    description: 'Collapses qubit state into classical bit',
    family: 'measure',
    shortcutKey: 'm',
    colorClass: 'border-border-medium text-ink-primary bg-surface-raised',
    badgeClass: 'border-border-medium bg-surface-raised text-ink-secondary',
  },
};

export const SUPPORTED_GATES_LIST: GateName[] = [
  'H',
  'X',
  'Y',
  'Z',
  'S',
  'T',
  'CNOT',
  'CZ',
  'CCX',
  'MEASURE',
];
