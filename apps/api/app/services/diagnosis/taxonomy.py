"""
AI-4 — Misconception Taxonomy, Learner-Level Replay Copy, and Explanation Templates
===================================================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-4
Branch:  feat/ai-pedagogy/ai-4-complete-the-misconception-taxonomy-and
Version: 1
Contracts consumed: board/contracts/circuit-simulation.md v1
                    board/contracts/learning-content.md v1
Contract owned:    board/contracts/flight-recorder-tutor.md v1

Key Requirements (AI-4):
1. Complete misconception taxonomy rules and replay copy for all 4 codes:
   - SUPERPOSITION_VS_ENTANGLEMENT
   - MEASUREMENT_DETERMINISM
   - GATE_ORDER
   - NO_SIGNAL
2. Learner-level replay copy tailored for both demo personas:
   - Aarav (BEGINNER_CSE): intuitive, observable outcomes, code/branch reasoning, no math barrier.
   - Meera (PHYSICS_TO_CODE): formal quantum theory, linear algebra, state vectors, tensor products.
3. Explanation templates that explicitly distinguish state representation from physical trajectory:
   - Addresses the core physics-education misconception that a quantum state vector
     or Bloch sphere represents a classical spatial trajectory or particle in physical space.
   - Explains that the state lives in abstract Hilbert space representing probability
     amplitudes and phases, while measurement is non-local projective collapse.
4. Robust no-signal behavior for correct predictions (CORRELATED_00_11), missing predictions (None),
   and unrecognized prediction inputs.
5. 100% pure and deterministic — zero LLM calls, zero free text persisted, zero unhandled branches.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal, Optional

from app.services.diagnosis.rules import (
    KNOWN_EVIDENCE_KEYS,
    KNOWN_MISCONCEPTION_CODES,
    KNOWN_PREDICTION_ANSWERS,
    DiagnosisResult,
    apply_rules,
    find_rule,
)

# ---------------------------------------------------------------------------
# Learner Role Definitions
# ---------------------------------------------------------------------------

LearnerRole = Literal["BEGINNER_CSE", "PHYSICS_TO_CODE"]
KNOWN_LEARNER_ROLES: frozenset[str] = frozenset({"BEGINNER_CSE", "PHYSICS_TO_CODE"})
DEFAULT_LEARNER_ROLE: LearnerRole = "BEGINNER_CSE"


def normalize_learner_role(role: Optional[str]) -> LearnerRole:
    """Normalize learner role string to a known LearnerRole, defaulting safely."""
    if role and role.upper() in KNOWN_LEARNER_ROLES:
        return role.upper()  # type: ignore[return-value]
    return DEFAULT_LEARNER_ROLE


# ---------------------------------------------------------------------------
# Replay Step Copy Data Structure
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ReplayStepCopy:
    """Replay step headline and explanatory copy tailored for a learner role."""
    step_index: int
    headline: str
    learner_copy: str
    evidence_keys: tuple[str, ...]
    representation_note: str

    def to_contract_dict(self) -> dict[str, Any]:
        """Convert to flight-recorder-tutor contract format."""
        return {
            "stepIndex": self.step_index,
            "headline": self.headline,
            "evidenceKeys": list(self.evidence_keys),
            "learnerCopy": self.learner_copy,
            "representationNote": self.representation_note,
        }


# ---------------------------------------------------------------------------
# Explanation Template Data Structure
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ExplanationTemplate:
    """Pedagogical explanation template distinguishing representation from trajectory."""
    code: str
    role: LearnerRole
    title: str
    core_concept: str
    representation_vs_trajectory: str
    pedagogical_guidance: str
    repair_action: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "code": self.code,
            "role": self.role,
            "title": self.title,
            "coreConcept": self.core_concept,
            "representationVsTrajectory": self.representation_vs_trajectory,
            "pedagogicalGuidance": self.pedagogical_guidance,
            "repairAction": self.repair_action,
        }


# ---------------------------------------------------------------------------
# Replay Copy Table for all Misconception Codes & Learner Roles
# ---------------------------------------------------------------------------

REPLAY_COPY_TABLE: dict[tuple[str, LearnerRole], tuple[ReplayStepCopy, ...]] = {
    # -----------------------------------------------------------------------
    # SUPERPOSITION_VS_ENTANGLEMENT
    # -----------------------------------------------------------------------
    ("SUPERPOSITION_VS_ENTANGLEMENT", "BEGINNER_CSE"): (
        ReplayStepCopy(
            step_index=0,
            headline="Superposition created on qubit 0",
            learner_copy=(
                "The Hadamard (H) gate puts qubit 0 into an equal 50/50 superposition of 0 and 1. "
                "Think of it as two parallel computational branches, both equally likely. "
                "Qubit 1 remains unchanged in state 0."
            ),
            evidence_keys=("stateTrace.0.basisProbabilities",),
            representation_note=(
                "The 50/50 probability chart represents computational possibilities, "
                "not a physical particle oscillating between locations."
            ),
        ),
        ReplayStepCopy(
            step_index=1,
            headline="Entanglement created between qubits",
            learner_copy=(
                "The CNOT gate uses qubit 0 as control and qubit 1 as target. When qubit 0 is 1, "
                "qubit 1 flips to 1. The two branches become 00 and 11. "
                "Although each shot is random, the two qubits are tied together — not independent!"
            ),
            evidence_keys=("stateTrace.1.basisProbabilities", "stateTrace.1.reducedQubits"),
            representation_note=(
                "The joint state (00 and 11) is a single non-separable mathematical vector. "
                "The correlation does not mean one particle sends a signal across physical space."
            ),
        ),
    ),
    ("SUPERPOSITION_VS_ENTANGLEMENT", "PHYSICS_TO_CODE"): (
        ReplayStepCopy(
            step_index=0,
            headline="Hadamard unitary prepares product state (|0>+|1>)/√2 ⊗ |0>",
            learner_copy=(
                "Hadamard gate H acts locally on qubit 0, transforming |00> into "
                "(|00> + |10>)/√2. The state remains a separable product state in Hilbert space. "
                "Both qubits have purity 1.0 (pure subsystems)."
            ),
            evidence_keys=("stateTrace.0.basisProbabilities", "stateTrace.0.amplitudes"),
            representation_note=(
                "The statevector and Bloch vector are abstract representations of probability amplitudes "
                "in state space, not the physical trajectory of a particle moving through space."
            ),
        ),
        ReplayStepCopy(
            step_index=1,
            headline="CNOT entangles system into maximally entangled Bell state |Φ+>",
            learner_copy=(
                "The entangling unitary CNOT maps (|00> + |10>)/√2 to (|00> + |11>)/√2. "
                "The joint state cannot be factored into single-qubit states. "
                "Tracing out either qubit yields a reduced density matrix with purity 0.5 (maximally mixed)."
            ),
            evidence_keys=("stateTrace.1.basisProbabilities", "stateTrace.1.reducedQubits"),
            representation_note=(
                "Entanglement resides in the tensor product structure of the state space. "
                "It is a non-local correlation in measurement statistics, not a physical trajectory or mechanical link."
            ),
        ),
    ),

    # -----------------------------------------------------------------------
    # MEASUREMENT_DETERMINISM
    # -----------------------------------------------------------------------
    ("MEASUREMENT_DETERMINISM", "BEGINNER_CSE"): (
        ReplayStepCopy(
            step_index=0,
            headline="Superposition introduced",
            learner_copy=(
                "The H gate introduces true quantum randomness. Qubit 0 is no longer a fixed 0 or 1, "
                "so downstream operations will not produce a single deterministic outcome."
            ),
            evidence_keys=("stateTrace.0.basisProbabilities",),
            representation_note=(
                "Quantum randomness is intrinsic to the state, not an artifact of imperfect measurement tools."
            ),
        ),
        ReplayStepCopy(
            step_index=1,
            headline="Probabilistic correlation observed",
            learner_copy=(
                "Predicting that the circuit always outputs 00 or always outputs 11 assumes deterministic behavior. "
                "In reality, verified simulation shows both 00 (50%) and 11 (50%) appear. "
                "Measurement randomly collapses into one branch each run."
            ),
            evidence_keys=("stateTrace.1.basisProbabilities", "stateTrace.1.basisProbabilities.00", "stateTrace.1.basisProbabilities.11"),
            representation_note=(
                "State amplitudes represent probabilities before measurement. "
                "Measurement randomly selects an eigenstate rather than following a predetermined hidden path."
            ),
        ),
    ),
    ("MEASUREMENT_DETERMINISM", "PHYSICS_TO_CODE"): (
        ReplayStepCopy(
            step_index=0,
            headline="Coherent superposition across computational basis",
            learner_copy=(
                "Unitary evolution produces non-zero probability amplitudes across orthogonal basis vectors. "
                "The system possesses definite statevector evolution, but indefinite projective measurement values."
            ),
            evidence_keys=("stateTrace.0.basisProbabilities", "stateTrace.0.amplitudes"),
            representation_note=(
                "The statevector is a deterministic wave function in Hilbert space; its projection onto "
                "measurement operators follows Born's probabilistic rule."
            ),
        ),
        ReplayStepCopy(
            step_index=1,
            headline="Born rule probability distribution P(00)=0.5, P(11)=0.5",
            learner_copy=(
                "The final state |Φ+> = (|00> + |11>)/√2 has support on two orthogonal basis states. "
                "By the Born rule, P(00) = |<00|Φ+>|² = 0.5 and P(11) = |<11|Φ+>|² = 0.5. "
                "Assuming deterministic output conflates unitary state evolution with projective collapse."
            ),
            evidence_keys=("stateTrace.1.basisProbabilities", "stateTrace.1.basisProbabilities.00", "stateTrace.1.basisProbabilities.11"),
            representation_note=(
                "Measurement collapse is an irreversible projection onto an observable basis, "
                "not the detection of a particle following a predefined classical trajectory."
            ),
        ),
    ),

    # -----------------------------------------------------------------------
    # GATE_ORDER
    # -----------------------------------------------------------------------
    ("GATE_ORDER", "BEGINNER_CSE"): (
        ReplayStepCopy(
            step_index=0,
            headline="Gate sequence divergence at step 0",
            learner_copy=(
                "Gate order matters in quantum circuits! Applying H to qubit 0 first prepares "
                "the control qubit. If gates are applied in the wrong sequence or qubits are swapped, "
                "the circuit creates an unintended outcome like 01 or 10 instead of Bell correlation."
            ),
            evidence_keys=("stateTrace.0.basisProbabilities", "stateTrace.0.reducedQubits"),
            representation_note=(
                "The left-to-right circuit timeline represents sequential gate application, "
                "not physical motion of qubits along wires."
            ),
        ),
        ReplayStepCopy(
            step_index=1,
            headline="Target qubit behavior diverged",
            learner_copy=(
                "Because CNOT executed with an unsuperposed control or swapped target, the resulting "
                "truth table failed to produce the correlated 00 and 11 pair. "
                "Check that H is on the control qubit before CNOT."
            ),
            evidence_keys=("stateTrace.1.basisProbabilities",),
            representation_note=(
                "Circuit diagrams are mathematical flowcharts, not electrical wiring diagrams."
            ),
        ),
    ),
    ("GATE_ORDER", "PHYSICS_TO_CODE"): (
        ReplayStepCopy(
            step_index=0,
            headline="Non-commutative operator ordering [H ⊗ I, CNOT] ≠ 0",
            learner_copy=(
                "Quantum gates are unitary matrix transformations. Because matrix multiplication is non-commutative, "
                "the operator product U = CNOT · (H ⊗ I) yields |Φ+>, whereas swapping order or wire index "
                "yields an entirely different unitary matrix."
            ),
            evidence_keys=("stateTrace.0.basisProbabilities", "stateTrace.0.reducedQubits"),
            representation_note=(
                "The circuit model is an operator network acting on state space, "
                "not particles traversing physical spatial paths."
            ),
        ),
        ReplayStepCopy(
            step_index=1,
            headline="State evolution mismatch in computational basis",
            learner_copy=(
                "Without the prior Hadamard basis rotation on control qubit 0, CNOT acts merely as a "
                "classical permutation matrix on computational basis states, failing to generate entanglement."
            ),
            evidence_keys=("stateTrace.1.basisProbabilities",),
            representation_note=(
                "Unitary transformations rotate the state vector in Hilbert space; timing represents "
                "sequential transformation, not relativistic physical travel."
            ),
        ),
    ),

    # -----------------------------------------------------------------------
    # NO_SIGNAL
    # -----------------------------------------------------------------------
    ("NO_SIGNAL", "BEGINNER_CSE"): (
        ReplayStepCopy(
            step_index=0,
            headline="Step 0 verified: Superposition initialized",
            learner_copy=(
                "Qubit 0 is properly superposed with 50% probability of 0 and 50% probability of 1. "
                "Your prediction aligns with the simulated circuit behavior."
            ),
            evidence_keys=("stateTrace.0.basisProbabilities",),
            representation_note=(
                "The probability display represents quantum amplitude distributions in state space."
            ),
        ),
        ReplayStepCopy(
            step_index=1,
            headline="Step 1 verified: Bell correlation confirmed",
            learner_copy=(
                "The CNOT gate correctly linked both qubits into an entangled Bell state. "
                "Simulation confirms equal 50% chances of 00 and 11. No misconception detected!"
            ),
            evidence_keys=("stateTrace.1.basisProbabilities",),
            representation_note=(
                "The verified correlation reflects quantum entanglement across computational branches."
            ),
        ),
    ),
    ("NO_SIGNAL", "PHYSICS_TO_CODE"): (
        ReplayStepCopy(
            step_index=0,
            headline="Step 0 verified: Separable state (|0>+|1>)/√2 ⊗ |0>",
            learner_copy=(
                "Unitary transformation H ⊗ I prepared the correct equal superposition on qubit 0. "
                "Verified statevector matches theoretical expectation."
            ),
            evidence_keys=("stateTrace.0.basisProbabilities",),
            representation_note=(
                "State vector representation correctly models initial product state evolution."
            ),
        ),
        ReplayStepCopy(
            step_index=1,
            headline="Step 1 verified: Bell state |Φ+> fidelity confirmed",
            learner_copy=(
                "Entangling operator CNOT produced |Φ+> = (|00>+|11>)/√2 with zero divergence. "
                "Subsystem purities and basis probabilities strictly conform to quantum theory."
            ),
            evidence_keys=("stateTrace.1.basisProbabilities",),
            representation_note=(
                "Entangled state representation verified without conceptual or numerical divergence."
            ),
        ),
    ),
}


# ---------------------------------------------------------------------------
# Explanation Templates (Distinguishing Representation from Trajectory)
# ---------------------------------------------------------------------------

EXPLANATION_TEMPLATES: dict[tuple[str, LearnerRole], ExplanationTemplate] = {
    ("SUPERPOSITION_VS_ENTANGLEMENT", "BEGINNER_CSE"): ExplanationTemplate(
        code="SUPERPOSITION_VS_ENTANGLEMENT",
        role="BEGINNER_CSE",
        title="Superposition vs Entanglement",
        core_concept="Entanglement creates correlated outcomes between qubits, not independent random events.",
        representation_vs_trajectory=(
            "Distinguishing Representation from Trajectory: The quantum circuit diagram and Bloch sphere "
            "are mathematical models showing probabilities of computational states. They do NOT show "
            "a physical particle moving along a path or spinning in physical 3D space. When two qubits "
            "entangle, their outcomes are linked not because signals travel between them, but because "
            "their joint state cannot be split into two separate descriptions."
        ),
        pedagogical_guidance=(
            "You predicted independent randomness, like flipping two separate coins. But after CNOT, "
            "qubit 1's fate is tied to qubit 0. When qubit 0 yields 0, qubit 1 is always 0; when qubit 0 "
            "yields 1, qubit 1 is always 1. The result is only 00 or 11, never 01 or 10."
        ),
        repair_action="Complete the Bell repair challenge to restore the correct entangled state support.",
    ),
    ("SUPERPOSITION_VS_ENTANGLEMENT", "PHYSICS_TO_CODE"): ExplanationTemplate(
        code="SUPERPOSITION_VS_ENTANGLEMENT",
        role="PHYSICS_TO_CODE",
        title="Non-Separability in Hilbert Space",
        core_concept="Entangled states are non-separable vectors in tensor product Hilbert space H_A ⊗ H_B.",
        representation_vs_trajectory=(
            "Distinguishing Representation from Physical Trajectory: The statevector |Ψ⟩ and Bloch sphere vectors "
            "are mathematical representations of probability amplitudes and expectation values in a complex Hilbert space, "
            "NOT trajectories of physical particles in spacetime. A single-qubit Bloch vector cannot fully describe an entangled "
            "qubit because its reduced state is mixed (purity Tr(ρ²) = 0.5), demonstrating that quantum correlation is a global "
            "property of the state space rather than classical particles following local spatial trajectories."
        ),
        pedagogical_guidance=(
            "Independent random behavior corresponds to a mixed separable state ρ_A ⊗ ρ_B. The Bell state |Φ+⟩, "
            "however, has joint state |Φ+⟩ = (|00⟩ + |11⟩)/√2. Tracing out either subsystem yields a maximally mixed "
            "state with zero Bloch vector length, proving non-local quantum correlation."
        ),
        repair_action="Restore Bell correlation |Φ+⟩ in the circuit repair challenge.",
    ),

    ("MEASUREMENT_DETERMINISM", "BEGINNER_CSE"): ExplanationTemplate(
        code="MEASUREMENT_DETERMINISM",
        role="BEGINNER_CSE",
        title="Measurement is Probabilistic, Not Deterministic",
        core_concept="Quantum circuits with superposition collapse randomly upon measurement; they do not output a single fixed answer.",
        representation_vs_trajectory=(
            "Distinguishing Representation from Trajectory: The circuit output displays 50% for 00 and 50% for 11. "
            "This does not mean the circuit is alternating along a physical track or that a hidden mechanism decides "
            "the outcome. The quantum state represents a probability distribution that only resolves upon measurement."
        ),
        pedagogical_guidance=(
            "Predicting ALWAYS_00 or ALWAYS_11 assumes the circuit works like classical logic where inputs produce "
            "one guaranteed output. Because of Hadamard and CNOT, each measurement shot is fundamentally random."
        ),
        repair_action="Practice with the measurement challenge to see how repeated shots reveal the probability distribution.",
    ),
    ("MEASUREMENT_DETERMINISM", "PHYSICS_TO_CODE"): ExplanationTemplate(
        code="MEASUREMENT_DETERMINISM",
        role="PHYSICS_TO_CODE",
        title="Projective Measurement and the Born Rule",
        core_concept="Unitary evolution is deterministic in state space, but projective measurement is stochastic under the Born rule.",
        representation_vs_trajectory=(
            "Distinguishing Representation from Physical Trajectory: Unitary evolution U(t) rotates the statevector "
            "deterministically in Hilbert space according to the Schrödinger equation. However, this mathematical rotation "
            "does not represent a physical particle moving along an orbit. When a projective measurement P_m occurs, the state "
            "collapses probabilistically with Born probability P(m) = ⟨Ψ|P_m|Ψ⟩, refuting classical determinism."
        ),
        pedagogical_guidance=(
            "The state |Φ+⟩ has equal amplitude 1/√2 on |00⟩ and |11⟩. Predicting a deterministic single basis outcome "
            "overlooks the foundational postulate of quantum measurement."
        ),
        repair_action="Verify Born rule statistics in the measurement repair challenge.",
    ),

    ("GATE_ORDER", "BEGINNER_CSE"): ExplanationTemplate(
        code="GATE_ORDER",
        role="BEGINNER_CSE",
        title="Gate Application Sequence",
        core_concept="Quantum operations must be applied in exact order to construct the intended state.",
        representation_vs_trajectory=(
            "Distinguishing Representation from Trajectory: A quantum circuit diagram shows sequential operations "
            "applied to qubit registers. The wires are not physical copper wires carrying moving charges; they are "
            "timelines of mathematical transformations."
        ),
        pedagogical_guidance=(
            "If CNOT is executed before H, or if control and target qubits are swapped, the circuit will produce "
            "unintended outcomes (like 01 or 10). To create a Bell state, H must prepare qubit 0 before CNOT links it."
        ),
        repair_action="Reorder the gates in the circuit repair challenge so H precedes CNOT.",
    ),
    ("GATE_ORDER", "PHYSICS_TO_CODE"): ExplanationTemplate(
        code="GATE_ORDER",
        role="PHYSICS_TO_CODE",
        title="Unitary Operator Non-Commutativity",
        core_concept="Matrix multiplication of quantum logic gates is non-commutative ([U_1, U_2] ≠ 0).",
        representation_vs_trajectory=(
            "Distinguishing Representation from Physical Trajectory: Circuit gate sequences represent the ordered product "
            "of unitary operators U = U_n · ... · U_1 acting on state space. Time ordering on the circuit grid denotes operator "
            "composition, not relativistic spatial transit of physical particles."
        ),
        pedagogical_guidance=(
            "The Bell circuit requires U = CNOT_{0→1} · (H_0 ⊗ I_1). Permuting the gates or transposing control and target "
            "changes the operator eigenspaces, producing states orthogonal to the desired Bell state."
        ),
        repair_action="Correct the operator sequence in the gate order repair challenge.",
    ),

    ("NO_SIGNAL", "BEGINNER_CSE"): ExplanationTemplate(
        code="NO_SIGNAL",
        role="BEGINNER_CSE",
        title="No Conceptual Divergence Detected",
        core_concept="Your prediction matches the simulated quantum state evolution.",
        representation_vs_trajectory=(
            "Distinguishing Representation from Trajectory: The verified circuit behavior confirms your prediction. "
            "Remember that state traces depict probability distributions in mathematical state space, not physical particle motion."
        ),
        pedagogical_guidance=(
            "The circuit successfully prepares the Bell state with 50% 00 and 50% 11. No misconceptions were identified."
        ),
        repair_action="Proceed to the next module in your learning path.",
    ),
    ("NO_SIGNAL", "PHYSICS_TO_CODE"): ExplanationTemplate(
        code="NO_SIGNAL",
        role="PHYSICS_TO_CODE",
        title="Verified State Evolution Fidelity",
        core_concept="Unitary evolution and statevector projections are fully consistent with theoretical Bell state formulation.",
        representation_vs_trajectory=(
            "Distinguishing Representation from Physical Trajectory: Statevector, reduced density matrices, and basis probabilities "
            "match theoretical Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2. Abstract Hilbert space representation correctly models the physical experiment."
        ),
        pedagogical_guidance=(
            "No divergence was detected between your prediction and verified simulator output."
        ),
        repair_action="Advance to subsequent quantum algorithms and circuit modules.",
    ),
}


# ---------------------------------------------------------------------------
# Public Functions for AI-4
# ---------------------------------------------------------------------------

def get_replay_copy_for_role(
    code: str,
    role: Optional[str] = None,
) -> tuple[ReplayStepCopy, ...]:
    """Retrieve role-tailored replay copy for a given misconception code.

    Guarantees no unhandled branch:
    - If code is not recognized, falls back to NO_SIGNAL.
    - If role is not recognized, falls back to DEFAULT_LEARNER_ROLE (BEGINNER_CSE).
    """
    normalized_role = normalize_learner_role(role)
    norm_code = code if code in KNOWN_MISCONCEPTION_CODES else "NO_SIGNAL"

    key = (norm_code, normalized_role)
    if key in REPLAY_COPY_TABLE:
        return REPLAY_COPY_TABLE[key]

    # Fallback to NO_SIGNAL with normalized role
    return REPLAY_COPY_TABLE[("NO_SIGNAL", normalized_role)]


def build_contract_replay(
    code: str,
    role: Optional[str] = None,
    state_trace: Optional[list[dict[str, Any]]] = None,
) -> list[dict[str, Any]]:
    """Build the replay step list conforming to flight-recorder-tutor contract.

    Format matches:
    [
        {"stepIndex": 0, "headline": "...", "evidenceKeys": ["..."]},
        {"stepIndex": 1, "headline": "...", "evidenceKeys": ["..."]}
    ]
    """
    copies = get_replay_copy_for_role(code, role)
    replay_list: list[dict[str, Any]] = []

    for copy in copies:
        replay_list.append(copy.to_contract_dict())

    return replay_list


def get_explanation_template(
    code: str,
    role: Optional[str] = None,
) -> ExplanationTemplate:
    """Retrieve explanation template distinguishing representation from trajectory.

    Guarantees no unhandled branch:
    - If code is not recognized, falls back to NO_SIGNAL.
    - If role is not recognized, falls back to DEFAULT_LEARNER_ROLE (BEGINNER_CSE).
    """
    normalized_role = normalize_learner_role(role)
    norm_code = code if code in KNOWN_MISCONCEPTION_CODES else "NO_SIGNAL"

    key = (norm_code, normalized_role)
    if key in EXPLANATION_TEMPLATES:
        return EXPLANATION_TEMPLATES[key]

    return EXPLANATION_TEMPLATES[("NO_SIGNAL", normalized_role)]


@dataclass(frozen=True)
class TaxonomyDiagnosis:
    """Comprehensive diagnosis result combining pure rules with role-tailored replay and templates."""
    code: str
    learner_role: LearnerRole
    first_divergence_step: Optional[int]
    evidence_keys: tuple[str, ...]
    repair_challenge_id: str
    replay: list[dict[str, Any]]
    explanation_template: dict[str, Any]
    confidence: float
    verified_behavior: str
    prediction: Optional[str]
    is_correct_prediction: bool = False
    prediction_description: Optional[str] = None
    verified_behavior_description: Optional[str] = None


def diagnose_with_taxonomy(
    prediction_answer: Optional[str],
    state_trace: list[dict[str, Any]],
    learner_role: Optional[str] = None,
) -> TaxonomyDiagnosis:
    """End-to-end diagnosis applying rules, selecting role-tailored replay copy,
    and attaching the representation-vs-trajectory explanation template.

    Parameters
    ----------
    prediction_answer:
        The learner's answer choice or None.
    state_trace:
        The verified state trace steps from simulation.
    learner_role:
        "BEGINNER_CSE" (Aarav), "PHYSICS_TO_CODE" (Meera), or None.

    Returns
    -------
    TaxonomyDiagnosis:
        Deterministic, fully grounded diagnosis with role-specific replay and templates.
    """
    rule_result: DiagnosisResult = apply_rules(prediction_answer, state_trace)
    role = normalize_learner_role(learner_role)

    replay = build_contract_replay(rule_result.code, role, state_trace)
    template = get_explanation_template(rule_result.code, role).to_dict()

    first_div = (
        None
        if (rule_result.is_correct_prediction or rule_result.code == "NO_SIGNAL")
        else rule_result.first_divergence_step
    )

    return TaxonomyDiagnosis(
        code=rule_result.code,
        learner_role=role,
        first_divergence_step=first_div,
        evidence_keys=rule_result.evidence_keys,
        repair_challenge_id=rule_result.repair_challenge_id,
        replay=replay,
        explanation_template=template,
        confidence=rule_result.confidence,
        verified_behavior=rule_result.verified_behavior,
        prediction=prediction_answer,
        is_correct_prediction=rule_result.is_correct_prediction,
        prediction_description=rule_result.prediction_description,
        verified_behavior_description=rule_result.verified_behavior_description,
    )
