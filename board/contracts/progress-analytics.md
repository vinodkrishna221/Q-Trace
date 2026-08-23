# Contract: progress-analytics                    version: 1

> OWNER: data-analytics · CONSUMERS: learning-ux, ai-pedagogy, fixtures-qa, story-ship
> DEPENDS ON: circuit-simulation v1, flight-recorder-tutor v1
> Change ritual: edit → bump version + changelog → DECISIONS entry → ping consumers → THEN code.

## GET /v1/challenges/{challengeId}

RESPONSE 200
```json
{
  "challenge": {
    "id": "ch_bell_repair",
    "moduleId": "mod_bell",
    "type": "CIRCUIT_REPAIR",
    "title": "Restore Bell Correlation",
    "prompt": "Repair the circuit so only 00 and 11 have non-zero ideal probability.",
    "starterCircuitModelId": "cm_bell_broken",
    "acceptanceRule": {"version": 1, "kind": "PROBABILITY_SUPPORT_EQUALS", "states": ["00", "11"], "epsilon": 0.000001},
    "targetsMisconceptionCodes": ["SUPERPOSITION_VS_ENTANGLEMENT", "GATE_ORDER"],
    "points": 100
  }
}
```

ERRORS: `404 CHALLENGE_NOT_FOUND`.

## POST /v1/challenge-attempts

REQUEST
```json
{
  "challengeId": "ch_bell_repair",
  "learnerProfileId": "lp_aarav",
  "submittedAnswer": {"type": "CIRCUIT_MODEL", "circuitModelId": "cm_aarav_repaired"},
  "simulationRunId": "sr_demo_002"
}
```

RESPONSE 201
```json
{
  "challengeAttempt": {
    "id": "ca_demo_001",
    "challengeId": "ch_bell_repair",
    "learnerProfileId": "lp_aarav",
    "simulationRunId": "sr_demo_002",
    "submittedAnswer": {"type": "CIRCUIT_MODEL", "circuitModelId": "cm_aarav_repaired"},
    "passed": true,
    "score": 100,
    "feedbackCode": "BELL_SUPPORT_CORRECT",
    "attemptNumber": 1,
    "createdAt": "2026-08-23T05:28:00Z"
  },
  "progressRecord": {
    "id": "progress_lp_aarav",
    "learnerProfileId": "lp_aarav",
    "completedModuleIds": ["mod_bell"],
    "skillStates": [
      {"skillId": "skill_create_bell", "status": "MASTERED", "score": 100},
      {"skillId": "skill_explain_correlation", "status": "PRACTICING", "score": 70}
    ],
    "latestChallengeAttemptId": "ca_demo_001",
    "misconceptionSummary": [{"code": "SUPERPOSITION_VS_ENTANGLEMENT", "count": 1, "latestAt": "2026-08-23T05:27:01Z"}],
    "totalPoints": 100,
    "updatedAt": "2026-08-23T05:28:00Z"
  }
}
```

ERRORS: `404 CHALLENGE_NOT_FOUND` · `404 LEARNER_NOT_FOUND` · `404 SIMULATION_RUN_NOT_FOUND` · `409 RUN_NOT_SUCCEEDED` · `422 ANSWER_TYPE_INVALID` · `422 ACCEPTANCE_EVIDENCE_INVALID`.

NOTES: grading is deterministic; the client may send `Idempotency-Key` to prevent duplicate attempts; Progress Record update is atomic with the accepted attempt.

## GET /v1/progress-records/{learnerProfileId}

RESPONSE 200: the `ProgressRecord` shape above.

ERRORS: `404 LEARNER_NOT_FOUND` · `404 PROGRESS_RECORD_NOT_FOUND`.

## GET /v1/instructor-insights/{cohortId}

RESPONSE 200
```json
{
  "instructorInsight": {
    "cohortId": "cohort_demo_2026",
    "generatedAt": "2026-08-23T05:28:01Z",
    "learnerCount": 30,
    "moduleCompletion": [{"moduleId": "mod_bell", "completed": 18, "assigned": 30}],
    "challengePassRate": [{"challengeId": "ch_bell_repair", "passed": 17, "attempted": 24, "rate": 0.7083}],
    "topMisconceptions": [{"code": "SUPERPOSITION_VS_ENTANGLEMENT", "learnerCount": 11, "occurrences": 15}],
    "liveDemoLearner": {"learnerProfileId": "lp_aarav", "latestAttemptPassed": true},
    "dataDisclosure": "Synthetic seeded cohort plus current live demo attempt"
  }
}
```

ERRORS: `404 COHORT_NOT_FOUND`.

NOTES: P0 cache TTL ≤10 seconds; the response is aggregate and does not contain Tutor messages.

## Types

```ts
type ChallengeType = "QUIZ" | "CIRCUIT_REPAIR";
type SkillStatus = "NOT_STARTED" | "PRACTICING" | "MASTERED";
type SkillState = { skillId: string; status: SkillStatus; score: number };
type ProgressRecord = { id: string; learnerProfileId: string; completedModuleIds: string[]; skillStates: SkillState[]; latestChallengeAttemptId: string | null; misconceptionSummary: { code: string; count: number; latestAt: string }[]; totalPoints: number; updatedAt: string };
```

## Changelog

- v1 2026-08-23: initial Challenge, atomic Challenge Attempt/Progress Record and aggregate Instructor Insight contracts.