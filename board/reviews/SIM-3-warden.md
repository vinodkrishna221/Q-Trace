# Warden Review — SIM-3 — Execute Bell and normalize the State Trace

**Branch:** `feat/simulation-api/sim-3-execute-bell-and-normalize-the`
**Reviewer:** Warden (fresh session) · **Date:** 2026-08-25T16:31 IST
**Author:** Uday Rohit · **Card load:** 4h / timebox 4h
**Bar applied:** standard (P0 star card — highest value delivery so far)

---

## Checks

| # | Check | Result |
|---|---|---|
| 1 | Card match — all deliverables present | PASS |
| 2 | Contract fidelity — stateTrace/amplitude/reducedQubits shapes exact | PASS |
| 3 | Proof — TEST command run independently, 23/23 green (47/47 suite) | PASS |
| 4 | Ponytail audit — no unrequested abstractions, justified normalizer module | PASS |
| 5 | Demo-path safety — Bell probabilities verified, endianness normalized | PASS |
| 6 | File ownership — no cross-track edits | PASS |
| 7 | Hygiene — no secrets, no bare prints, pragma: no cover correct | PASS |
| 8 | quantum-runtime rules — all 10 rules verified (see detail notes) | PASS |

---

## TEST result (Warden-executed)

```
uv run --project apps/api --extra quantum --extra dev pytest apps/api/tests/unit/simulation/test_qiskit_bell_trace.py -v
```

```
============================= test session starts =============================
platform win32 -- Python 3.13.7, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\A. Uday Rohith\OneDrive\Desktop\q-trace\apps\api
configfile: pyproject.toml
collected 23 items

apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_probabilities_keys PASSED [  4%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_probabilities_values PASSED [  8%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_probabilities_sum_to_one PASSED [ 13%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_trace_length PASSED [ 17%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_trace_step_labels PASSED [ 21%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_trace_operation_ids PASSED [ 26%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_trace_step_indices PASSED [ 30%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_post_cnot_purity PASSED [ 34%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_post_cnot_mixed_label PASSED [ 39%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_after_h_basis_labels_are_big_endian PASSED [ 43%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_asymmetric_trace_label PASSED [ 47%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_asymmetric_post_x_pure PASSED [ 52%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_no_nan_infinity_amplitudes PASSED [ 56%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_normalizer_2qubit_index_0 PASSED [ 60%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_normalizer_2qubit_index_1 PASSED [ 65%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_normalizer_2qubit_index_2 PASSED [ 69%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_normalizer_2qubit_index_3 PASSED [ 73%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_normalizer_3qubit_index_1 PASSED [ 78%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_normalizer_3qubit_index_4 PASSED [ 82%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_normalize_counts_basic PASSED [ 86%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_normalize_counts_asymmetric PASSED [ 91%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_normalize_counts_with_spaces PASSED [ 95%]
apps/api/tests/unit/simulation/test_qiskit_bell_trace.py::test_bell_duration_positive PASSED [100%]

======================== 23 passed in 1.34s ==============================
```

Full cumulative suite: 47/47 passed, 1 benign deprecation warning, no regressions.

---

## Detail notes

- Pre-measurement statevector saved for State Trace; MEASURE gates excluded from trace loop (quantum-runtime.md rule enforced).
- Single tested normalizer function `qiskit_index_to_contract_label()` handles Qiskit LSB → contract MSB conversion at adapter boundary.
- Bell ideal probabilities {00: 0.5, 11: 0.5} verified; trace length=2; post-CNOT purity=0.5 MIXED_SUBSYSTEM — all match contract examples.
- Asymmetric fixture (X on q1) produces contract label "01" (not "10") — endianness trap confirmed absent.
- `_assert_finite()` guards every amplitude and probability; NaN/Infinity rejected.
- Qiskit imported AFTER CircuitModel validation (late import inside `run_qiskit_aer()`).
- `run_qiskit_aer()` is sync — threadpool wiring noted for SIM-4, not pre-loaded here.
- Zero cross-track file edits.

---

## Verdict

VERDICT: MERGE
23/23 card tests green (47/47 full suite); Bell probabilities {00:0.5, 11:0.5} exact;
trace length=2; post-CNOT purity=0.5 MIXED_SUBSYSTEM; asymmetric fixture labels correct;
endianness normalizer unit-tested; NaN/Infinity rejection active; pre-measurement save
confirmed; Qiskit late-imported; zero cross-track edits.

Do not merge the PR yourself. Hand off to Vinod (SHIP lead) to merge in DAG order.
Unblocked by this merge: SIM-4.
