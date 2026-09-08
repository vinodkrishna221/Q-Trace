#!/usr/bin/env bash
# =============================================================================
# QA-2 — contract-check.sh
#
# Orchestrates contract shape validation at both API and frontend boundaries.
#
# What it does:
#   1. Runs apps/api/tests/contract/test_contract_shapes.py via pytest.
#      Tests include valid-example round-trips AND three deliberate-breakage
#      categories: renamed field, ObjectId leak, missing requestId.
#   2. Runs apps/web/tests/fixtures/contract.test.ts via vitest.
#      Same three breakage categories; no Zod — uses TypeScript type guards.
#
# Exit codes:
#   0 — all tests pass (valid examples pass, all deliberate breakages caught)
#   1 — one or more failures
#
# Usage:
#   bash scripts/contract-check.sh
#
# Requirements:
#   - uv (Python package manager) installed and in PATH
#   - pnpm installed and in PATH
#   - Run from the repository root (d:/Q-Trace or its Linux equivalent)
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${REPO_ROOT}/apps/api"
WEB_DIR="${REPO_ROOT}/apps/web"

# Colour helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Colour

hr() { printf '%s\n' "$(printf '─%.0s' {1..72})"; }

pass() { echo -e "${GREEN}✓ PASS${NC}  $1"; }
fail() { echo -e "${RED}✗ FAIL${NC}  $1"; }
info() { echo -e "${BLUE}ℹ${NC}  $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }

OVERALL_EXIT=0

# =============================================================================
# Banner
# =============================================================================
hr
echo ""
echo "  Q-Trace · QA-2 contract-check.sh"
echo "  Validates contract shapes at API (Python/Pydantic) and"
echo "  frontend (TypeScript/Vitest) boundaries."
echo ""
info "Repository root: ${REPO_ROOT}"
echo ""
hr

# =============================================================================
# Step 1 — Backend: Pydantic serialization tests
# =============================================================================
echo ""
echo "  STEP 1/2 · Backend — Pydantic contract shapes"
echo "  Suite : apps/api/tests/contract/test_contract_shapes.py"
echo "  Runner: uv run --project apps/api pytest"
echo ""

BACKEND_TEST="apps/api/tests/contract/test_contract_shapes.py"

if ! command -v uv &>/dev/null; then
    warn "uv not found in PATH — skipping backend tests."
    warn "Install uv (https://docs.astral.sh/uv/) and re-run."
    OVERALL_EXIT=1
else
    info "Running backend contract tests..."
    if uv run --project "${API_DIR}" pytest \
            "${BACKEND_TEST}" \
            -v \
            --tb=short \
            2>&1; then
        pass "Backend contract shape tests"
    else
        fail "Backend contract shape tests"
        OVERALL_EXIT=1
    fi
fi

hr

# =============================================================================
# Step 2 — Frontend: TypeScript fixture shape tests
# =============================================================================
echo ""
echo "  STEP 2/2 · Frontend — TypeScript contract shapes"
echo "  Suite : apps/web/tests/fixtures/contract.test.ts"
echo "  Runner: pnpm --dir apps/web test"
echo ""

FRONTEND_TEST="tests/fixtures/contract.test.ts"

if ! command -v pnpm &>/dev/null; then
    warn "pnpm not found in PATH — skipping frontend tests."
    warn "Install pnpm (https://pnpm.io/) and re-run."
    OVERALL_EXIT=1
else
    info "Running frontend contract tests..."
    if pnpm --dir "${WEB_DIR}" exec vitest run \
            "${FRONTEND_TEST}" \
            2>&1; then
        pass "Frontend contract shape tests"
    else
        fail "Frontend contract shape tests"
        OVERALL_EXIT=1
    fi
fi

hr

# =============================================================================
# Summary
# =============================================================================
echo ""
if [ "${OVERALL_EXIT}" -eq 0 ]; then
    echo -e "${GREEN}  RESULT: contract-check PASS${NC}"
    echo "  Valid examples: accepted at both boundaries."
    echo "  Deliberate breakages caught:"
    echo "    • renamed field   — value not found at wrong key"
    echo "    • ObjectId leak   — _id / \$oid stripped / detected"
    echo "    • missing requestId — validation error raised"
else
    echo -e "${RED}  RESULT: contract-check FAIL${NC}"
    echo "  One or more suites reported failures — see output above."
    echo "  Fix the failures before merging QA-2."
fi
echo ""
hr

exit "${OVERALL_EXIT}"
