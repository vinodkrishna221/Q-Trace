"""FEA-6 card TEST — Socratic Counterexample Grading Engine.

Proves:
  1. G-1 Entanglement Entropy:
     - Maximally entangled Bell state produces S(rho_A) = 1.0.
     - Separable product state (e.g. X+CNOT producing |11>) produces S(rho_A) = 0.0.
     - G-1 invariant checker flags separable state when Bell entanglement is expected.
  2. G-2 Phase Observability:
     - Correct |+> state gives deterministic |0> in Hadamard basis (fidelity = 1.0).
     - Phase-inverted |-> state has identical computational basis probabilities (0.5/0.5)
       but fails phase observability in the Hadamard basis (Hadamard fidelity < 0.99).
  3. G-3 Unitary Reversibility:
     - Unitary sequence U reversed with U dagger restores ground state |00> with fidelity >= 0.99.
     - Mid-circuit measurement collapses state irreversibly and fails G-3.
  4. Socratic Counterexample Generation:
     - generate_counterexample() finds the input state where student and target diverge.
     - Returns structured CounterExample with inputState, studentOutput, targetOutput, fidelity,
       invariantViolated, and clear Socratic explanation.
  5. Demo Wow-Moment:
     - Submitting an X+CNOT circuit against the Bell challenge returns an invariant violation G-1
       with input |+> (or |0>) proving subsystem purity produces deterministic output instead of random 50/50.
  6. Pre-seeded Mutation Challenges:
     - CH_BELL_ENTANGLE, CH_PHASE_SUPER, CH_GROVER_2Q, CH_UNITARY_REV are seeded in repository.
  7. API Endpoints:
     - POST /v1/grading/assess returns 200 with AssessResponse (attemptId, passed, invariants, counterExample).
     - GET /v1/grading/assess/{attemptId} retrieves previously evaluated assessment.
     - Unknown challenge returns 404 with contract error envelope.
     - Unknown attempt ID returns 404 with contract error envelope.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.circuit import CircuitModel, GateName, Operation
from app.repositories.seeds import MUTATION_CHALLENGES
from app.services.grading.socratic_engine import (
    AssessRequest,
    AssessResponse,
    CounterExample,
    assess_circuit,
    check_invariant_g1,
    check_invariant_g2,
    check_invariant_g3,
    compute_entanglement_entropy,
    generate_counterexample,
    get_target_circuit_for_challenge,
    simulate_statevector,
)

client = TestClient(app)

# ---------------------------------------------------------------------------
# Test Circuits
# ---------------------------------------------------------------------------

BELL_CIRCUIT = CircuitModel(
    id="cm_test_bell",
    name="Bell State",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        Operation(opId="op_h", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
        Operation(opId="op_cx", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=1),
    ],
    source="SEED",
    modelVersion=1,
)

X_CNOT_CIRCUIT = CircuitModel(
    id="cm_test_x_cnot",
    name="X then CNOT (Separable |11> on |00> input)",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        Operation(opId="op_x", gate=GateName.X, targets=[0], controls=[], classicalTargets=[], column=0),
        Operation(opId="op_cx", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=1),
    ],
    source="SEED",
    modelVersion=1,
)

SUPERPOSITION_PLUS_CIRCUIT = CircuitModel(
    id="cm_test_plus",
    name="State |+> (H on q0)",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        Operation(opId="op_h", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
    ],
    source="SEED",
    modelVersion=1,
)

PHASE_FLIPPED_MINUS_CIRCUIT = CircuitModel(
    id="cm_test_minus",
    name="State |-> (H then Z on q0)",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        Operation(opId="op_h", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
        Operation(opId="op_z", gate=GateName.Z, targets=[0], controls=[], classicalTargets=[], column=1),
    ],
    source="SEED",
    modelVersion=1,
)

UNITARY_REVERSIBLE_CIRCUIT = CircuitModel(
    id="cm_test_unitary",
    name="Unitary Reversible (H then X)",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        Operation(opId="op_h", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
        Operation(opId="op_x", gate=GateName.X, targets=[1], controls=[], classicalTargets=[], column=0),
    ],
    source="SEED",
    modelVersion=1,
)

NON_UNITARY_MEASURE_CIRCUIT = CircuitModel(
    id="cm_test_measure",
    name="Non-Unitary Measurement",
    qubitCount=2,
    classicalBitCount=2,
    operations=[
        Operation(opId="op_h", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
        Operation(opId="op_m", gate=GateName.MEASURE, targets=[0], controls=[], classicalTargets=[0], column=1),
    ],
    source="SEED",
    modelVersion=1,
)


# ---------------------------------------------------------------------------
# Invariant Unit Tests
# ---------------------------------------------------------------------------

class TestInvariantG1EntanglementEntropy:
    """Test G-1: Entanglement entropy calculation and invariant checker."""

    def test_bell_state_maximal_entanglement(self):
        sv_bell = simulate_statevector(BELL_CIRCUIT)
        entropy = compute_entanglement_entropy(sv_bell, 2, subsystem_qubit=0)
        assert abs(entropy - 1.0) < 1e-3, f"Expected S(rho_A) ~ 1.0 for Bell state, got {entropy}"

    def test_separable_product_state_zero_entropy(self):
        sv_x_cnot = simulate_statevector(X_CNOT_CIRCUIT)
        entropy = compute_entanglement_entropy(sv_x_cnot, 2, subsystem_qubit=0)
        assert abs(entropy - 0.0) < 1e-3, f"Expected S(rho_A) ~ 0.0 for product state, got {entropy}"

    def test_g1_passes_for_bell_against_bell(self):
        result = check_invariant_g1(BELL_CIRCUIT, BELL_CIRCUIT)
        assert result.passed is True
        assert result.invariant == "G-1"
        assert abs(result.measuredValue - 1.0) < 0.1

    def test_g1_fails_for_x_cnot_against_bell(self):
        result = check_invariant_g1(X_CNOT_CIRCUIT, BELL_CIRCUIT)
        assert result.passed is False
        assert result.invariant == "G-1"
        assert abs(result.measuredValue - 0.0) < 0.1
        assert "separable product state" in result.message


class TestInvariantG2PhaseObservability:
    """Test G-2: Phase observability via Hadamard basis interference."""

    def test_g2_passes_for_matching_phase(self):
        result = check_invariant_g2(SUPERPOSITION_PLUS_CIRCUIT, SUPERPOSITION_PLUS_CIRCUIT)
        assert result.passed is True
        assert result.invariant == "G-2"
        assert result.measuredValue >= 0.99

    def test_g2_fails_for_phase_flipped_minus_state(self):
        # Both |+> and |-> have identical 50%/50% probabilities in computational basis
        sv_plus = simulate_statevector(SUPERPOSITION_PLUS_CIRCUIT)
        sv_minus = simulate_statevector(PHASE_FLIPPED_MINUS_CIRCUIT)
        # Verify computational basis probabilities are both 0.5 for |0> and |1> on q0
        assert abs(abs(sv_plus[0]) ** 2 - 0.5) < 1e-3
        assert abs(abs(sv_minus[0]) ** 2 - 0.5) < 1e-3

        # But G-2 reveals the relative phase mismatch in the Hadamard basis!
        result = check_invariant_g2(PHASE_FLIPPED_MINUS_CIRCUIT, SUPERPOSITION_PLUS_CIRCUIT)
        assert result.passed is False
        assert result.invariant == "G-2"
        assert result.measuredValue < 0.99
        assert "Phase Observability violated" in result.message


class TestInvariantG3UnitaryReversibility:
    """Test G-3: Unitary reversibility U dagger U = I."""

    def test_g3_passes_for_unitary_circuit(self):
        result = check_invariant_g3(UNITARY_REVERSIBLE_CIRCUIT)
        assert result.passed is True
        assert result.invariant == "G-3"
        assert result.measuredValue >= 0.99

    def test_g3_fails_for_circuit_with_measurement(self):
        result = check_invariant_g3(NON_UNITARY_MEASURE_CIRCUIT)
        assert result.passed is False
        assert result.invariant == "G-3"
        assert result.measuredValue == 0.0


# ---------------------------------------------------------------------------
# Socratic Counterexample Generation & Demo Wow-Moment Tests
# ---------------------------------------------------------------------------

class TestSocraticCounterexampleAndDemo:
    """Test counterexample generation and the exact demo wow-moment script."""

    def test_counterexample_generated_for_diverging_circuits(self):
        cx = generate_counterexample(X_CNOT_CIRCUIT, BELL_CIRCUIT, "G-1")
        assert cx is not None
        assert isinstance(cx, CounterExample)
        assert cx.invariantViolated == "G-1"
        assert cx.fidelity < 0.99
        assert "probabilities" in cx.studentOutput
        assert "probabilities" in cx.targetOutput
        assert cx.explanation != ""

    def test_demo_wow_moment_bell_challenge_with_plus_input(self):
        """Card DEMO: Submitting X+CNOT returns G-1 violation with input |+>."""
        cx = generate_counterexample(
            student_circuit=X_CNOT_CIRCUIT,
            target_circuit=BELL_CIRCUIT,
            failed_invariant="G-1",
            preferred_input="|+⟩",
        )
        assert cx is not None
        assert cx.inputState == "|+⟩"
        assert cx.invariantViolated == "G-1"
        assert cx.fidelity < 0.99
        assert "Entanglement Entropy violated" in cx.explanation

    def test_assess_circuit_passed_for_valid_bell(self):
        res = assess_circuit(BELL_CIRCUIT, "CH_BELL_ENTANGLE", "lp_aarav")
        assert res.passed is True
        assert res.counterExample is None
        assert len(res.invariantsChecked) == 3
        assert all(inv.passed for inv in res.invariantsChecked)

    def test_assess_circuit_failed_for_x_cnot_with_counterexample(self):
        res = assess_circuit(X_CNOT_CIRCUIT, "CH_BELL_ENTANGLE", "lp_aarav")
        assert res.passed is False
        assert res.counterExample is not None
        assert res.counterExample.invariantViolated == "G-1"
        assert any(not inv.passed and inv.invariant == "G-1" for inv in res.invariantsChecked)


# ---------------------------------------------------------------------------
# Mutation Challenges Seed Tests
# ---------------------------------------------------------------------------

class TestMutationChallengesSeed:
    """Test the 4 mutation challenges required by FEA-6 (§5.6)."""

    def test_four_mutation_challenges_present(self):
        challenge_ids = {ch.id for ch in MUTATION_CHALLENGES}
        expected_ids = {"CH_BELL_ENTANGLE", "CH_PHASE_SUPER", "CH_GROVER_2Q", "CH_UNITARY_REV"}
        assert expected_ids.issubset(challenge_ids)

    def test_target_circuits_exist_for_all_mutation_challenges(self):
        for cid in ("CH_BELL_ENTANGLE", "CH_PHASE_SUPER", "CH_GROVER_2Q", "CH_UNITARY_REV"):
            target = get_target_circuit_for_challenge(cid)
            assert target is not None
            assert target.qubitCount >= 2
            assert len(target.operations) >= 1


# ---------------------------------------------------------------------------
# API Route Integration Tests (POST & GET /v1/grading/assess)
# ---------------------------------------------------------------------------

class TestGradingApiRoutes:
    """Test HTTP contract for /v1/grading/assess endpoints."""

    def test_post_assess_success_bell_circuit(self):
        payload = {
            "circuitModel": BELL_CIRCUIT.model_dump(),
            "challengeId": "CH_BELL_ENTANGLE",
            "learnerId": "lp_aarav",
        }
        res = client.post("/v1/grading/assess", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["passed"] is True
        assert data["attemptId"].startswith("ca_assess_")
        assert len(data["invariantsChecked"]) == 3
        assert data["counterExample"] is None

    def test_post_assess_failure_with_counterexample(self):
        payload = {
            "circuitModel": X_CNOT_CIRCUIT.model_dump(),
            "challengeId": "CH_BELL_ENTANGLE",
            "learnerId": "lp_aarav",
        }
        res = client.post("/v1/grading/assess", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["passed"] is False
        assert data["counterExample"] is not None
        assert data["counterExample"]["invariantViolated"] == "G-1"

    def test_get_assess_by_attempt_id(self):
        # 1. Create assessment
        payload = {
            "circuitModel": X_CNOT_CIRCUIT.model_dump(),
            "challengeId": "CH_BELL_ENTANGLE",
            "learnerId": "lp_aarav",
        }
        post_res = client.post("/v1/grading/assess", json=payload)
        assert post_res.status_code == 200
        attempt_id = post_res.json()["attemptId"]

        # 2. Retrieve assessment
        get_res = client.get(f"/v1/grading/assess/{attempt_id}")
        assert get_res.status_code == 200
        get_data = get_res.json()
        assert get_data["attemptId"] == attempt_id
        assert get_data["passed"] is False
        assert get_data["counterExample"]["invariantViolated"] == "G-1"

    def test_post_assess_unknown_challenge_returns_404(self):
        payload = {
            "circuitModel": BELL_CIRCUIT.model_dump(),
            "challengeId": "CH_NONEXISTENT_XYZ",
            "learnerId": "lp_aarav",
        }
        res = client.post("/v1/grading/assess", json=payload)
        assert res.status_code == 404
        assert res.json()["error"]["code"] == "CHALLENGE_NOT_FOUND"

    def test_get_assess_unknown_attempt_returns_404(self):
        res = client.get("/v1/grading/assess/ca_nonexistent_999")
        assert res.status_code == 404
        assert res.json()["error"]["code"] == "ASSESSMENT_NOT_FOUND"
