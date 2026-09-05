"""OpenQASM 3 exporter for supported CircuitModel — SIM-5.

Converts a CircuitModel (source: BUILDER | SUPPORTED_QISKIT | SEED) to an
OpenQASM 3.0 string covering the prototype gate subset.

Rules from quantum-runtime.md + circuit-simulation contract v1:
  - OpenQASM 3 is SUPPORTED-SUBSET export, not lossless persistence.
  - Round-trip tests must preserve the CircuitModel or fail explicitly.
  - Supported gates in export: H, X, Y, Z, CNOT (cx), MEASURE.
  - `lossy` flag is False for the supported subset (all gates are round-trippable).
  - No quantum SDK imports — export is pure string construction.

The round-trip validator re-parses the emitted QASM back into a CircuitModel
using the qiskit SDK (import deferred until round-trip time, never during export)
and checks structural equivalence.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from app.models.circuit import CircuitModel, GateName, Operation


# ---------------------------------------------------------------------------
# Error type
# ---------------------------------------------------------------------------

@dataclass
class ExportError(Exception):
    """Structured export error for 422 responses."""
    code: str    # "INVALID_CIRCUIT_MODEL" | "OPENQASM_EXPORT_UNSUPPORTED"
    message: str
    details: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Gate → QASM token map
# ---------------------------------------------------------------------------

_GATE_TO_QASM: dict[GateName, str] = {
    GateName.H:       "h",
    GateName.X:       "x",
    GateName.Y:       "y",
    GateName.Z:       "z",
    GateName.CNOT:    "cx",
    GateName.MEASURE: "measure",
}


# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------

def export_openqasm3(circuit: CircuitModel) -> dict:
    """Convert a CircuitModel to an OpenQASM 3.0 string.

    Args:
        circuit: Validated CircuitModel.

    Returns:
        Dict with keys: openQasmVersion, openQasm3, lossy, warnings.

    Raises:
        ExportError: If the circuit contains gates outside the exportable subset.
    """
    lines: list[str] = []
    warnings: list[str] = []

    # Header
    lines.append('OPENQASM 3.0;')
    lines.append('include "stdgates.inc";')

    # Qubit and classical registers
    lines.append(f'qubit[{circuit.qubitCount}] q;')
    if circuit.classicalBitCount > 0:
        lines.append(f'bit[{circuit.classicalBitCount}] c;')

    # Operations
    for op in circuit.operations:
        gate = op.gate
        if gate not in _GATE_TO_QASM:
            raise ExportError(
                code="OPENQASM_EXPORT_UNSUPPORTED",
                message=f"Gate '{gate.value}' is not supported in OpenQASM 3 export.",
                details={"gate": gate.value},
            )

        qasm_token = _GATE_TO_QASM[gate]

        if gate == GateName.CNOT:
            ctrl = op.controls[0]
            tgt = op.targets[0]
            lines.append(f'cx q[{ctrl}], q[{tgt}];')

        elif gate == GateName.MEASURE:
            # Multiple qubit→classical pairs can be in one MEASURE op
            for q_idx, c_idx in zip(op.targets, op.classicalTargets):
                lines.append(f'c[{c_idx}] = measure q[{q_idx}];')

        else:
            # Single-qubit gate
            tgt = op.targets[0]
            lines.append(f'{qasm_token} q[{tgt}];')

    openqasm_str = "\n".join(lines) + "\n"

    return {
        "openQasmVersion": "3.0",
        "openQasm3": openqasm_str,
        "lossy": False,
        "warnings": warnings,
    }


# ---------------------------------------------------------------------------
# Round-trip validation (structural, not numeric)
# ---------------------------------------------------------------------------

def validate_roundtrip(circuit: CircuitModel) -> list[str]:
    """Export to QASM and verify the gate sequence round-trips correctly.

    Parses the emitted QASM using qiskit's QASM parser, then checks that
    the non-MEASURE gate sequence and qubit counts match the source model.

    Returns a list of warning strings (empty = clean round-trip).
    Raises ExportError if a critical mismatch is detected.

    NOTE: This uses qiskit for validation only — no simulation occurs.
    """
    # Deferred import — only used for round-trip structural check
    try:
        from qiskit import QuantumCircuit as QC  # noqa: PLC0415
    except ImportError:
        # Qiskit not available — skip round-trip, surface a warning
        return ["Qiskit not available; round-trip validation skipped."]

    export_result = export_openqasm3(circuit)
    qasm_str = export_result["openQasm3"]
    warnings: list[str] = []

    try:
        qc = QC.from_qasm_str(qasm_str)
    except Exception as exc:
        raise ExportError(
            code="OPENQASM_EXPORT_UNSUPPORTED",
            message=f"Round-trip parse failed: {exc}.",
        ) from exc

    # Check qubit count
    if qc.num_qubits != circuit.qubitCount:
        raise ExportError(
            code="OPENQASM_EXPORT_UNSUPPORTED",
            message=(
                f"Round-trip qubitCount mismatch: exported {qc.num_qubits}, "
                f"expected {circuit.qubitCount}."
            ),
        )

    # Gate sequence check (non-MEASURE ops)
    expected_gates = [op.gate for op in circuit.operations if op.gate != GateName.MEASURE]
    _QISKIT_NAME_TO_GATE: dict[str, GateName] = {
        "h": GateName.H,
        "x": GateName.X,
        "y": GateName.Y,
        "z": GateName.Z,
        "cx": GateName.CNOT,
    }
    actual_gates: list[GateName] = []
    for instr in qc.data:
        name = instr.operation.name
        if name in ("barrier", "reset"):
            continue
        if name in _QISKIT_NAME_TO_GATE:
            actual_gates.append(_QISKIT_NAME_TO_GATE[name])
        # measure handled separately — skip

    if actual_gates != expected_gates:
        raise ExportError(
            code="OPENQASM_EXPORT_UNSUPPORTED",
            message=(
                f"Round-trip gate sequence mismatch. "
                f"Expected {[g.value for g in expected_gates]}, "
                f"got {[g.value for g in actual_gates]}."
            ),
        )

    return warnings
