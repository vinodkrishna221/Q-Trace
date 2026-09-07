#!/usr/bin/env bash
# scripts/smoke.sh -- SIM-9 local smoke test (mock path for QA-7)
#
# Usage:
#   bash scripts/smoke.sh --mode local --repeat 5
#
# Purpose:
#   Exercises the Bell simulation path N times, verifies every run completes
#   within the 1500ms contract budget, and asserts that ideal probabilities
#   are identical across all runs (deterministic statevector, not shot-based).
#
# Requires: curl, python3, API running locally on API_URL (default: http://localhost:8000)
#
# SIM-9 mock path: QA-7 (scripts/release-gate.sh) is not yet merged.
# This script covers the simulation-api track smoke obligation only.

set -euo pipefail

MODE="local"
REPEAT=5
API_URL="${API_URL:-http://localhost:8000}"
BUDGET_MS=1500
EPSILON="0.001"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --mode)   MODE="$2";   shift 2 ;;
        --repeat) REPEAT="$2"; shift 2 ;;
        --url)    API_URL="$2"; shift 2 ;;
        *) echo "Unknown arg: $1" >&2; exit 1 ;;
    esac
done

if [[ "$MODE" != "local" ]]; then
    echo "ERROR: smoke.sh only supports --mode local (SIM-9 mock path)." >&2
    exit 1
fi

echo "============================================================"
echo "  Q-Trace Simulation Smoke -- mode=${MODE} repeat=${REPEAT}"
echo "  API: ${API_URL}  Budget: ${BUDGET_MS}ms"
echo "============================================================"

BELL_PAYLOAD='{"learnerProfileId":"lp_smoke","moduleId":"mod_bell","circuitModel":{"id":"cm_smoke_bell","name":"Smoke Bell State","qubitCount":2,"classicalBitCount":2,"operations":[{"opId":"op_1","gate":"H","targets":[0],"controls":[],"classicalTargets":[],"column":0},{"opId":"op_2","gate":"CNOT","targets":[1],"controls":[0],"classicalTargets":[],"column":1},{"opId":"op_3","gate":"MEASURE","targets":[0],"controls":[],"classicalTargets":[0],"column":2},{"opId":"op_4","gate":"MEASURE","targets":[1],"controls":[],"classicalTargets":[1],"column":2}],"source":"SEED","modelVersion":1},"primaryAdapter":"QISKIT_AER","runConformance":false,"shots":1024}'

echo ""
echo ">>> Health check ..."
HEALTH=$(curl -sf "${API_URL}/health" 2>/dev/null || true)
if [[ -z "$HEALTH" ]]; then
    echo "FAIL: /health did not respond. Is the API running at ${API_URL}?" >&2
    exit 1
fi
echo "    /health OK: ${HEALTH}"

PASS=0; FAIL=0; FIRST_PROB_00=""; FIRST_PROB_11=""

echo ""
echo ">>> Running ${REPEAT} Bell simulations ..."

for i in $(seq 1 "$REPEAT"); do
    REQUEST_ID="req_smoke_$(date +%s)_${i}"
    START_MS=$(python3 -c "import time; print(int(time.monotonic()*1000))")

    HTTP_RESPONSE=$(curl -s -o /tmp/qtrace_smoke_body.json -w "%{http_code}" \
        -X POST "${API_URL}/v1/simulation-runs" \
        -H "Content-Type: application/json" \
        -H "X-Request-ID: ${REQUEST_ID}" \
        --max-time 5 \
        -d "$BELL_PAYLOAD" 2>/dev/null || echo "000")

    END_MS=$(python3 -c "import time; print(int(time.monotonic()*1000))")
    ELAPSED=$((END_MS - START_MS))

    if [[ "$HTTP_RESPONSE" != "201" ]]; then
        BODY=$(cat /tmp/qtrace_smoke_body.json 2>/dev/null || echo "{}")
        echo "  [${i}/${REPEAT}] FAIL -- HTTP ${HTTP_RESPONSE} (elapsed ${ELAPSED}ms) body=${BODY}"
        FAIL=$((FAIL + 1)); continue
    fi

    DURATION_MS=$(python3 -c "import json; d=json.load(open('/tmp/qtrace_smoke_body.json')); print(d['simulationRun']['durationMs'])" 2>/dev/null || echo "9999")
    PROB_00=$(python3 -c "import json; d=json.load(open('/tmp/qtrace_smoke_body.json')); print(d['simulationRun']['probabilities'].get('00','MISSING'))" 2>/dev/null || echo "MISSING")
    PROB_11=$(python3 -c "import json; d=json.load(open('/tmp/qtrace_smoke_body.json')); print(d['simulationRun']['probabilities'].get('11','MISSING'))" 2>/dev/null || echo "MISSING")

    BUDGET_OK="YES"
    if (( DURATION_MS > BUDGET_MS )); then BUDGET_OK="NO"; fi

    PROB_OK="YES"
    if [[ -z "$FIRST_PROB_00" ]]; then
        FIRST_PROB_00="$PROB_00"; FIRST_PROB_11="$PROB_11"
    else
        PROB_MATCH=$(python3 -c "
p00=float('${PROB_00}'); p11=float('${PROB_11}')
r00=float('${FIRST_PROB_00}'); r11=float('${FIRST_PROB_11}')
print('YES' if abs(p00-r00)<=${EPSILON} and abs(p11-r11)<=${EPSILON} else 'NO')
" 2>/dev/null || echo "NO")
        [[ "$PROB_MATCH" != "YES" ]] && PROB_OK="NO"
    fi

    if [[ "$BUDGET_OK" == "YES" && "$PROB_OK" == "YES" ]]; then
        echo "  [${i}/${REPEAT}] PASS -- durationMs=${DURATION_MS} elapsed=${ELAPSED}ms p00=${PROB_00} p11=${PROB_11}"
        PASS=$((PASS + 1))
    else
        echo "  [${i}/${REPEAT}] FAIL -- budgetOk=${BUDGET_OK} probOk=${PROB_OK} durationMs=${DURATION_MS}"
        FAIL=$((FAIL + 1))
    fi
done

echo ""
echo "============================================================"
echo "  SMOKE: ${PASS}/${REPEAT} PASS  ${FAIL}/${REPEAT} FAIL"
echo "  Reference: 00=${FIRST_PROB_00}  11=${FIRST_PROB_11}"
echo "============================================================"

[[ $FAIL -gt 0 ]] && { echo "RESULT: FAIL" >&2; exit 1; }
echo "RESULT: PASS"
exit 0