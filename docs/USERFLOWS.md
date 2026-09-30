# 🔄 Q-Trace User Flow Diagrams

> **Project:** Q-Trace — Quantum Flight Recorder & Learning Platform  
> **Problem Statement:** SIH26140 — AI-Based Interactive Quantum Algorithm Learning Platform  
> **Format:** Mermaid Markdown Specification

---

## 1. Core Learner Journey: "Predict → Simulate → Inspect → Repair"

```mermaid
flowchart TD
  START([Learner Enters Q-Trace Platform]) --> SELECT_PATH[Select Unit on Gamified Learning Path]
  SELECT_PATH --> VIEW_CHALLENGE[Read Quantum Challenge Objective e.g. Bell State Creation]

  VIEW_CHALLENGE --> PREDICT_MODAL{Prediction Checkpoint}
  PREDICT_MODAL -->|Learner Declares Hypothesis| RECORD_PRED[Record Intuition: e.g. Independent 50/50 Outcomes]

  RECORD_PRED --> BUILD_CIRCUIT[Construct Quantum Circuit in Workspace]
  BUILD_CIRCUIT -->|Drag and Drop Gates or Type Code| LIVE_LINT{Live Invariant Linter}

  LIVE_LINT -->|QI-1 Post-Collapse Violation| LINT_ERR[Show Warning: Gate placed after measurement wire]
  LINT_ERR --> BUILD_CIRCUIT
  LIVE_LINT -->|Valid Quantum Invariants| RUN_SIM[Click 'Simulate & Flight Record']

  RUN_SIM --> AST_CHECK{AST Security Sandbox}
  AST_CHECK -->|Disallowed Syntax| REJECT_CODE[Display Security Rejection Notice]
  REJECT_CODE --> BUILD_CIRCUIT

  AST_CHECK -->|Allowlisted Python/Circuit| EXEC_SIM[FastAPI executes Qiskit Aer / PennyLane]
  EXEC_SIM --> INSPECT_EVID[Inspect Visual Evidence: Histogram, Phase Discs, Q-Sphere]

  INSPECT_EVID --> SCRUB_TRACE[Scrub State Trace Step-by-Step with Flight Recorder]
  SCRUB_TRACE --> COMPARE_PRED{Causal Flight Recorder Evaluation}

  COMPARE_PRED -->|Simulation Matches Prediction| SUCCESS_BRANCH[Learner Demonstrated Accurate Intuition]
  SUCCESS_BRANCH --> AWARD_BADGE[Award Algorithmic Mastery Badge & Increment Streak]
  AWARD_BADGE --> NEXT_NODE([Unlock Next ChamberNode in Learning Path])

  COMPARE_PRED -->|Conceptual Divergence Detected| DIAGNOSE_MISCON[Identify Misconception Signal e.g. SUPERPOSITION_VS_ENTANGLEMENT]
  DIAGNOSE_MISCON --> SOCRATIC_TUTOR[Evidence-Bound Socratic AI Tutor Opens]
  SOCRATIC_TUTOR --> COUNTER_EXAMPLE[Generate Minimal Socratic Counterexample Circuit]
  COUNTER_EXAMPLE --> REPAIR_CHALLENGE[Learner Accepts Targeted Repair Challenge]
  REPAIR_CHALLENGE --> FIX_CIRCUIT[Apply Correction: Add CNOT Gate to entangle Q0 and Q1]
  FIX_CIRCUIT --> RE_EVALUATE{Automated Linear Algebra Grader}

  RE_EVALUATE -->|Still Incomplete| HINT_LOOP[Provide Guided Socratic Hint based on Trace State]
  HINT_LOOP --> REPAIR_CHALLENGE

  RE_EVALUATE -->|Challenge Solved| UPDATE_PROGRESS[Update Progress Record & Resolve Misconception]
  UPDATE_PROGRESS --> NOTIFY_INSTRUCTOR[Sync to Cohort Topology: Misconception Resolved]
  NOTIFY_INSTRUCTOR --> NEXT_NODE
```

---

## 2. Instructor & Institutional Feedback Loop

```mermaid
sequenceDiagram
  autonumber
  actor Learner as Student (Aarav)
  participant UI as Q-Trace Learner Shell
  participant API as FastAPI Backend & Engine
  participant DB as MongoDB Atlas / Telemetry
  actor Faculty as Instructor (Dr. Rao)
  participant Dash as Instructor Failure Topology Dashboard

  Note over Learner, UI: Learner attempts Bell State Module
  Learner->>UI: Enters incorrect Prediction (Independent Random)
  Learner->>UI: Simulates circuit without CNOT entangling gate
  UI->>API: POST /v1/flight-recorder/diagnose
  API->>API: Detects SUPERPOSITION_VS_ENTANGLEMENT
  API->>DB: Log Misconception Signal + Student Attempt

  Note over Faculty, Dash: Instructor reviews live class telemetry
  Faculty->>Dash: Opens Cohort Analytics for "Quantum Foundations A"
  Dash->>API: GET /v1/instructor-insights/demo-cohort
  API->>DB: Query aggregated misconception heatmaps
  DB-->>API: Return cohort clusters: 64% confused on Entanglement
  API-->>Dash: Render Failure Topology Heatmap

  Note over Faculty, Dash: 1-Click Remedial Intervention
  Faculty->>Dash: Reviews identified misconception cluster
  Faculty->>Dash: Clicks "Dispatch 1-Click Remedial Repair Lab"
  Dash->>API: POST /v1/instructor/dispatch-remedy
  API->>DB: Push Targeted Entanglement Repair Challenge to cohort

  Note over Learner, UI: Student receives real-time guided lab
  API-->>UI: Real-time notification: "New Remedial Lab Dispatched by Dr. Rao"
  Learner->>UI: Completes Socratic Repair Lab
  UI->>API: POST /v1/challenge-attempts
  API->>DB: Update Learner Progress & Clear Misconception Flag
  DB-->>Dash: Cohort Entanglement Mastery increases from 36% to 92%
  Faculty->>Dash: Observes validated learning outcome improvement
```

---

## 3. National Credentialing & DigiLocker Issuance User Flow

```mermaid
flowchart LR
  STUDENT([Student]) --> COMPLETE_TRACK[Complete Modules 1 to 4 on Q-Trace]
  COMPLETE_TRACK --> CAPSTONE_ASSESS[Take Proctored Quantum Flight Recorder Capstone Assessment]
  CAPSTONE_ASSESS --> AUTO_EVAL{Linear Algebra & Invariant Grader}

  AUTO_EVAL -->|Score < 80%| TARGET_REPAIR[Provide Automated Remedial Module]
  TARGET_REPAIR --> CAPSTONE_ASSESS

  AUTO_EVAL -->|Score >= 80%| PASS_AUDIT[Generate Cryptographically Signed Competency Record]
  PASS_AUDIT --> SHA_HASH[Generate SHA-256 Tamper-Evident Digest of Solution Artifacts]
  SHA_HASH --> NAD_API[Sync to National Academic Depository NAD API]
  NAD_API --> DIGILOCKER[Issue Verifiable Micro-Credential to Student DigiLocker Account]
  DIGILOCKER --> RECRUITER([Deep-Tech Employer / NQM Research Lab Verifies Credential])
```
