"""
Cloud and Fallback Parity Suite and Fixtures for Q-Trace Tutor.
==============================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-6
Contract: board/contracts/flight-recorder-tutor.md v1
Stack:   .agents/rules/stack/ai-llm.md

Verifies:
- Both Cloud and Fallback modes cite the exact same trace steps
- Both resolve to the identical repair challenge ID
- Meaning and pedagogical advice remain invariant across modes
- Safety notes and schema invariants are preserved
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel, Field

STEP_INDEX_REGEX = re.compile(r"^stateTrace\.(\d+)")


def extract_cited_step_indexes(explanation: Dict[str, Any]) -> List[int]:
    """Extracts unique StateTrace step indexes cited in steps and numerical claims."""
    steps_cited: Set[int] = set()

    # 1. From steps evidenceKeys
    for step in explanation.get("steps", []):
        for key in step.get("evidenceKeys", []):
            match = STEP_INDEX_REGEX.match(key)
            if match:
                steps_cited.add(int(match.group(1)))

    # 2. From numericalClaims evidenceKey
    for claim in explanation.get("numericalClaims", []):
        key = claim.get("evidenceKey", "")
        match = STEP_INDEX_REGEX.match(key)
        if match:
            steps_cited.add(int(match.group(1)))

    return sorted(steps_cited)


class ParityCheckResult(BaseModel):
    """Result of parity evaluation between cloud and fallback explanations."""

    isParity: bool
    repairChallengeMatch: bool
    stepIndexesMatch: bool
    intentMatch: bool
    cloudStepIndexes: List[int]
    fallbackStepIndexes: List[int]
    repairChallengeId: str
    cloudModel: str
    fallbackModel: str
    discrepancies: List[str] = Field(default_factory=list)


def verify_cloud_fallback_parity(
    cloud_explanation: Dict[str, Any],
    fallback_explanation: Dict[str, Any],
) -> ParityCheckResult:
    """Evaluates semantic and structural parity between cloud and fallback tutor responses."""
    discrepancies: List[str] = []

    # 1. Verify Repair Challenge ID equivalence
    cloud_challenge = cloud_explanation.get("repairChallengeId")
    fallback_challenge = fallback_explanation.get("repairChallengeId")
    challenge_match = (cloud_challenge == fallback_challenge) and bool(cloud_challenge)
    if not challenge_match:
        discrepancies.append(
            f"Repair challenge mismatch: cloud='{cloud_challenge}', fallback='{fallback_challenge}'"
        )

    # 2. Verify cited StateTrace step indexes match exactly
    cloud_steps = extract_cited_step_indexes(cloud_explanation)
    fallback_steps = extract_cited_step_indexes(fallback_explanation)
    steps_match = (cloud_steps == fallback_steps)
    if not steps_match:
        discrepancies.append(
            f"Cited trace step index mismatch: cloud={cloud_steps}, fallback={fallback_steps}"
        )

    # 3. Verify intent equivalence
    cloud_intent = cloud_explanation.get("intent")
    fallback_intent = fallback_explanation.get("intent")
    intent_match = (cloud_intent == fallback_intent) and bool(cloud_intent)
    if not intent_match:
        discrepancies.append(
            f"Intent mismatch: cloud='{cloud_intent}', fallback='{fallback_intent}'"
        )

    # 4. Verify safety notes present
    if "hardware claim" not in cloud_explanation.get("safetyNote", ""):
        discrepancies.append("Cloud response missing required safety disclaimer.")
    if "hardware claim" not in fallback_explanation.get("safetyNote", ""):
        discrepancies.append("Fallback response missing required safety disclaimer.")

    # 5. Verify fallbackUsed flags
    if cloud_explanation.get("fallbackUsed") is not False:
        discrepancies.append("Cloud response unexpectedly has fallbackUsed=True.")
    if fallback_explanation.get("fallbackUsed") is not True:
        discrepancies.append("Fallback response unexpectedly has fallbackUsed=False.")

    is_parity = (len(discrepancies) == 0)

    return ParityCheckResult(
        isParity=is_parity,
        repairChallengeMatch=challenge_match,
        stepIndexesMatch=steps_match,
        intentMatch=intent_match,
        cloudStepIndexes=cloud_steps,
        fallbackStepIndexes=fallback_steps,
        repairChallengeId=str(fallback_challenge),
        cloudModel=str(cloud_explanation.get("model", "")),
        fallbackModel=str(fallback_explanation.get("model", "")),
        discrepancies=discrepancies,
    )


# Canonical parity test fixtures across core learner cases
PARITY_FIXTURES: List[Dict[str, Any]] = [
    {
        "id": "parity_bell_superposition",
        "description": "Bell state divergence: superposition vs entanglement (Hero case: Aarav)",
        "learnerProfileId": "lp_aarav",
        "moduleId": "mod_bell",
        "simulationRunId": "sr_demo_001",
        "misconceptionCode": "SUPERPOSITION_VS_ENTANGLEMENT",
        "intent": "EXPLAIN_DIVERGENCE",
        "expectedStepIndexes": [0, 1],
        "expectedRepairChallengeId": "ch_bell_repair",
    },
    {
        "id": "parity_bell_measurement",
        "description": "Bell state divergence: measurement determinism (Case: Meera)",
        "learnerProfileId": "lp_meera",
        "moduleId": "mod_bell",
        "simulationRunId": "sr_demo_001",
        "misconceptionCode": "MEASUREMENT_DETERMINISM",
        "intent": "EXPLAIN_DIVERGENCE",
        "expectedStepIndexes": [0, 1],
        "expectedRepairChallengeId": "ch_measurement_repair",
    },
    {
        "id": "parity_bell_gate_order",
        "description": "Bell state divergence: gate order inverted (Case: Aarav)",
        "learnerProfileId": "lp_aarav",
        "moduleId": "mod_bell",
        "simulationRunId": "sr_demo_001",
        "misconceptionCode": "GATE_ORDER",
        "intent": "EXPLAIN_DIVERGENCE",
        "expectedStepIndexes": [0, 1],
        "expectedRepairChallengeId": "ch_bell_repair",
    },
    {
        "id": "parity_bell_no_signal",
        "description": "Bell state: no misconception detected / correct execution",
        "learnerProfileId": "lp_aarav",
        "moduleId": "mod_bell",
        "simulationRunId": "sr_demo_001",
        "misconceptionCode": "NO_SIGNAL",
        "intent": "EXPLAIN_DIVERGENCE",
        "expectedStepIndexes": [0, 1],
        "expectedRepairChallengeId": "ch_bell_repair",
    },
]
