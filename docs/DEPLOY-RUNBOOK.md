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
