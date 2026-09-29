"""Socratic counterexample grading engine package."""

from app.services.grading.socratic_engine import (
    AssessRequest,
    AssessResponse,
    CounterExample,
    InvariantResult,
    assess_circuit,
    check_invariant_g1,
    check_invariant_g2,
    check_invariant_g3,
    compute_entanglement_entropy,
    generate_counterexample,
)

__all__ = [
    "AssessRequest",
    "AssessResponse",
    "CounterExample",
    "InvariantResult",
    "assess_circuit",
    "check_invariant_g1",
    "check_invariant_g2",
    "check_invariant_g3",
    "compute_entanglement_entropy",
    "generate_counterexample",
]
