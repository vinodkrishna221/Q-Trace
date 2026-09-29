"""Socratic Counterexample Grading Engine (FEA-6 / Deliverable 5).

Deterministic evaluation of three quantum mechanical invariants:
- G-1: Entanglement Entropy S(rho_A) = -Tr(rho_A log2 rho_A)
- G-2: Phase Observability (Hadamard basis interference verification)
- G-3: Unitary Reversibility U dagger U = I (fidelity >= 0.99)

Finds the smallest input state (|0>, |1>, |+>) where student and target circuits diverge,
without LLM dependencies.
"""

from __future__ import annotations

import cmath
import math
import uuid
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

from app.models.circuit import CircuitModel, GateName, Operation
from app.services.quantum.normalizer import (
    build_normalized_amplitude_map,
    build_normalized_probability_map,
    qiskit_index_to_contract_label,
)


# ---------------------------------------------------------------------------
# Data Models (mirrored on frontend in apps/web/lib/types/grading.ts)
# ---------------------------------------------------------------------------

class InvariantResult(BaseModel):
    invariant: Literal["G-1", "G-2", "G-3"]
    passed: bool
    measuredValue: float
    expectedValue: float
    message: str


class CounterExample(BaseModel):
    inputState: str
    studentOutput: dict[str, Any]
    targetOutput: dict[str, Any]
    fidelity: float
    invariantViolated: Literal["G-1", "G-2", "G-3"]
    explanation: str


class AssessRequest(BaseModel):
    circuitModel: CircuitModel
    challengeId: str
    learnerId: str
    targetCircuitModel: Optional[CircuitModel] = None


class AssessResponse(BaseModel):
    attemptId: str
    passed: bool
    invariantsChecked: list[InvariantResult]
    counterExample: Optional[CounterExample] = None
    feedback: str


# ---------------------------------------------------------------------------
# In-memory Assessment Cache (for GET /v1/grading/assess/{attemptId})
# ---------------------------------------------------------------------------

_ASSESSMENT_CACHE: dict[str, AssessResponse] = {}


def get_saved_assessment(attempt_id: str) -> Optional[AssessResponse]:
    """Retrieve a previously generated assessment by attempt ID."""
    return _ASSESSMENT_CACHE.get(attempt_id)


def store_saved_assessment(response: AssessResponse) -> None:
    """Store an assessment response in the cache."""
    _ASSESSMENT_CACHE[response.attemptId] = response


# ---------------------------------------------------------------------------
# Pure-Python Statevector Simulator (with Qiskit Aer preference)
# ---------------------------------------------------------------------------

_SQRT2 = math.sqrt(2.0)
_INV_SQRT2 = 1.0 / _SQRT2

_GATE_MATRICES_1Q: dict[str, list[list[complex]]] = {
    "H": [
        [complex(_INV_SQRT2, 0.0), complex(_INV_SQRT2, 0.0)],
        [complex(_INV_SQRT2, 0.0), complex(-_INV_SQRT2, 0.0)],
    ],
    "X": [
        [complex(0.0, 0.0), complex(1.0, 0.0)],
        [complex(1.0, 0.0), complex(0.0, 0.0)],
    ],
    "Y": [
        [complex(0.0, 0.0), complex(0.0, -1.0)],
        [complex(0.0, 1.0), complex(0.0, 0.0)],
    ],
    "Z": [
        [complex(1.0, 0.0), complex(0.0, 0.0)],
        [complex(0.0, 0.0), complex(-1.0, 0.0)],
    ],
    "S": [
        [complex(1.0, 0.0), complex(0.0, 0.0)],
        [complex(0.0, 0.0), complex(0.0, 1.0)],
    ],
    "T": [
        [complex(1.0, 0.0), complex(0.0, 0.0)],
        [complex(0.0, 0.0), cmath.exp(complex(0.0, math.pi / 4.0))],
    ],
}


def _apply_1q_gate(state: list[complex], n_qubits: int, target: int, matrix: list[list[complex]]) -> list[complex]:
    """Apply a 1-qubit gate in Qiskit wire convention (qubit 0 is LSB)."""
    dim = 1 << n_qubits
    out = [complex(0.0, 0.0)] * dim
    step = 1 << target
    m00, m01 = matrix[0][0], matrix[0][1]
    m10, m11 = matrix[1][0], matrix[1][1]

    for i in range(0, dim, 2 * step):
        for j in range(i, i + step):
            v0 = state[j]
            v1 = state[j + step]
            out[j] = m00 * v0 + m01 * v1
            out[j + step] = m10 * v0 + m11 * v1
    return out


def _apply_cnot(state: list[complex], n_qubits: int, control: int, target: int) -> list[complex]:
    """Apply CNOT where control and target are qubit indices."""
    dim = 1 << n_qubits
    out = list(state)
    for i in range(dim):
        if (i & (1 << control)) != 0 and (i & (1 << target)) == 0:
            paired = i | (1 << target)
            out[i], out[paired] = out[paired], out[i]
    return out


def _apply_cz(state: list[complex], n_qubits: int, control: int, target: int) -> list[complex]:
    """Apply CZ (phase flip if both qubits are 1)."""
    dim = 1 << n_qubits
    out = list(state)
    for i in range(dim):
        if (i & (1 << control)) != 0 and (i & (1 << target)) != 0:
            out[i] = -out[i]
    return out


def _apply_ccx(state: list[complex], n_qubits: int, ctrl1: int, ctrl2: int, target: int) -> list[complex]:
    """Apply Toffoli (CCX) gate."""
    dim = 1 << n_qubits
    out = list(state)
    mask = (1 << ctrl1) | (1 << ctrl2)
    for i in range(dim):
        if (i & mask) == mask and (i & (1 << target)) == 0:
            paired = i | (1 << target)
            out[i], out[paired] = out[paired], out[i]
    return out


def simulate_statevector(
    circuit: CircuitModel,
    prep_ops: list[dict[str, Any]] | None = None,
    hadamard_all: bool = False,
    reverse_dagger: bool = False,
) -> list[complex]:
    """Simulate circuit to final statevector.
    
    Tries Qiskit Aer first; falls back seamlessly to the exact pure-Python linear algebra simulator.
    """
    try:
        from qiskit import QuantumCircuit, QuantumRegister
        from qiskit_aer import AerSimulator

        n_qubits = circuit.qubitCount
        qr = QuantumRegister(n_qubits, "q")
        qc = QuantumCircuit(qr)

        if prep_ops:
            for p in prep_ops:
                g = p.get("gate", "H")
                tg = p.get("targets", [0])[0]
                if g == "H":
                    qc.h(tg)
                elif g == "X":
                    qc.x(tg)
                elif g == "Y":
                    qc.y(tg)
                elif g == "Z":
                    qc.z(tg)

        ops = [op for op in circuit.operations if op.gate != GateName.MEASURE]
        for op in ops:
            g = op.gate.value if hasattr(op.gate, "value") else str(op.gate)
            if g == "H":
                qc.h(op.targets[0])
            elif g == "X":
                qc.x(op.targets[0])
            elif g == "Y":
                qc.y(op.targets[0])
            elif g == "Z":
                qc.z(op.targets[0])
            elif g == "CNOT":
                qc.cx(op.controls[0], op.targets[0])
            elif g == "CZ":
                qc.cz(op.controls[0], op.targets[0])
            elif g == "CCX":
                qc.ccx(op.controls[0], op.controls[1], op.targets[0])
            elif g == "S":
                qc.s(op.targets[0])
            elif g == "T":
                qc.t(op.targets[0])

        if reverse_dagger:
            for op in reversed(ops):
                g = op.gate.value if hasattr(op.gate, "value") else str(op.gate)
                if g == "H":
                    qc.h(op.targets[0])
                elif g == "X":
                    qc.x(op.targets[0])
                elif g == "Y":
                    qc.y(op.targets[0])
                elif g == "Z":
                    qc.z(op.targets[0])
                elif g == "CNOT":
                    qc.cx(op.controls[0], op.targets[0])
                elif g == "CZ":
                    qc.cz(op.controls[0], op.targets[0])
                elif g == "CCX":
                    qc.ccx(op.controls[0], op.controls[1], op.targets[0])
                elif g == "S":
                    qc.sdg(op.targets[0])
                elif g == "T":
                    qc.tdg(op.targets[0])

        if hadamard_all:
            for q in range(n_qubits):
                qc.h(q)

        qc.save_statevector()
        sim = AerSimulator(method="statevector")
        job = sim.run(qc, shots=1)
        sv = job.result().get_statevector(qc).data
        return [complex(c) for c in sv]

    except Exception:
        # Pure-Python fallback (exact, zero dependencies)
        n_qubits = circuit.qubitCount
        dim = 1 << n_qubits
        state = [complex(0.0, 0.0)] * dim
        state[0] = complex(1.0, 0.0)

        if prep_ops:
            for p in prep_ops:
                g = p.get("gate", "H")
                tg = p.get("targets", [0])[0]
                if g in _GATE_MATRICES_1Q:
                    state = _apply_1q_gate(state, n_qubits, tg, _GATE_MATRICES_1Q[g])

        ops = [op for op in circuit.operations if op.gate != GateName.MEASURE]
        for op in ops:
            g = op.gate.value if hasattr(op.gate, "value") else str(op.gate)
            if g in _GATE_MATRICES_1Q:
                state = _apply_1q_gate(state, n_qubits, op.targets[0], _GATE_MATRICES_1Q[g])
            elif g == "CNOT":
                state = _apply_cnot(state, n_qubits, op.controls[0], op.targets[0])
            elif g == "CZ":
                state = _apply_cz(state, n_qubits, op.controls[0], op.targets[0])
            elif g == "CCX":
                state = _apply_ccx(state, n_qubits, op.controls[0], op.controls[1], op.targets[0])

        if reverse_dagger:
            for op in reversed(ops):
                g = op.gate.value if hasattr(op.gate, "value") else str(op.gate)
                if g in ("H", "X", "Y", "Z"):
                    state = _apply_1q_gate(state, n_qubits, op.targets[0], _GATE_MATRICES_1Q[g])
                elif g == "S":
                    # S dagger = Z * S
                    state = _apply_1q_gate(state, n_qubits, op.targets[0], [
                        [complex(1.0, 0.0), complex(0.0, 0.0)],
                        [complex(0.0, 0.0), complex(0.0, -1.0)],
                    ])
                elif g == "T":
                    # T dagger
                    state = _apply_1q_gate(state, n_qubits, op.targets[0], [
                        [complex(1.0, 0.0), complex(0.0, 0.0)],
                        [complex(0.0, 0.0), cmath.exp(complex(0.0, -math.pi / 4.0))],
                    ])
                elif g == "CNOT":
                    state = _apply_cnot(state, n_qubits, op.controls[0], op.targets[0])
                elif g == "CZ":
                    state = _apply_cz(state, n_qubits, op.controls[0], op.targets[0])
                elif g == "CCX":
                    state = _apply_ccx(state, n_qubits, op.controls[0], op.controls[1], op.targets[0])

        if hadamard_all:
            for q in range(n_qubits):
                state = _apply_1q_gate(state, n_qubits, q, _GATE_MATRICES_1Q["H"])

        return state


# ---------------------------------------------------------------------------
# Fidelity Calculation
# ---------------------------------------------------------------------------

def compute_fidelity(sv_a: list[complex], sv_b: list[complex]) -> float:
    """Compute state fidelity F = |<psi_a | psi_b>|^2."""
    if len(sv_a) != len(sv_b):
        return 0.0
    inner = sum(a.conjugate() * b for a, b in zip(sv_a, sv_b))
    return float(round(max(0.0, min(1.0, abs(inner) ** 2)), 6))


# ---------------------------------------------------------------------------
# Invariant G-1: Entanglement Entropy
# ---------------------------------------------------------------------------

def compute_entanglement_entropy(statevector: list[complex], n_qubits: int, subsystem_qubit: int = 0) -> float:
    """Compute von Neumann entropy S(rho_A) = -Tr(rho_A log2 rho_A) for subsystem A.
    
    - S = 0.0: separable product state
    - S = 1.0: maximally entangled Bell state (for 2 qubits)
    """
    dim = 1 << n_qubits
    rho00 = 0.0
    rho11 = 0.0
    rho01 = complex(0.0, 0.0)

    mask = ~(1 << subsystem_qubit)
    for i in range(dim):
        for j in range(dim):
            if (i & mask) != (j & mask):
                continue
            ri = (i >> subsystem_qubit) & 1
            rj = (j >> subsystem_qubit) & 1
            term = statevector[i] * statevector[j].conjugate()
            if ri == 0 and rj == 0:
                rho00 += term.real
            elif ri == 1 and rj == 1:
                rho11 += term.real
            elif ri == 0 and rj == 1:
                rho01 += term

    # Eigenvalues of 2x2 Hermitian density matrix with trace = 1
    delta = math.sqrt(max(0.0, (rho00 - rho11) ** 2 + 4.0 * (rho01.real ** 2 + rho01.imag ** 2)))
    l1 = max(0.0, min(1.0, (1.0 + delta) / 2.0))
    l2 = max(0.0, min(1.0, (1.0 - delta) / 2.0))

    entropy = 0.0
    for l in (l1, l2):
        if l > 1e-12:
            entropy -= l * math.log2(l)

    return float(round(max(0.0, entropy), 4))


def check_invariant_g1(student_circuit: CircuitModel, target_circuit: CircuitModel) -> InvariantResult:
    """Evaluate Invariant G-1: Entanglement Entropy."""
    sv_student = simulate_statevector(student_circuit)
    sv_target = simulate_statevector(target_circuit)

    s_student = compute_entanglement_entropy(sv_student, student_circuit.qubitCount)
    s_target = compute_entanglement_entropy(sv_target, target_circuit.qubitCount)

    # Entangled target check
    if s_target >= 0.5:
        passed = s_student >= 0.5 and abs(s_student - s_target) <= 0.2
        if not passed:
            msg = (
                f"G-1: Entanglement Entropy violated — your circuit produces separable product state "
                f"(S(ρ_A) = {s_student:.2f}); target produces Bell state with S(ρ_A) = {s_target:.2f}."
            )
        else:
            msg = f"G-1: Entanglement Entropy verified (S(ρ_A) = {s_student:.2f}, expected = {s_target:.2f})."
    else:
        # Separable target check
        passed = s_student < 0.5
        if not passed:
            msg = (
                f"G-1: Entanglement Entropy violated — target requires separable state (S(ρ_A) = {s_target:.2f}), "
                f"but your circuit produces entangled state with S(ρ_A) = {s_student:.2f}."
            )
        else:
            msg = f"G-1: Entanglement Entropy verified (S(ρ_A) = {s_student:.2f}, expected = {s_target:.2f})."

    return InvariantResult(
        invariant="G-1",
        passed=passed,
        measuredValue=s_student,
        expectedValue=s_target,
        message=msg,
    )


# ---------------------------------------------------------------------------
# Invariant G-2: Phase Observability
# ---------------------------------------------------------------------------

def check_invariant_g2(student_circuit: CircuitModel, target_circuit: CircuitModel) -> InvariantResult:
    """Evaluate Invariant G-2: Phase Observability in Hadamard basis."""
    sv_student_h = simulate_statevector(student_circuit, hadamard_all=True)
    sv_target_h = simulate_statevector(target_circuit, hadamard_all=True)

    f_hadamard = compute_fidelity(sv_student_h, sv_target_h)
    passed = f_hadamard >= 0.99

    if not passed:
        msg = (
            f"G-2: Phase Observability violated — your circuit creates correct probability magnitudes but "
            f"wrong relative phase, causing destructive interference to fail in the Hadamard basis "
            f"(Hadamard fidelity = {f_hadamard:.3f} < 0.99)."
        )
    else:
        msg = f"G-2: Phase Observability verified — correct relative phase interference confirmed in Hadamard basis (fidelity = {f_hadamard:.3f})."

    return InvariantResult(
        invariant="G-2",
        passed=passed,
        measuredValue=f_hadamard,
        expectedValue=1.0,
        message=msg,
    )


# ---------------------------------------------------------------------------
# Invariant G-3: Unitary Reversibility
# ---------------------------------------------------------------------------

def check_invariant_g3(student_circuit: CircuitModel, target_circuit: CircuitModel | None = None) -> InvariantResult:
    """Evaluate Invariant G-3: Unitary Reversibility (U dagger U = I)."""
    # Any mid-circuit measurement destroys unitarity
    has_measure = any(op.gate == GateName.MEASURE for op in student_circuit.operations)
    if has_measure:
        return InvariantResult(
            invariant="G-3",
            passed=False,
            measuredValue=0.0,
            expectedValue=1.0,
            message="G-3: Unitary Reversibility violated — mid-circuit MEASURE operation collapses state irreversibly.",
        )

    sv_rev = simulate_statevector(student_circuit, reverse_dagger=True)
    # Ground state has amplitude 1 at index 0
    f_rev = float(round(abs(sv_rev[0]) ** 2, 6))
    passed = f_rev >= 0.99

    if not passed:
        msg = f"G-3: Unitary Reversibility violated — your circuit is not a valid unitary transformation (reversibility fidelity = {f_rev:.3f} < 0.99)."
    else:
        msg = f"G-3: Unitary Reversibility verified — U† U restored ground state |0⟩^n with fidelity {f_rev:.3f}."

    return InvariantResult(
        invariant="G-3",
        passed=passed,
        measuredValue=f_rev,
        expectedValue=1.0,
        message=msg,
    )


# ---------------------------------------------------------------------------
# Socratic Counterexample Generation
# ---------------------------------------------------------------------------

DEFAULT_TEST_INPUTS: list[dict[str, Any]] = [
    {"state": "|+⟩", "prep_ops": [{"gate": "H", "targets": [0]}]},
    {"state": "|0⟩", "prep_ops": []},
    {"state": "|1⟩", "prep_ops": [{"gate": "X", "targets": [0]}]},
]


def _format_state_output(sv: list[complex], n_qubits: int) -> dict[str, Any]:
    """Format a statevector into contract-keyed probabilities and amplitudes."""
    probs = build_normalized_probability_map(sv, n_qubits)
    amps = build_normalized_amplitude_map(sv, n_qubits)
    # Find dominant label
    sorted_probs = sorted(probs.items(), key=lambda kv: kv[1], reverse=True)
    dominant_label = f"|{sorted_probs[0][0]}⟩" if sorted_probs else "|?⟩"
    if len(sorted_probs) == 2 and abs(sorted_probs[0][1] - 0.5) < 0.05:
        dominant_label = f"(|{sorted_probs[0][0]}⟩ + |{sorted_probs[1][0]}⟩)/√2"

    return {
        "probabilities": probs,
        "amplitudes": amps,
        "dominantLabel": dominant_label,
    }


def generate_counterexample(
    student_circuit: CircuitModel,
    target_circuit: CircuitModel,
    failed_invariant: Literal["G-1", "G-2", "G-3"],
    test_inputs: list[dict[str, Any]] | None = None,
    preferred_input: str | None = None,
) -> Optional[CounterExample]:
    """Find the smallest basis state where student_circuit diverges from target_circuit."""
    candidate_inputs = list(test_inputs) if test_inputs is not None else list(DEFAULT_TEST_INPUTS)

    # If preferred_input is provided, prioritize it
    if preferred_input:
        candidate_inputs.sort(key=lambda item: 0 if item["state"] == preferred_input else 1)

    n_qubits = student_circuit.qubitCount

    for inp in candidate_inputs:
        sv_student = simulate_statevector(student_circuit, prep_ops=inp["prep_ops"])
        sv_target = simulate_statevector(target_circuit, prep_ops=inp["prep_ops"])
        fidelity = compute_fidelity(sv_student, sv_target)

        if fidelity < 0.99:
            s_out = _format_state_output(sv_student, n_qubits)
            t_out = _format_state_output(sv_target, n_qubits)

            # Detailed Socratic pedagogical explanation
            if failed_invariant == "G-1":
                s_entropy = compute_entanglement_entropy(sv_student, n_qubits)
                t_entropy = compute_entanglement_entropy(sv_target, n_qubits)
                explanation = (
                    f"G-1: Entanglement Entropy violated — on input {inp['state']}, student and target states diverge "
                    f"(fidelity = {fidelity:.3f} < 0.99). Your circuit produces a separable product state with S(ρ_A) = {s_entropy:.2f} "
                    f"(subsystem measurement produces deterministic output), whereas target Bell state produces maximum entanglement "
                    f"with S(ρ_A) = {t_entropy:.2f} (random 50/50 measurement correlation)."
                )
            elif failed_invariant == "G-2":
                explanation = (
                    f"G-2: Phase Observability violated — on input {inp['state']}, relative phase interference diverges "
                    f"(fidelity = {fidelity:.3f} < 0.99). Your circuit produces correct probability magnitudes but lacks the required "
                    f"quantum phase coherence, causing destructive interference to fail in the Hadamard basis."
                )
            else:
                explanation = (
                    f"G-3: Unitary Reversibility violated — on input {inp['state']}, state fidelity is {fidelity:.3f} < 0.99. "
                    f"Your circuit does not execute a reversible unitary mapping equivalent to the target."
                )

            return CounterExample(
                inputState=inp["state"],
                studentOutput=s_out,
                targetOutput=t_out,
                fidelity=fidelity,
                invariantViolated=failed_invariant,
                explanation=explanation,
            )

    return None


# ---------------------------------------------------------------------------
# Pre-seeded Mutation Challenges & Target Circuits (§5.6)
# ---------------------------------------------------------------------------

def get_target_circuit_for_challenge(challenge_id: str) -> CircuitModel:
    """Return canonical target circuit for known mutation and repair challenges."""
    cid = challenge_id.upper()

    if cid in ("CH_BELL_ENTANGLE", "CH_BELL_REPAIR"):
        return CircuitModel(
            id="cm_target_bell",
            name="Target Bell Circuit (|Φ+⟩)",
            qubitCount=2,
            classicalBitCount=2,
            operations=[
                Operation(opId="op_h0", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
                Operation(opId="op_cx01", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=1),
            ],
            source="SEED",
            modelVersion=1,
        )

    if cid == "CH_PHASE_SUPER":
        return CircuitModel(
            id="cm_target_phase_super",
            name="Target Superposition with Phase (|0⟩+|1⟩)/√2",
            qubitCount=2,
            classicalBitCount=2,
            operations=[
                Operation(opId="op_h0", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
            ],
            source="SEED",
            modelVersion=1,
        )

    if cid == "CH_GROVER_2Q":
        return CircuitModel(
            id="cm_target_grover_2q",
            name="Target 2-Qubit Grover Search (|11⟩)",
            qubitCount=2,
            classicalBitCount=2,
            operations=[
                # Superposition
                Operation(opId="op_g_h0", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
                Operation(opId="op_g_h1", gate=GateName.H, targets=[1], controls=[], classicalTargets=[], column=0),
                # Oracle for |11⟩: CZ(0,1) represented via H(1)-CNOT(0,1)-H(1)
                Operation(opId="op_g_oh1", gate=GateName.H, targets=[1], controls=[], classicalTargets=[], column=1),
                Operation(opId="op_g_ocx", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=2),
                Operation(opId="op_g_oh2", gate=GateName.H, targets=[1], controls=[], classicalTargets=[], column=3),
                # Diffusion
                Operation(opId="op_g_dh0", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=4),
                Operation(opId="op_g_dh1", gate=GateName.H, targets=[1], controls=[], classicalTargets=[], column=4),
                Operation(opId="op_g_dx0", gate=GateName.X, targets=[0], controls=[], classicalTargets=[], column=5),
                Operation(opId="op_g_dx1", gate=GateName.X, targets=[1], controls=[], classicalTargets=[], column=5),
                Operation(opId="op_g_doh1", gate=GateName.H, targets=[1], controls=[], classicalTargets=[], column=6),
                Operation(opId="op_g_dcx", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=7),
                Operation(opId="op_g_doh2", gate=GateName.H, targets=[1], controls=[], classicalTargets=[], column=8),
                Operation(opId="op_g_dx2", gate=GateName.X, targets=[0], controls=[], classicalTargets=[], column=9),
                Operation(opId="op_g_dx3", gate=GateName.X, targets=[1], controls=[], classicalTargets=[], column=9),
                Operation(opId="op_g_dh2", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=10),
                Operation(opId="op_g_dh3", gate=GateName.H, targets=[1], controls=[], classicalTargets=[], column=10),
            ],
            source="SEED",
            modelVersion=1,
        )

    if cid == "CH_UNITARY_REV":
        return CircuitModel(
            id="cm_target_unitary_rev",
            name="Target Unitary Reversible Sequence (H then H)",
            qubitCount=2,
            classicalBitCount=2,
            operations=[
                Operation(opId="op_u_h1", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
                Operation(opId="op_u_h2", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=1),
            ],
            source="SEED",
            modelVersion=1,
        )

    if cid == "CH_BELL_PSI_PLUS":
        return CircuitModel(
            id="cm_target_bell_psi",
            name="Target Anti-Correlated Bell (|01⟩+|10⟩)/√2",
            qubitCount=2,
            classicalBitCount=2,
            operations=[
                Operation(opId="op_x1", gate=GateName.X, targets=[1], controls=[], classicalTargets=[], column=0),
                Operation(opId="op_h0", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=1),
                Operation(opId="op_cx01", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=2),
            ],
            source="SEED",
            modelVersion=1,
        )

    # Default fallback target (Bell circuit)
    return CircuitModel(
        id=f"cm_target_{challenge_id.lower()}",
        name=f"Target Circuit for {challenge_id}",
        qubitCount=2,
        classicalBitCount=2,
        operations=[
            Operation(opId="op_h0", gate=GateName.H, targets=[0], controls=[], classicalTargets=[], column=0),
            Operation(opId="op_cx01", gate=GateName.CNOT, targets=[1], controls=[0], classicalTargets=[], column=1),
        ],
        source="SEED",
        modelVersion=1,
    )


# ---------------------------------------------------------------------------
# Assessment Pipeline
# ---------------------------------------------------------------------------

def assess_circuit(
    student_circuit: CircuitModel,
    challenge_id: str,
    learner_id: str,
    target_circuit: Optional[CircuitModel] = None,
    preferred_counterexample_input: Optional[str] = None,
) -> AssessResponse:
    """Evaluate student circuit against target challenge across invariants G-1, G-2, G-3."""
    target = target_circuit or get_target_circuit_for_challenge(challenge_id)

    # 1. Run all three invariant checks
    g1 = check_invariant_g1(student_circuit, target)
    g2 = check_invariant_g2(student_circuit, target)
    g3 = check_invariant_g3(student_circuit, target)

    invariants = [g1, g2, g3]

    # 2. Overall target fidelity
    sv_student = simulate_statevector(student_circuit)
    sv_target = simulate_statevector(target)
    direct_fidelity = compute_fidelity(sv_student, sv_target)

    all_invariants_passed = all(inv.passed for inv in invariants)
    passed = all_invariants_passed and direct_fidelity >= 0.99

    attempt_id = f"ca_assess_{uuid.uuid4().hex[:10]}"

    if passed:
        counter_example = None
        feedback = "All quantum invariants satisfied. Your circuit correctly prepares the expected state with high fidelity."
    else:
        # Determine first failed invariant
        failed_inv: Literal["G-1", "G-2", "G-3"] = "G-1"
        for inv in invariants:
            if not inv.passed:
                failed_inv = inv.invariant
                break

        counter_example = generate_counterexample(
            student_circuit,
            target,
            failed_inv,
            preferred_input=preferred_counterexample_input,
        )

        feedback = (
            f"Assessment failed on invariant {failed_inv}. "
            + (counter_example.explanation if counter_example else "Circuit diverges from target state.")
        )

    response = AssessResponse(
        attemptId=attempt_id,
        passed=passed,
        invariantsChecked=invariants,
        counterExample=counter_example,
        feedback=feedback,
    )

    store_saved_assessment(response)
    return response
