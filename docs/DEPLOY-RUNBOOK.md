# Deploy Runbook

This runbook documents how to configure Q-Trace for local offline demo mode versus cloud (Atlas) deployment, and how to safely seed and pre-warm the databases.

## Safe Environment Selection

Q-Trace is designed to run seamlessly either offline (using the in-memory repository) or in the cloud (using MongoDB Atlas).

### Local Offline Demo (Default)
For the local venue demo (e.g., without reliable internet), no external database is required. The in-memory fallback is automatically engaged.
- Ensure `MONGODB_URI` in `.env` is either empty or points to a non-existent/local instance, or the app defaults to `InMemoryRepository`.
- `DEMO_LOCAL=1` and `DEMO_FALLBACK=1` should be enabled in `.env`.

### Cloud (MongoDB Atlas)
For staging or live deployment:
1. Copy `.env.example` to `.env`.
2. Update `MONGODB_URI` with the secure Atlas connection string.
3. Update `MONGODB_DB` (e.g., `qtrace_prod`).
4. Ensure `DEMO_LOCAL=0` if deploying to the cloud.

> [!WARNING]
> Never commit `.env` or Atlas credentials to git. The in-memory mode remains the primary fallback if the Atlas connection is absent.

## Seed and Pre-Warm Commands

Before running the application against a new MongoDB Atlas cluster (or testing locally), you must seed the deterministic cohort and hero data to ensure a consistent presentation.

### 1. Verify Parity
Run the behavioral contract suite to ensure the chosen backend is fully compatible:
```bash
uv run --project apps/api pytest apps/api/tests/unit/data/test_repository_contract.py
```

### 2. Seed Data
To populate the database with the demo cohort (30 synthetic profiles), Aarav, Meera, Dr. Rao, and the Bell state learning paths:
```bash
uv run --project apps/api python apps/api/scripts/seed.py
```

### 3. Verify Seed
To confirm that all required hero IDs and content are present:
```bash
uv run --project apps/api python apps/api/scripts/seed.py --check
```

### 4. Reset Data (Caution)
To wipe the database before seeding again (useful during development):
```bash
uv run --project apps/api python apps/api/scripts/seed.py --reset
```

## Schema Freeze Gate (DATA-8)

**SCHEMA_VERSION = 1** is now locked. No new collection or entity field may be
added without:
1. Bumping `SCHEMA_VERSION` in `apps/api/app/repositories/schema_freeze.py`.
2. Adding the new collection/index/field entries to the freeze manifest.
3. Filing a DECISIONS entry and pinging all contract consumers in Discord.

### Pre-warm Sequence (full venue cycle)

Run these steps in order before any live demo:

```bash
# 1. Prove schema freeze is intact (exit 0 = no drift)
uv run --project apps/api pytest apps/api/tests/unit/data/test_schema_freeze.py -q

# 2. Verify parity between memory and Atlas backends
uv run --project apps/api pytest apps/api/tests/unit/data/test_repository_contract.py -q

# 3. Optional reset (development only — skips on venue)
uv run --project apps/api python apps/api/scripts/seed.py --reset

# 4. Seed the demo cohort + hero profiles
uv run --project apps/api python apps/api/scripts/seed.py

# 5. Verify hero IDs are present
uv run --project apps/api python apps/api/scripts/seed.py --check
```

> [!NOTE]
> All `InstructorInsight` responses include a `dataDisclosure` field that
> contains "Synthetic" to clearly mark synthetic seeded cohort data.
> The freeze test `test_instructor_insight_synthetic_disclosure_present`
> enforces this on every deployment.
