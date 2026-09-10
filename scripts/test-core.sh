#!/usr/bin/env bash
# =============================================================================
# QA-5 — test-core.sh
#
# Cross-suite test runner: all unit tests + QA-5-owned acceptance suites.
#
# Proves no numerical claim in diagnosis, grading or Tutor evidence lacks
# a matching verified evidence key — the core QA-5 contract requirement.
#
# What it runs:
#   1. Backend API unit suite (all tests/unit/**) — regression gate.
#   2. QA-5 acceptance tests:
#        apps/api/tests/acceptance/test_diagnosis_grading.py
#        apps/api/tests/acceptance/test_tutor_evidence.py
#   3. QA-4 acceptance suite (regression guard):
#        apps/api/tests/acceptance/quantum/
#        apps/api/tests/security/test_qiskit_ast.py
#   4. Frontend unit suite — regression gate.
#   5. QA-5 frontend acceptance:
#        apps/web/tests/acceptance/circuit-workspace.test.tsx
#        apps/web/tests/acceptance/fallback-state.test.tsx
#
# Exit codes:
#   0 — all suites pass; no numerical claim lacks evidence
#   1 — one or more suites failed; see output for details
#
# Usage:
#   bash scripts/test-core.sh
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${REPO_ROOT}/apps/api"
WEB_DIR="${REPO_ROOT}/apps/web"

# Ensure API directory is on PYTHONPATH for python -m pytest fallback
export PYTHONPATH="${API_DIR}:${PYTHONPATH:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

PASS=0
FAIL=0
RESULTS=()

# =============================================================================
# Discovery: Pytest & Vitest Runners
# =============================================================================
if command -v uv &>/dev/null; then
  run_pytest() {
    uv run --project "${API_DIR}" pytest "$@"
  }
elif command -v python &>/dev/null && python -m pytest --version &>/dev/null; then
  run_pytest() {
    (cd "${API_DIR}" && python -m pytest "$@")
  }
elif command -v python3 &>/dev/null && python3 -m pytest --version &>/dev/null; then
  run_pytest() {
    (cd "${API_DIR}" && python3 -m pytest "$@")
  }
elif command -v py &>/dev/null && py -m pytest --version &>/dev/null; then
  run_pytest() {
    (cd "${API_DIR}" && py -m pytest "$@")
  }
else
  echo -e "${RED}ERROR: No pytest runner found (uv, python -m pytest, python3 -m pytest, or py -m pytest).${RESET}" >&2
  exit 1
fi

if command -v pnpm &>/dev/null; then
  run_vitest() {
    pnpm --dir "${WEB_DIR}" exec vitest run "$@"
  }
  run_web_unit() {
    pnpm --dir "${WEB_DIR}" test --run
  }
elif command -v npx &>/dev/null; then
  run_vitest() {
    (cd "${WEB_DIR}" && npx vitest run "$@")
  }
  run_web_unit() {
    (cd "${WEB_DIR}" && npx vitest run)
  }
elif [ -f "${WEB_DIR}/node_modules/vitest/vitest.mjs" ]; then
  run_vitest() {
    (cd "${WEB_DIR}" && node node_modules/vitest/vitest.mjs run "$@")
  }
  run_web_unit() {
    (cd "${WEB_DIR}" && node node_modules/vitest/vitest.mjs run)
  }
else
  echo -e "${RED}ERROR: No vitest runner found (pnpm, npx vitest, or node_modules/vitest).${RESET}" >&2
  exit 1
fi

run_step() {
  local label="$1"
  shift
  echo -e "\n${CYAN}${BOLD}▶ ${label}${RESET}"
  if "$@"; then
    echo -e "${GREEN}  ✓ PASS${RESET}"
    PASS=$((PASS + 1))
    RESULTS+=("PASS: ${label}")
  else
    echo -e "${RED}  ✗ FAIL${RESET}"
    FAIL=$((FAIL + 1))
    RESULTS+=("FAIL: ${label}")
    return 0
  fi
}

# =============================================================================
# Header
# =============================================================================
echo -e "${BOLD}=== test-core.sh (QA-5) — cross-suite unit + acceptance runner ===${RESET}"
echo "Repo root: ${REPO_ROOT}"
echo "Started at: $(date '+%Y-%m-%d %H:%M:%S')"

# =============================================================================
# 1. Backend API unit suite (regression)
# =============================================================================
run_step "API unit suite (regression)" \
  run_pytest tests/unit -q --tb=short

# =============================================================================
# 2. QA-5 backend acceptance: diagnosis, grading, Tutor evidence
# =============================================================================
run_step "QA-5: diagnosis + grading acceptance (test_diagnosis_grading.py)" \
  run_pytest tests/acceptance/test_diagnosis_grading.py -v --tb=short

run_step "QA-5: Tutor evidence binding acceptance (test_tutor_evidence.py)" \
  run_pytest tests/acceptance/test_tutor_evidence.py -v --tb=short

# =============================================================================
# 3. QA-4 acceptance regression (adapter tolerance + AST security)
# =============================================================================
run_step "QA-4 regression: adapter tolerance + AST security" \
  run_pytest tests/acceptance/quantum tests/security/test_qiskit_ast.py -q --tb=short

# =============================================================================
# 4. Frontend unit suite (regression)
# =============================================================================
run_step "Web unit suite (regression)" \
  run_web_unit

# =============================================================================
# 5. QA-5 frontend acceptance: circuit workspace + fallback state fixtures
# =============================================================================
run_step "QA-5: Circuit Workspace acceptance (circuit-workspace.test.tsx)" \
  run_vitest tests/acceptance/circuit-workspace.test.tsx

run_step "QA-5: Fallback state acceptance fixtures (fallback-state.test.tsx)" \
  run_vitest tests/acceptance/fallback-state.test.tsx

# =============================================================================
# Summary
# =============================================================================
echo -e "\n${BOLD}=== test-core.sh Results ===${RESET}"
for r in "${RESULTS[@]}"; do
  if [[ "${r}" == PASS* ]]; then
    echo -e "  ${GREEN}${r}${RESET}"
  else
    echo -e "  ${RED}${r}${RESET}"
  fi
done
echo ""
echo -e "Passed: ${GREEN}${PASS}${RESET}  Failed: ${RED}${FAIL}${RESET}"
echo "Finished at: $(date '+%Y-%m-%d %H:%M:%S')"

if [[ "${FAIL}" -gt 0 ]]; then
  echo -e "\n${RED}${BOLD}FAIL — ${FAIL} step(s) failed. See output above.${RESET}"
  echo "NUMERICAL CLAIM EVIDENCE CHECK: FAIL — one or more suites did not pass."
  exit 1
fi

echo -e "\n${GREEN}${BOLD}PASS — all suites green; no numerical claim lacks evidence.${RESET}"
exit 0
