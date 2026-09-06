# Screen Spec — `/instructor` (Instructor Insight)

- **Archetype:** `dashboard`
- **Purpose:** Close the demo loop: the same prediction a learner just made shows up as cohort
  intelligence. This page proves the platform is a *system*, not a toy.

## Section inventory

| # | Section | Content source | Notes |
|---|---|---|---|
| 1 | PageHeader | fixture + copy table | Eyebrow `INSTRUCTOR INSIGHT` + cohort id; right slot: active-learners stat |
| 2 | Metric panels ×3 | `DEMO_INSTRUCTOR_INSIGHT` | Module completion bars (evidence) · challenge pass rate bars (accent) · top misconceptions list (caution) |
| 3 | Live-demo callout | fixture `liveDemoLearner` | One-line strip: "Live demo learner lp_aarav — latest repair attempt: not yet passed." Makes the cohort feel connected to the demo just performed |
| 4 | Disclosure footer | fixture | `dataDisclosure` text + generated-at timestamp, mono |

## Copy table

| Key | Text |
|---|---|
| header.eyebrow | `INSTRUCTOR INSIGHT` |
| header.title | `Cohort Analytics & Misconceptions` |
| header.purpose | `Aggregate completion, challenge pass rates, and Flight Recorder divergence signals — evidence for what to re-teach next.` |
| stat.learners | `Active Learners` |
| stat.learners.value | `{learnerCount} students` |
| panel.completion | `Module Completion` |
| panel.passrate | `Challenge Pass Rate` |
| panel.misconceptions | `Top Misconceptions` |
| live.prefix | `Live demo learner` |
| live.failed | `latest repair attempt: not yet passed` |
| live.passed | `latest repair attempt: passed` |
| misconception.meta | `{learnerCount} learners · {occurrences} detections` |

## Notes

- Misconception codes render in mono with caution color — they are diagnostic codes, not prose.
- All numbers come from the fixture; the live-demo strip must reflect `latestAttemptPassed`.
