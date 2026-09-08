#!/usr/bin/env bash
# ==============================================================================
# scripts/demo-local.sh — Q-Trace One-Laptop Local Demo Launcher & Check
# ==============================================================================
#
# Card: SHIP-2 · One-Laptop Demo Launcher
# Track: story-ship
# Owner: Vinod Krishna (lead)
#
# Purpose:
#   Launches the entire Q-Trace quantum learning platform on a single laptop in
#   self-contained offline mode with deterministic memory seeds and Flight
#   Recorder Tutor fallback enabled. Venue Wi-Fi, MongoDB Atlas, and cloud LLM
#   keys are NEVER required.
#
# Usage:
#   bash scripts/demo-local.sh            # Start web + API in local demo mode
#   bash scripts/demo-local.sh --check    # Start, verify readiness & absent keys, shutdown, exit 0
#   bash scripts/demo-local.sh --reset    # Reset local state and clear temporary logs/caches
#   bash scripts/demo-local.sh --help     # Show help, prerequisites & cache preparation
#
# Local Demo Environment Contract:
#   DEMO_LOCAL=1
#   DEMO_FALLBACK=1
#   ENABLE_TUTOR_CLOUD=0
#   ENABLE_PENNYLANE=1
#   ENABLE_CODE_PARSE=1
#   ENABLE_NOISE_LAB=0
#   TUTOR_PROVIDER=mock
#   TUTOR_MODEL=mock-tutor-v1
#   TUTOR_API_KEY=""
#   MONGODB_URI=""
#   MONGODB_DB=qtrace_demo_local
#   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
#   WEB_ORIGIN=http://localhost:3000
#   PORT=8000
# ==============================================================================

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

API_PORT=8000
WEB_PORT=3000
API_PID=""
WEB_PID=""
LOG_DIR="$ROOT_DIR/.demo_logs"
API_LOG="$LOG_DIR/api.log"
WEB_LOG="$LOG_DIR/web.log"
API_PID_FILE="$LOG_DIR/api.pid"
WEB_PID_FILE="$LOG_DIR/web.pid"

mkdir -p "$LOG_DIR"

# ------------------------------------------------------------------------------
# Export Local Demo Contract Environment Variables
# ------------------------------------------------------------------------------
export DEMO_LOCAL=1
export DEMO_FALLBACK=1
export ENABLE_TUTOR_CLOUD=0
export ENABLE_PENNYLANE=1
export ENABLE_CODE_PARSE=1
export ENABLE_NOISE_LAB=0
export TUTOR_PROVIDER="mock"
export TUTOR_MODEL="mock-tutor-v1"
export TUTOR_API_KEY=""
export MONGODB_URI=""
export MONGODB_DB="qtrace_demo_local"
export NEXT_PUBLIC_API_BASE_URL="http://localhost:${API_PORT}"
export WEB_ORIGIN="http://localhost:${WEB_PORT}"

# ------------------------------------------------------------------------------
# Banner & Help
# ------------------------------------------------------------------------------
print_banner() {
  cat <<'EOF'
================================================================================
🚀 Q-TRACE · ONE-LAPTOP VENUE DEMO LAUNCHER
================================================================================
[LOCAL DEMO CONTRACT & DISCLOSURE]
  • Runtime Mode:          LOCAL OFFLINE (DEMO_LOCAL=1)
  • AI Pedagogy Strategy:  TRACE-AWARE DETERMINISTIC FALLBACK (DEMO_FALLBACK=1)
  • Cloud AI Credentials:  DISCLOSED ABSENT (TUTOR_API_KEY is empty / mock active)
  • Database Backend:      IN-MEMORY REPOSITORY (MongoDB Atlas not required)
  • Quantum Engine:        Qiskit Aer local simulation
  • Web Interface:         http://localhost:3000
  • Backend API:           http://localhost:8000
  • Ops Endpoints:         http://localhost:8000/health | http://localhost:8000/ready
--------------------------------------------------------------------------------
💡 Venue resilience: Works 100% offline from this laptop during judge evaluations.
================================================================================
EOF
}

print_help() {
  cat <<'EOF'
Q-Trace One-Laptop Local Demo Launcher

Usage:
  bash scripts/demo-local.sh [command|flags]

Commands & Options:
  (no args)       Start API and Web services, verify readiness, and run interactive demo
  --check, -c     Start both services in background, test health/readiness endpoints,
                  prove Atlas & cloud Tutor keys are absent, clean up, and exit 0
  --reset, -r     Reset local runtime demo state, purge log files and clean orphan processes
  --help, -h      Display this documentation and cache preparation guide

Prerequisites:
  1. Python >= 3.10 with FastAPI and Uvicorn installed:
     pip install fastapi uvicorn pydantic
  2. Node.js >= 18 and pnpm installed:
     pnpm install (in repository root or apps/web)
  3. No external credentials needed (DEMO_LOCAL=1 forces memory seeds and mock tutor)

Cache Preparation (Run once before entering venue):
  1. Build frontend cache: pnpm --filter web build
  2. Verify local execution: bash scripts/demo-local.sh --check
  3. Test offline: Disconnect Wi-Fi and verify http://localhost:3000 loads instantly
EOF
}

# ------------------------------------------------------------------------------
# Runner Discovery
# ------------------------------------------------------------------------------
find_python_cmd() {
  # Test candidate commands that can run `uvicorn`
  if py -3.14 -m uvicorn --version >/dev/null 2>&1; then
    echo "py -3.14 -m uvicorn"
    return 0
  elif py -3.13 -m uvicorn --version >/dev/null 2>&1; then
    echo "py -3.13 -m uvicorn"
    return 0
  elif py -3.12 -m uvicorn --version >/dev/null 2>&1; then
    echo "py -3.12 -m uvicorn"
    return 0
  elif python3 -m uvicorn --version >/dev/null 2>&1; then
    echo "python3 -m uvicorn"
    return 0
  elif python -m uvicorn --version >/dev/null 2>&1; then
    echo "python -m uvicorn"
    return 0
  elif uvicorn --version >/dev/null 2>&1; then
    echo "uvicorn"
    return 0
  else
    echo ""
    return 1
  fi
}

find_web_cmd() {
  if command -v pnpm >/dev/null 2>&1; then
    echo "pnpm"
  elif command -v npm >/dev/null 2>&1; then
    echo "npm"
  else
    echo ""
  fi
}

# ------------------------------------------------------------------------------
# Process & Port Cleanup
# ------------------------------------------------------------------------------
kill_port() {
  local port="$1"
  
  # On Windows / MSYS / Git Bash
  if command -v taskkill.exe >/dev/null 2>&1 && command -v netstat >/dev/null 2>&1; then
    local pids
    pids=$(netstat -ano 2>/dev/null | grep -E "(:${port}[[:space:]]+.*LISTENING)" | awk '{print $NF}' | sort -u)
    for p in $pids; do
      if [[ -n "$p" && "$p" =~ ^[0-9]+$ && "$p" -gt 0 ]]; then
        MSYS_NO_PATHCONV=1 taskkill.exe /F /PID "$p" >/dev/null 2>&1 || true
      fi
    done
  fi

  # On Linux / macOS
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids=$(lsof -ti ":$port" 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
      kill -9 $pids >/dev/null 2>&1 || true
    fi
  fi
}

cleanup_processes() {
  echo "🧹 Shutting down local demo processes..."

  if [[ -n "${API_PID:-}" ]]; then
    kill "$API_PID" >/dev/null 2>&1 || true
    if command -v taskkill.exe >/dev/null 2>&1; then
      MSYS_NO_PATHCONV=1 taskkill.exe /F /T /PID "$API_PID" >/dev/null 2>&1 || true
    fi
  fi

  if [[ -n "${WEB_PID:-}" ]]; then
    kill "$WEB_PID" >/dev/null 2>&1 || true
    if command -v taskkill.exe >/dev/null 2>&1; then
      MSYS_NO_PATHCONV=1 taskkill.exe /F /T /PID "$WEB_PID" >/dev/null 2>&1 || true
    fi
  fi

  # Clean by PID files if stored
  if [[ -f "$API_PID_FILE" ]]; then
    local old_api_pid
    old_api_pid=$(cat "$API_PID_FILE" 2>/dev/null || true)
    if [[ -n "$old_api_pid" && "$old_api_pid" =~ ^[0-9]+$ ]]; then
      kill "$old_api_pid" >/dev/null 2>&1 || true
      if command -v taskkill.exe >/dev/null 2>&1; then
        MSYS_NO_PATHCONV=1 taskkill.exe /F /T /PID "$old_api_pid" >/dev/null 2>&1 || true
      fi
    fi
    rm -f "$API_PID_FILE"
  fi

  if [[ -f "$WEB_PID_FILE" ]]; then
    local old_web_pid
    old_web_pid=$(cat "$WEB_PID_FILE" 2>/dev/null || true)
    if [[ -n "$old_web_pid" && "$old_web_pid" =~ ^[0-9]+$ ]]; then
      kill "$old_web_pid" >/dev/null 2>&1 || true
      if command -v taskkill.exe >/dev/null 2>&1; then
        MSYS_NO_PATHCONV=1 taskkill.exe /F /T /PID "$old_web_pid" >/dev/null 2>&1 || true
      fi
    fi
    rm -f "$WEB_PID_FILE"
  fi

  kill_port "$API_PORT"
  kill_port "$WEB_PORT"
  echo "✅ All local services stopped cleanly."
}

# ------------------------------------------------------------------------------
# Reset Action
# ------------------------------------------------------------------------------
do_reset() {
  echo "🔄 Resetting Q-Trace local demo state..."
  cleanup_processes
  rm -rf "$LOG_DIR"
  mkdir -p "$LOG_DIR"
  echo "✅ Demo state, logs, and process locks reset to clean initial state."
}

# ------------------------------------------------------------------------------
# Start Services
# ------------------------------------------------------------------------------
start_api_service() {
  local py_cmd="$1"
  echo "⚡ Starting API service on port ${API_PORT} (DEMO_LOCAL=1, TUTOR_PROVIDER=mock)..."
  
  # Clear existing port listeners
  kill_port "$API_PORT"

  (
    cd "$ROOT_DIR/apps/api"
    export PORT="$API_PORT"
    # shellcheck disable=SC2086
    $py_cmd app.main:app --port "$API_PORT" --host 127.0.0.1 > "$API_LOG" 2>&1
  ) &
  API_PID=$!
  echo "$API_PID" > "$API_PID_FILE"
}

start_web_service() {
  local web_cmd="$1"
  echo "🌐 Starting Web service on port ${WEB_PORT}..."
  
  # Clear existing port listeners
  kill_port "$WEB_PORT"

  (
    cd "$ROOT_DIR/apps/web"
    export PORT="$WEB_PORT"
    if [[ "$web_cmd" == "pnpm" ]]; then
      pnpm dev --port "$WEB_PORT" > "$WEB_LOG" 2>&1
    else
      npm run dev -- -p "$WEB_PORT" > "$WEB_LOG" 2>&1
    fi
  ) &
  WEB_PID=$!
  echo "$WEB_PID" > "$WEB_PID_FILE"
}

# ------------------------------------------------------------------------------
# Readiness & Contract Verification
# ------------------------------------------------------------------------------
wait_for_api_readiness() {
  local max_attempts=30
  local attempt=1
  local url="http://127.0.0.1:${API_PORT}/health"
  local ready_url="http://127.0.0.1:${API_PORT}/ready"

  echo "⏳ Waiting for API service readiness at $ready_url..."

  while [[ $attempt -le $max_attempts ]]; do
    if curl -s -f "$url" >/dev/null 2>&1; then
      local ready_body
      ready_body=$(curl -s "$ready_url" 2>/dev/null || true)
      if echo "$ready_body" | grep -q '"status":"ready"'; then
        echo "  ✅ API is READY (attempt $attempt/$max_attempts)"
        return 0
      fi
    fi
    sleep 1
    attempt=$((attempt + 1))
  done

  echo "  ❌ API failed to reach readiness within ${max_attempts}s. Logs:"
  if [[ -f "$API_LOG" ]]; then
    tail -n 20 "$API_LOG"
  fi
  return 1
}

wait_for_web_readiness() {
  local max_attempts=35
  local attempt=1
  local url="http://127.0.0.1:${WEB_PORT}"

  echo "⏳ Waiting for Web service readiness at $url..."

  while [[ $attempt -le $max_attempts ]]; do
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)
    if [[ "$http_code" == "200" || "$http_code" == "304" || "$http_code" == "307" || "$http_code" == "308" ]]; then
      echo "  ✅ Web service is READY (HTTP $http_code on attempt $attempt/$max_attempts)"
      return 0
    fi
    sleep 1
    attempt=$((attempt + 1))
  done

  echo "  ❌ Web service failed to respond within ${max_attempts}s. Logs:"
  if [[ -f "$WEB_LOG" ]]; then
    tail -n 20 "$WEB_LOG"
  fi
  return 1
}

verify_key_absence() {
  echo "🔍 Verifying offline contract & key absence..."

  # 1. Verify TUTOR_API_KEY is empty
  if [[ -n "${TUTOR_API_KEY:-}" ]]; then
    echo "  ❌ TUTOR_API_KEY is non-empty in demo environment!"
    return 1
  else
    echo "  ✅ TUTOR_API_KEY is confirmed ABSENT (value is empty string)"
  fi

  # 2. Verify TUTOR_PROVIDER is mock
  if [[ "${TUTOR_PROVIDER:-}" != "mock" ]]; then
    echo "  ❌ TUTOR_PROVIDER is '${TUTOR_PROVIDER:-}' (expected 'mock')"
    return 1
  else
    echo "  ✅ TUTOR_PROVIDER is set to 'mock' (trace-aware fallback enabled)"
  fi

  # 3. Verify ENABLE_TUTOR_CLOUD is 0
  if [[ "${ENABLE_TUTOR_CLOUD:-}" != "0" ]]; then
    echo "  ❌ ENABLE_TUTOR_CLOUD is '${ENABLE_TUTOR_CLOUD:-}' (expected '0')"
    return 1
  else
    echo "  ✅ ENABLE_TUTOR_CLOUD is '0' (cloud calls disabled)"
  fi

  # 4. Verify MONGODB_URI is not set to external Atlas
  if [[ "${MONGODB_URI:-}" =~ mongodb(\+srv)?:\/\/.*\.mongodb\.net ]]; then
    echo "  ❌ MONGODB_URI points to external Atlas cloud cluster in local demo mode!"
    return 1
  else
    echo "  ✅ Atlas connection is confirmed ABSENT (local in-memory repository active)"
  fi

  # 5. Query /ready endpoint from live API
  local ready_json
  ready_json=$(curl -s "http://127.0.0.1:${API_PORT}/ready" 2>/dev/null || true)
  if echo "$ready_json" | grep -q '"demoLocal":true' && echo "$ready_json" | grep -q '"demoFallback":true'; then
    echo "  ✅ API /ready contract confirmed: demoLocal=true, demoFallback=true"
  else
    echo "  ❌ API /ready endpoint did not report demoLocal=true and demoFallback=true! Got: $ready_json"
    return 1
  fi

  return 0
}

# ------------------------------------------------------------------------------
# Check Mode Handler (Card TEST: bash scripts/demo-local.sh --check)
# ------------------------------------------------------------------------------
run_check_mode() {
  print_banner
  echo ""
  echo "🔬 EXECUTING CARD SHIP-2 TEST PROTOCOL (--check mode)..."
  echo "--------------------------------------------------------"

  local py_cmd
  py_cmd=$(find_python_cmd)
  if [[ -z "$py_cmd" ]]; then
    echo "❌ Error: Could not find Python runtime with fastapi and uvicorn installed."
    exit 1
  fi
  echo "  ✅ Python runner found: $py_cmd"

  local web_cmd
  web_cmd=$(find_web_cmd)
  if [[ -z "$web_cmd" ]]; then
    echo "❌ Error: Could not find pnpm or npm."
    exit 1
  fi
  echo "  ✅ Web runner found: $web_cmd"

  # Trap exit to guarantee cleanup
  trap cleanup_processes EXIT INT TERM

  start_api_service "$py_cmd"
  start_web_service "$web_cmd"

  wait_for_api_readiness || exit 1
  wait_for_web_readiness || exit 1
  verify_key_absence || exit 1

  echo ""
  echo "--------------------------------------------------------"
  echo "🎉 SHIP-2 CHECK PASSED: Both services started, reached health/readiness, and proved offline key absence."
  echo "--------------------------------------------------------"
  
  # Trap handles cleanup_processes on exit 0
  exit 0
}

# ------------------------------------------------------------------------------
# Interactive Start Handler
# ------------------------------------------------------------------------------
run_interactive_start() {
  print_banner
  echo ""
  echo "🚀 Launching Q-Trace local demo stack..."

  local py_cmd
  py_cmd=$(find_python_cmd)
  if [[ -z "$py_cmd" ]]; then
    echo "❌ Error: Could not find Python runtime with fastapi and uvicorn."
    exit 1
  fi

  local web_cmd
  web_cmd=$(find_web_cmd)
  if [[ -z "$web_cmd" ]]; then
    echo "❌ Error: Could not find pnpm or npm."
    exit 1
  fi

  trap cleanup_processes EXIT INT TERM

  start_api_service "$py_cmd"
  start_web_service "$web_cmd"

  wait_for_api_readiness || exit 1
  wait_for_web_readiness || exit 1
  verify_key_absence || exit 1

  echo ""
  echo "================================================================================"
  echo "🟢 Q-TRACE DEMO STACK IS RUNNING & READY!"
  echo "  • Open Web App:  http://localhost:3000"
  echo "  • API Docs:      http://localhost:8000/docs"
  echo "  • Logs saved in: $LOG_DIR"
  echo ""
  echo "👉 Press CTRL+C to stop all services and return to terminal."
  echo "================================================================================"

  # Keep running in foreground until Ctrl+C
  while true; do
    sleep 2
  done
}

# ------------------------------------------------------------------------------
# CLI Dispatcher
# ------------------------------------------------------------------------------
case "${1:-}" in
  --check|-c)
    run_check_mode
    ;;
  --reset|-r|reset)
    do_reset
    ;;
  --help|-h|help)
    print_help
    ;;
  *)
    run_interactive_start
    ;;
esac
