"""Canonical Circuit Model and Operation Pydantic v2 types.

Mirrors board/contracts/circuit-simulation.md Types section exactly.
Validation rejects circuits outside the prototype subset BEFORE any quantum SDK
is imported — per quantum-runtime.md rule: "Reject outside the subset before
importing a quantum SDK."

Prototype limits (quantum-runtime.md):
  - 2–5 qubits (inclusive)
  - ≤20 operations
  - Supported gates: H, X, Y, Z, CNOT, MEASURE only

No quantum SDK import anywhere in this module.
"""

from __future__ import annotations

from enum import Enum
from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator, model_validator


# ---------------------------------------------------------------------------
# Gate enum — closed set, matches contract GateName
# ---------------------------------------------------------------------------

class GateName(str, Enum):
    H = "H"
    X = "X"
    Y = "Y"
    Z = "Z"
    CNOT = "CNOT"
    MEASURE = "MEASURE"


# ---------------------------------------------------------------------------
# Operation
# ---------------------------------------------------------------------------

class Operation(BaseModel):
    """Single gate operation within a CircuitModel.

    Contract shape:
      { opId, gate, targets, controls, classicalTargets, column }
    """

    opId: str = Field(..., min_length=1)
    gate: GateName
    targets: list[int] = Field(..., min_length=1)
    controls: list[int] = Field(default_factory=list)
    classicalTargets: list[int] = Field(default_factory=list)
    column: int = Field(..., ge=0)

    @field_validator("targets", "controls", "classicalTargets", mode="before")
    @classmethod
    def _non_negative_indices(cls, v: list[int]) -> list[int]:
        for idx in v:
            if idx < 0:
                raise ValueError(f"Qubit/bit index must be non-negative, got {idx}")
        return v


# ---------------------------------------------------------------------------
# CircuitModel
# ---------------------------------------------------------------------------

_SOURCE_LITERAL = Literal["BUILDER", "SUPPORTED_QISKIT", "SEED"]

class CircuitModel(BaseModel):
    """Canonical circuit representation.

    Contract shape:
      { id, name, qubitCount, classicalBitCount, operations, source, modelVersion }

    Invariants enforced by validators:
      - qubitCount in [2, 5]
      - classicalBitCount >= 0
      - len(operations) <= 20
      - No duplicate opId
      - Every target/control qubit index < qubitCount
      - Every classicalTarget index < classicalBitCount
      - CNOT: exactly 1 target, exactly 1 control, control != target
      - MEASURE: len(targets) == len(classicalTargets) >= 1, no controls
      - Non-MEASURE gates: classicalTargets must be empty
      - Operations are normalized by column (ascending order enforced)
    """

    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    qubitCount: Annotated[int, Field(ge=2, le=5)]
    classicalBitCount: Annotated[int, Field(ge=0)]
    operations: list[Operation] = Field(..., max_length=20)
    source: _SOURCE_LITERAL
    modelVersion: Literal[1]

    # ------------------------------------------------------------------
    # Cross-field validation
    # ------------------------------------------------------------------

    @model_validator(mode="after")
    def _validate_operations(self) -> "CircuitModel":
        ops = self.operations
        n_qubits = self.qubitCount
        n_classical = self.classicalBitCount

        # 1. Duplicate opId
        seen_ids: set[str] = set()
        for op in ops:
            if op.opId in seen_ids:
                raise ValueError(
                    f"Duplicate opId '{op.opId}' — every operation must have a unique ID."
                )
            seen_ids.add(op.opId)

        # 2. Per-operation gate-specific rules
        for op in ops:
            gate = op.gate

            # Qubit index bounds for targets and controls
            for q in op.targets:
                if q >= n_qubits:
                    raise ValueError(
                        f"Operation '{op.opId}': target qubit {q} >= qubitCount {n_qubits}."
                    )
            for q in op.controls:
                if q >= n_qubits:
                    raise ValueError(
                        f"Operation '{op.opId}': control qubit {q} >= qubitCount {n_qubits}."
                    )

            # Classical bit index bounds
            for c in op.classicalTargets:
                if c >= n_classical:
                    raise ValueError(
                        f"Operation '{op.opId}': classicalTarget {c} >= classicalBitCount {n_classical}."
                    )

            if gate == GateName.CNOT:
                # Exactly 1 target, exactly 1 control, control != target
                if len(op.targets) != 1:
                    raise ValueError(
                        f"CNOT '{op.opId}' must have exactly 1 target, got {len(op.targets)}."
                    )
                if len(op.controls) != 1:
                    raise ValueError(
                        f"CNOT '{op.opId}' must have exactly 1 control, got {len(op.controls)}."
                    )
                if op.controls[0] == op.targets[0]:
                    raise ValueError(
                        f"CNOT '{op.opId}': control and target must be different qubits."
                    )
                if op.classicalTargets:
                    raise ValueError(
                        f"CNOT '{op.opId}': classicalTargets must be empty for CNOT."
                    )

            elif gate == GateName.MEASURE:
                # targets and classicalTargets must be same length, non-empty; no controls
                if not op.targets:
                    raise ValueError(
                        f"MEASURE '{op.opId}': targets must be non-empty."
                    )
                if len(op.targets) != len(op.classicalTargets):
                    raise ValueError(
                        f"MEASURE '{op.opId}': targets length {len(op.targets)} != "
                        f"classicalTargets length {len(op.classicalTargets)}."
                    )
                if op.controls:
                    raise ValueError(
                        f"MEASURE '{op.opId}': controls must be empty for MEASURE."
                    )

            else:
                # H, X, Y, Z: exactly 1 target, no controls, no classicalTargets
                if len(op.targets) != 1:
                    raise ValueError(
                        f"{gate.value} '{op.opId}' must have exactly 1 target, got {len(op.targets)}."
                    )
                if op.controls:
                    raise ValueError(
                        f"{gate.value} '{op.opId}': controls must be empty."
                    )
                if op.classicalTargets:
                    raise ValueError(
                        f"{gate.value} '{op.opId}': classicalTargets must be empty."
                    )

        # 3. Normalize / verify operations are column-sorted
        columns = [op.column for op in ops]
        if columns != sorted(columns):
            raise ValueError(
                "Operations must be ordered by ascending column. "
                f"Got columns: {columns}"
            )

        return self
