# Contract: flight-recorder-tutor                    version: 1

> OWNER: ai-pedagogy · CONSUMERS: learning-ux, data-analytics, fixtures-qa, story-ship
> DEPENDS ON: circuit-simulation v1
> Change ritual: edit → bump version + changelog → DECISIONS entry → ping consumers → THEN code.

## POST /v1/flight-recorder/diagnose

REQUEST
```json
{
  "learnerProfileId": "lp_aarav",
  "simulationRunId": "sr_demo_001"
}
```

RESPONSE 201
```json
{
  "misconceptionSignal": {
    "id": "ms_demo_001",
    "learnerProfileId": "lp_aarav",
    "simulationRunId": "sr_demo_001",
    "code": "SUPERPOSITION_VS_ENTANGLEMENT",
    "firstDivergenceStep": 1,
    "evidence": {
      "prediction": "INDEPENDENT_RANDOM",
      "verifiedBehavior": "CORRELATED_00_11",
      "stateTraceStepIndexes": [0, 1]
    },
    "confidence": 1.0,
    "repairChallengeId": "ch_bell_repair",
    "createdAt": "2026-08-23T05:27:01Z"
  },
  "replay": [
    {"stepIndex": 0, "headline": "Superposition created", "evidenceKeys": ["stateTrace.0.basisProbabilities"]},
    {"stepIndex": 1, "headline": "Correlation introduced", "evidenceKeys": ["stateTrace.1.basisProbabilities", "stateTrace.1.reducedQubits"]}
  ]
}
```

ERRORS: `404 LEARNER_NOT_FOUND` · `404 SIMULATION_RUN_NOT_FOUND` · `409 RUN_NOT_SUCCEEDED` · `422 PREDICTION_MISSING` · `422 TRACE_INSUFFICIENT`.

NOTES: diagnosis is deterministic over closed rules and verified trace data; an LLM never selects the code or first divergence.

## POST /v1/tutor/explain

REQUEST
```json
{
  "learnerProfileId": "lp_aarav",
  "moduleId": "mod_bell",
  "simulationRunId": "sr_demo_001",
  "misconceptionSignalId": "ms_demo_001",
  "intent": "EXPLAIN_DIVERGENCE",
  "learnerQuestion": "Why are the outcomes random but still linked?"
}
```
- `intent`: `EXPLAIN_DIVERGENCE | EXPLAIN_CODE_ERROR | SUGGEST_OPTIMIZATION`.
- `learnerQuestion`: string, 0–500 chars; never treated as evidence.

RESPONSE 200
```json
{
  "tutorResponse": {
    "responseId": "tr_demo_001",
    "intent": "EXPLAIN_DIVERGENCE",
    "summary": "The Hadamard gate made qubit 0 uncertain; the CNOT then tied qubit 1 to that branch. Each shot is random, but the pair is correlated.",
    "steps": [
      {"title": "After H", "body": "The verified probabilities are 00 = 0.5 and 10 = 0.5.", "evidenceKeys": ["stateTrace.0.basisProbabilities"]},
      {"title": "After CNOT", "body": "The verified support moves to 00 = 0.5 and 11 = 0.5.", "evidenceKeys": ["stateTrace.1.basisProbabilities"]}
    ],
    "numericalClaims": [
      {"claim": "P(00)=0.5", "evidenceKey": "stateTrace.1.basisProbabilities.00"},
      {"claim": "P(11)=0.5", "evidenceKey": "stateTrace.1.basisProbabilities.11"}
    ],
    "repairChallengeId": "ch_bell_repair",
    "fallbackUsed": true,
    "model": "DEMO_FALLBACK",
    "safetyNote": "Explanation is grounded in this Simulation Run; it is not a hardware claim."
  }
}
```

ERRORS: `404 EVIDENCE_NOT_FOUND` · `422 INTENT_UNSUPPORTED` · `422 EVIDENCE_KEY_INVALID` · `429 TUTOR_RATE_LIMITED` · `503 TUTOR_UNAVAILABLE`.

NOTES:
- latency budget: stream first text ≤2000ms in cloud mode; full fallback ≤150ms.
- the service validates every `evidenceKey` and rejects numerical claims without a matching value.
- fallback is selected by `DEMO_FALLBACK=1`, provider failure, timeout or rate limit; the UI always exposes `fallbackUsed`.
- free-form question and response are not persisted in P0.

## POST /v1/circuit-health

Deterministic SHOULD endpoint; the Tutor may verbalize its output but not create metrics.

REQUEST
```json
{
  "circuitModelId": "cm_bell_seed"
}
```

RESPONSE 200
```json
{
  "health": {
    "qubitCount": 2,
    "gateCount": 2,
    "measurementCount": 2,
    "depth": 2,
    "suggestions": [
      {"code": "NO_CHANGE", "message": "No supported simplification was found for this circuit.", "verified": true}
    ]
  }
}
```

ERRORS: `404 CIRCUIT_MODEL_NOT_FOUND` · `422 METRIC_UNAVAILABLE`.

## Types

```ts
type MisconceptionCode = "SUPERPOSITION_VS_ENTANGLEMENT" | "MEASUREMENT_DETERMINISM" | "GATE_ORDER" | "NO_SIGNAL";
type MisconceptionSignal = { id: string; learnerProfileId: string; simulationRunId: string; code: MisconceptionCode; firstDivergenceStep: number | null; evidence: { prediction: string; verifiedBehavior: string; stateTraceStepIndexes: number[] }; confidence: number; repairChallengeId: string | null; createdAt: string };
type TutorStep = { title: string; body: string; evidenceKeys: string[] };
type NumericalClaim = { claim: string; evidenceKey: string };
```

## Changelog

- v1 2026-08-23: initial deterministic diagnosis, evidence-bound Tutor and circuit-health contracts.