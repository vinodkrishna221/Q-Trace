/**
 * Types and contract schemas for Socratic Counterexample Grading Engine (FEA-6 / FEA-7).
 * Mirrors backend models in apps/api/app/services/grading/socratic_engine.py
 * and endpoints in apps/api/app/routers/grading.py.
 */

import { CircuitModel } from '@/lib/contracts';

export type InvariantId = 'G-1' | 'G-2' | 'G-3' | string;

export interface InvariantResult {
  invariantId: InvariantId;
  name: string;
  passed: boolean;
  value?: number;
  threshold?: number;
  details: string;
}

export interface CounterExample {
  inputState: string; // e.g. "|+⟩", "|0⟩", "|1⟩"
  divergenceStep?: number; // e.g. 2
  gateName?: string; // e.g. "CNOT"
  studentOutput: Record<string, number> | string; // e.g. "|11⟩ with P = 1.0" or { "11": 1.0 }
  targetOutput: Record<string, number> | string; // e.g. "(|00⟩ + |11⟩)/√2" or { "00": 0.5, "11": 0.5 }
  fidelity: number;
  invariantViolated: string; // e.g. "G-1"
  explanation: string;
  hint?: string;
}

export interface AssessRequest {
  circuitModel: CircuitModel;
  challengeId: string;
  learnerId?: string;
}

export interface AssessResponse {
  passed: boolean;
  challengeId?: string;
  attemptId?: string;
  studentCircuit?: CircuitModel;
  targetCircuit?: CircuitModel;
  invariantsChecked: InvariantResult[];
  counterExample: CounterExample | null;
  feedback: string;
}

export const INVARIANT_DEFINITIONS: Record<
  string,
  { name: string; description: string; mathFormula: string }
> = {
  'G-1': {
    name: 'Entanglement Entropy',
    description:
      'Verifies subsystem von Neumann entropy S(ρ_A) > 0 for entangled states vs S = 0 for product states.',
    mathFormula: 'S(ρ_A) = -Tr(ρ_A log₂ ρ_A)',
  },
  'G-2': {
    name: 'Phase Observability',
    description:
      'Verifies phase interference in the Hadamard basis to detect missing relative phases.',
    mathFormula: 'H^(⊗n) |ψ⟩',
  },
  'G-3': {
    name: 'Unitary Reversibility',
    description: 'Verifies U†U |0...0⟩ = |0...0⟩ with fidelity ≥ 0.99.',
    mathFormula: 'F = |⟨0ⁿ| U†U |0ⁿ⟩|² ≥ 0.99',
  },
};

/**
 * Seeded student circuit that uses X + CNOT instead of H + CNOT for Bell state preparation.
 * Violates Invariant G-1 (Entanglement Entropy).
 */
export const DEMO_STUDENT_BELL_CIRCUIT: CircuitModel = {
  id: 'cm_student_bell_x_diverged',
  name: 'Student Attempt (X + CNOT)',
  qubitCount: 2,
  classicalBitCount: 2,
  operations: [
    { opId: 'op_s_1', gate: 'X', targets: [0], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_s_2', gate: 'CNOT', targets: [1], controls: [0], classicalTargets: [], column: 1 },
    { opId: 'op_s_3', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 2 },
    { opId: 'op_s_4', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 2 },
  ],
  source: 'BUILDER',
  openQasm3: 'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[2] q;\nbit[2] c;\nx q[0];\ncx q[0], q[1];\nc[0] = measure q[0];\nc[1] = measure q[1];\n',
  modelVersion: 1,
  ownerLearnerProfileId: 'lp_aarav',
  createdAt: '2026-09-29T12:00:00Z',
  updatedAt: '2026-09-29T12:00:00Z',
};

/**
 * Canonical target Bell state circuit (H + CNOT).
 */
export const DEMO_TARGET_BELL_CIRCUIT: CircuitModel = {
  id: 'cm_target_bell_correct',
  name: 'Target Circuit (Bell State |Φ+⟩)',
  qubitCount: 2,
  classicalBitCount: 2,
  operations: [
    { opId: 'op_t_1', gate: 'H', targets: [0], controls: [], classicalTargets: [], column: 0 },
    { opId: 'op_t_2', gate: 'CNOT', targets: [1], controls: [0], classicalTargets: [], column: 1 },
    { opId: 'op_t_3', gate: 'MEASURE', targets: [0], controls: [], classicalTargets: [0], column: 2 },
    { opId: 'op_t_4', gate: 'MEASURE', targets: [1], controls: [], classicalTargets: [1], column: 2 },
  ],
  source: 'SEED',
  openQasm3: 'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[2] q;\nbit[2] c;\nh q[0];\ncx q[0], q[1];\nc[0] = measure q[0];\nc[1] = measure q[1];\n',
  modelVersion: 1,
  ownerLearnerProfileId: null,
  createdAt: '2026-08-23T05:27:00Z',
  updatedAt: '2026-08-23T05:27:00Z',
};

/**
 * Pre-seeded Socratic Counterexample response for CH_BELL_ENTANGLE / demo attempt.
 * Conforms to docs/FEATURES-SPEC.md § 5.4, § 5.5, and § 5.7.
 */
export const DEFAULT_SOCRATIC_ASSESS_RESPONSE: AssessResponse = {
  passed: false,
  challengeId: 'CH_BELL_ENTANGLE',
  attemptId: 'att_demo_01',
  studentCircuit: DEMO_STUDENT_BELL_CIRCUIT,
  targetCircuit: DEMO_TARGET_BELL_CIRCUIT,
  invariantsChecked: [
    {
      invariantId: 'G-1',
      name: 'Entanglement Entropy',
      passed: false,
      value: 0.0,
      threshold: 1.0,
      details: 'Subsystem entropy S(ρ_A) = 0.00 (separable product state), expected S(ρ_A) = 1.00 (maximally entangled Bell state).',
    },
    {
      invariantId: 'G-2',
      name: 'Phase Observability',
      passed: true,
      details: 'Phase interference satisfies observable bounds.',
    },
    {
      invariantId: 'G-3',
      name: 'Unitary Reversibility',
      passed: true,
      value: 1.0,
      threshold: 0.99,
      details: 'U†U fidelity = 1.00 ≥ 0.99.',
    },
  ],
  counterExample: {
    inputState: '|+⟩',
    divergenceStep: 2,
    gateName: 'CNOT',
    studentOutput: '|11⟩ with P = 1.00',
    targetOutput: '(|00⟩ + |11⟩)/√2 (P = 0.50 each)',
    fidelity: 0.0,
    invariantViolated: 'G-1',
    explanation:
      'Your circuit produces a separable product state |11⟩. The target produces a Bell state with S(ρ_A) = 1.00 (max entangled). Measuring subsystem A of a Bell state yields random {0, 1} — yours gives deterministic |1⟩ every time.',
    hint: 'A Bell state requires creating an equal superposition on the control qubit before applying CNOT. Replace the Pauli-X gate on qubit 0 with a Hadamard (H) gate to allow constructive and destructive quantum interference.',
  },
  feedback:
    'G-1: Entanglement Entropy violated — your circuit produces separable product state |11⟩; target produces Bell state with S(ρ_A) = 1.00',
};

/**
 * Fetch counterexample assess data from backend with fallback support.
 */
export async function fetchAssessResult(
  attemptId?: string,
  challengeId?: string
): Promise<{ data: AssessResponse; isFallback: boolean }> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  if (attemptId && typeof window !== 'undefined') {
    try {
      const res = await fetch(`${apiBaseUrl}/v1/grading/assess/${encodeURIComponent(attemptId)}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        return { data: json, isFallback: false };
      }
    } catch {
      // Backend not running or endpoint not ready — use mock path
    }
  }

  // Fallback to deterministic pre-seeded counterexample
  return {
    data: {
      ...DEFAULT_SOCRATIC_ASSESS_RESPONSE,
      challengeId: challengeId || DEFAULT_SOCRATIC_ASSESS_RESPONSE.challengeId,
      attemptId: attemptId || DEFAULT_SOCRATIC_ASSESS_RESPONSE.attemptId,
    },
    isFallback: true,
  };
}
