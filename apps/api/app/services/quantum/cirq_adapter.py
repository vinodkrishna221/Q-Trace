"""Google Cirq adapter for Q-Trace — FEA-8.

Maps CircuitModel → cirq.Circuit → cirq.Simulator → normalized StateTrace / statevector.
Reuses normalizer.py for basis endianness alignment (big-endian → little-endian).

Cirq uses big-endian qubit ordering (q0 = MSB), matching PennyLane.
The normalizer bit-reversal maps to Qiskit little-endian format so statevectors
are directly comparable across engines.
"""

from __future__ import annotations

import logging
import time
from typing import Any

import cirq
import numpy as np

from app.models.circuit import CircuitModel, GateName
from app.services.quantum.normalizer import normalize_statevector

logger = logging.getLogger("qtrace.cirq_adapter")

# Single qubit gate mapping to Cirq gates
_GATE_MAP: dict[GateName, Any] = {
    GateName.H: cirq.H,
    GateName.X: cirq.X,
    GateName.Y: cirq.Y,
    GateName.Z: cirq.Z,
    GateName.S: cirq.S,
    GateName.T: cirq.T,
}


def build_cirq_circuit(model: CircuitModel, include_measure: bool = True) -> cirq.Circuit:
    """Compile a validated CircuitModel into a cirq.Circuit.

    Args:
        model: Validated CircuitModel
        include_measure: If True, MEASURE operations are appended to the circuit.
                         If False, MEASURE ops are omitted (for pre-measurement statevector).

    Returns:
        cirq.Circuit instance
    """
    qubits = cirq.LineQubit.range(model.qubitCount)
    circuit = cirq.Circuit()

    for op in model.operations:
        if op.gate == GateName.MEASURE:
            if include_measure and op.targets:
                meas_qubits = [qubits[t] for t in op.targets]
                circuit.append(cirq.measure(*meas_qubits, key=f"m_{op.opId}"))
        elif op.gate == GateName.CNOT:
            ctrl = qubits[op.controls[0]]
            tgt = qubits[op.targets[0]]
            circuit.append(cirq.CNOT(ctrl, tgt))
        elif op.gate == GateName.CCX:
            c1 = qubits[op.controls[0]]
            c2 = qubits[op.controls[1]]
            tgt = qubits[op.targets[0]]
            circuit.append(cirq.CCX(c1, c2, tgt))
        elif op.gate == GateName.CZ:
            ctrl = qubits[op.controls[0]]
            tgt = qubits[op.targets[0]]
            circuit.append(cirq.CZ(ctrl, tgt))
        else:
            gate = _GATE_MAP.get(op.gate)
            if gate is not None:
                circuit.append(gate(qubits[op.targets[0]]))
            else:
                logger.warning("Unsupported gate %s encountered in cirq_adapter", op.gate)

    return circuit


def run_cirq(model: CircuitModel) -> dict[str, Any]:
    """Execute CircuitModel with Cirq simulator and return normalized statevector.

    The statevector is normalized from Cirq's big-endian convention (q0 MSB)
    to Qiskit's little-endian convention (q0 LSB) via normalize_statevector.

    Args:
        model: Validated CircuitModel

    Returns:
        dict with:
          backend: "cirq"
          statevector: list[complex]
          durationMs: int
    """
    t0 = time.monotonic()
    n = model.qubitCount
    qubits = cirq.LineQubit.range(n)

    # Pre-measurement unitary circuit for statevector
    circuit = build_cirq_circuit(model, include_measure=False)
    sim = cirq.Simulator()
    result = sim.simulate(circuit, qubit_order=qubits)
    sv = result.final_state_vector

    # Cirq is big-endian (q0 MSB). Normalize to match Qiskit little-endian.
    normalized = normalize_statevector(sv, n, source_endian="big")
    elapsed_ms = max(1, int((time.monotonic() - t0) * 1000))

    return {
        "backend": "cirq",
        "statevector": normalized.tolist(),
        "durationMs": elapsed_ms,
    }
