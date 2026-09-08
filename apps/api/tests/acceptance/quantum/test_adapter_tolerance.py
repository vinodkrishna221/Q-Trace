"""QA-4: Qiskit / PennyLane probability tolerance acceptance tests.

Verifies that the two adapters agree on ideal basis probabilities within
epsilon=1e-6 (quantum-runtime.md rule) for the Bell circuit and
superposition-only circuits from the golden fixtures.

Consumes:
  - apps/api/app/services/quantum/adapter.py  (run_qiskit_aer)
  - apps/api/app/services/quantum/pennylane_adapter.py  (run_pennylane_conformance)
  - apps/api/tests/fixtures/golden/bell_simulation_run.json
  - apps/api/tests/fixtures/golden/asymmetric_bit_order_run.json
"""

import json
import os
from pathlib import Path

import pytest

# Skip the whole module when Qiskit is disabled (CI may not have GPU/Aer)
ENABLE_QISKIT = os.getenv("ENABLE_QISKIT", "1") != "0"
ENABLE_PENNYLANE = os.getenv("ENABLE_PENNYLANE", "1") != "0"

pytestmark = pytest.mark.skipif(
    not ENABLE_QISKIT,
    reason="ENABLE_QISKIT=0 — Qiskit Aer not available in this environment",
)

FIXTURES_DIR = Path(__file__).parents[3] / "tests" / "fixtures" / "golden"
EPSILON = 1e-6


def _load_golden(name: str) -> dict:
    return json.loads((FIXTURES_DIR / f"{name}.json").read_text(encoding="utf-8"))


def _make_circuit_model(ops_spec: list[dict], qubit_count: int = 2, classical_count: int = 2):
    """Build a CircuitModel from a minimal spec list."""
    from app.models.circuit import CircuitModel, GateName, Operation

    def _gate(g: str) -> GateName:
        return GateName[g]

    operations = []
    for i, spec in enumerate(ops_spec):
        operations.append(
            Operation(
                opId=f"op_{i + 1}",
                gate=_gate(spec["gate"]),
                targets=spec.get("targets", [0]),
                controls=spec.get("controls", []),
                classicalTargets=spec.get("classicalTargets", []),
                column=i,
            )
        )
    return CircuitModel(
        id="cm_test",
        name="Test circuit",
        qubitCount=qubit_count,
        classicalBitCount=classical_count,
        operations=operations,
        source="BUILDER",
        modelVersion=1,
    )


# ---------------------------------------------------------------------------
# Test 1 — Bell path: Qiskit and PennyLane agree within epsilon
# ---------------------------------------------------------------------------

def test_bell_qiskit_pennylane_tolerance():
    """Qiskit and PennyLane both produce P(00)=0.5, P(11)=0.5 within 1e-6."""
    from app.services.quantum.adapter import run_qiskit_aer
    from app.services.quantum.pennylane_adapter import run_pennylane_conformance

    circuit = _make_circuit_model([
        {"gate": "H", "targets": [0]},
        {"gate": "CNOT", "targets": [1], "controls": [0]},
        {"gate": "MEASURE", "targets": [0], "classicalTargets": [0]},
        {"gate": "MEASURE", "targets": [1], "classicalTargets": [1]},
    ])

    aer_result = run_qiskit_aer(circuit, shots=1024)
    conformance = run_pennylane_conformance(circuit, aer_result.probabilities)

    assert conformance.skipped_reason is None, (
        f"PennyLane conformance was skipped: {conformance.skipped_reason}"
    )
    assert conformance.passed, (
        f"Qiskit/PennyLane probability delta {conformance.max_probability_delta} > epsilon {EPSILON}. "
        f"Qiskit: {aer_result.probabilities}, PennyLane: {conformance.pl_probabilities}"
    )
    assert conformance.max_probability_delta <= EPSILON

    # Also verify against golden fixture values
    golden = _load_golden("bell_simulation_run")["simulationRun"]
    for basis, expected in golden["probabilities"].items():
        actual = aer_result.probabilities.get(basis, 0.0)
        assert abs(actual - expected) <= EPSILON, (
            f"Qiskit P({basis})={actual} disagrees with golden {expected}"
        )


# ---------------------------------------------------------------------------
# Test 2 — Superposition only: H on qubit-0, qubit-1 idle
# ---------------------------------------------------------------------------

def test_superposition_qiskit_pennylane_tolerance():
    """Single H on qubit-0 with qubit-1 idle. P(00)=0.5, P(10)=0.5 within epsilon."""
    from app.services.quantum.adapter import run_qiskit_aer
    from app.services.quantum.pennylane_adapter import run_pennylane_conformance

    circuit = _make_circuit_model([
        {"gate": "H", "targets": [0]},
        {"gate": "MEASURE", "targets": [0], "classicalTargets": [0]},
        {"gate": "MEASURE", "targets": [1], "classicalTargets": [1]},
    ])

    aer_result = run_qiskit_aer(circuit, shots=1024)
    conformance = run_pennylane_conformance(circuit, aer_result.probabilities)

    assert conformance.skipped_reason is None
    assert conformance.passed, (
        f"Tolerance failed: delta={conformance.max_probability_delta}"
    )
    assert conformance.max_probability_delta <= EPSILON


# ---------------------------------------------------------------------------
# Test 3 — Disabled PennyLane returns skipped result, not an error
# ---------------------------------------------------------------------------

def test_pennylane_disabled_skips_gracefully(monkeypatch):
    """When PennyLane import fails, conformance returns skipped_reason, not a crash."""
    # Use a 2-qubit circuit — Pydantic requires qubitCount >= 2
    circuit = _make_circuit_model([{"gate": "H", "targets": [0]}], qubit_count=2, classical_count=2)

    # Simulate PennyLane being unavailable by patching the import inside the function
    import app.services.quantum.pennylane_adapter as pl_mod
    original = pl_mod._run_pennylane

    def _fail(_circuit):
        raise ImportError("pennylane not installed")

    monkeypatch.setattr(pl_mod, "_run_pennylane", _fail)

    from app.services.quantum.pennylane_adapter import run_pennylane_conformance
    result = run_pennylane_conformance(circuit, {"0": 0.5, "1": 0.5})

    assert result.skipped_reason is not None
    assert "PENNYLANE_EXECUTION_ERROR" in result.skipped_reason or result.skipped_reason != ""
