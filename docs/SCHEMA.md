# Schema — Q-Trace

> Store: MongoDB Atlas M0 with deterministic in-memory demo fallback (DECISIONS #7) · schema version 1 · PRD nouns verbatim · IDs cross contracts as strings, dates as ISO-8601.

## Shared conventions

- IDs are stable prefixed strings in seeds (`lp_aarav`, `mod_bell`, `sr_demo_001`); production may use ObjectId internally but never at the contract boundary.
- All records carry `schemaVersion: 1` and ISO timestamps where mutable.
- Enumerations are closed at the contract boundary. Unknown values fail with `VALIDATION_ERROR`.
- State amplitudes are transported as `{ re: number, im: number }`; JSON never carries Python complex values.
- Free-form Tutor messages are not stored. Only structured outcome metadata may be attached to a Challenge Attempt.

## Learner Profile  (collection: `learner_profiles`)

| Field | Type | Notes |
|---|---|---|
| id | string | stable; example `lp_aarav` |
| displayName | string | synthetic demo name |
| role | `BEGINNER_CSE \| PHYSICS_TO_CODE` | learner entry band |
| cohortId | string | example `cohort_demo_2026` |
| priorKnowledge | object | booleans: `python`, `linearAlgebra`, `quantumTheory`, `circuitProgramming` |
| completedSkillIds | string[] | denormalized for immediate path rendering |
| activeLearningPathId | string | current path |
| schemaVersion | number | `1` |
| createdAt, updatedAt | ISO string | contract boundary |

**Example document:**
```json
{
  "id": "lp_aarav",
  "displayName": "Aarav",
  "role": "BEGINNER_CSE",
  "cohortId": "cohort_demo_2026",
  "priorKnowledge": {"python": true, "linearAlgebra": false, "quantumTheory": false, "circuitProgramming": false},
  "completedSkillIds": [],
  "activeLearningPathId": "path_aarav_foundations",
  "schemaVersion": 1,
  "createdAt": "2026-08-23T05:27:00Z",
  "updatedAt": "2026-08-23T05:27:00Z"
}
```

**Demo queries → indexes:**
- role switch by `id` → unique `{ id: 1 }`
- cohort learner list → `{ cohortId: 1, displayName: 1 }`

**Embedded vs referenced:** prior-knowledge flags embed because they render with the profile; attempts and progress events grow independently and are referenced by learner ID.

## Learning Path  (collection: `learning_paths`)

| Field | Type | Notes |
|---|---|---|
| id | string | stable path ID |
| learnerProfileId | string | indexed |
| entryBand | `FOUNDATIONS \| THEORY_TO_CODE` | selected from prior knowledge |
| moduleIds | string[] | ordered |
| currentModuleId | string | path cursor |
| recommendationReason | string | deterministic, display-safe |
| schemaVersion | number | `1` |
| updatedAt | ISO string | |

**Example document:**
```json
{
  "id": "path_aarav_foundations",
  "learnerProfileId": "lp_aarav",
  "entryBand": "FOUNDATIONS",
  "moduleIds": ["mod_superposition", "mod_measurement", "mod_bell"],
  "currentModuleId": "mod_bell",
  "recommendationReason": "Complete the Bell-state lab after the superposition checkpoint.",
  "schemaVersion": 1,
  "updatedAt": "2026-08-23T05:27:00Z"
}
```

**Demo queries → indexes:**
- active path by learner → unique `{ learnerProfileId: 1 }`

**Embedded vs referenced:** ordered module IDs embed; full Module content is reused and referenced.

## Module  (collection: `modules`)

| Field | Type | Notes |
|---|---|---|
| id | string | `mod_superposition`, `mod_measurement`, `mod_bell` |
| slug | string | route-safe, unique |
| title | string | UI title |
| skillIds | string[] | measurable outcomes |
| level | `FOUNDATION \| INTERMEDIATE` | |
| estimatedMinutes | number | positive integer |
| contentBlocks | object[] | allowlisted block types: `TEXT`, `FORMULA`, `CALLOUT`, `CIRCUIT_PREVIEW` |
| predictionCheckpointId | string? | Bell module uses one |
| starterCircuitModelId | string? | seeded demo circuit |
| challengeIds | string[] | ordered |
| schemaVersion | number | `1` |

**Example document:**
```json
{
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
  "predictionCheckpointId": "pc_bell_outcomes",
  "starterCircuitModelId": "cm_bell_seed",
  "challengeIds": ["ch_bell_repair"],
  "schemaVersion": 1
}
```

**Demo queries → indexes:**
- module route by slug → unique `{ slug: 1 }`
- catalogue by level → `{ level: 1, title: 1 }`

**Embedded vs referenced:** bounded display content embeds to keep the lesson render one read; shared Circuit Model and Challenge records are referenced.

## Prediction Checkpoint  (collection: `prediction_checkpoints`)

| Field | Type | Notes |
|---|---|---|
| id | string | template ID |
| moduleId | string | indexed |
| prompt | string | vetted learning prompt |
| answerSchema | object | allowlisted structured choices, not arbitrary grading code |
| misconceptionMap | object | answer choice → Misconception Signal code |
| schemaVersion | number | `1` |

**Example document:**
```json
{
  "id": "pc_bell_outcomes",
  "moduleId": "mod_bell",
  "prompt": "After H and CNOT, which measurement pattern should dominate?",
  "answerSchema": {
    "type": "SINGLE_CHOICE",
    "options": ["INDEPENDENT_RANDOM", "CORRELATED_00_11", "ALWAYS_00", "ALWAYS_11"]
  },
  "misconceptionMap": {
    "INDEPENDENT_RANDOM": "SUPERPOSITION_VS_ENTANGLEMENT",
    "ALWAYS_00": "MEASUREMENT_DETERMINISM",
    "ALWAYS_11": "MEASUREMENT_DETERMINISM"
  },
  "schemaVersion": 1
}
```

**Demo queries → indexes:**
- checkpoint by module → unique `{ moduleId: 1 }`

## Circuit Model  (collection: `circuit_models`)

| Field | Type | Notes |
|---|---|---|
| id | string | stable or generated |
| ownerLearnerProfileId | string? | null for starter circuit |
| name | string | ≤80 chars |
| qubitCount | integer | 2–5 |
| classicalBitCount | integer | 0–5 |
| operations | object[] | ordered, max 20 |
| source | `BUILDER \| SUPPORTED_QISKIT \| SEED` | provenance |
| openQasm3 | string? | derived export, not authoritative |
| modelVersion | number | `1` |
| createdAt, updatedAt | ISO string | |

**Operation shape:**
```json
{
  "opId": "op_2",
  "gate": "CNOT",
  "targets": [1],
  "controls": [0],
  "classicalTargets": [],
  "column": 1
}
```

**Example document:**
```json
{
  "id": "cm_bell_seed",
  "ownerLearnerProfileId": null,
  "name": "Bell State Seed",
  "qubitCount": 2,
  "classicalBitCount": 2,
  "operations": [
    {"opId": "op_1", "gate": "H", "targets": [0], "controls": [], "classicalTargets": [], "column": 0},
    {"opId": "op_2", "gate": "CNOT", "targets": [1], "controls": [0], "classicalTargets": [], "column": 1},
    {"opId": "op_3", "gate": "MEASURE", "targets": [0], "controls": [], "classicalTargets": [0], "column": 2},
    {"opId": "op_4", "gate": "MEASURE", "targets": [1], "controls": [], "classicalTargets": [1], "column": 2}
  ],
  "source": "SEED",
  "openQasm3": null,
  "modelVersion": 1,
  "createdAt": "2026-08-23T05:27:00Z",
  "updatedAt": "2026-08-23T05:27:00Z"
}
```

**Demo queries → indexes:**
- circuit by ID → unique `{ id: 1 }`
- saved learner circuits → `{ ownerLearnerProfileId: 1, updatedAt: -1 }`

**Embedded vs referenced:** operations embed because they are bounded and always executed/rendered with the circuit; derived OpenQASM is disposable.

## Simulation Run  (collection: `simulation_runs`)

| Field | Type | Notes |
|---|---|---|
| id | string | generated |
| learnerProfileId | string | indexed |
| moduleId | string | indexed |
| circuitModelId | string | points to immutable model snapshot ID |
| circuitSnapshot | object | canonical bounded Circuit Model snapshot for reproducibility |
| predictionResponse | object | checkpoint ID + structured answer |
| adapter | `QISKIT_AER \| PENNYLANE` | |
| shots | integer | 1–4096; demo default 1024 |
| status | `SUCCEEDED \| FAILED` | |
| probabilities | object | basis string → number, sum within epsilon |
| counts | object | basis string → integer |
| stateTrace | object[] | ordered by `stepIndex`; pre-measurement evidence |
| conformance | object? | secondary adapter comparison |
| durationMs | integer | non-negative |
| error | object? | contract error snapshot, no stack trace |
| schemaVersion | number | `1` |
| createdAt | ISO string | |

**State Trace step:**
```json
{
  "stepIndex": 1,
  "operationId": "op_2",
  "label": "After CNOT",
  "basisProbabilities": {"00": 0.5, "11": 0.5},
  "amplitudes": {
    "00": {"re": 0.70710678, "im": 0.0},
    "11": {"re": 0.70710678, "im": 0.0}
  },
  "reducedQubits": [
    {"qubit": 0, "bloch": {"x": 0.0, "y": 0.0, "z": 0.0}, "purity": 0.5, "label": "MIXED_SUBSYSTEM"},
    {"qubit": 1, "bloch": {"x": 0.0, "y": 0.0, "z": 0.0}, "purity": 0.5, "label": "MIXED_SUBSYSTEM"}
  ]
}
```

**Example document:**
```json
{
  "id": "sr_demo_001",
  "learnerProfileId": "lp_aarav",
  "moduleId": "mod_bell",
  "circuitModelId": "cm_bell_seed",
  "circuitSnapshot": {"id": "cm_bell_seed", "qubitCount": 2, "operations": ["omitted in example"]},
  "predictionResponse": {"checkpointId": "pc_bell_outcomes", "answer": "INDEPENDENT_RANDOM"},
  "adapter": "QISKIT_AER",
  "shots": 1024,
  "status": "SUCCEEDED",
  "probabilities": {"00": 0.5, "11": 0.5},
  "counts": {"00": 512, "11": 512},
  "stateTrace": [{"stepIndex": 0, "operationId": "op_1", "label": "After H", "basisProbabilities": {"00": 0.5, "10": 0.5}}],
  "conformance": {"adapter": "PENNYLANE", "maxProbabilityDelta": 0.0, "epsilon": 0.000001, "passed": true},
  "durationMs": 84,
  "error": null,
  "schemaVersion": 1,
  "createdAt": "2026-08-23T05:27:00Z"
}
```

**Demo queries → indexes:**
- get run by ID → unique `{ id: 1 }`
- learner run history → `{ learnerProfileId: 1, createdAt: -1 }`
- module analytics → `{ moduleId: 1, createdAt: -1 }`

**Embedded vs referenced:** bounded circuit snapshot and State Trace embed for reproducibility and one-read replay; learner/module records are referenced.

## Misconception Signal  (collection: `misconception_signals`)

| Field | Type | Notes |
|---|---|---|
| id | string | generated |
| learnerProfileId | string | indexed |
| simulationRunId | string | unique for prototype diagnosis |
| code | `SUPERPOSITION_VS_ENTANGLEMENT \| MEASUREMENT_DETERMINISM \| GATE_ORDER \| NO_SIGNAL` | closed taxonomy |
| firstDivergenceStep | integer? | null for `NO_SIGNAL` |
| evidence | object | checkpoint answer + verified expected behavior + trace refs |
| confidence | number | deterministic rule score 0–1; not LLM confidence |
| repairChallengeId | string? | |
| schemaVersion | number | `1` |
| createdAt | ISO string | |

**Example document:**
```json
{
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
  "schemaVersion": 1,
  "createdAt": "2026-08-23T05:27:01Z"
}
```

**Demo queries → indexes:**
- diagnosis by run → unique `{ simulationRunId: 1 }`
- common cohort misconceptions via learner join keys → `{ learnerProfileId: 1, code: 1, createdAt: -1 }`

## Challenge  (collection: `challenges`)

| Field | Type | Notes |
|---|---|---|
| id | string | stable |
| moduleId | string | indexed |
| type | `QUIZ \| CIRCUIT_REPAIR` | |
| title | string | |
| prompt | string | vetted |
| starterCircuitModelId | string? | |
| acceptanceRule | object | versioned deterministic rule |
| targetsMisconceptionCodes | string[] | |
| points | integer | non-negative |
| schemaVersion | number | `1` |

**Example document:**
```json
{
  "id": "ch_bell_repair",
  "moduleId": "mod_bell",
  "type": "CIRCUIT_REPAIR",
  "title": "Restore Bell Correlation",
  "prompt": "Repair the circuit so only 00 and 11 have non-zero ideal probability.",
  "starterCircuitModelId": "cm_bell_broken",
  "acceptanceRule": {"version": 1, "kind": "PROBABILITY_SUPPORT_EQUALS", "states": ["00", "11"], "epsilon": 0.000001},
  "targetsMisconceptionCodes": ["SUPERPOSITION_VS_ENTANGLEMENT", "GATE_ORDER"],
  "points": 100,
  "schemaVersion": 1
}
```

**Demo queries → indexes:**
- challenges by module → `{ moduleId: 1, type: 1 }`

## Challenge Attempt  (collection: `challenge_attempts`)

| Field | Type | Notes |
|---|---|---|
| id | string | generated |
| challengeId | string | indexed |
| learnerProfileId | string | indexed |
| simulationRunId | string? | evidence used for deterministic grading |
| submittedAnswer | object | structured; circuit attempts reference Circuit Model ID |
| passed | boolean | deterministic |
| score | integer | 0–points |
| feedbackCode | string | display maps to vetted copy |
| attemptNumber | integer | ≥1 |
| schemaVersion | number | `1` |
| createdAt | ISO string | |

**Example document:**
```json
{
  "id": "ca_demo_001",
  "challengeId": "ch_bell_repair",
  "learnerProfileId": "lp_aarav",
  "simulationRunId": "sr_demo_002",
  "submittedAnswer": {"circuitModelId": "cm_aarav_repaired"},
  "passed": true,
  "score": 100,
  "feedbackCode": "BELL_SUPPORT_CORRECT",
  "attemptNumber": 1,
  "schemaVersion": 1,
  "createdAt": "2026-08-23T05:28:00Z"
}
```

**Demo queries → indexes:**
- learner attempts timeline → `{ learnerProfileId: 1, createdAt: -1 }`
- challenge outcomes → `{ challengeId: 1, passed: 1 }`
- enforce attempt ordering → unique `{ learnerProfileId: 1, challengeId: 1, attemptNumber: 1 }`

## Progress Record  (collection: `progress_records`)

| Field | Type | Notes |
|---|---|---|
| id | string | `progress_<learnerId>` |
| learnerProfileId | string | unique |
| completedModuleIds | string[] | bounded prototype list |
| skillStates | object[] | `{ skillId, status, score }` |
| latestChallengeAttemptId | string? | |
| misconceptionSummary | object[] | code + count + latestAt; no chat text |
| totalPoints | integer | |
| schemaVersion | number | `1` |
| updatedAt | ISO string | |

**Example document:**
```json
{
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
  "schemaVersion": 1,
  "updatedAt": "2026-08-23T05:28:00Z"
}
```

**Demo queries → indexes:**
- progress by learner → unique `{ learnerProfileId: 1 }`

**Embedded vs referenced:** bounded Skill and misconception summaries embed for the dashboard; source attempts and signals remain referenced.

## Instructor Insight  (materialized response; no collection in P0)

Instructor Insight is computed from Learner Profiles, Progress Records, Challenge Attempts and Misconception Signals. P0 does not persist a second analytics truth.

**Response shape:**
```json
{
  "cohortId": "cohort_demo_2026",
  "generatedAt": "2026-08-23T05:28:01Z",
  "learnerCount": 30,
  "moduleCompletion": [{"moduleId": "mod_bell", "completed": 18, "assigned": 30}],
  "challengePassRate": [{"challengeId": "ch_bell_repair", "passed": 17, "attempted": 24, "rate": 0.7083}],
  "topMisconceptions": [{"code": "SUPERPOSITION_VS_ENTANGLEMENT", "learnerCount": 11, "occurrences": 15}],
  "liveDemoLearner": {"learnerProfileId": "lp_aarav", "latestAttemptPassed": true}
}
```

**Demo queries → indexes:** existing cohort/profile, attempt and signal indexes above serve the aggregation. Cache in process for 10 seconds if needed; no new collection.

## Seed plan (`apps/api/scripts/seed.py`)

- **Hero records:** Aarav, Meera, Dr. Rao demo session; three Modules; Bell Prediction Checkpoint; seeded Bell Circuit Model; one broken repair circuit; one quiz; one repair Challenge.
- **Cohort volume:** 30 disclosed synthetic Learner Profiles, 60–90 Challenge Attempts, and 35–50 Misconception Signals so aggregate charts look real without claiming production data.
- **Edge rows:** untouched beginner, perfect learner, repeated misconception, failed Simulation Run, empty cohort, long display name, unsupported-gate Circuit Model rejected during seed validation.
- **Idempotency:** upsert stable IDs; delete only records with `seedNamespace: "qtrace-demo-v1"`; rerun yields the same dashboard story.
- **Indexes:** created idempotently during seed.
- **Local fallback:** the same seed objects load into the in-memory repository; no separate mock schema.

## Change ritual

Schema change = contract change: update this file, bump affected contract version, write a three-line DECISIONS entry, reseed, and ping every consumer before code changes. Freeze schema after P1 integration; defend it afterward.
