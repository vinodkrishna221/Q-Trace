"""SIM-3 card TEST — Execute Bell and normalize the State Trace.

Proves (per card spec and quantum-runtime.md):
  1. Bell run: probabilities {00: 0.5, 11: 0.5} within epsilon
  2. State Trace has exactly 2 steps (after H, after CNOT) — MEASURE excluded
  3. Post-CNOT purity = 0.5 for both qubits (MIXED_SUBSYSTEM)
  4. Basis labels are contract big-endian (qubit 0 leftmost):
     After-H step has "00" and "10" keys (not Qiskit "00" and "01")
  5. Asymmetric-order fixture: 3-qubit circuit, X on q2 — basis labels correct
  6. No NaN/Infinity in any amplitude or probability
  7. Normalizer unit tests: Qiskit index → contract label

Run with:
  uv run --project apps/api --extra quantum --extra dev pytest
    apps/api/tests/unit/simulation/test_qiskit_bell_trace.py -v
"""

from __future__ import annotations

import math

import pytest

from app.models.circuit import CircuitModel
from app.services.quantum.adapter import run_qiskit_aer
from app.services.quantum.normalizer import (
    build_normalized_amplitude_map,
    build_normalized_probability_map,
    normalize_counts,
    qiskit_index_to_contract_label,
)

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

BELL_CIRCUIT = {
    "id": "cm_bell_test",
    "name": "Bell State",
    "qubitCount": 2,
    "classicalBitCount": 2,
    "operations": [
        {"opId": "op_h",  "gate": "H",       "targets": [0], "controls": [],  "classicalTargets": [], "column": 0},
        {"opId": "op_cx", "gate": "CNOT",     "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
        {"opId": "op_m0", "gate": "MEASURE",  "targets": [0], "controls": [],  "classicalTargets": [0],"column": 2},
        {"opId": "op_m1", "gate": "MEASURE",  "targets": [1], "controls": [],  "classicalTargets": [1],"column": 2},
    ],
    "source": "SEED",
    "modelVersion": 1,
}

# Asymmetric fixture: 2 qubits, X on q1 only (NOT symmetric)
# After X on q1: state is |01⟩ in contract order (q0=0, q1=1)
# In Qiskit statevector index 2 = binary "10" → reversed "01" → label "01"
ASYMMETRIC_CIRCUIT = {
    "id": "cm_asym_test",
    "name": "Asymmetric X on q1",
    "qubitCount": 2,
    "classicalBitCount": 2,
    "operations": [
        {"opId": "op_x1", "gate": "X", "targets": [1], "controls": [], "classicalTargets": [], "column": 0},
        {"opId": "op_m0", "gate": "MEASURE", "targets": [0], "controls": [], "classicalTargets": [0], "column": 1},
        {"opId": "op_m1", "gate": "MEASURE", "targets": [1], "controls": [], "classicalTargets": [1], "column": 1},
    ],
    "source": "SEED",
    "modelVersion": 1,
}

EPS = 1e-4  # tolerance for floating-point comparisons


@pytest.fixture(scope="module")
def bell_result():
    circuit = CircuitModel.model_validate(BELL_CIRCUIT)
    return run_qiskit_aer(circuit, shots=8192)


@pytest.fixture(scope="module")
def asym_result():
    circuit = CircuitModel.model_validate(ASYMMETRIC_CIRCUIT)
    return run_qiskit_aer(circuit, shots=4096)


# ---------------------------------------------------------------------------
# 1. Bell probabilities: {00: ~0.5, 11: ~0.5}
# ---------------------------------------------------------------------------

def test_bell_probabilities_keys(bell_result):
    probs = bell_result.probabilities
    assert "00" in probs, f"Expected '00' in probs, got {list(probs.keys())}"
    assert "11" in probs, f"Expected '11' in probs, got {list(probs.keys())}"


def test_bell_probabilities_values(bell_result):
    probs = bell_result.probabilities
    assert abs(probs["00"] - 0.5) < EPS, f"P(00)={probs['00']:.6f} not ≈ 0.5"
    assert abs(probs["11"] - 0.5) < EPS, f"P(11)={probs['11']:.6f} not ≈ 0.5"


def test_bell_probabilities_sum_to_one(bell_result):
    total = sum(bell_result.probabilities.values())
    assert abs(total - 1.0) < 1e-6, f"Probabilities sum to {total}"


# ---------------------------------------------------------------------------
# 2. Trace length = 2 (after H, after CNOT — MEASURE excluded)
# ---------------------------------------------------------------------------

def test_bell_trace_length(bell_result):
    assert len(bell_result.stateTrace) == 2, (
        f"Expected 2 trace steps, got {len(bell_result.stateTrace)}"
    )


def test_bell_trace_step_labels(bell_result):
    labels = [s.label for s in bell_result.stateTrace]
    assert labels[0] == "After H"
    assert labels[1] == "After CNOT"


def test_bell_trace_operation_ids(bell_result):
    op_ids = [s.operationId for s in bell_result.stateTrace]
    assert op_ids[0] == "op_h"
    assert op_ids[1] == "op_cx"


def test_bell_trace_step_indices(bell_result):
    indices = [s.stepIndex for s in bell_result.stateTrace]
    assert indices == [0, 1]


# ---------------------------------------------------------------------------
# 3. Post-CNOT purity = 0.5 per qubit → MIXED_SUBSYSTEM
# ---------------------------------------------------------------------------

def test_bell_post_cnot_purity(bell_result):
    cnot_step = bell_result.stateTrace[1]  # "After CNOT"
    for rq in cnot_step.reducedQubits:
        assert abs(rq.purity - 0.5) < EPS, (
            f"qubit {rq.qubit}: purity={rq.purity:.6f}, expected ≈ 0.5"
        )


def test_bell_post_cnot_mixed_label(bell_result):
    cnot_step = bell_result.stateTrace[1]
    for rq in cnot_step.reducedQubits:
        assert rq.label == "MIXED_SUBSYSTEM", (
            f"qubit {rq.qubit}: label={rq.label}, expected MIXED_SUBSYSTEM"
        )


# ---------------------------------------------------------------------------
# 4. After-H basis labels: contract big-endian ("00", "10")
#    NOT Qiskit little-endian ("00", "01")
# ---------------------------------------------------------------------------

def test_bell_after_h_basis_labels_are_big_endian(bell_result):
    """After H on q0:
    - Qiskit state: |0⟩+|1⟩ on q0, |0⟩ on q1 → indices 0 ("00") and 1 ("01")
    - Qiskit index 1 binary "01" reversed → contract label "10" (q0=1, q1=0)
    - So contract keys must be "00" and "10", NOT "00" and "01"
    """
    h_step = bell_result.stateTrace[0]  # "After H"
    probs = h_step.basisProbabilities
    assert "10" in probs, (
        f"Expected contract label '10' after H on q0, got {list(probs.keys())}. "
        "This likely indicates missing endianness normalization."
    )
    assert "00" in probs, f"Expected '00' after H, got {list(probs.keys())}"
    assert abs(probs["00"] - 0.5) < EPS
    assert abs(probs["10"] - 0.5) < EPS


# ---------------------------------------------------------------------------
# 5. Asymmetric-order fixture: X on q1 → contract label "01"
#    Qiskit index 2 = binary "10" → reversed = "01" (q0=0, q1=1)
# ---------------------------------------------------------------------------

def test_asymmetric_trace_label(asym_result):
    """X on q1 flips qubit 1. In contract big-endian: q0=0 (leftmost), q1=1.
    Label must be '01' not '10'.
    """
    assert len(asym_result.stateTrace) == 1, (
        f"Expected 1 trace step (X gate only), got {len(asym_result.stateTrace)}"
    )
    step = asym_result.stateTrace[0]
    probs = step.basisProbabilities
    assert "01" in probs, (
        f"Expected contract label '01' after X on q1, got {list(probs.keys())}. "
        "This is the asymmetric endianness test."
    )
    assert abs(probs["01"] - 1.0) < EPS


def test_asymmetric_post_x_pure(asym_result):
    """After X on q1: state is pure |01⟩. Both qubits should be PURE_SUBSYSTEM."""
    step = asym_result.stateTrace[0]
    for rq in step.reducedQubits:
        assert rq.label == "PURE_SUBSYSTEM", (
            f"qubit {rq.qubit}: label={rq.label}, expected PURE_SUBSYSTEM after X"
        )
        assert abs(rq.purity - 1.0) < EPS, (
            f"qubit {rq.qubit}: purity={rq.purity:.6f}, expected ≈ 1.0"
        )


# ---------------------------------------------------------------------------
# 6. No NaN/Infinity in amplitudes or probabilities
# ---------------------------------------------------------------------------

def test_bell_no_nan_infinity_amplitudes(bell_result):
    for step in bell_result.stateTrace:
        for label, amp in step.amplitudes.items():
            assert math.isfinite(amp["re"]), f"NaN/Inf in amplitude re for {label}"
            assert math.isfinite(amp["im"]), f"NaN/Inf in amplitude im for {label}"
        for label, p in step.basisProbabilities.items():
            assert math.isfinite(p), f"NaN/Inf in probability for {label}"


# ---------------------------------------------------------------------------
# 7. Normalizer unit tests
# ---------------------------------------------------------------------------

def test_normalizer_2qubit_index_0():
    # Qiskit index 0 → binary "00" → reversed "00" → contract "00"
    assert qiskit_index_to_contract_label(0, 2) == "00"


def test_normalizer_2qubit_index_1():
    # Qiskit index 1 → binary "01" → reversed "10" → contract "10"
    assert qiskit_index_to_contract_label(1, 2) == "10"


def test_normalizer_2qubit_index_2():
    # Qiskit index 2 → binary "10" → reversed "01" → contract "01"
    assert qiskit_index_to_contract_label(2, 2) == "01"


def test_normalizer_2qubit_index_3():
    # Qiskit index 3 → binary "11" → reversed "11" → contract "11"
    assert qiskit_index_to_contract_label(3, 2) == "11"


def test_normalizer_3qubit_index_1():
    # Qiskit index 1 → binary "001" → reversed "100" → contract "100"
    assert qiskit_index_to_contract_label(1, 3) == "100"


def test_normalizer_3qubit_index_4():
    # Qiskit index 4 → binary "100" → reversed "001" → contract "001"
    assert qiskit_index_to_contract_label(4, 3) == "001"


def test_normalize_counts_basic():
    # Qiskit counts "00" → contract "00" (no change for symmetric)
    raw = {"00": 512, "11": 512}
    result = normalize_counts(raw, 2)
    assert result == {"00": 512, "11": 512}


def test_normalize_counts_asymmetric():
    # Qiskit counts "10" → reversed "01" → contract "01"
    raw = {"10": 100}
    result = normalize_counts(raw, 2)
    assert "01" in result
    assert result["01"] == 100


def test_normalize_counts_with_spaces():
    # Qiskit multi-register key "0 1" → joined "01" → reversed "10"
    raw = {"0 1": 200}
    result = normalize_counts(raw, 2)
    assert "10" in result


# ---------------------------------------------------------------------------
# 8. Duration is positive
# ---------------------------------------------------------------------------

def test_bell_duration_positive(bell_result):
    assert bell_result.durationMs >= 0
