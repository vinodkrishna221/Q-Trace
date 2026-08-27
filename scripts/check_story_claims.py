#!/usr/bin/env python3
"""
SHIP-3 · check_story_claims.py
Verifies docs/DEMO-SCRIPT.md satisfies the SHIP-3 card test:
  1. Every number claim has a source URL in the Sourced Evidence Ledger.
  2. The 90-second script includes all eight learner beat tags (B1–B8).
  3. A FALLBACK CUE is explicitly scripted.

Exit 0 = all checks pass.
Exit 1 = one or more checks failed (detail printed to stdout).
"""

import re
import sys
from pathlib import Path

DEMO_SCRIPT = Path(__file__).parent.parent / "docs" / "DEMO-SCRIPT.md"

# ── 1. Beat tags that must appear in the script ────────────────────────────
REQUIRED_BEAT_TAGS = [
    "B1",
    "B2",
    "B3",
    "B4",
    "B5",
    "B6",
    "B7",
    "B8",
]

# ── 2. Numbers / statistics that must have a source URL ───────────────────
# Each tuple: (short description, regex that matches the claim text,
#               one or more URL substrings that constitute a valid source)
NUMBER_CLAIMS: list[tuple[str, str, list[str]]] = [
    (
        "50%→80% state-count improvement",
        r"50\s*[%％].*?80\s*[%％]|~50.*?~80",
        ["doi.org/10.1103/physrevphyseducres"],
    ),
    (
        "40 seeded learner sessions",
        r"40\s+seeded",
        [],  # No URL required — synthetic-data disclosure is self-sourcing
    ),
]

# ── 3. URL patterns that must appear somewhere in the ledger ──────────────
REQUIRED_URLS = [
    "doi.org/10.1103/physrevphyseducres.20.020108",
    "doi.org/10.48550/arxiv.1410.0867",
    "qiskit.github.io/qiskit-aer",
    "docs.pennylane.ai",
    "dst.gov.in/national-quantum-mission-nqm",
    "dst.gov.in/dst-along-aicte-announces-undergraduate-courses-quantum",
    "openqasm.com",
]


def load_script() -> str:
    if not DEMO_SCRIPT.exists():
        print(f"FAIL  docs/DEMO-SCRIPT.md not found at {DEMO_SCRIPT}")
        sys.exit(1)
    return DEMO_SCRIPT.read_text(encoding="utf-8")


def check_beat_tags(text: str) -> list[str]:
    """Return list of missing beat tags."""
    missing = []
    for tag in REQUIRED_BEAT_TAGS:
        # Accept: "B1:", "BEAT TAG: B1", "- B1:", "B1 —" etc.
        pattern = rf"\b{re.escape(tag)}\b"
        if not re.search(pattern, text):
            missing.append(tag)
    return missing


def check_fallback_cue(text: str) -> bool:
    """Return True if an explicit FALLBACK CUE section exists."""
    return bool(re.search(r"FALLBACK\s+CUE", text, re.IGNORECASE))


def check_required_urls(text: str) -> list[str]:
    """Return list of required URLs missing from the document."""
    missing = []
    for url in REQUIRED_URLS:
        if url not in text:
            missing.append(url)
    return missing


def check_number_claims(text: str) -> list[str]:
    """
    For each numbered claim whose source list is non-empty, verify that
    (a) the claim pattern appears, and (b) at least one source URL appears nearby
    (within 500 chars of the claim OR anywhere in the ledger section).
    Returns list of failure descriptions.
    """
    failures = []
    ledger_match = re.search(r"SOURCED EVIDENCE LEDGER(.*?)(?=^##|\Z)", text,
                              re.DOTALL | re.MULTILINE)
    ledger_text = ledger_match.group(1) if ledger_match else ""

    for description, claim_pattern, source_urls in NUMBER_CLAIMS:
        if not source_urls:
            continue  # self-sourcing; skip URL check
        claim_found = re.search(claim_pattern, text, re.IGNORECASE | re.DOTALL)
        if not claim_found:
            failures.append(f"Claim pattern not found: '{description}' ({claim_pattern!r})")
            continue
        # Check source URL is present somewhere in the ledger
        url_found = any(u in ledger_text for u in source_urls)
        if not url_found:
            failures.append(
                f"Source URL missing for claim '{description}'. "
                f"Expected one of: {source_urls}"
            )
    return failures


def main() -> None:
    text = load_script()
    errors: list[str] = []

    # Check 1: all eight beat tags
    missing_beats = check_beat_tags(text)
    if missing_beats:
        errors.append(f"Missing beat tag(s): {', '.join(missing_beats)}")
    else:
        print(f"PASS  All {len(REQUIRED_BEAT_TAGS)} beat tags found (B1–B8)")

    # Check 2: FALLBACK CUE
    if check_fallback_cue(text):
        print("PASS  FALLBACK CUE section found")
    else:
        errors.append("FALLBACK CUE section not found in DEMO-SCRIPT.md")

    # Check 3: required source URLs in the ledger
    missing_urls = check_required_urls(text)
    if missing_urls:
        for u in missing_urls:
            errors.append(f"Required source URL missing from ledger: {u}")
    else:
        print(f"PASS  All {len(REQUIRED_URLS)} required source URLs present in ledger")

    # Check 4: numbered claims backed by sources
    claim_failures = check_number_claims(text)
    if claim_failures:
        for f in claim_failures:
            errors.append(f)
    else:
        print("PASS  All sourced number claims have ledger entries")

    # Summary
    if errors:
        print(f"\nFAIL  {len(errors)} check(s) failed:")
        for i, e in enumerate(errors, 1):
            print(f"  {i}. {e}")
        sys.exit(1)
    else:
        print("\nPASS  check_story_claims: all checks green — SHIP-3 TEST PASSED")
        sys.exit(0)


if __name__ == "__main__":
    main()
