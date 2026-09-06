# Screen Spec — `/progress` (Learner Progress)

- **Archetype:** `dashboard`
- **Purpose:** Proof that learning happened — mastery, points, and diagnosed misconceptions for
  the active role. A judge switching roles in the header should see this page change.

## Section inventory

| # | Section | Content source | Notes |
|---|---|---|---|
| 1 | PageHeader | role store + fixture | Eyebrow `LEARNER PROGRESS` + record id; title carries active role name; right slot: total-points stat |
| 2 | Stat strip | `DEMO_PROGRESS_RECORDS[profileId]` | 3 stats: total points · modules completed · skills mastered |
| 3 | Skill competency | fixture | Rows with score bar + status badge (`MASTERED` evidence / `PRACTICING` caution) |
| 4 | Completed modules | fixture | List with check icons; empty state copy when none |

## Copy table

| Key | Text |
|---|---|
| header.eyebrow | `LEARNER PROGRESS` |
| header.title | `Progress — {activeRole.name}` |
| header.purpose | `Skill mastery, completed modules, and misconception history — recorded from verified simulator runs.` |
| stat.points | `Total Points` |
| stat.modules | `Modules Completed` |
| stat.skills | `Skills Mastered` |
| panel.skills | `Skill Competency` |
| panel.modules | `Completed Modules` |
| empty.modules | `No completed modules yet — finish the Bell-state lab to begin the record.` |
| points.suffix | ` pts` |

## Notes

- Progress data stays fixture-driven per active role (`lp_aarav` fallback preserved).
- Status badges are the semantic-color showcase: MASTERED = evidence, PRACTICING = caution.
