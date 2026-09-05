import { create } from 'zustand';
import { CircuitModel, Operation, GateName } from '@/lib/contracts';
import { DEMO_STARTER_CIRCUIT } from '@/lib/fixtures';
import {
  generateQiskitCode,
  parseQiskitCode,
  serializeCircuitColumns,
  sortOperations,
  ParseResult,
} from '@/features/circuit/circuit-parser';

export interface CircuitStoreState {
  circuit: CircuitModel;
  selectedOpId: string | null;
  selectedGateToPlace: GateName | null;
  code: string;
  isCodeModified: boolean;
  parseError: string | null;
  parseSuccess: boolean;

  // Actions
  setCircuit: (circuit: CircuitModel) => void;
  resetToBellSeed: () => void;
  clearCircuit: () => void;
  selectOp: (opId: string | null) => void;
  selectGateToPlace: (gate: GateName | null) => void;
  addGate: (
    gate: GateName,
    targetQubit: number,
    column?: number,
    controlQubit?: number,
    classicalTarget?: number
  ) => Operation;
  removeGate: (opId: string) => void;
  removeGateAt: (qubit: number, column: number) => void;
  moveGate: (opId: string, toQubit: number, toColumn: number) => void;
  updateCode: (code: string) => void;
  applyCodeEdit: (codeToApply?: string) => ParseResult;
  revertCodeToCircuit: () => void;
  setQubitCount: (count: number) => void;
}

export const useCircuitStore = create<CircuitStoreState>((set, get) => ({
  circuit: DEMO_STARTER_CIRCUIT,
  selectedOpId: null,
  selectedGateToPlace: null,
  code: generateQiskitCode(DEMO_STARTER_CIRCUIT),
  isCodeModified: false,
  parseError: null,
  parseSuccess: false,

  setCircuit: (circuit: CircuitModel) => {
    const serializedOps = serializeCircuitColumns(circuit.operations);
    const updatedCircuit: CircuitModel = {
      ...circuit,
      operations: serializedOps,
    };
    const code = generateQiskitCode(updatedCircuit);
    set({
      circuit: updatedCircuit,
      code,
      isCodeModified: false,
      parseError: null,
      parseSuccess: false,
      selectedOpId: null,
    });
  },

  resetToBellSeed: () => {
    const code = generateQiskitCode(DEMO_STARTER_CIRCUIT);
    set({
      circuit: DEMO_STARTER_CIRCUIT,
      code,
      isCodeModified: false,
      parseError: null,
      parseSuccess: false,
      selectedOpId: null,
      selectedGateToPlace: null,
    });
  },

  clearCircuit: () => {
    const current = get().circuit;
    const blankCircuit: CircuitModel = {
      ...current,
      id: `cm_custom_${Date.now()}`,
      name: 'Custom Circuit',
      operations: [],
      source: 'BUILDER',
    };
    const code = generateQiskitCode(blankCircuit);
    set({
      circuit: blankCircuit,
      code,
      isCodeModified: false,
      parseError: null,
      parseSuccess: false,
      selectedOpId: null,
      selectedGateToPlace: null,
    });
  },

  selectOp: (opId: string | null) => set({ selectedOpId: opId }),

  selectGateToPlace: (gate: GateName | null) => set({ selectedGateToPlace: gate }),

  addGate: (
    gate: GateName,
    targetQubit: number,
    column?: number,
    controlQubit?: number,
    classicalTarget?: number
  ) => {
    const state = get();
    const currentCircuit = state.circuit;
    const opId = `op_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const controls =
      gate === 'CNOT'
        ? [controlQubit !== undefined ? controlQubit : targetQubit === 0 ? 1 : 0]
        : [];
    const classicalTargets =
      gate === 'MEASURE'
        ? [classicalTarget !== undefined ? classicalTarget : targetQubit]
        : [];

    // Calculate column if not explicitly given
    let assignedCol = column;
    if (assignedCol === undefined) {
      // Find max column for involved qubits
      const involved = [targetQubit, ...controls];
      let maxCol = -1;
      for (const op of currentCircuit.operations) {
        const opInvolved = [...op.targets, ...op.controls];
        if (involved.some((q) => opInvolved.includes(q))) {
          if (op.column > maxCol) {
            maxCol = op.column;
          }
        }
      }
      assignedCol = maxCol + 1;
    }

    const newOp: Operation = {
      opId,
      gate,
      targets: [targetQubit],
      controls,
      classicalTargets,
      column: assignedCol,
    };

    // Remove any existing gate at this exact cell if single gate (unless CNOT target/control)
    const filteredOps = currentCircuit.operations.filter(
      (op) => !(op.column === assignedCol && op.targets.includes(targetQubit))
    );

    const updatedOps = serializeCircuitColumns([...filteredOps, newOp]);
    const updatedCircuit: CircuitModel = {
      ...currentCircuit,
      operations: updatedOps,
      source: 'BUILDER',
    };

    const newCode = generateQiskitCode(updatedCircuit);
    set({
      circuit: updatedCircuit,
      code: newCode,
      isCodeModified: false,
      parseError: null,
      selectedOpId: opId,
    });

    return newOp;
  },

  removeGate: (opId: string) => {
    const state = get();
    const filteredOps = state.circuit.operations.filter((op) => op.opId !== opId);
    const updatedOps = serializeCircuitColumns(filteredOps);
    const updatedCircuit: CircuitModel = {
      ...state.circuit,
      operations: updatedOps,
      source: 'BUILDER',
    };
    const newCode = generateQiskitCode(updatedCircuit);
    set({
      circuit: updatedCircuit,
      code: newCode,
      isCodeModified: false,
      parseError: null,
      selectedOpId: state.selectedOpId === opId ? null : state.selectedOpId,
    });
  },

  removeGateAt: (qubit: number, column: number) => {
    const state = get();
    const filteredOps = state.circuit.operations.filter((op) => {
      if (op.column !== column) return true;
      if (op.targets.includes(qubit)) return false;
      if (op.controls.includes(qubit)) return false;
      return true;
    });
    const updatedOps = serializeCircuitColumns(filteredOps);
    const updatedCircuit: CircuitModel = {
      ...state.circuit,
      operations: updatedOps,
      source: 'BUILDER',
    };
    const newCode = generateQiskitCode(updatedCircuit);
    set({
      circuit: updatedCircuit,
      code: newCode,
      isCodeModified: false,
      parseError: null,
    });
  },

  moveGate: (opId: string, toQubit: number, toColumn: number) => {
    const state = get();
    const targetOp = state.circuit.operations.find((op) => op.opId === opId);
    if (!targetOp) return;

    const updatedOp: Operation = {
      ...targetOp,
      targets: [toQubit],
      controls:
        targetOp.gate === 'CNOT'
          ? [targetOp.controls[0] === toQubit ? (toQubit === 0 ? 1 : 0) : targetOp.controls[0]]
          : [],
      column: toColumn,
    };

    const remainingOps = state.circuit.operations.filter((op) => op.opId !== opId);
    const updatedOps = serializeCircuitColumns([...remainingOps, updatedOp]);
    const updatedCircuit: CircuitModel = {
      ...state.circuit,
      operations: updatedOps,
      source: 'BUILDER',
    };
    const newCode = generateQiskitCode(updatedCircuit);
    set({
      circuit: updatedCircuit,
      code: newCode,
      isCodeModified: false,
      parseError: null,
    });
  },

  updateCode: (newCode: string) => {
    set({
      code: newCode,
      isCodeModified: true,
      parseError: null,
      parseSuccess: false,
    });
  },

  applyCodeEdit: (codeToApply?: string): ParseResult => {
    const state = get();
    const codeString = codeToApply !== undefined ? codeToApply : state.code;
    const result = parseQiskitCode(codeString, state.circuit);

    if (result.success) {
      const regeneratedCode = generateQiskitCode(result.circuit);
      set({
        circuit: result.circuit,
        code: regeneratedCode,
        isCodeModified: false,
        parseError: null,
        parseSuccess: true,
        selectedOpId: null,
      });
    } else {
      // CRITICAL: NEVER mutate the circuit model on error!
      set({
        parseError: result.error,
        parseSuccess: false,
        // code stays as edited so user can see and fix the error
      });
    }

    return result;
  },

  revertCodeToCircuit: () => {
    const state = get();
    const code = generateQiskitCode(state.circuit);
    set({
      code,
      isCodeModified: false,
      parseError: null,
      parseSuccess: false,
    });
  },

  setQubitCount: (count: number) => {
    if (count < 1 || count > 5) return;
    const state = get();
    // Filter out operations on qubits >= count
    const validOps = state.circuit.operations.filter(
      (op) =>
        op.targets.every((q) => q < count) &&
        op.controls.every((q) => q < count)
    );
    const updatedOps = serializeCircuitColumns(validOps);
    const updatedCircuit: CircuitModel = {
      ...state.circuit,
      qubitCount: count,
      classicalBitCount: Math.max(1, count),
      operations: updatedOps,
      source: 'BUILDER',
    };
    const code = generateQiskitCode(updatedCircuit);
    set({
      circuit: updatedCircuit,
      code,
      isCodeModified: false,
      parseError: null,
    });
  },
}));
