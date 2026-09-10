#!/usr/bin/env python3
"""
scripts/check_deck.py — SHIP-5 TEST
Verifies the internal-round PPT evidence package (docs/deck/ship-5-ppt-content.md).

Checks:
  1. Required sections are present (11 sections).
  2. All 7 source URLs are present and reachable (link existence in text).
  3. Screenshot placeholders exist — accepts [PLACEHOLDER] markers OR actual
     PNG/JPG/GIF files in docs/deck/assets/.
  4. No roadmap feature is presented as live (banned live phrases).
  5. Synthetic data disclosure is present.
  6. 6-slide structure is present (Slides 1-6).

Exit 0 = all checks green. Exit 1 = one or more checks failed.

Usage:
    python3 scripts/check_deck.py
"""
import sys
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DECK_FILE = ROOT / "docs" / "deck" / "ship-5-ppt-content.md"
ASSETS_DIR = ROOT / "docs" / "deck" / "assets"

REQUIRED_SECTIONS = [
    ("PROBLEM-EVIDENCE",   r"PROBLEM-EVIDENCE"),
    ("PERSONAS",           r"PERSONAS"),
    ("LEARNER-FLOW",       r"LEARNER-FLOW"),
    ("FLIGHT-RECORDER",    r"FLIGHT-RECORDER"),
    ("ARCHITECTURE",       r"ARCHITECTURE"),
    ("MULTIPLE-BACKENDS",  r"MULTIPLE-BACKENDS"),
    ("SAFETY",             r"SAFETY"),
    ("ANALYTICS",          r"ANALYTICS"),
    ("IMPACT",             r"IMPACT"),
    ("FEASIBILITY",        r"FEASIBILITY"),
    ("ROADMAP",            r"ROADMAP"),
]

REQUIRED_URLS = [
    "https://doi.org/10.1103/physrevphyseducres.20.020108",
    "https://doi.org/10.48550/arxiv.1410.0867",
    "https://qiskit.github.io/qiskit-aer/tutorials/1_aersimulator.html",
    "https://docs.pennylane.ai/en/stable/introduction/inspecting_circuits.html",
    "https://dst.gov.in/dst-along-aicte-announces-undergraduate-courses-quantum",
    "https://dst.gov.in/national-quantum-mission-nqm",
    "https://openqasm.com/",
]

# These phrases indicate a roadmap feature is being claimed as live.
# Each tuple: (label, regex pattern to search).
ROADMAP_LIVE_PHRASES = [
    ("Bhashini live claim",    r"Bhashini\b.*\b(is live|now live|live today|currently live|deployed)"),
    ("Cirq live claim",        r"Cirq\b.*\b(is live|now live|live adapter|live backend|deployed)"),
    ("qBraid live claim",      r"qBraid\b.*\b(is live|now live|live adapter|live backend|deployed)"),
    ("Real QPU live claim",    r"(real QPU|real quantum hardware|real quantum computer)\b.*\b(is live|now live|currently|deployed)"),
    ("IVR live claim",         r"IVR\b.*\b(is live|now live|currently live|deployed)"),
    ("Realtime collab live",   r"real.?time (collaboration|collab)\b.*\b(is live|now live|currently|deployed)"),
]

REQUIRED_SLIDES = [
    r"## Slide 1",
    r"## Slide 2",
    r"## Slide 3",
    r"## Slide 4",
    r"## Slide 5",
    r"## Slide 6",
]

REQUIRED_SCREENSHOT_PLACEHOLDERS = [
    "slide2-hero-comparison",
    "slide3-architecture-diagram",
    "slide4-live-smoke-result",
    "slide5-instructor-insight",
]

SYNTHETIC_DISCLOSURE_PATTERN = r"SYNTHETIC DATA"

failures = []
warnings = []

def check(label, ok, detail=""):
    mark = "OK" if ok else "FAIL"
    print(f"  [{mark}] {label}" + (f": {detail}" if detail else ""))
    if not ok:
        failures.append(label)

def main():
    print(f"\ncheck_deck.py — SHIP-5 deck verification")
    print(f"Deck file : {DECK_FILE.relative_to(ROOT)}")
    print(f"Assets dir: {ASSETS_DIR.relative_to(ROOT)}")
    print()

    # ── 0. File exists ──────────────────────────────────────────────────────
    print("0. File existence")
    if not DECK_FILE.exists():
        check("deck file exists", False, str(DECK_FILE))
        print("\nFATAL: deck file missing — cannot continue.\n")
        sys.exit(1)
    check("deck file exists", True)

    text = DECK_FILE.read_text(encoding="utf-8")
    text_lower = text.lower()
    print()

    # ── 1. 6-slide structure ─────────────────────────────────────────────────
    print("1. Six-slide structure (Slides 1-6)")
    for pattern in REQUIRED_SLIDES:
        found = bool(re.search(pattern, text))
        check(pattern, found)
    print()

    # ── 2. Required sections checklist ──────────────────────────────────────
    print("2. Required sections (11 sections)")
    for section_label, pattern in REQUIRED_SECTIONS:
        found = bool(re.search(pattern, text))
        check(section_label, found)
    print()

    # ── 3. Source URLs ───────────────────────────────────────────────────────
    print("3. Source URLs (7 required)")
    for url in REQUIRED_URLS:
        found = url in text
        check(url[:70] + ("…" if len(url) > 70 else ""), found)
    print()

    # ── 4. Screenshot coverage ──────────────────────────────────────────────
    print("4. Screenshot coverage (placeholder markers OR actual files)")
    for slug in REQUIRED_SCREENSHOT_PLACEHOLDERS:
        # Accept [PLACEHOLDER] marker in deck text OR actual image file in assets dir
        has_placeholder = slug in text
        has_file = any(
            ASSETS_DIR.glob(f"{slug}.*")
        ) if ASSETS_DIR.exists() else False
        ok = has_placeholder or has_file
        detail = "placeholder marker found" if has_placeholder else (
            "actual image file found" if has_file else
            "neither placeholder marker nor image file found"
        )
        check(slug, ok, detail)
    print()

    # ── 5. Roadmap-not-live guard ────────────────────────────────────────────
    print("5. Roadmap features NOT claimed as live")
    for label, pattern in ROADMAP_LIVE_PHRASES:
        found = bool(re.search(pattern, text, re.IGNORECASE))
        # found means a violation — we want NOT found
        check(label, not found, "claimed as live — REMOVE from deck" if found else "")
    print()

    # ── 6. Synthetic data disclosure ─────────────────────────────────────────
    print("6. Synthetic data disclosure")
    has_disclosure = bool(re.search(SYNTHETIC_DISCLOSURE_PATTERN, text, re.IGNORECASE))
    check("SYNTHETIC DATA disclosure present", has_disclosure)
    print()

    # ── Result ───────────────────────────────────────────────────────────────
    total = (
        len(REQUIRED_SLIDES)
        + len(REQUIRED_SECTIONS)
        + len(REQUIRED_URLS)
        + len(REQUIRED_SCREENSHOT_PLACEHOLDERS)
        + len(ROADMAP_LIVE_PHRASES)
        + 1  # synthetic disclosure
        + 1  # file exists
    )
    passed = total - len(failures)

    print("=" * 60)
    if failures:
        print(f"RESULT: FAIL — {len(failures)}/{total} checks failed")
        print("Failed checks:")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    else:
        print(f"RESULT: PASS — {passed}/{total} checks green")
        print("Deck evidence package verified. Ready for PR.")
        sys.exit(0)

if __name__ == "__main__":
    main()
