#!/usr/bin/env bash
# ==============================================================================
# scripts/check-layout.sh — Q-Trace Monorepo Layout & Environment Contract Checker
# ==============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ERRORS=0
PASSED=0

echo "🔍 Running Q-Trace monorepo layout & environment contract check..."
echo "------------------------------------------------------------------"

check_dir() {
  local dir="$1"
  if [[ -d "$dir" ]]; then
    echo "  ✅ Directory exists: $dir"
    PASSED=$((PASSED + 1))
  else
    echo "  ❌ Missing directory: $dir"
    ERRORS=$((ERRORS + 1))
  fi
}

check_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    echo "  ✅ File exists: $file"
    PASSED=$((PASSED + 1))
  else
    echo "  ❌ Missing file: $file"
    ERRORS=$((ERRORS + 1))
  fi
}

check_env_var() {
  local var="$1"
  if grep -E "^${var}=" .env.example >/dev/null 2>&1; then
    echo "  ✅ .env.example defines: $var"
    PASSED=$((PASSED + 1))
  else
    echo "  ❌ .env.example missing variable: $var"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "📂 Checking required root & application directories..."
REQUIRED_DIRS=(
  "apps/web"
  "apps/web/app"
  "apps/web/components"
  "apps/web/features"
  "apps/web/tests/unit"
  "apps/web/tests/fixtures"
  "apps/web/tests/acceptance"
  "apps/web/e2e"
  "apps/api"
  "apps/api/app"
  "apps/api/app/routers"
  "apps/api/app/services"
  "apps/api/app/repositories"
  "apps/api/app/prompts"
  "apps/api/app/models"
  "apps/api/tests"
  "apps/api/tests/unit/simulation"
  "apps/api/tests/unit/ai"
  "apps/api/tests/unit/data"
  "apps/api/tests/contract"
  "apps/api/tests/fixtures/golden"
  "apps/api/tests/acceptance"
  "apps/api/tests/security"
  "board/contracts"
  "scripts"
)

for d in "${REQUIRED_DIRS[@]}"; do
  check_dir "$d"
done

echo ""
echo "📄 Checking required configuration files..."
REQUIRED_FILES=(
  "package.json"
  "pnpm-workspace.yaml"
  ".env.example"
  ".gitignore"
  "apps/web/package.json"
  "apps/web/tsconfig.json"
  "apps/web/next.config.mjs"
  "apps/api/pyproject.toml"
  "apps/api/app/main.py"
  "board/contracts/circuit-simulation.md"
  "board/contracts/flight-recorder-tutor.md"
  "board/contracts/learning-content.md"
  "board/contracts/progress-analytics.md"
)

for f in "${REQUIRED_FILES[@]}"; do
  check_file "$f"
done

echo ""
echo "🔑 Checking environment contract in .env.example..."
REQUIRED_ENV_VARS=(
  "NEXT_PUBLIC_API_BASE_URL"
  "WEB_ORIGIN"
  "MONGODB_URI"
  "MONGODB_DB"
  "TUTOR_PROVIDER"
  "TUTOR_MODEL"
  "TUTOR_API_KEY"
  "DEMO_LOCAL"
  "DEMO_FALLBACK"
  "ENABLE_PENNYLANE"
  "ENABLE_CODE_PARSE"
  "ENABLE_TUTOR_CLOUD"
  "ENABLE_NOISE_LAB"
)

for v in "${REQUIRED_ENV_VARS[@]}"; do
  check_env_var "$v"
done

echo ""
echo "🛡️ Verifying no secrets or sensitive values are committed..."
# Check for unignored .env files or real API keys in .env.example
if [[ -f ".env" ]]; then
  echo "  ⚠️ Found .env in workspace root — verifying it is ignored by git..."
  if git check-ignore -q .env; then
    echo "  ✅ .env is correctly gitignored"
    PASSED=$((PASSED + 1))
  else
    echo "  ❌ .env is NOT ignored by git!"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Ensure .env.example contains no real API keys
if grep -E "^TUTOR_API_KEY=[^[:space:]]+" .env.example >/dev/null 2>&1; then
  echo "  ❌ Real or dummy non-empty TUTOR_API_KEY detected in .env.example"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✅ .env.example TUTOR_API_KEY is properly blank"
  PASSED=$((PASSED + 1))
fi

echo ""
echo "------------------------------------------------------------------"
if [[ "$ERRORS" -eq 0 ]]; then
  echo "🎉 SUCCESS: All layout, structure, and environment checks passed ($PASSED checks ok)."
  exit 0
else
  echo "💥 FAILURE: $ERRORS check(s) failed."
  exit 1
fi
