# Contract: circuit-simulation                    version: 1

> OWNER: simulation-api · CONSUMERS: learning-ux, ai-pedagogy, fixtures-qa, story-ship
> Change ritual: edit → bump version + changelog → DECISIONS entry → ping consumers → THEN code.

## Common error

```json
{
  "error": {
    "code": "UNSUPPORTED_GATE",
    "message": "Gate RX is outside the prototype subset.",
    "requestId": "req_demo_001",
    "details": {"operationIndex": 2, "allowedGates": ["H", "X", "Y", "Z", "CNOT", "MEASURE"]}
  }
}
```

HTTP mapping: validation/unsupported `422` · missing `404` · timeout `504` · internal `500`. Stack traces never cross the boundary.

## POST /v1/circuits/parse-qiskit

Parses but never executes the frozen safe Qiskit subset.

REQUEST
```json
{
  "code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure([0, 1], [0, 1])",
  "modelVersion": 1
}
```
- `code`: string, 1–8000 chars; one `QuantumCircuit` symbol; only allowlisted AST nodes/calls.
- `modelVersion`: integer, exactly `1`.

RESPONSE 200
```json
{
  "circuitModel": {
    "id": "cm_parsed_req_demo_001",
    "name": "Parsed Qiskit Circuit",
    "qubitCount": 2,
    "classicalBitCount": 2,
    "operations": [
      {"opId": "op_1", "gate": "H", "targets": [0], "controls": [], "classicalTargets": [], "column": 0},
      {"opId": "op_2", "gate": "CNOT", "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
      {"opId": "op_3", "gate": "MEASURE", "targets": [0], "controls": [], "classicalTargets": [0], "column": 2},
      {"opId": "op_4", "gate": "MEASURE", "targets": [1], "controls": [], "classicalTargets": [1], "column": 2}
    ],
    "source": "SUPPORTED_QISKIT",
    "modelVersion": 1
  },
  "warnings": []
}
```

ERRORS: `422 UNSAFE_CODE` · `422 UNSUPPORTED_GATE` · `422 CIRCUIT_LIMIT_EXCEEDED` · `422 PARSE_ERROR`.

NOTES: no imports beyond the exact allowlist; no loops, functions, attributes beyond `qc.<gate>`, file/network access, dynamic values or `exec`.

## POST /v1/circuits/export-openqasm3

REQUEST
```json
{
  "circuitModel": {
    "id": "cm_bell_seed",
    "name": "Bell State Seed",
    "qubitCount": 2,
    "classicalBitCount": 2,
    "operations": [
      {"opId": "op_1", "gate": "H", "targets": [0], "controls": [], "classicalTargets": [], "column": 0},
      {"opId": "op_2", "gate": "CNOT", "targets": [1], "controls": [0], "classicalTargets": [], "column": 1}
    ],
    "source": "SEED",
    "modelVersion": 1
  }
}
```

RESPONSE 200
```json
{
  "openQasmVersion": "3.0",
  "openQasm3": "OPENQASM 3.0;\ninclude \"stdgates.inc\";\nqubit[2] q;\nh q[0];\ncx q[0], q[1];\n",
  "lossy": false,
  "warnings": []
}
```

ERRORS: `422 INVALID_CIRCUIT_MODEL` · `422 OPENQASM_EXPORT_UNSUPPORTED`.

## POST /v1/simulation-runs

REQUEST
```json
{
  "learnerProfileId": "lp_aarav",
  "moduleId": "mod_bell",
  "circuitModel": {
    "id": "cm_bell_seed",
    "name": "Bell State Seed",
    "qubitCount": 2,
    "classicalBitCount": 2,
    "operations": [
      {"opId": "op_1", "gate": "H", "targets": [0], "controls": [], "classicalTargets": [], "column": 0},
      {"opId": "op_2", "gate": "CNOT", "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
      {"opId": "op_3", "gate": "MEASURE", "targets": [0], "controls": [], "classicalTargets": [0], "column": 2},
      {"opId": "op_4", "gate": "MEASURE", "targets": [1], "controls": [], "classicalTargets": [1], "column": 2}
    ],
    "source": "BUILDER",
    "modelVersion": 1
  },
  "predictionResponse": {"checkpointId": "pc_bell_outcomes", "answer": "INDEPENDENT_RANDOM"},
  "primaryAdapter": "QISKIT_AER",
  "runConformance": true,
  "shots": 1024
}
```

RESPONSE 201
```json
{
  "simulationRun": {
    "id": "sr_demo_001",
    "learnerProfileId": "lp_aarav",
    "moduleId": "mod_bell",
    "circuitModelId": "cm_bell_seed",
    "adapter": "QISKIT_AER",
    "shots": 1024,
    "status": "SUCCEEDED",
    "probabilities": {"00": 0.5, "11": 0.5},
    "counts": {"00": 512, "11": 512},
    "stateTrace": [
      {
        "stepIndex": 0,
        "operationId": "op_1",
        "label": "After H",
        "basisProbabilities": {"00": 0.5, "10": 0.5},
        "amplitudes": {"00": {"re": 0.70710678, "im": 0.0}, "10": {"re": 0.70710678, "im": 0.0}},
        "reducedQubits": [
          {"qubit": 0, "bloch": {"x": 1.0, "y": 0.0, "z": 0.0}, "purity": 1.0, "label": "PURE_SUBSYSTEM"},
          {"qubit": 1, "bloch": {"x": 0.0, "y": 0.0, "z": 1.0}, "purity": 1.0, "label": "PURE_SUBSYSTEM"}
        ]
      },
      {
        "stepIndex": 1,
        "operationId": "op_2",
        "label": "After CNOT",
        "basisProbabilities": {"00": 0.5, "11": 0.5},
        "amplitudes": {"00": {"re": 0.70710678, "im": 0.0}, "11": {"re": 0.70710678, "im": 0.0}},
        "reducedQubits": [
          {"qubit": 0, "bloch": {"x": 0.0, "y": 0.0, "z": 0.0}, "purity": 0.5, "label": "MIXED_SUBSYSTEM"},
          {"qubit": 1, "bloch": {"x": 0.0, "y": 0.0, "z": 0.0}, "purity": 0.5, "label": "MIXED_SUBSYSTEM"}
        ]
      }
    ],
    "conformance": {"adapter": "PENNYLANE", "maxProbabilityDelta": 0.0, "epsilon": 0.000001, "passed": true, "skippedReason": null},
    "durationMs": 84,
    "createdAt": "2026-08-23T05:27:00Z"
  }
}
```

ERRORS: `404 LEARNER_NOT_FOUND` · `404 MODULE_NOT_FOUND` · `422 INVALID_CIRCUIT_MODEL` · `422 MEASUREMENT_MAPPING_INVALID` · `503 ADAPTER_UNAVAILABLE` · `504 SIMULATION_TIMEOUT`.

NOTES: synchronous P0 latency budget 1500ms for ≤5 qubits/≤20 operations; request ID provides idempotency for 60 seconds; primary response succeeds when PennyLane is disabled and sets a disclosed `skippedReason`.

## GET /v1/simulation-runs/{simulationRunId}

RESPONSE 200: the same `SimulationRun` shape returned above.

ERRORS: `404 SIMULATION_RUN_NOT_FOUND`.

## Types

```ts
type GateName = "H" | "X" | "Y" | "Z" | "CNOT" | "MEASURE";
type AdapterName = "QISKIT_AER" | "PENNYLANE";
type ComplexValue = { re: number; im: number };
type Operation = { opId: string; gate: GateName; targets: number[]; controls: number[]; classicalTargets: number[]; column: number };
type CircuitModel = { id: string; name: string; qubitCount: number; classicalBitCount: number; operations: Operation[]; source: "BUILDER" | "SUPPORTED_QISKIT" | "SEED"; modelVersion: 1 };
type ReducedQubit = { qubit: number; bloch: { x: number; y: number; z: number }; purity: number; label: "PURE_SUBSYSTEM" | "MIXED_SUBSYSTEM" };
type StateTraceStep = { stepIndex: number; operationId: string; label: string; basisProbabilities: Record<string, number>; amplitudes: Record<string, ComplexValue>; reducedQubits: ReducedQubit[] };
```

## Changelog

- v1 2026-08-23: initial Circuit Model, safe Qiskit parse, OpenQASM export and Simulation Run contract.