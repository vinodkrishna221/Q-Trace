# Warden Review — SIM-2 — Validate the canonical Circuit Model

**Branch:** `feat/simulation-api/sim-2-validate-the-canonical-circuit-model`  
**Reviewer:** Warden (fresh session) · **Date:** 2026-08-25T16:14 IST  
**Author:** Uday Rohit · **Card load:** 2h / timebox 2h  
**Bar applied:** standard (Phase 0 Skeleton, pure model validation)

---

## Checks

| # | Check | Result |
|---|---|---|
| 1 | Card match — all deliverables present | PASS |
| 2 | Contract fidelity — types & fields match circuit-simulation.md exact | PASS |
| 3 | Proof — TEST command run independently, 17/17 green (24/24 suite) | PASS |
| 4 | Ponytail audit — no unrequested abstractions, pure Pydantic v2 | PASS |
| 5 | Demo-path safety — physical invariants enforced, zero blank states | PASS |
| 6 | File ownership — no cross-track edits | PASS |
| 7 | Hygiene — no secrets, no bare prints, no dead code | PASS |
| 8 | quantum-runtime rules — zero premature quantum SDK imports | PASS |

---

## TEST result (Warden-executed)

```
uv run --project apps/api pytest apps/api/tests/unit/simulation/test_circuit_model.py -v
```

```
============================= test session starts =============================
platform win32 -- Python 3.13.7, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\A. Uday Rohith\OneDrive\Desktop\q-trace\apps\api
configfile: pyproject.toml
collected 17 items

apps/api/tests/unit/simulation/test_circuit_model.py::test_accepts_bell_circuit PASSED [  5%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_accepts_all_supported_single_qubit_gates PASSED [ 11%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_gate_rx PASSED [ 17%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_gate_ry PASSED [ 23%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_six_qubits PASSED [ 29%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_one_qubit PASSED [ 35%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_accepts_qubit_count_5 PASSED [ 41%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_duplicate_op_ids PASSED [ 47%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_cnot_control_equals_target PASSED [ 52%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_cnot_missing_control PASSED [ 58%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_target_qubit_out_of_bounds PASSED [ 64%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_control_qubit_out_of_bounds PASSED [ 70%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_measure_mismatched_classical_targets PASSED [ 76%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_h_with_classical_targets PASSED [ 82%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_rejects_out_of_column_order PASSED [ 88%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_gate_name_enum_values PASSED [ 94%]
apps/api/tests/unit/simulation/test_circuit_model.py::test_operation_rejects_negative_qubit_index PASSED [100%]

============================= 17 passed in 0.17s ==============================
```

---

## Detail notes

- `CircuitModel` and `Operation` Pydantic v2 types match `board/contracts/circuit-simulation.md` field-for-field.
- Closed `GateName` enum contains exactly H, X, Y, Z, CNOT, MEASURE.
- Validators enforce prototype limits (2–5 qubits, <=20 ops), unique op IDs, boundary checks, CNOT/MEASURE semantics, and ascending column order.
- Zero SDK imports anywhere in `apps/api/app/models/circuit.py`.
- No cross-track file edits.

---

## Verdict

VERDICT: MERGE
17/17 card tests green (24/24 suite green); CircuitModel Pydantic v2 schema matches
contract 1:1 with zero premature SDK imports; bounds, duplicate op IDs, and physical
invariants enforced.

Do not merge the PR yourself. Hand off to Vinod (SHIP lead) to merge in DAG order.
Unblocked by this merge: SIM-3.
