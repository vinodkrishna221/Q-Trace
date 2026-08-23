---
name: problem-prospector
description: Mine real, evidence-backed problem statements from institutional signal streams — for hackathons where teams must find their own problems (SIH self-proposed / Open Innovation). Scoped by industry, state, or theme. Problems are mined from documents where institutions admit them with numbers, never brainstormed. Use during /prospect.
---

# Problem Prospector

Core inversion: ChatGPT generates problems from pattern memory ("farmers lack awareness
of…"), which is why every team's self-proposed PS looks identical. The prospector never
generates — it **mines**. A problem exists for us only when institutions have admitted
it, citizens have reported it, buyers have tried to buy it away, or builders have died on
it — in documents, with numbers, with links. Run by Scout (mining), Maverick (anti-generic
gate), Orion (wedge scoping), Oracle (scoring).

## Scope modes (pick one per run; they change WHERE you dig, not the method)

- **INDUSTRY** (e.g., agritech): national streams filtered by sector; state signals used
  for grounding examples
- **STATE** (e.g., Maharashtra): state-level streams first (state CAG chapters, assembly
  questions, state grievance portal, state tenders), national streams as backfill
- **THEME** (SIH-style, e.g., "smart education"): translate the theme into 2-3 concrete
  sectors × user groups first, then run as INDUSTRY — themes are marketing labels,
  not minable categories

**Every mode passes through Gate 0 immediately after cells are chosen/confirmed —
before a single pipeline runs.** Software-native screening happens at the door, not
after the mining budget is already spent.

## Gate 0 · Software-native cell screen (BEFORE mining — cell/theme level)

Assume the team is 4-6 people with zero manufacturing/hardware-assembly capacity beyond
commodity off-the-shelf devices already in hand (phone, laptop, webcam, mic). Never
assume custom sensors, actuators, or physical prototypes get built during the event.

Score every candidate cell 1-5: does its core value-creating action look like *verify,
diagnose, predict, match, coordinate, generate, translate, monitor,* or *automate a
decision/workflow* (high) — or does it require *manufacturing, construction, physical
installation, novel hardware,* or fieldwork that IS the deliverable (low, reject)?

Reframe before rejecting: "build drones" dies; "software-around-drones" (compliance
workflows, mission coordination, data processing for orgs that already own drones)
survives as the same theme, software-native cell. If an entire THEME is structurally
physical (most of Robotics & Drones, Toys & Games manufacturing, Space Technology
hardware, Smart Vehicles) and no reframing survives, say so to the human BEFORE mining
and recommend a different theme or cell — never spend the budget on a dead scope.

## The five mining pipelines (parallel, equal budget, ~20-25m each timebox)

**P1 · ADMISSION MINING — the government confessing, with numbers**
CAG audit reports (name failures + ₹ + causes — the single richest stream) ·
parliamentary & assembly questions (ministries answering "what is being done about X"
= X is admitted) · NITI Aayog / ministry scheme evaluations · budget allocated-vs-utilized
gaps (money unspent = an execution problem, money spent without outcomes = a design problem).

**P2 · GRIEVANCE MINING — citizens reporting, at volume**
CPGRAMS category statistics · state grievance portals (categories with high counts +
high re-open rates) · RTI-based journalism · recurring regional-language news (the same
complaint in different words every quarter) · consumer forums.

**P3 · PROCUREMENT MINING — buying is admitting**
Government tenders/EOIs (GeM + state portals): what agencies repeatedly try to BUY is a
problem they've admitted they can't solve internally · grand-challenge and govt-hackathon
archives: a problem reposted across years is a problem no winner actually solved.

**P4 · GRAVEYARD MINING — the constraint that kills**
Failed pilots, shutdown startups, abandoned scheme dashboards in the scope — and the
stated reason. The dead attempt's killing constraint IS the real problem statement,
usually one level below the surface framing (not "farm advisory failed" but "farm
advisory died because trust + last-mile distribution, not information").

**P5 · FRICTION MINING — recurrence and force**
Seasonal recurrence: the same failure reported in ≥2 different years (recurrence =
structurally unsolved, not transient) · court/NGT orders (a judge ordering a fix =
an admitted, unfixed problem) · regional search-trend spikes.

Deep-water rules apply (see prior-art-check's source ladder): every signal keeps a link;
no link = `unverified-memory`; timeboxes hold — partial evidence now beats perfect late.

## Gate 1 · Triangulation (the recurrence test)

A candidate survives only with **≥3 independent streams, across ≥2 different years, and
≥1 NUMBERED official admission** (₹ / count / % from an official document or statement).
One viral news story is weather; three streams over two years is climate.

## Gate 2 · Anti-generic (the chair test — Maverick)

Kill any framing that could be written without leaving a chair. Banned shapes: "lack of
awareness about…", "no unified platform for…", "inefficient X management", "farmers/
students/patients lack access to information". A survivor MUST carry all four:
- a **named place** (district/mandi/hospital/portal — not "rural India")
- a **named number with source** (the pain quantified by someone official)
- a **named attempt that exists/failed and WHY** (scheme, startup, portal — the graveyard finding)
- a **named pain owner** (the role/institution that operationally owns this pain and
  would operate a fix — this becomes the deployability operator later)

## Gate 3 · Whitespace + overlap

Quick coverage scan: is a funded startup or a live govt platform already doing this
WELL? Named → candidate dies or reframes to the uncovered segment/geography. Then
pre-answer "how is this not just scheme/portal X?" in one line — the differentiation
line every judge will demand.

## Gate 4 · Software-native wedge check (wedge level — Orion names it, before PQ scoring)

Every wedge must pass ALL FOUR, even after triangulation/chair-test/whitespace all
passed. A real, well-evidenced problem with no software-only fix is not our problem
to solve — log it as `evidence-strong, software-infeasible` in the pipeline notes so
it isn't wastefully rediscovered next run, and move to the next candidate.

1. **Value creation is code.** The wedge's core output — a verdict, a match, a
   prediction, a draft, a route, a score, a flagged case, a routed alert — is produced
   BY software/AI-ML, not by a person doing physical work the software merely displays.
2. **Inputs ride existing devices.** Data comes from what the user/operator already
   holds (phone camera/mic/GPS, existing sensors, existing portals/APIs/documents) —
   never a device the team must design, assemble, or manufacture. Using a phone camera
   to capture a field photo is software; building a custom sensor rig is not.
3. **Demos standalone.** The 36h build runs end-to-end for a judge WITHOUT waiting on
   any physical action to complete first. A monitoring/escalation wedge is fine — the
   software's job (flag it, route it, prove it, chase it) is complete and demoable even
   though the underlying physical/policy fix happens later, outside the team's control.
4. **No fabrication in the build plan.** Zero phase-plan tasks read "manufacture,"
   "assemble," or "wire a sensor we designed." Off-the-shelf peripherals used AS-IS are
   fine; building or assembling a custom device is not.

## PQ Score (Oracle, per survivor, 1-5 each)

`SEVERITY (the number's size × who bleeds) · RECURRENCE (years × streams) ·
WHITESPACE · SOLVABILITY (Gate 4 already passed — score how CHEAP/fast this 36h build
is, not whether it's software) · DEMOABILITY (can a judge SEE it in 3 minutes?) ·
DEPLOYABILITY (battery preview: which rail, which operator)` — weighted sum ranks
them. 8-12 candidates → **top 3 full dossiers** (template: PROBLEM-DOSSIER.md).

## Output register

The SIH-format PS section is written the way a ministry writes: sober title (no
adjectives), background with the sourced numbers, description naming the gap and the
failed attempts, expected outcome as capabilities (not tech), stakeholders named.
The gauntlet brief section stays internal: evidence file, chain-of-loss, candidate
wedges. **The PS must read like it was discovered, not invented — because it was.**
