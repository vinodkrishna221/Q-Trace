# Screen Specs — Q-Trace UI contracts

One spec per routed screen. Each spec is the truth for that screen's **purpose, layout
archetype, section inventory, and copy**. The page derives from the spec; the spec never
describes the page after the fact. Appearance rules live in `docs/DESIGN-SYSTEM.md`.

Change protocol (mirrors `board/contracts/`): edit the spec in the same PR as the UI change,
flag in `board/DECISIONS.md` if a layout archetype or headline changes, and expect Warden to
diff rendered UI against the spec's section inventory and copy table.

Warden UI checklist for every PR touching `apps/web/app` or `apps/web/components`:

1. Page uses the archetype named in its spec — no ad-hoc grids.
2. Every section in the spec's inventory is present, in order, with its data source honored.
3. Every user-visible string matches the spec's copy table (or the spec was updated in-PR).
4. Only semantic tokens (`bg-panel`, `text-ink-dim`, `text-evidence`…) — no raw palette
   classes, no hardcoded hex in page files.
5. Mandatory copy present: footer disclaimer verbatim; seeded loading/empty/error states.
6. `data-testid` attributes unchanged (tests are contract).
7. One accent; violet only where entanglement semantics apply; glow only on primary/evidence.
8. 1366×768 pass: no horizontal scroll, primary evidence readable without hover.
