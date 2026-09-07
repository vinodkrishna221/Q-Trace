"""
Tutor Resilience Drill Script — Forces Failover Transitions and Asserts Parity.
==============================================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-6
Contract: board/contracts/flight-recorder-tutor.md v1
Stack:   .agents/rules/stack/ai-llm.md

Usage:
    uv run --project apps/api python -m app.services.tutor.drill
"""

from __future__ import annotations

import asyncio
import copy
import sys
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.services.tutor.adapter import FakeTutorProvider
from app.services.tutor.badge import compute_tutor_badge
from app.services.tutor.parity import (
    extract_cited_step_indexes,
    verify_cloud_fallback_parity,
)
from app.services.tutor.service import TutorService, default_tutor_service
from app.services.tutor.telemetry import telemetry

# Standard Bell State Trace used as ground truth
SAMPLE_BELL_TRACE: List[Dict[str, Any]] = [
    {
        "stepIndex": 0,
        "operationId": "op_1",
        "label": "After H",
        "basisProbabilities": {"00": 0.5, "10": 0.5},
        "reducedQubits": [
            {"qubit": 0, "purity": 1.0, "label": "PURE_SUBSYSTEM"},
            {"qubit": 1, "purity": 1.0, "label": "PURE_SUBSYSTEM"},
        ],
    },
    {
        "stepIndex": 1,
        "operationId": "op_2",
        "label": "After CNOT",
        "basisProbabilities": {"00": 0.5, "11": 0.5},
        "reducedQubits": [
            {"qubit": 0, "purity": 0.5, "label": "MIXED_SUBSYSTEM"},
            {"qubit": 1, "purity": 0.5, "label": "MIXED_SUBSYSTEM"},
        ],
    },
]


class DrillStepReport(BaseModel):
    stepName: str
    transitionTrigger: str
    durationMs: int
    fallbackUsed: bool
    model: str
    badgeType: str
    badgeLabel: str
    repairChallengeId: str
    citedStepIndexes: List[int]
    passed: bool
    notes: str = ""


class DrillSummary(BaseModel):
    totalSteps: int
    passedSteps: int
    failedSteps: int
    allParityPassed: bool
    stepReports: List[DrillStepReport]


async def run_tutor_resilience_drill(
    service: Optional[TutorService] = None,
    trace: Optional[List[Dict[str, Any]]] = None,
) -> DrillSummary:
    """Executes the complete resilience drill testing all failure transitions."""
    active_trace = copy.deepcopy(trace or SAMPLE_BELL_TRACE)
    fake_provider = FakeTutorProvider(mode="success", model="cloud-qtrace-v1")
    drill_service = service or TutorService(provider=fake_provider)

    step_reports: List[DrillStepReport] = []

    # Get golden baseline from pure fallback first
    golden_fallback = await drill_service.generate_explanation(
        state_trace=active_trace,
        learner_profile_id="lp_aarav",
        module_id="mod_bell",
        misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
        force_fallback=True,
    )
    expected_challenge = golden_fallback["repairChallengeId"]
    expected_steps = extract_cited_step_indexes(golden_fallback)

    # Scenarios to drill
    scenarios = [
        ("1. Cloud Success", "success", False, "Normal cloud provider operation"),
        ("2. Provider Timeout", "timeout", True, "Provider hangs; timeout triggers fallback"),
        ("3. 429 Rate Limit", "rate_limit", True, "Provider returns HTTP 429; fallback engaged"),
        ("4. Malformed JSON", "malformed", True, "Provider emits invalid schema; fallback engaged"),
        ("5. Fabricated Claim", "fabricated_claim", True, "Hallucinated number rejected; fallback engaged"),
        ("6. Invalid Evidence Key", "invalid_key", True, "Invalid dot-path rejected; fallback engaged"),
        ("7. Offline Enforced", "offline_forced", True, "DEMO_FALLBACK mode active without cloud calls"),
    ]

    for name, mode, expect_fallback, desc in scenarios:
        t0 = time.perf_counter()
        fake_provider.call_count = 0

        if mode == "offline_forced":
            resp = await drill_service.generate_explanation(
                state_trace=active_trace,
                learner_profile_id="lp_aarav",
                module_id="mod_bell",
                misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
                force_fallback=True,
            )
        else:
            fake_provider.set_mode(mode)
            # Use short timeout for drill speed
            timeout = 0.05 if mode == "timeout" else 2.0
            resp = await drill_service.generate_explanation(
                state_trace=active_trace,
                learner_profile_id="lp_aarav",
                module_id="mod_bell",
                misconception_code="SUPERPOSITION_VS_ENTANGLEMENT",
                force_fallback=False,
                provider_override=fake_provider,
                timeout_seconds=timeout,
            )

        duration_ms = int((time.perf_counter() - t0) * 1000)

        # Evaluate parity with golden baseline
        actual_challenge = resp.get("repairChallengeId")
        actual_steps = extract_cited_step_indexes(resp)
        actual_fallback_used = resp.get("fallbackUsed", False)
        actual_model = resp.get("model", "")

        # Compute badge
        badge = resp.get("badge")
        if not badge:
            # Fallback computation if not already embedded
            trigger_reason = desc if actual_fallback_used else None
            badge_obj = compute_tutor_badge(actual_fallback_used, actual_model, trigger_reason)
            badge_type = badge_obj.badgeType
            badge_label = badge_obj.label
        else:
            badge_type = badge.get("badgeType")
            badge_label = badge.get("label")

        # Invariants:
        # 1. repairChallengeId matches expected
        # 2. citedStepIndexes matches expected
        # 3. fallbackUsed matches expected
        passed = (
            actual_challenge == expected_challenge
            and actual_steps == expected_steps
            and actual_fallback_used == expect_fallback
        )

        step_reports.append(
            DrillStepReport(
                stepName=name,
                transitionTrigger=desc,
                durationMs=duration_ms,
                fallbackUsed=actual_fallback_used,
                model=actual_model,
                badgeType=badge_type,
                badgeLabel=badge_label,
                repairChallengeId=actual_challenge or "",
                citedStepIndexes=actual_steps,
                passed=passed,
                notes="Parity intact with golden baseline" if passed else "Parity invariant failed",
            )
        )

    passed_count = sum(1 for r in step_reports if r.passed)
    summary = DrillSummary(
        totalSteps=len(step_reports),
        passedSteps=passed_count,
        failedSteps=len(step_reports) - passed_count,
        allParityPassed=(passed_count == len(step_reports)),
        stepReports=step_reports,
    )
    return summary


def main() -> int:
    """CLI runner for the resilience drill."""
    print("=================================================================")
    print(" Q-Trace AI Pedagogy: Cloud & Fallback Resilience Drill (AI-6)   ")
    print("=================================================================")
    summary = asyncio.run(run_tutor_resilience_drill())

    for r in summary.stepReports:
        status_symbol = "[PASS]" if r.passed else "[FAIL]"
        print(f"{status_symbol} {r.stepName} ({r.durationMs}ms)")
        print(f"       Badge: {r.badgeType} ('{r.badgeLabel}') | Model: {r.model}")
        print(f"       Challenge: {r.repairChallengeId} | Trace steps: {r.citedStepIndexes}")
        print(f"       Notes: {r.notes}")

    print("-----------------------------------------------------------------")
    print(f"Summary: {summary.passedSteps}/{summary.totalSteps} steps passed. All parity passed: {summary.allParityPassed}")
    return 0 if summary.allParityPassed else 1


if __name__ == "__main__":
    sys.exit(main())
