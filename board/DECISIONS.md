# Decisions â€” Q-Trace

> ADR-lite: irreversible choices, contract/schema changes, pivots and Direction Checks.

### 1 Â· Broad platform plus one innovation                 23 Aug 2026 Â· by Vinod + team
CHOSE: Cover the official platform categories in one thin integrated prototype; use Quantum Flight Recorder as the single innovative differentiator.
BECAUSE: A single-feature product undercovers the SIH statement, while an undifferentiated feature bundle duplicates existing platforms.
AFFECTS: learning-ux, circuit-fe, simulation-be, ai-pedagogy, data-analytics, story-ship.

### 2 Â· Three user roles, one protagonist                  23 Aug 2026 Â· by Vinod + team
CHOSE: Aarav is the primary beginner demo learner; Meera is the theory-to-code learner; Dr. Rao is the instructor/operator.
BECAUSE: All three requested audiences must appear without fragmenting the live story.
AFFECTS: demo narrative, Learner Profile, Learning Path, Progress Record, Instructor Insight.

### 3 Â· Learner-led core loop and demo                     23 Aug 2026 Â· by Vinod + team
CHOSE: Assign â†’ learn/predict â†’ visual/code build â†’ simulate â†’ inspect â†’ diagnose â†’ repair â†’ track, with instructor analytics as a brief closing proof.
BECAUSE: Judges need to see the learning transformation, not a dashboard tour.
AFFECTS: PRD demo beats, Flight Recorder, Tutor, assessment, PPT.

### 4 Â· FULL scale gate                                    23 Aug 2026 Â· by Vinod
CHOSE: FULL planning and project structure for the six-member team.
BECAUSE: The prototype and PPT must credibly represent the breadth of the official problem statement.
AFFECTS: /blueprint, per-track /phase-plan, /missions; P0 remains a thin end-to-end skeleton.

### 5 Â· No extra mandated technology                       23 Aug 2026 Â· by Vinod
CHOSE: Select the implementation stack at /blueprint; no provider, API, language or submission technology is currently mandatory.
BECAUSE: The college/SIH coordinator has supplied no constraints beyond the problem statement.
AFFECTS: fit-audit, architecture and deploy decisions.

### 6 Â· Conservative calendar until exact time             23 Aug 2026 Â· by Orion
CHOSE: Skeleton 25 Aug 09:00; risky-feature freeze 27 Aug 18:00; feature freeze 28 Aug 09:00; merge/deploy/PPT readiness 28 Aug 18:00 IST.
BECAUSE: The internal date is 29 Aug but its exact time is unknown; inventing a presentation time would produce unsafe gates.
AFFECTS: STATUS, build plan and ship mission; recompute when the organizer confirms the time.

### 7 Â· Application stack and fit-audit packs               23 Aug 2026 Â· by Vinod + team
CHOSE: Next.js quantum workspace + FastAPI quantum modular monolith + MongoDB repository/fallback; add quantum-ui.md and quantum-runtime.md and index both in AGENTS.md.
BECAUSE: The platform needs a rich learner UI and Python-native quantum runtime, while generic stack law does not cover circuit-model synchronization or numerical-correctness traps.
AFFECTS: frontend, simulation, AI-pedagogy, QA, contracts and every subsequent phase-plan; sync completed and kit freeze re-engaged.

### 8 Â· Blueprint freeze and phase-plan authorization        23 Aug 2026 Â· by Vinod
CHOSE: Approve the Q-Trace architecture, schema, four contracts, fit-audit and BUILD-PLAN; authorize six FULL track plans.
BECAUSE: Warden returned MERGE and automated checks passed 17/17 MUST mapping, 34 JSON examples, contract completeness and synced pack integrity.
AFFECTS: blueprint files are frozen; 50 phase cards later passed human review before missions or implementation.

### 9 Â· Phase-plan freeze and sixth member                  23 Aug 2026 Â· by Vinod
CHOSE: Approve all six plans and the P0 DAG; record Akshaya as the sixth member with provisional fixtures-qa/story support.
BECAUSE: Warden returned MERGE on the 50-card acyclic plan, and P0 remains viable while Akshayaâ€™s strengths and hours are confirmed.
AFFECTS: plans are frozen; Rani=data, Rajeswari=AI pedagogy and Akshaya=fixtures/QA are confirmed; later mission inputs resolved.

### 10 Â· Mission capacity, channels and stage roles          23 Aug 2026 Â· by Vinod
CHOSE: Declare 48 usable hours per member; use Discord as canonical record and WhatsApp for urgent pings; Venu operates/narrates learner-flow beats while all six share the pitch and Vinod owns opening/architecture/Q&A.
BECAUSE: 48h gives a 33.6h card cap, so every 16â€“20h track passes the 70% law with substantial integration buffer.
AFFECTS: `/missions` prerequisites pass; every brief receives a domain speaking beat and must use Discord acceptance/status protocol.

### 11 Â· Shared repository bridge for InMemorySimRunRepo     8 Sep 2026 Â· by Vinod + Lead Engineer
CHOSE: Connect InMemorySimRunRepo to DataRepositoryProtocol via an async execution helper (_run_async) passing typed SimulationRun with predictionResponse.
BECAUSE: DEMO_LOCAL=1 requires learner-loop parity across simulation and diagnosis without violating encapsulation through private attribute access.
AFFECTS: apps/api/app/repositories/sim_run_repository.py, apps/api/app/routers/simulation_runs.py, QA-3 smoke runner, and cross-track contract integrity.

### 12 Â· Learn Page Stepper & Algorithm Sidebar Layout           10 Sep 2026 Â· by Vinod
CHOSE: Redesign `/learn` into a sequential step-by-step learning progression with an interactive stepper and a dedicated left-rail algorithm navigator containing Bell Correlation (Hero Lab) and a 6-algorithm future roadmap.
BECAUSE: Learners need progressive mental-model construction (superposition â†’ measurement â†’ entanglement) without cognitive overload, and future algorithm placeholders clarify platform trajectory.
AFFECTS: apps/web/app/(app)/learn/page.tsx, apps/web/features/learning/learn-sidebar.tsx, learn-layout.test.tsx.

### 13 Â· Near-Future Bridge Challenge & In-Situ Repair Workspace   14 Sep 2026 Â· by Vinod + team
CHOSE: Add near-future bridge challenge ch_bell_psi_plus (|Î¨+âŸ© preparation for Stage 2 Teleportation) with in-situ circuit workspace in Step 6; bound diagnosis and fallback tutor to verified trace length.
BECAUSE: Solves Step 2 / Step 6 circuit redundancy, eliminates false-positive prediction bypass, and prevents HTTP 422 errors when broken circuits are simulated.
AFFECTS: board/contracts/progress-analytics.md (v2), apps/api (diagnosis, tutor, seeds, progress), apps/web (in-situ workspace, repair challenge, learn page).

### 14 Â· Linear-Grade Design System, Dual Themes & Presentation Layer Sanitization   24 Sep 2026 Â· by Vinod + team
CHOSE: Complete design overhaul to Linear.app aesthetic standard: porcelain light mode and carbon dark mode defaulting to system preference (`next-themes`), hairline translucent borders, Inter typography scale, removal of harsh 48px grid and neon cyan glows, 3-Stage Studio workflow for `/lab`, single-column progressive stepper for `/learn/[slug]`, and strict UI sanitization purging developer request IDs (`req_...`), contract IDs (`ch_...`), and raw enums from user-facing cards.
BECAUSE: Judges' feedback highlighted acute cognitive overload and unstyled developer telemetry that degraded the product's perceived maturity; the new architecture delivers world-class craftsmanship and progressive disclosure without breaking underlying backend schemas.
AFFECTS: docs/DESIGN-SYSTEM.md, .agents/rules/stack/quantum-ui.md, board/contracts/*.md, apps/web/app/globals.css, apps/web/components/layout/app-header.tsx, apps/web/features/circuit/, apps/web/features/learning/, apps/web/features/flight-recorder/.




### 15 · Floating Pill Navbar and Simplified Header Design       26 Sep 2026 · by Vinod + team
CHOSE: Update the app header to a sticky, floating pill design that triggers on scroll, center the navigation items, remove the "FLIGHT RECORDER" sub-brand text, and permanently remove the light/dark mode toggle (locking to light mode).
BECAUSE: The header felt cluttered and occupied too much vertical space; a scroll-triggered pill layout reduces cognitive load, creates a more modern spatial aesthetic, and aligns with the decision to standardize strictly on the light-mode theme for consistency.
AFFECTS: apps/web/components/layout/app-header.tsx, .agents/rules/stack/quantum-ui.md.

### 16 · Production Authentication & Individual Onboarding Streamlining   27 Sep 2026 · by Vinod + team
CHOSE: Implement full identity & authentication architecture (Argon2id hashing, PyJWT in HttpOnly SameSite cookies, CSRF protection, brute-force lockout, TOTP 2FA, GitHub OAuth, soft email verification, and institutional early-access modal); streamline individual signup by removing the demo persona switcher and synthetic header role-switcher pill, defaulting new signups to 'LEARNER', and standardizing on 'alex@gmail.com' placeholders.
BECAUSE: Replaces mock demo personas with a zero-trust production security perimeter; removing the synthetic header role switcher and extraneous persona questions delivers a frictionless, individual-focused onboarding flow without breaking institutional gateway routing.
AFFECTS: docs/AUTH-SYSTEM-DESIGN.md, board/contracts/auth-identity.md, apps/api (auth core, models, routes, tests), apps/web (auth pages, store, client, header, waitlist modal, unit tests).


### 17 � Brand Identity Logo & Interactive Atomic Cursor � 27 Sep 2026 � by Vinod + team
CHOSE: Implement Option A ("The Quantum Statevector Trace") as the primary brand logo across all layouts, headers, footers, favicons, and hero displays; introduce an interactive tri-orbital Atomic Custom Cursor (nucleus + 3 revolving electrons) with reactive micro-animations (excited state dilation on hover, wavefunction measurement collapse on click, collimation on inputs, and an ergonomic toggle in the footer).
BECAUSE: Replaced placeholder stroked circle glyphs with a mathematically grounded brand mark (superposition Q + Dirac ket facet + flight recorder telemetry descender); the custom atomic cursor provides high-precision tactile feedback during quantum circuit manipulation with zero latency and full touchscreen/accessibility fallbacks.
AFFECTS: docs/DESIGN-LOGO-AND-ATOMIC-CURSOR.md, docs/preview-logo-cursor.html, apps/web/components/ui/q-trace-logo.tsx, apps/web/components/ui/atomic-cursor.tsx, apps/web/components/ui/cursor-toggle.tsx, apps/web/app/globals.css, apps/web/app/layout.tsx, apps/web/components/layout/app-header.tsx, apps/web/components/layout/app-shell.tsx, apps/web/app/page.tsx, apps/web/app/verify-email/page.tsx, apps/web/app/icon.svg, apps/web/tests/unit/logo-and-cursor.test.tsx.

### 18 � Interactive 3D Bell State & Measurement Simulations � 27 Sep 2026 � by Vinod + team
CHOSE: Build a React Three Fiber `BellStateSimulation` showing dual Bloch spheres shrinking to the center upon entanglement (purity loss), plus a live `MeasurementSimulation` histogram showing the Born rule convergence over 1024 shots.
BECAUSE: The curriculum demands visual evidence of wavefunction collapse and entanglement subsystem correlation; static circuit diagrams and textbook formulas failed to impart this intuition before the learner hit the prediction checkpoint.
AFFECTS: apps/web/features/learning/components/, apps/web/app/(app)/learn/, apps/web/lib/fixtures.ts, apps/web/lib/contracts/learning-content.ts.

