# Warden Review — UX-8 · Add supported circuit sharing and export

**Branch:** `feat/learning-ux/ux-8-add-supported-circuit-sharing-and`  
**Reviewer:** Warden (fresh session) · **Date:** 2026-08-27T17:35 IST  
**Author:** Venu Gopal · **Card load:** 2h / timebox 2h  
**Bar applied:** standard (Phase 2 Integration, circuit sharing & export)

---

## Checks

| # | Check | Result |
|---|---|---|
| 1 | **Card match** — all deliverables present (OpenQASM 3.0 download, Circuit Model JSON copy/import for supported subset, CircuitSharePanel with explicit local artifact sharing disclosure) | PASS |
| 2 | **Contract fidelity** — OpenQASM 3.0 format and CircuitModel types match `circuit-simulation.md` (v1) and `docs/SCHEMA.md` 1:1 | PASS |
| 3 | **Proof** — TEST command independently executed; 13/13 circuit-share unit tests passed, 53/53 web suite passed, Next.js build passed (11/11 static routes) | PASS |
| 4 | **Ponytail audit** — clean, concise native browser blob/clipboard utilities; no heavy external graph/multiplayer dependencies | PASS |
| 5 | **Demo-path safety** — client-side local export and import functional 100% offline without requiring network or backend execution; fallback integrated in `apiClient.exportOpenQasm3` | PASS |
| 6 | **File ownership** — strictly within `apps/web/**` and tracking doc status lines; zero cross-track edits | PASS |
| 7 | **Hygiene** — no secrets, no console noise on hot paths, clean TypeScript types, strict lint/typecheck passes | PASS |
| 8 | **quantum-ui / runtime rules** — Circuit Model is single editable truth, prototype limits (1-5 qubits, <=20 operations, supported gate enum) strictly enforced, safe rejection without model mutation | PASS |

---

## TEST result (Warden-executed)

### Circuit Share Unit Tests
```bash
pnpm --dir apps/web test tests/unit/circuit-share.test.tsx
```

```text
 RUN  v2.1.9 C:/Users/12ven/Downloads/q-trace/apps/web

 ✓ tests/unit/circuit-share.test.tsx (13 tests) 149ms
   ✓ OpenQASM 3.0 Generation > generates standard-compliant OpenQASM 3.0 code for Bell State seed
   ✓ OpenQASM 3.0 Generation > generates OpenQASM for all supported gates (H, X, Y, Z, CNOT, MEASURE)
   ✓ Circuit Model JSON Export & Reimport Round-trip > exports the Bell model, reimports it and obtains a byte-for-byte equivalent normalized Circuit Model
   ✓ Circuit Model JSON Export & Reimport Round-trip > handles pretty-printed JSON export and round-trip reimport correctly
   ✓ Validation, Safety & Error Handling > rejects empty or invalid JSON string
   ✓ Validation, Safety & Error Handling > rejects unsupported gate (RX) without mutating the circuit
   ✓ Validation, Safety & Error Handling > rejects qubit count exceeding prototype limits (>5 qubits or <1 qubit)
   ✓ Validation, Safety & Error Handling > rejects unsupported model version (modelVersion !== 1)
   ✓ Validation, Safety & Error Handling > rejects CNOT with matching control and target qubit
   ✓ Interactive Share Panel Component UI > renders the share panel with local artifact sharing disclosure and export previews
   ✓ Interactive Share Panel Component UI > allows importing a circuit via the Import tab and updates workspace state
   ✓ Interactive Share Panel Component UI > shows validation error banner when invalid JSON or unsupported gate is imported
   ✓ Integration with InteractiveCircuitWorkspace > toggles the Share & Export panel when the header action button is clicked

 Test Files  1 passed (1)
      Tests  13 passed (13)
   Duration  2.03s
```

### Full Web Test Suite
```bash
pnpm --dir apps/web test
```

```text
 Test Files  8 passed (8)
      Tests  53 passed (53)
   Duration  4.34s
```

### Next.js Production Build
```bash
pnpm --dir apps/web build
```

```text
   ▲ Next.js 15.5.23
   Creating an optimized production build ...
 ✓ Compiled successfully in 1608ms
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (11/11)
   Finalizing page optimization ...

Route (app)                                 Size  First Load JS
┌ ○ /                                    2.79 kB         112 kB
├ ○ /_not-found                            993 B         103 kB
├ ○ /instructor                          8.01 kB         133 kB
├ ○ /lab                                 2.86 kB         142 kB
├ ○ /learn                               4.23 kB         121 kB
├ ○ /learn/bell-state                      18 kB         234 kB
├ ○ /learn/measurement                   1.67 kB         198 kB
├ ○ /learn/superposition                 1.74 kB         198 kB
└ ○ /progress                            3.81 kB         133 kB
+ First Load JS shared by all             102 kB

○  (Static)  prerendered as static content
```

---

## Detail notes

- **OpenQASM 3.0 Exporter (`apps/web/features/circuit/circuit-qasm-exporter.ts`):**
  - Generates standard OpenQASM 3.0 syntax targeting `stdgates.inc` (`h`, `x`, `y`, `z`, `cx`, `measure`).
  - Implements browser download trigger `downloadTextFile` with automatic blob URL creation and revocation.

- **Circuit Model Serialization & Validation (`apps/web/features/circuit/circuit-serializer.ts`):**
  - `normalizeCircuitModel`: Produces deterministic property ordering and sorted gate indices.
  - `importCircuitModelJson`: Validates against prototype boundaries ($1 \le \text{qubits} \le 5$, $\le 20$ operations, `modelVersion === 1`, control/target mismatch rejection) before updating application state.
  - Round-trip byte-for-byte stringified and object equality test verified.

- **Circuit Share Panel Component (`apps/web/features/circuit/circuit-share-panel.tsx`):**
  - Clean 3-tab interface (`Export & Share`, `Import Artifact`, `Standards & Info`).
  - Prominently labeled with `LOCAL ARTIFACT SHARING` badge and explicit privacy/offline notices.
  - Integrated into `InteractiveCircuitWorkspace` via a `Share & Export` toggle.

- **Scope & Boundaries:**
  - Zero cross-track edits: no changes to `apps/api/**` or shared contracts in `board/contracts/`.
  - Zero roadmap creep or ungrounded multiplayer claims.

---

## Verdict

VERDICT: MERGE
✅ OpenQASM 3.0 generation and Circuit Model JSON round-trip verified byte-for-byte; all 13 circuit-share unit tests and 53/53 web suite pass; Next.js static build passes (11/11 routes); strict prototype boundary validation prevents invalid state mutation; artifact sharing scope is honestly disclosed without unbacked cloud/multiplayer claims.

BAR: standard

Do not merge the PR yourself. Hand off to Vinod (SHIP lead) to merge in DAG order.
Unblocks: UX-9.
