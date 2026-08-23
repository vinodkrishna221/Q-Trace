# Contract: learning-content                    version: 1

> OWNER: data-analytics · CONSUMERS: learning-ux, ai-pedagogy, fixtures-qa, story-ship
> Change ritual: edit → bump version + changelog → DECISIONS entry → ping consumers → THEN code.

## GET /v1/demo-profiles

RESPONSE 200
```json
{
  "profiles": [
    {"id": "lp_aarav", "displayName": "Aarav", "role": "BEGINNER_CSE", "cohortId": "cohort_demo_2026", "priorKnowledge": {"python": true, "linearAlgebra": false, "quantumTheory": false, "circuitProgramming": false}, "activeLearningPathId": "path_aarav_foundations"},
    {"id": "lp_meera", "displayName": "Meera", "role": "PHYSICS_TO_CODE", "cohortId": "cohort_demo_2026", "priorKnowledge": {"python": true, "linearAlgebra": true, "quantumTheory": true, "circuitProgramming": false}, "activeLearningPathId": "path_meera_code"}
  ],
  "instructor": {"id": "instructor_rao", "displayName": "Dr. Rao", "cohortId": "cohort_demo_2026"}
}
```

NOTES: all identities are disclosed synthetic demo profiles; no authentication claim.

## GET /v1/learning-paths/{learnerProfileId}

RESPONSE 200
```json
{
  "learningPath": {
    "id": "path_aarav_foundations",
    "learnerProfileId": "lp_aarav",
    "entryBand": "FOUNDATIONS",
    "moduleIds": ["mod_superposition", "mod_measurement", "mod_bell"],
    "currentModuleId": "mod_bell",
    "recommendationReason": "Complete the Bell-state lab after the superposition checkpoint.",
    "updatedAt": "2026-08-23T05:27:00Z"
  }
}
```

ERRORS: `404 LEARNER_NOT_FOUND` · `404 LEARNING_PATH_NOT_FOUND`.

## GET /v1/modules

QUERY: `level=FOUNDATION|INTERMEDIATE` optional; `limit` integer 1–20 default 10.

RESPONSE 200
```json
{
  "modules": [
    {"id": "mod_superposition", "slug": "superposition", "title": "Qubits and Superposition", "level": "FOUNDATION", "estimatedMinutes": 14, "skillIds": ["skill_create_superposition"]},
    {"id": "mod_measurement", "slug": "measurement", "title": "Measurement and Probability", "level": "FOUNDATION", "estimatedMinutes": 12, "skillIds": ["skill_predict_measurement"]},
    {"id": "mod_bell", "slug": "bell-state", "title": "From Superposition to Bell Correlation", "level": "FOUNDATION", "estimatedMinutes": 18, "skillIds": ["skill_create_bell", "skill_explain_correlation"]}
  ],
  "nextCursor": null
}
```

## GET /v1/modules/{moduleSlug}

RESPONSE 200
```json
{
  "module": {
    "id": "mod_bell",
    "slug": "bell-state",
    "title": "From Superposition to Bell Correlation",
    "skillIds": ["skill_create_bell", "skill_explain_correlation"],
    "level": "FOUNDATION",
    "estimatedMinutes": 18,
    "contentBlocks": [
      {"type": "TEXT", "body": "Apply H to create superposition, then CNOT to correlate the qubits."},
      {"type": "CALLOUT", "tone": "CAUTION", "body": "Random outcomes can still be perfectly correlated."}
    ],
    "predictionCheckpoint": {
      "id": "pc_bell_outcomes",
      "prompt": "After H and CNOT, which measurement pattern should dominate?",
      "answerSchema": {"type": "SINGLE_CHOICE", "options": ["INDEPENDENT_RANDOM", "CORRELATED_00_11", "ALWAYS_00", "ALWAYS_11"]}
    },
    "starterCircuitModelId": "cm_bell_seed",
    "challengeIds": ["ch_bell_repair"]
  }
}
```

ERRORS: `404 MODULE_NOT_FOUND`.

NOTES: module content is vetted seed content, not generated at request time.

## Types

```ts
type LearnerRole = "BEGINNER_CSE" | "PHYSICS_TO_CODE";
type PriorKnowledge = { python: boolean; linearAlgebra: boolean; quantumTheory: boolean; circuitProgramming: boolean };
type LearnerProfile = { id: string; displayName: string; role: LearnerRole; cohortId: string; priorKnowledge: PriorKnowledge; activeLearningPathId: string };
type LearningPath = { id: string; learnerProfileId: string; entryBand: "FOUNDATIONS" | "THEORY_TO_CODE"; moduleIds: string[]; currentModuleId: string; recommendationReason: string; updatedAt: string };
type ContentBlock = { type: "TEXT"; body: string } | { type: "CALLOUT"; tone: "INFO" | "CAUTION"; body: string } | { type: "FORMULA"; latex: string } | { type: "CIRCUIT_PREVIEW"; circuitModelId: string };
```

## Changelog

- v1 2026-08-23: initial seeded profiles, Learning Path and Module read contract.