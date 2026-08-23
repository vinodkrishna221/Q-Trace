# Decisions — Q-Trace

> ADR-lite: irreversible choices, contract/schema changes, pivots and Direction Checks.

### 1 · Broad platform plus one innovation                 23 Aug 2026 · by Vinod + team
CHOSE: Cover the official platform categories in one thin integrated prototype; use Quantum Flight Recorder as the single innovative differentiator.
BECAUSE: A single-feature product undercovers the SIH statement, while an undifferentiated feature bundle duplicates existing platforms.
AFFECTS: learning-ux, circuit-fe, simulation-be, ai-pedagogy, data-analytics, story-ship.

### 2 · Three user roles, one protagonist                  23 Aug 2026 · by Vinod + team
CHOSE: Aarav is the primary beginner demo learner; Meera is the theory-to-code learner; Dr. Rao is the instructor/operator.
BECAUSE: All three requested audiences must appear without fragmenting the live story.
AFFECTS: demo narrative, Learner Profile, Learning Path, Progress Record, Instructor Insight.

### 3 · Learner-led core loop and demo                     23 Aug 2026 · by Vinod + team
CHOSE: Assign → learn/predict → visual/code build → simulate → inspect → diagnose → repair → track, with instructor analytics as a brief closing proof.
BECAUSE: Judges need to see the learning transformation, not a dashboard tour.
AFFECTS: PRD demo beats, Flight Recorder, Tutor, assessment, PPT.

### 4 · FULL scale gate                                    23 Aug 2026 · by Vinod
CHOSE: FULL planning and project structure for the six-member team.
BECAUSE: The prototype and PPT must credibly represent the breadth of the official problem statement.
AFFECTS: /blueprint, per-track /phase-plan, /missions; P0 remains a thin end-to-end skeleton.

### 5 · No extra mandated technology                       23 Aug 2026 · by Vinod
CHOSE: Select the implementation stack at /blueprint; no provider, API, language or submission technology is currently mandatory.
BECAUSE: The college/SIH coordinator has supplied no constraints beyond the problem statement.
AFFECTS: fit-audit, architecture and deploy decisions.

### 6 · Conservative calendar until exact time             23 Aug 2026 · by Orion
CHOSE: Skeleton 25 Aug 09:00; risky-feature freeze 27 Aug 18:00; feature freeze 28 Aug 09:00; merge/deploy/PPT readiness 28 Aug 18:00 IST.
BECAUSE: The internal date is 29 Aug but its exact time is unknown; inventing a presentation time would produce unsafe gates.
AFFECTS: STATUS, build plan and ship mission; recompute when the organizer confirms the time.

### 7 · Application stack and fit-audit packs               23 Aug 2026 · by Vinod + team
CHOSE: Next.js quantum workspace + FastAPI quantum modular monolith + MongoDB repository/fallback; add quantum-ui.md and quantum-runtime.md and index both in AGENTS.md.
BECAUSE: The platform needs a rich learner UI and Python-native quantum runtime, while generic stack law does not cover circuit-model synchronization or numerical-correctness traps.
AFFECTS: frontend, simulation, AI-pedagogy, QA, contracts and every subsequent phase-plan; sync completed and kit freeze re-engaged.

### 8 · Blueprint freeze and phase-plan authorization        23 Aug 2026 · by Vinod
CHOSE: Approve the Q-Trace architecture, schema, four contracts, fit-audit and BUILD-PLAN; authorize six FULL track plans.
BECAUSE: Warden returned MERGE and automated checks passed 17/17 MUST mapping, 34 JSON examples, contract completeness and synced pack integrity.
AFFECTS: blueprint files are frozen; 50 phase cards later passed human review before missions or implementation.

### 9 · Phase-plan freeze and sixth member                  23 Aug 2026 · by Vinod
CHOSE: Approve all six plans and the P0 DAG; record Akshaya as the sixth member with provisional fixtures-qa/story support.
BECAUSE: Warden returned MERGE on the 50-card acyclic plan, and P0 remains viable while Akshaya’s strengths and hours are confirmed.
AFFECTS: plans are frozen; Rani=data, Rajeswari=AI pedagogy and Akshaya=fixtures/QA are confirmed; later mission inputs resolved.

### 10 · Mission capacity, channels and stage roles          23 Aug 2026 · by Vinod
CHOSE: Declare 48 usable hours per member; use Discord as canonical record and WhatsApp for urgent pings; Venu operates/narrates learner-flow beats while all six share the pitch and Vinod owns opening/architecture/Q&A.
BECAUSE: 48h gives a 33.6h card cap, so every 16–20h track passes the 70% law with substantial integration buffer.
AFFECTS: `/missions` prerequisites pass; every brief receives a domain speaking beat and must use Discord acceptance/status protocol.
