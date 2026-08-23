# Q-Trace Phase Plan Index

> Human-approved and frozen. `/missions` load gate passes at 48h declared per member; no implementation starts from this index alone.

## Track ledger

| Track | Cards | Hours | Ceiling | Owner |
|---|---:|---:|---:|---|
| learning-ux | 9 | 20h | 20h | Venu Gopal |
| simulation-api | 9 | 20h | 20h | Uday Rohit |
| ai-pedagogy | 8 | 18h | 18h | Rajeswari |
| data-analytics | 8 | 18h | 18h | Rani |
| fixtures-qa | 8 | 16h | 16h | Akshaya |
| story-ship | 8 | 16h | 16h | Vinod Krishna (lead) |

**Total:** 50 cards · 108 card-hours.
**Load gate:** every member declared 48h; every mission is ≤20h and below the 33.6h cap.

## Global DAG

```mermaid
flowchart LR
  SHIP1[SHIP-1 repo scaffold] --> UX1[UX-1 web shell]
  SHIP1 --> SIM1[SIM-1 API shell]
  SHIP1 --> DATA1[DATA-1 repository protocol]
  SHIP1 --> QA1[QA-1 golden fixtures]
  UX1 --> UX2[UX-2 lesson + prediction]
  UX2 --> UX3[UX-3 mocked learner loop]
  SIM1 --> SIM2[SIM-2 Circuit Model]
  SIM2 --> SIM3[SIM-3 Qiskit trace]
  DATA1 --> SIM4[SIM-4 simulation routes]
  SIM3 --> SIM4
  DATA1 --> DATA2[DATA-2 core seeds]
  DATA2 --> DATA3[DATA-3 attempt/progress]
  AI1[AI-1 diagnosis rules] --> AI2[AI-2 diagnosis endpoint]
  AI2 --> AI3[AI-3 fallback Tutor]
  UX3 --> UX4[UX-4 live Bell swap]
  SIM4 --> UX4
  DATA3 --> UX4
  AI3 --> UX4
  UX4 --> QA3[QA-3 P0 smoke]
  SIM4 --> QA3
  DATA3 --> QA3
  AI3 --> QA3
  QA2[QA-2 contract checks] --> QA3
  SHIP2[SHIP-2 local launcher] --> QA3
  QA3 --> P1[P1 core branches]
  P1 --> P2[P2 integration train]
  P2 --> QA7[QA-7 release gate]
  QA7 --> P3[P3 polish/freeze]
```

## Remaining scheduling note

- Exact 29 Aug presentation time is unknown; conservative readiness gates remain active.
- Discord is canonical for mission acceptance/standups/blockers; WhatsApp is urgent-only.
- Venu operates the demo; all six share domain pitch beats; Vinod leads opening, architecture and technical Q&A.
