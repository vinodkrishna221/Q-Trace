"""Quantum Invariant Linter — FEA-2 / F2.

Pure logic, no quantum SDK imports (quantum-runtime.md).

Analyzes circuit operations to detect quantum physics constraints at authoring time:
  QI-1: Post-collapse unitary gate (WARNING)
  QI-2: No-cloning violation attempt (INFO)
  QI-3: Controlled gate wire collision (ERROR)

Returns a list of LintWarning objects.
"""

from __future__ import annotations

from typing import Any

from app.models.circuit import CircuitModel, GateName, LintSeverity, LintWarning

__all__ = ["LintSeverity", "LintWarning", "lint_circuit"]


_CLONING_MESSAGE = (
    "Cloning attempt detected: You are trying to duplicate a superposition state "
    "via two CNOT gates. This does not copy quantum states — it creates entanglement. "
    "The No-Cloning Theorem (Wootters & Zurek, 1982) proves this is impossible."
)


def _extract_operations(circuit: CircuitModel | dict[str, Any] | list[Any] | Any) -> list[Any]:
    """Extract an iterable of operations from various input shapes."""
    if isinstance(circuit, list):
        return circuit
    if hasattr(circuit, "operations"):
        return getattr(circuit, "operations", [])
    if isinstance(circuit, dict):
        return circuit.get("operations", [])
    return []


def _get_op_field(op: Any, field_name: str, default: Any = None) -> Any:
    """Extract a field from either an Operation instance or a dict."""
    if isinstance(op, dict):
        return op.get(field_name, default)
    return getattr(op, field_name, default)


def _get_gate_str(gate: Any) -> str:
    """Normalize gate to string name."""
    if hasattr(gate, "value"):
        return str(gate.value)
    if gate is not None:
        return str(gate)
    return ""


def lint_circuit(circuit: CircuitModel | dict[str, Any] | list[Any] | Any) -> list[LintWarning]:
    """Analyze a circuit's operation sequence for quantum invariant violations.

    Rules enforced:
      - QI-1: Post-collapse unitary (WARNING)
      - QI-2: No-cloning violation attempt (INFO)
      - QI-3: Controlled gate wire collision (ERROR)

    Args:
        circuit: CircuitModel, dict, or list of operations.

    Returns:
        List of LintWarning objects ordered by column / rule.
    """
    warnings: list[LintWarning] = []
    measured_qubits: set[int] = set()
    superposition_qubits: set[int] = set()
    prior_cnot_controls: set[int] = set()
    prior_cnot_targets: set[int] = set()

    operations = _extract_operations(circuit)

    for op in operations:
        raw_gate = _get_op_field(op, "gate")
        gate_str = _get_gate_str(raw_gate)
        controls: list[int] = list(_get_op_field(op, "controls", []) or [])
        targets: list[int] = list(_get_op_field(op, "targets", []) or [])
        column: int = int(_get_op_field(op, "column", 0) or 0)
        op_id: str = str(_get_op_field(op, "opId", "") or "")

        # ------------------------------------------------------------------
        # QI-3: Controlled gate wire collision (check first, fast)
        # ------------------------------------------------------------------
        for ctrl in controls:
            if ctrl in targets:
                warnings.append(
                    LintWarning(
                        rule="QI-3",
                        severity=LintSeverity.ERROR,
                        qubit=ctrl,
                        column=column,
                        opId=op_id,
                        message=f"Wire collision: control q[{ctrl}] == target q[{ctrl}]. A qubit cannot be its own control.",
                    )
                )

        # ------------------------------------------------------------------
        # QI-1: Post-collapse unitary gate
        # ------------------------------------------------------------------
        is_measure = gate_str.upper() in (GateName.MEASURE.value, "MEASURE")
        if not is_measure:
            # Check targets
            for t in targets:
                if t in measured_qubits:
                    warnings.append(
                        LintWarning(
                            rule="QI-1",
                            severity=LintSeverity.WARNING,
                            qubit=t,
                            column=column,
                            opId=op_id,
                            message=(
                                f"Post-collapse unitary: {gate_str} on q[{t}] "
                                f"after MEASURE. Qubit is collapsed."
                            ),
                        )
                    )
            # Check controls
            for c in controls:
                if c in measured_qubits:
                    warnings.append(
                        LintWarning(
                            rule="QI-1",
                            severity=LintSeverity.WARNING,
                            qubit=c,
                            column=column,
                            opId=op_id,
                            message=(
                                f"Post-collapse unitary: {gate_str} control on q[{c}] "
                                f"after MEASURE. Qubit is collapsed."
                            ),
                        )
                    )

        # ------------------------------------------------------------------
        # QI-2: No-cloning violation attempt
        # ------------------------------------------------------------------
        is_cnot = gate_str.upper() in (GateName.CNOT.value, "CNOT", "CX")
        if is_cnot and controls and targets:
            c = controls[0]
            t = targets[0]

            # Trigger when control is in known superposition state and:
            # - Pattern A: target is also in superposition and has previously received a CNOT (attempting to duplicate state)
            # - Pattern B: control is in superposition and user adds a subsequent CNOT to fan out / duplicate
            is_pattern_a = (c in superposition_qubits) and (t in superposition_qubits) and (t in prior_cnot_targets)
            is_pattern_b = (c in superposition_qubits) and (c in prior_cnot_controls)

            if is_pattern_a or is_pattern_b:
                warnings.append(
                    LintWarning(
                        rule="QI-2",
                        severity=LintSeverity.INFO,
                        qubit=t,
                        column=column,
                        opId=op_id,
                        message=_CLONING_MESSAGE,
                    )
                )

        # ------------------------------------------------------------------
        # State tracking updates
        # ------------------------------------------------------------------
        if is_measure:
            measured_qubits.update(targets)
            for t in targets:
                superposition_qubits.discard(t)
        elif gate_str.upper() in (GateName.H.value, "H"):
            for t in targets:
                if t not in measured_qubits:
                    superposition_qubits.add(t)
        elif is_cnot and controls and targets:
            prior_cnot_controls.add(controls[0])
            prior_cnot_targets.add(targets[0])

    return warnings
