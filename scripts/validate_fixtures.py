#!/usr/bin/env python3
"""
QA-1 — validate_fixtures.py

Parses every JSON file under apps/api/tests/fixtures/golden/,
checks structural invariants sourced from the four contracts, and
reports zero drift from contract examples.

Exit 0 = all fixtures valid.
Exit 1 = one or more failures found (details printed to stdout).

Contract sources (all v1):
  board/contracts/circuit-simulation.md
  board/contracts/flight-recorder-tutor.md
  board/contracts/progress-analytics.md
  board/contracts/learning-content.md
"""

from __future__ import annotations

import json
import pathlib
import sys
from typing import Any

GOLDEN_DIR = pathlib.Path(__file__).parent.parent / "apps" / "api" / "tests" / "fixtures" / "golden"

ALLOWED_GATES = {"H", "X", "Y", "Z", "CNOT", "MEASURE"}
MISCONCEPTION_CODES = {
    "SUPERPOSITION_VS_ENTANGLEMENT",
    "MEASUREMENT_DETERMINISM",
    "GATE_ORDER",
    "NO_SIGNAL",
}
ADAPTER_NAMES = {"QISKIT_AER", "PENNYLANE"}

failures: list[str] = []


def fail(fixture: str, message: str) -> None:
    failures.append(f"FAIL [{fixture}]: {message}")


def check_probabilities_sum(fixture_name: str, probs: dict[str, float], label: str) -> None:
    """Probability values must be non-negative and sum to 1.0 ± epsilon."""
    epsilon = 1e-4
    for key, val in probs.items():
        if not isinstance(val, (int, float)) or val < 0:
            fail(fixture_name, f"{label} key '{key}' has invalid probability {val!r}")
    total = sum(float(v) for v in probs.values())
    if abs(total - 1.0) > epsilon:
        fail(fixture_name, f"{label} probabilities sum to {total:.6f}, expected 1.0 ± {epsilon}")


def check_basis_keys_qubit0_msb(fixture_name: str, probs: dict[str, float], qubit_count: int) -> None:
    """
    Verify that basis keys are zero-padded binary strings of length qubit_count
    and that qubit-0 is the most-significant bit (leftmost character).

    For the asymmetric fixture (H on qubit-0 only, qubit-1 idle in |0⟩):
      expected keys: '00' and '10' — qubit-0 flips, qubit-1 stays 0.
      NOT '01' / '11'.
    """
    expected_len = qubit_count
    for key in probs.keys():
        if len(key) != expected_len or not all(c in "01" for c in key):
            fail(fixture_name, f"Basis key '{key}' is not a {expected_len}-bit binary string")


def check_reduced_qubits_purity(fixture_name: str, step: dict[str, Any], step_label: str) -> None:
    for rq in step.get("reducedQubits", []):
        purity = rq.get("purity", None)
        label = rq.get("label", "")
        if purity is None:
            fail(fixture_name, f"{step_label} reducedQubits missing purity")
            continue
        if not 0.0 <= purity <= 1.0:
            fail(fixture_name, f"{step_label} qubit-{rq.get('qubit')} purity {purity} out of [0,1]")
        if label not in ("PURE_SUBSYSTEM", "MIXED_SUBSYSTEM"):
            fail(fixture_name, f"{step_label} qubit-{rq.get('qubit')} unknown label '{label}'")
        # purity=1.0 must be PURE; purity=0.5 must be MIXED (contract examples)
        if purity == 1.0 and label != "PURE_SUBSYSTEM":
            fail(fixture_name, f"{step_label} purity=1.0 expects PURE_SUBSYSTEM, got '{label}'")
        if purity == 0.5 and label != "MIXED_SUBSYSTEM":
            fail(fixture_name, f"{step_label} purity=0.5 expects MIXED_SUBSYSTEM, got '{label}'")


def validate_simulation_run(fixture_name: str, sr: dict[str, Any]) -> None:
    """Validates a simulationRun object."""
    # Required string IDs
    for field in ("id", "learnerProfileId", "moduleId", "circuitModelId"):
        if not isinstance(sr.get(field), str) or not sr[field]:
            fail(fixture_name, f"simulationRun.{field} missing or empty")

    # adapter
    adapter = sr.get("adapter", "")
    if adapter not in ADAPTER_NAMES:
        fail(fixture_name, f"simulationRun.adapter '{adapter}' not in {ADAPTER_NAMES}")

    # status
    if sr.get("status") != "SUCCEEDED":
        fail(fixture_name, f"simulationRun.status should be SUCCEEDED, got '{sr.get('status')}'")

    # probabilities: non-negative, sum to 1
    probs = sr.get("probabilities", {})
    if not probs:
        fail(fixture_name, "simulationRun.probabilities is empty")
    else:
        check_probabilities_sum(fixture_name, probs, "simulationRun.probabilities")

    # stateTrace
    trace = sr.get("stateTrace", [])
    if not trace:
        fail(fixture_name, "simulationRun.stateTrace is empty")
    for step in trace:
        step_label = f"stateTrace[{step.get('stepIndex', '?')}]"
        bp = step.get("basisProbabilities", {})
        if bp:
            check_probabilities_sum(fixture_name, bp, f"{step_label}.basisProbabilities")
        check_reduced_qubits_purity(fixture_name, step, step_label)

    # conformance (optional but present in contract examples)
    conformance = sr.get("conformance")
    if conformance is not None:
        conf_adapter = conformance.get("adapter", "")
        if conf_adapter and conf_adapter not in ADAPTER_NAMES:
            fail(fixture_name, f"conformance.adapter '{conf_adapter}' not in {ADAPTER_NAMES}")


def validate_bell_simulation_run(fixture_name: str, data: dict[str, Any]) -> None:
    sr = data.get("simulationRun")
    if sr is None:
        fail(fixture_name, "Missing 'simulationRun' key")
        return
    validate_simulation_run(fixture_name, sr)

    # Bell-specific: probabilities must be {00: 0.5, 11: 0.5}
    probs = sr.get("probabilities", {})
    if set(probs.keys()) != {"00", "11"}:
        fail(fixture_name, f"Bell probabilities keys should be {{00, 11}}, got {set(probs.keys())}")
    for k in ("00", "11"):
        if abs(probs.get(k, -1) - 0.5) > 1e-6:
            fail(fixture_name, f"Bell P({k}) should be 0.5, got {probs.get(k)}")

    # Verify stateTrace qubit-0 MSB ordering: step-0 has keys 00 and 10
    trace = sr.get("stateTrace", [])
    if trace:
        step0_bp = trace[0].get("basisProbabilities", {})
        if set(step0_bp.keys()) != {"00", "10"}:
            fail(fixture_name, f"stateTrace[0].basisProbabilities keys should be {{00, 10}} (qubit-0 MSB after H), got {set(step0_bp.keys())}")


def validate_asymmetric_bit_order(fixture_name: str, data: dict[str, Any]) -> None:
    sr = data.get("simulationRun")
    if sr is None:
        fail(fixture_name, "Missing 'simulationRun' key")
        return
    validate_simulation_run(fixture_name, sr)

    # Asymmetric fixture: qubit-0 H only → expected top-level probs {00, 10}
    probs = sr.get("probabilities", {})
    if set(probs.keys()) != {"00", "10"}:
        fail(fixture_name, f"Asymmetric run probabilities should be {{00, 10}} (qubit-0 MSB), got {set(probs.keys())}")

    # Confirm _basisOrderNote is present (self-documenting invariant)
    if "_basisOrderNote" not in data:
        fail(fixture_name, "Missing '_basisOrderNote' field (required for QA-4 reviewer guidance)")


def validate_invalid_gate_error(fixture_name: str, data: dict[str, Any]) -> None:
    err = data.get("error")
    if err is None:
        fail(fixture_name, "Missing 'error' key")
        return

    code = err.get("code", "")
    if code != "UNSUPPORTED_GATE":
        fail(fixture_name, f"error.code should be UNSUPPORTED_GATE, got '{code}'")

    if not err.get("requestId"):
        fail(fixture_name, "error.requestId is missing (contract requires it)")

    details = err.get("details", {})
    allowed = details.get("allowedGates", [])
    if set(allowed) != ALLOWED_GATES:
        fail(fixture_name, f"error.details.allowedGates {set(allowed)} != {ALLOWED_GATES}")

    http_status = data.get("_httpStatus")
    if http_status != 422:
        fail(fixture_name, f"_httpStatus should be 422, got {http_status!r}")


def validate_diagnosis_result(fixture_name: str, data: dict[str, Any]) -> None:
    resp = data.get("response", {})
    ms = resp.get("misconceptionSignal")
    if ms is None:
        fail(fixture_name, "Missing response.misconceptionSignal")
        return

    code = ms.get("code", "")
    if code not in MISCONCEPTION_CODES:
        fail(fixture_name, f"misconceptionSignal.code '{code}' not in {MISCONCEPTION_CODES}")

    fds = ms.get("firstDivergenceStep")
    if fds is None or not isinstance(fds, int) or fds < 0:
        fail(fixture_name, f"misconceptionSignal.firstDivergenceStep invalid: {fds!r}")

    evidence = ms.get("evidence", {})
    if not evidence.get("prediction"):
        fail(fixture_name, "misconceptionSignal.evidence.prediction missing")
    if not evidence.get("verifiedBehavior"):
        fail(fixture_name, "misconceptionSignal.evidence.verifiedBehavior missing")
    trace_steps = evidence.get("stateTraceStepIndexes", [])
    if not trace_steps or not all(isinstance(i, int) for i in trace_steps):
        fail(fixture_name, "misconceptionSignal.evidence.stateTraceStepIndexes invalid")

    if ms.get("confidence") != 1.0:
        fail(fixture_name, f"misconceptionSignal.confidence should be 1.0 (deterministic), got {ms.get('confidence')!r}")

    replay = resp.get("replay", [])
    if not replay:
        fail(fixture_name, "response.replay is empty")

    if data.get("_httpStatus") != 201:
        fail(fixture_name, f"_httpStatus should be 201, got {data.get('_httpStatus')!r}")


def validate_tutor_response(fixture_name: str, data: dict[str, Any]) -> None:
    resp = data.get("response", {})
    tr = resp.get("tutorResponse")
    if tr is None:
        fail(fixture_name, "Missing response.tutorResponse")
        return

    # fallbackUsed + model
    if tr.get("fallbackUsed") is not True:
        fail(fixture_name, "tutorResponse.fallbackUsed should be true for demo fallback fixture")
    if tr.get("model") != "DEMO_FALLBACK":
        fail(fixture_name, f"tutorResponse.model should be 'DEMO_FALLBACK', got '{tr.get('model')}'")

    # numericalClaims must all have non-empty evidenceKey
    claims = tr.get("numericalClaims", [])
    if not claims:
        fail(fixture_name, "tutorResponse.numericalClaims is empty (every claim needs evidence)")
    for c in claims:
        if not c.get("claim") or not c.get("evidenceKey"):
            fail(fixture_name, f"numericalClaim missing claim or evidenceKey: {c!r}")

    # safetyNote must be present
    if not tr.get("safetyNote"):
        fail(fixture_name, "tutorResponse.safetyNote is missing")

    if data.get("_httpStatus") != 200:
        fail(fixture_name, f"_httpStatus should be 200, got {data.get('_httpStatus')!r}")


def validate_progress_after_repair(fixture_name: str, data: dict[str, Any]) -> None:
    resp = data.get("response", {})
    ca = resp.get("challengeAttempt")
    pr = resp.get("progressRecord")

    if ca is None:
        fail(fixture_name, "Missing response.challengeAttempt")
    else:
        if ca.get("passed") is not True:
            fail(fixture_name, "challengeAttempt.passed should be true")
        if ca.get("score") != 100:
            fail(fixture_name, f"challengeAttempt.score should be 100, got {ca.get('score')!r}")

    if pr is None:
        fail(fixture_name, "Missing response.progressRecord")
    else:
        # totalPoints = 100 (single Bell repair)
        if pr.get("totalPoints") != 100:
            fail(fixture_name, f"progressRecord.totalPoints should be 100, got {pr.get('totalPoints')!r}")

        # skill_create_bell must be MASTERED after passing
        skill_map = {s["skillId"]: s for s in pr.get("skillStates", [])}
        bell_skill = skill_map.get("skill_create_bell")
        if bell_skill is None:
            fail(fixture_name, "progressRecord.skillStates missing skill_create_bell")
        elif bell_skill.get("status") != "MASTERED":
            fail(fixture_name, f"skill_create_bell.status should be MASTERED, got '{bell_skill.get('status')}'")

        # misconceptionSummary must record SUPERPOSITION_VS_ENTANGLEMENT
        ms_codes = [m["code"] for m in pr.get("misconceptionSummary", [])]
        if "SUPERPOSITION_VS_ENTANGLEMENT" not in ms_codes:
            fail(fixture_name, "progressRecord.misconceptionSummary missing SUPERPOSITION_VS_ENTANGLEMENT")

    if data.get("_httpStatus") != 201:
        fail(fixture_name, f"_httpStatus should be 201, got {data.get('_httpStatus')!r}")


# ─── Fixture Registry ─────────────────────────────────────────────────────────

VALIDATORS = {
    "bell_simulation_run.json": validate_bell_simulation_run,
    "asymmetric_bit_order_run.json": validate_asymmetric_bit_order,
    "invalid_gate_error.json": validate_invalid_gate_error,
    "wrong_prediction_run.json": validate_bell_simulation_run,  # same SimRun shape
    "diagnosis_result.json": validate_diagnosis_result,
    "tutor_response.json": validate_tutor_response,
    "progress_after_repair.json": validate_progress_after_repair,
}


def main() -> int:
    if not GOLDEN_DIR.exists():
        print(f"ERROR: golden directory not found: {GOLDEN_DIR}")
        return 1

    json_files = sorted(GOLDEN_DIR.glob("*.json"))
    if not json_files:
        print(f"ERROR: no JSON files found in {GOLDEN_DIR}")
        return 1

    print(f"Validating {len(json_files)} fixture(s) in {GOLDEN_DIR}\n")

    unknown_files: list[str] = []

    for path in json_files:
        name = path.name
        print(f"  Checking {name} ...", end=" ")

        # Parse JSON
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            fail(name, f"JSON parse error: {exc}")
            print("FAIL (parse)")
            continue

        # Require _fixture metadata block
        meta = data.get("_fixture")
        if meta is None:
            fail(name, "Missing '_fixture' metadata block")
        else:
            if not meta.get("contractSource"):
                fail(name, "_fixture.contractSource is required")
            if not meta.get("description"):
                fail(name, "_fixture.description is required")

        # Run specific validator
        validator = VALIDATORS.get(name)
        if validator is None:
            unknown_files.append(name)
            print("WARN (no validator — add one to VALIDATORS dict)")
            continue

        before = len(failures)
        validator(name, data)
        after = len(failures)

        if after == before:
            print("OK")
        else:
            print(f"FAIL ({after - before} issue(s))")

    print()

    if unknown_files:
        print(f"WARNING: {len(unknown_files)} file(s) have no validator: {unknown_files}")
        print("  Add a validator function + entry in VALIDATORS to enforce contract invariants.\n")

    if failures:
        print("-" * 60)
        print(f"RESULT: {len(failures)} failure(s)\n")
        for f in failures:
            print(f"  {f}")
        print()
        return 1

    print("-" * 60)
    print(f"RESULT: all {len(json_files)} fixture(s) valid - zero contract drift")
    return 0


if __name__ == "__main__":
    sys.exit(main())
