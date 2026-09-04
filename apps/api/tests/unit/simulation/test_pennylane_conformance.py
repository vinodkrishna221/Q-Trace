"""Tests for PennyLane conformance adapter — SIM-6.

Card test command:
  uv run --project apps/api pytest apps/api/tests/unit/simulation/test_pennylane_conformance.py

Coverage requirements (from mission card):
  1. Bell fixture passes conformance (|delta| <= 1e-6 for all basis probabilities).
  2. Asymmetric fixture passes conformance (H on qubit 1 only — guards endianness).
  3. Deliberately reversed basis mapping FAILS (delta > epsilon → passed=False).
  4. runConformance=False in simulation_service returns skippedReason stub.
  5. runConformance=True in simulation_service returns live conformance result.
  6. Circuit with only MEASURE (no gates) is handled gracefully.
  7. skipped_reason is None when conformance passes.

QA-1 is not merged — mock path per mission:
  Use internal test objects (Bell + asymmetric). Do NOT touch tests/fixtures/golden/.
"""

from __future__ import annotations

import math

import pytest

from app.models.circuit import CircuitModel, GateName, Operation
from app.services.quantum.pennylane_adapter import (
    PennyLaneConformanceResult,
    _pennylane_index_to_contract_label,
    run_pennylane_conformance,
)

# ---------------------------------------------------------------------------
# Helpers — shared inline fixtures (QA-1 mock path)
# ---------------------------------------------------------------------------

BELL_CIRCUIT = CircuitModel(
    id="cm_bell_test",
    name="Bell State",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        Operation(opId="op_1", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
        Operation(opId="op_2", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=1),
        Operation(opId="op_3", gate=GateName.MEASURE, targets=[0], controls=[], classicalTargets=[0], column=2),
        Operation(opId="op_4", gate=GateName.MEASURE, targets=[1], controls=[], classicalTargets=[1], column=2),
    ],
    source="SEED",
    modelVersion=1,
)

# Asymmetric: H on qubit-1 only → ideal state |+0⟩ → probs: "01"=0.5, "00"=0.5
# Contract label: qubit-0 leftmost. qubit-0=0, qubit-1=0 or 1.
# After H on qubit-1: |ψ⟩ = |0⟩|+⟩ = 0.5*|00⟩ + 0.5*|01⟩
# Contract labels: "00"=0.5, "01"=0.5 (qubit-0 left)
ASYMMETRIC_CIRCUIT = CircuitModel(
    id="cm_asym_test",
    name="Asymmetric H on q1",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        Operation(opId="op_1", gate=GateName.H, targets=[1], controls=[], classicalTargets=[], column=0),
        Operation(opId="op_2", gate=GateName.MEASURE, targets=[0], controls=[], classicalTargets=[0], column=1),
        Operation(opId="op_3", gate=GateName.MEASURE, targets=[1], controls=[], classicalTargets=[1], column=1),
    ],
    source="SEED",
    modelVersion=1,
)

# Ideal Qiskit probabilities for Bell — contract labels
BELL_QISKIT_PROBS = {"00": 0.5, "11": 0.5}

# Ideal Qiskit probabilities for asymmetric (H on q1)
ASYM_QISKIT_PROBS = {"00": 0.5, "01": 0.5}

# Deliberately reversed mapping — simulate a buggy Qiskit result with swapped labels
# (00↔11 reversal on Bell) — should cause conformance to FAIL
BELL_REVERSED_PROBS = {"00": 0.5, "11": 0.5}   # note: same as correct for Bell (symmetric)
# Use an asymmetric reversed map that will actually differ from PennyLane
ASYM_REVERSED_PROBS = {"10": 0.5, "11": 0.5}   # deliberately wrong — PL sees 00/01


# ---------------------------------------------------------------------------
# Tests — _pennylane_index_to_contract_label
# ---------------------------------------------------------------------------

class TestPennyLaneIndexToContractLabel:
    """PennyLane index → contract label mapping.

    PennyLane default.qubit: wire 0 = MSB of index.
    Contract: qubit-0 leftmost.
    So PennyLane index 0 → "00", index 1 → "01", index 2 → "10", index 3 → "11".
    This matches the contract directly (no reversal needed unlike Qiskit).
    """

    def test_2q_index_0(self):
        assert _pennylane_index_to_contract_label(0, 2) == "00"

    def test_2q_index_1(self):
        assert _pennylane_index_to_contract_label(1, 2) == "01"

    def test_2q_index_2(self):
        assert _pennylane_index_to_contract_label(2, 2) == "10"

    def test_2q_index_3(self):
        assert _pennylane_index_to_contract_label(3, 2) == "11"

    def test_3q_index_5(self):
        # 5 = 101 binary → "101"
        assert _pennylane_index_to_contract_label(5, 3) == "101"

    def test_3q_index_0(self):
        assert _pennylane_index_to_contract_label(0, 3) == "000"


# ---------------------------------------------------------------------------
# Tests — run_pennylane_conformance: Bell fixture
# ---------------------------------------------------------------------------

class TestBellConformance:
    """Bell circuit: both adapters must agree within epsilon."""

    def test_bell_passes(self):
        result = run_pennylane_conformance(BELL_CIRCUIT, BELL_QISKIT_PROBS)
        assert isinstance(result, PennyLaneConformanceResult)
        assert result.passed is True, (
            f"Bell conformance failed. maxDelta={result.max_probability_delta}"
        )

    def test_bell_max_delta_within_epsilon(self):
        result = run_pennylane_conformance(BELL_CIRCUIT, BELL_QISKIT_PROBS)
        assert result.max_probability_delta <= result.epsilon

    def test_bell_skipped_reason_is_none_when_passed(self):
        result = run_pennylane_conformance(BELL_CIRCUIT, BELL_QISKIT_PROBS)
        assert result.skipped_reason is None

    def test_bell_pl_probs_sum_to_one(self):
        result = run_pennylane_conformance(BELL_CIRCUIT, BELL_QISKIT_PROBS)
        total = sum(result.pl_probabilities.values())
        assert abs(total - 1.0) < 1e-6

    def test_bell_pl_probs_correct_labels(self):
        """PennyLane Bell result must have keys '00' and '11' only."""
        result = run_pennylane_conformance(BELL_CIRCUIT, BELL_QISKIT_PROBS)
        assert set(result.pl_probabilities.keys()) == {"00", "11"}

    def test_bell_epsilon_is_1e_minus_6(self):
        result = run_pennylane_conformance(BELL_CIRCUIT, BELL_QISKIT_PROBS)
        assert result.epsilon == 1e-6

    def test_bell_all_pl_probs_finite(self):
        result = run_pennylane_conformance(BELL_CIRCUIT, BELL_QISKIT_PROBS)
        for label, p in result.pl_probabilities.items():
            assert math.isfinite(p), f"Non-finite probability at {label}: {p}"

    def test_bell_all_pl_probs_in_range(self):
        result = run_pennylane_conformance(BELL_CIRCUIT, BELL_QISKIT_PROBS)
        for label, p in result.pl_probabilities.items():
            assert 0.0 <= p <= 1.0 + 1e-10, f"Probability out of range at {label}: {p}"


# ---------------------------------------------------------------------------
# Tests — run_pennylane_conformance: asymmetric fixture (endianness guard)
# ---------------------------------------------------------------------------

class TestAsymmetricConformance:
    """H on qubit-1 only — asymmetric circuit guards the endianness mapping."""

    def test_asymmetric_passes(self):
        result = run_pennylane_conformance(ASYMMETRIC_CIRCUIT, ASYM_QISKIT_PROBS)
        assert result.passed is True, (
            f"Asymmetric conformance failed. maxDelta={result.max_probability_delta}, "
            f"pl_probs={result.pl_probabilities}"
        )

    def test_asymmetric_max_delta_within_epsilon(self):
        result = run_pennylane_conformance(ASYMMETRIC_CIRCUIT, ASYM_QISKIT_PROBS)
        assert result.max_probability_delta <= result.epsilon

    def test_asymmetric_pl_probs_correct_labels(self):
        """PennyLane asymmetric result: '00' and '01' (H on q1 → q0 stays 0)."""
        result = run_pennylane_conformance(ASYMMETRIC_CIRCUIT, ASYM_QISKIT_PROBS)
        assert set(result.pl_probabilities.keys()) == {"00", "01"}

    def test_asymmetric_skipped_reason_is_none(self):
        result = run_pennylane_conformance(ASYMMETRIC_CIRCUIT, ASYM_QISKIT_PROBS)
        assert result.skipped_reason is None


# ---------------------------------------------------------------------------
# Tests — deliberately reversed basis mapping FAILS
# ---------------------------------------------------------------------------

class TestReversedBasisFails:
    """A buggy Qiskit result with wrong basis mapping must cause passed=False."""

    def test_reversed_asymmetric_fails(self):
        """Swap the expected labels so PennyLane ('00','01') disagrees with
        the supplied Qiskit map ('10','11'). Delta must exceed epsilon."""
        result = run_pennylane_conformance(ASYMMETRIC_CIRCUIT, ASYM_REVERSED_PROBS)
        assert result.passed is False, (
            "Expected conformance to FAIL with a deliberately reversed basis mapping "
            f"but it passed. maxDelta={result.max_probability_delta}"
        )

    def test_reversed_max_delta_exceeds_epsilon(self):
        result = run_pennylane_conformance(ASYMMETRIC_CIRCUIT, ASYM_REVERSED_PROBS)
        assert result.max_probability_delta > result.epsilon

    def test_reversed_skipped_reason_is_none_on_failure(self):
        """A conformance *failure* still ran — skipped_reason must be None."""
        result = run_pennylane_conformance(ASYMMETRIC_CIRCUIT, ASYM_REVERSED_PROBS)
        assert result.skipped_reason is None


# ---------------------------------------------------------------------------
# Tests — simulation_service.py integration (conformance flag)
# ---------------------------------------------------------------------------

class TestSimulationServiceConformanceFlag:
    """Integration: build_simulation_run wires conformance correctly."""

    def _make_request(self, run_conformance: bool):
        from app.models.simulation import SimulationRunRequest, PredictionResponse
        return SimulationRunRequest(
            learnerProfileId="lp_uday_test",
            moduleId="mod_bell",
            circuitModel=BELL_CIRCUIT,
            predictionResponse=PredictionResponse(
                checkpointId="pc_bell_outcomes",
                answer="ENTANGLED",
            ),
            primaryAdapter="QISKIT_AER",
            runConformance=run_conformance,
            shots=1024,
        )

    def test_run_conformance_false_returns_stub(self):
        from app.services.simulation_service import build_simulation_run
        req = self._make_request(run_conformance=False)
        result = build_simulation_run(req, "req_sim6_stub")
        assert result.conformance.skippedReason == "PENNYLANE_NOT_ENABLED"
        assert result.conformance.passed is False

    def test_run_conformance_true_returns_live_result(self):
        from app.services.simulation_service import build_simulation_run
        req = self._make_request(run_conformance=True)
        result = build_simulation_run(req, "req_sim6_live")
        # Conformance must have run (skippedReason is None on success)
        assert result.conformance.skippedReason is None
        assert result.conformance.passed is True
        assert result.conformance.adapter == "PENNYLANE"
        assert result.conformance.maxProbabilityDelta <= result.conformance.epsilon

    def test_run_conformance_true_delta_is_finite(self):
        from app.services.simulation_service import build_simulation_run
        req = self._make_request(run_conformance=True)
        result = build_simulation_run(req, "req_sim6_finite")
        assert math.isfinite(result.conformance.maxProbabilityDelta)

    def test_run_conformance_true_epsilon_is_1e_minus_6(self):
        from app.services.simulation_service import build_simulation_run
        req = self._make_request(run_conformance=True)
        result = build_simulation_run(req, "req_sim6_eps")
        assert result.conformance.epsilon == 1e-6
