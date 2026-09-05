"""
Evidence Key and Numerical Claim Validator for Q-Trace Tutor.
=============================================================
Owner:   Rajeswari (ai-pedagogy track)
Card:    AI-3
Contract: board/contracts/flight-recorder-tutor.md v1

Rules & Constraints:
- Every evidenceKey must resolve to a valid path in StateTrace.
- Every NumericalClaim must be verified against actual simulator output.
- Fabricated or ungrounded claims are strictly rejected.
"""

from __future__ import annotations

import re
from typing import Any


class EvidenceKeyValidationError(ValueError):
    """Raised when an evidence key is malformed or does not resolve in the State Trace."""
    pass


class FabricatedClaimError(ValueError):
    """Raised when a numerical claim cannot be verified against simulator evidence."""
    pass


def resolve_evidence_key(key: str, state_trace: list[dict[str, Any]]) -> Any:
    """Resolve an evidence key dot-path against a StateTrace list.
    
    Format: stateTrace.<stepIndex>.<field>[.<subfield>]
    Example: stateTrace.1.basisProbabilities.00 -> state_trace[1]["basisProbabilities"]["00"]
    """
    if not isinstance(key, str) or not key.strip():
        raise EvidenceKeyValidationError("Evidence key must be a non-empty string.")

    parts = key.strip().split(".")
    if len(parts) < 2 or parts[0] != "stateTrace":
        raise EvidenceKeyValidationError(
            f"Invalid evidence key format '{key}'. Must start with 'stateTrace.<stepIndex>'."
        )

    try:
        step_idx = int(parts[1])
    except ValueError:
        raise EvidenceKeyValidationError(
            f"Invalid step index in evidence key '{key}': '{parts[1]}' is not an integer."
        )

    if not isinstance(state_trace, list) or step_idx < 0 or step_idx >= len(state_trace):
        raise EvidenceKeyValidationError(
            f"Step index {step_idx} out of range for StateTrace of length {len(state_trace) if isinstance(state_trace, list) else 0}."
        )

    curr: Any = state_trace[step_idx]
    for part in parts[2:]:
        if isinstance(curr, dict):
            if part in curr:
                curr = curr[part]
            else:
                raise EvidenceKeyValidationError(
                    f"Field '{part}' not found in StateTrace at path '{'.'.join(parts[:parts.index(part)+1])}'."
                )
        elif isinstance(curr, list):
            try:
                list_idx = int(part)
                curr = curr[list_idx]
            except (ValueError, IndexError):
                raise EvidenceKeyValidationError(
                    f"Invalid list index or field '{part}' at path '{key}'."
                )
        else:
            raise EvidenceKeyValidationError(
                f"Cannot traverse into primitive value at '{part}' in '{key}'."
            )

    return curr


def extract_claimed_value(claim: str) -> float:
    """Extract the primary numeric value from a claim string.
    
    Examples:
        'P(00)=0.5' -> 0.5
        'P(11)=0.5' -> 0.5
        'probability 0.50' -> 0.5
    """
    if not isinstance(claim, str) or not claim.strip():
        raise FabricatedClaimError("Claim must be a non-empty string.")

    # If format contains '=', extract the right-hand side first
    search_target = claim.split("=")[-1] if "=" in claim else claim

    match = re.search(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?", search_target)
    if not match:
        raise FabricatedClaimError(f"No numeric value found in claim: '{claim}'.")

    try:
        return float(match.group(0))
    except ValueError:
        raise FabricatedClaimError(f"Unable to parse number from claim: '{claim}'.")


def validate_numerical_claim(
    claim: str,
    evidence_key: str,
    state_trace: list[dict[str, Any]],
    tolerance: float = 1e-5,
) -> bool:
    """Verify that a numerical claim matches the verified simulator evidence at evidence_key."""
    actual_value = resolve_evidence_key(evidence_key, state_trace)

    if not isinstance(actual_value, (int, float)):
        raise EvidenceKeyValidationError(
            f"Evidence key '{evidence_key}' resolved to non-numeric value: {actual_value!r}."
        )

    claimed_val = extract_claimed_value(claim)

    if abs(claimed_val - float(actual_value)) > tolerance:
        raise FabricatedClaimError(
            f"Fabricated claim: claimed {claimed_val} in '{claim}' but verified evidence at '{evidence_key}' is {actual_value} (tolerance {tolerance})."
        )

    return True


def validate_tutor_response_evidence(
    steps: list[dict[str, Any]],
    numerical_claims: list[dict[str, Any]],
    state_trace: list[dict[str, Any]],
    tolerance: float = 1e-5,
) -> None:
    """Validate all step evidenceKeys and numerical claims against the state trace."""
    # 1. Validate every evidence key in steps
    for i, step in enumerate(steps):
        keys = step.get("evidenceKeys", [])
        if not isinstance(keys, list):
            raise EvidenceKeyValidationError(f"Step {i} 'evidenceKeys' must be a list.")
        for key in keys:
            resolve_evidence_key(key, state_trace)

    # 2. Validate every numerical claim
    for i, nc in enumerate(numerical_claims):
        claim = nc.get("claim")
        key = nc.get("evidenceKey")
        if not claim or not key:
            raise FabricatedClaimError(f"Numerical claim {i} missing 'claim' or 'evidenceKey'.")
        validate_numerical_claim(claim, key, state_trace, tolerance=tolerance)
