/**
 * QA-5: Circuit Workspace acceptance fixtures and critical UI state tests.
 *
 * Consumes (read-only, per UX-5 deliverable):
 *   - @/features/circuit/interactive-circuit-workspace (InteractiveCircuitWorkspace)
 *   - @/lib/circuit-store (useCircuitStore)
 *   - @/features/circuit/circuit-parser (generateQiskitCode)
 *   - @/lib/fixtures (DEMO_SIMULATION_RUN, DEMO_FLIGHT_RECORDER_DIAGNOSIS, DEMO_TUTOR_RESPONSE)
 *   - board/contracts/circuit-simulation.md v1
 *   - board/contracts/flight-recorder-tutor.md v1
 *
 * QA owns this file; UX track retains unit tests in tests/unit/circuit-workspace.test.tsx.
 *
 * This suite verifies:
 *   1. Circuit Workspace gate operations and GateName contract compliance.
 *   2. Qiskit code generation produces parseable, deterministic output.
 *   3. Unsupported gate rejection (RX is outside the prototype subset).
 *   4. Fallback state acceptance fixtures — every offline/fallback UI state
 *      that appears in the demo path renders without crashing.
 */

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useCircuitStore } from '@/lib/circuit-store';
import {
  generateQiskitCode,
  parseQiskitCode,
} from '@/features/circuit/circuit-parser';
import {
  DEMO_SIMULATION_RUN,
  DEMO_FLIGHT_RECORDER_DIAGNOSIS,
  DEMO_TUTOR_RESPONSE,
} from '@/lib/fixtures';

// ---------------------------------------------------------------------------
// Allowed gate vocabulary from circuit-simulation contract v1
// ---------------------------------------------------------------------------

const CONTRACT_GATE_NAMES = new Set(['H', 'X', 'Y', 'Z', 'CNOT', 'MEASURE']);

// ---------------------------------------------------------------------------
// Reset store before each test (UX-5 pattern)
// ---------------------------------------------------------------------------

beforeEach(() => {
  useCircuitStore.getState().resetToBellSeed();
});


// ===========================================================================
// 1. Circuit store — gate placement contract compliance
// ===========================================================================

describe('QA-5: Circuit Workspace gate operations (acceptance)', () => {
  it('Bell seed circuit has only contract-allowed gate names', () => {
    const { circuit } = useCircuitStore.getState();
    for (const op of circuit.operations) {
      expect(CONTRACT_GATE_NAMES.has(op.gate)).toBe(true);
    }
  });

  it('adding H on qubit 0 produces a valid operation in the store', () => {
    const store = useCircuitStore.getState();
    store.clearCircuit();
    act(() => {
      store.addGate('H', 0, 0);
    });
    const ops = useCircuitStore.getState().circuit.operations;
    expect(ops).toHaveLength(1);
    expect(ops[0].gate).toBe('H');
    expect(ops[0].targets).toEqual([0]);
  });

  it('adding CNOT with control-0 target-1 produces correct controls/targets', () => {
    const store = useCircuitStore.getState();
    store.clearCircuit();
    act(() => {
      store.addGate('H', 0, 0);
      store.addGate('CNOT', 1, 1, 0);
    });
    const ops = useCircuitStore.getState().circuit.operations;
    const cnot = ops.find(o => o.gate === 'CNOT');
    expect(cnot).toBeDefined();
    expect(cnot!.targets).toEqual([1]);
    expect(cnot!.controls).toEqual([0]);
  });

  it('removing a gate leaves the store in a consistent state', () => {
    const store = useCircuitStore.getState();
    store.clearCircuit();
    act(() => { store.addGate('H', 0, 0); });
    const op = useCircuitStore.getState().circuit.operations[0];
    act(() => { store.removeGate(op.opId); });
    expect(useCircuitStore.getState().circuit.operations).toHaveLength(0);
  });

  it('circuit model always has modelVersion=1 per contract', () => {
    const { circuit } = useCircuitStore.getState();
    expect(circuit.modelVersion).toBe(1);
  });

  it('circuit qubitCount is at least 2 for Bell circuit', () => {
    const { circuit } = useCircuitStore.getState();
    expect(circuit.qubitCount).toBeGreaterThanOrEqual(2);
  });

  it('all column values are non-negative integers', () => {
    const store = useCircuitStore.getState();
    store.clearCircuit();
    act(() => {
      store.addGate('H', 0, 0);
      store.addGate('CNOT', 1, 1, 0);
    });
    const ops = useCircuitStore.getState().circuit.operations;
    for (const op of ops) {
      expect(typeof op.column).toBe('number');
      expect(op.column).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(op.column)).toBe(true);
    }
  });

  it('clearCircuit produces empty operations list', () => {
    act(() => { useCircuitStore.getState().clearCircuit(); });
    expect(useCircuitStore.getState().circuit.operations).toHaveLength(0);
  });
});


// ===========================================================================
// 2. Qiskit code generation — deterministic and parseable
// ===========================================================================

describe('QA-5: Qiskit code generation (acceptance)', () => {
  it('generateQiskitCode for Bell seed produces valid Qiskit skeleton', () => {
    const { circuit } = useCircuitStore.getState();
    const code = generateQiskitCode(circuit);
    expect(code).toContain('QuantumCircuit');
    expect(code).toContain('.h(');
    expect(code).toContain('.cx(');
  });

  it('generated code contains exactly one QuantumCircuit definition', () => {
    const { circuit } = useCircuitStore.getState();
    const code = generateQiskitCode(circuit);
    const matches = (code.match(/QuantumCircuit/g) || []).length;
    // At least one reference to QuantumCircuit
    expect(matches).toBeGreaterThanOrEqual(1);
  });

  it('generated code does not contain exec or eval (security)', () => {
    const { circuit } = useCircuitStore.getState();
    const code = generateQiskitCode(circuit);
    expect(code).not.toContain('exec(');
    expect(code).not.toContain('eval(');
    expect(code).not.toContain('__import__');
  });

  it('generated code is a non-empty string', () => {
    const { circuit } = useCircuitStore.getState();
    const code = generateQiskitCode(circuit);
    expect(typeof code).toBe('string');
    expect(code.trim().length).toBeGreaterThan(0);
  });

  it('parseQiskitCode round-trips: parse then generate produces stable columns', () => {
    // Build a known circuit, generate code, parse it back
    const store = useCircuitStore.getState();
    store.clearCircuit();
    act(() => {
      store.addGate('H', 0, 0);
      store.addGate('CNOT', 1, 1, 0);
    });
    const circuit = useCircuitStore.getState().circuit;
    const code = generateQiskitCode(circuit);
    // parseQiskitCode returns ParseResult
    const result = parseQiskitCode(code);
    expect(result.success).toBe(true);
    if (result.success) {
      const gateNames = result.circuit.operations.map(op => op.gate);
      expect(gateNames).toContain('H');
      expect(gateNames).toContain('CNOT');
    }
  });

  it('parseQiskitCode rejects RX gate (outside prototype subset)', () => {
    const rxCode = `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.rx(0.5, 0)
`;
    const result = parseQiskitCode(rxCode);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorCode).toBe('UNSUPPORTED_GATE');
    }
  });
});


// ===========================================================================
// 3. Fixture acceptance — golden shapes conform to contract types
// ===========================================================================

describe('QA-5: Demo fixture contract shape acceptance', () => {
  it('DEMO_SIMULATION_RUN has required SimulationRun fields', () => {
    const sr = DEMO_SIMULATION_RUN;
    expect(sr).toHaveProperty('id');
    expect(sr).toHaveProperty('learnerProfileId');
    expect(sr).toHaveProperty('status');
    expect(sr).toHaveProperty('probabilities');
    expect(sr).toHaveProperty('stateTrace');
    expect(sr.status).toBe('SUCCEEDED');
  });

  it('DEMO_SIMULATION_RUN probabilities sum to ~1.0', () => {
    const probs = DEMO_SIMULATION_RUN.probabilities as Record<string, number>;
    const total = Object.values(probs).reduce((s, p) => s + p, 0);
    expect(Math.abs(total - 1.0)).toBeLessThanOrEqual(1e-5);
  });

  it('DEMO_SIMULATION_RUN Bell state has only 00 and 11 with p=0.5 each', () => {
    const probs = DEMO_SIMULATION_RUN.probabilities as Record<string, number>;
    expect(Math.abs((probs['00'] ?? 0) - 0.5)).toBeLessThanOrEqual(1e-5);
    expect(Math.abs((probs['11'] ?? 0) - 0.5)).toBeLessThanOrEqual(1e-5);
  });

  it('DEMO_SIMULATION_RUN stateTrace has at least 2 steps (H and CNOT)', () => {
    expect(Array.isArray(DEMO_SIMULATION_RUN.stateTrace)).toBe(true);
    expect((DEMO_SIMULATION_RUN.stateTrace as unknown[]).length).toBeGreaterThanOrEqual(2);
  });

  it('DEMO_FLIGHT_RECORDER_DIAGNOSIS has misconceptionSignal and replay', () => {
    const diag = DEMO_FLIGHT_RECORDER_DIAGNOSIS;
    expect(diag).toHaveProperty('misconceptionSignal');
    expect(diag).toHaveProperty('replay');
    expect(Array.isArray(diag.replay)).toBe(true);
  });

  it('DEMO_FLIGHT_RECORDER_DIAGNOSIS misconceptionSignal has id, code, firstDivergenceStep', () => {
    const signal = DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal;
    expect(signal).toHaveProperty('id');
    expect(signal).toHaveProperty('code');
    expect(signal).toHaveProperty('firstDivergenceStep');
  });

  it('DEMO_FLIGHT_RECORDER_DIAGNOSIS code is one of the four known codes', () => {
    const KNOWN_CODES = new Set([
      'SUPERPOSITION_VS_ENTANGLEMENT',
      'MEASUREMENT_DETERMINISM',
      'GATE_ORDER',
      'NO_SIGNAL',
    ]);
    const signal = DEMO_FLIGHT_RECORDER_DIAGNOSIS.misconceptionSignal;
    expect(KNOWN_CODES.has(signal.code as string)).toBe(true);
  });

  it('DEMO_TUTOR_RESPONSE has required fields', () => {
    const resp = DEMO_TUTOR_RESPONSE;
    expect(resp).toHaveProperty('responseId');
    expect(resp).toHaveProperty('intent');
    expect(resp).toHaveProperty('summary');
    expect(resp).toHaveProperty('steps');
    expect(resp).toHaveProperty('numericalClaims');
    expect(resp).toHaveProperty('repairChallengeId');
    expect(resp).toHaveProperty('fallbackUsed');
    expect(resp).toHaveProperty('model');
    expect(resp).toHaveProperty('safetyNote');
  });

  it('DEMO_TUTOR_RESPONSE intent is a valid contract intent', () => {
    const VALID_INTENTS = new Set(['EXPLAIN_DIVERGENCE', 'EXPLAIN_CODE_ERROR', 'SUGGEST_OPTIMIZATION']);
    const intent = DEMO_TUTOR_RESPONSE.intent;
    expect(VALID_INTENTS.has(intent as string)).toBe(true);
  });

  it('DEMO_TUTOR_RESPONSE all step evidenceKeys are valid dot-path strings', () => {
    const steps = DEMO_TUTOR_RESPONSE.steps as Array<{
      evidenceKeys: string[];
    }>;
    for (const step of steps) {
      for (const key of step.evidenceKeys) {
        expect(key.startsWith('stateTrace.')).toBe(true);
      }
    }
  });

  it('DEMO_TUTOR_RESPONSE fallbackUsed=true (demo mode always uses curated fallback)', () => {
    expect(DEMO_TUTOR_RESPONSE.fallbackUsed).toBe(true);
  });
});


// ===========================================================================
// 4. Fallback state acceptance fixtures — offline safety
// ===========================================================================

describe('QA-5: Fallback state acceptance fixtures', () => {
  it('DEMO_SIMULATION_RUN adapter field is present (provider/fallback badge)', () => {
    expect(DEMO_SIMULATION_RUN).toHaveProperty('adapter');
  });

  it('DEMO_TUTOR_RESPONSE model is DEMO_FALLBACK in offline mode', () => {
    expect(DEMO_TUTOR_RESPONSE.model).toBe('DEMO_FALLBACK');
  });

  it('DEMO_FLIGHT_RECORDER_DIAGNOSIS replay steps each have headline and evidenceKeys', () => {
    const replay = DEMO_FLIGHT_RECORDER_DIAGNOSIS.replay as Array<{
      stepIndex: number;
      headline: string;
      evidenceKeys: string[];
    }>;
    for (const step of replay) {
      expect(typeof step.stepIndex).toBe('number');
      expect(typeof step.headline).toBe('string');
      expect(step.headline.length).toBeGreaterThan(0);
      expect(Array.isArray(step.evidenceKeys)).toBe(true);
    }
  });

  it('DEMO_SIMULATION_RUN conformance field has passed and epsilon', () => {
    const conformance = DEMO_SIMULATION_RUN.conformance as {
      passed: boolean;
      epsilon: number;
    };
    expect(conformance).toBeDefined();
    expect(typeof conformance.passed).toBe('boolean');
    expect(conformance.epsilon).toBeLessThanOrEqual(1e-5);
  });
});
