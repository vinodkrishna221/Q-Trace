# Deploy Runbook

This runbook documents how to configure, deploy, seed, and smoke-test Q-Trace across local offline demo mode, cloud staging, and live cloud production (Vercel frontend + Railway API + MongoDB Atlas M0).

## Cloud Architecture & Platform Targets

Q-Trace deploys on managed infrastructure without custom orchestrators or complex clusters:

| Component | Target Platform | URL Placeholder | Deployment Config | Health/Status Check |
|---|---|---|---|---|
| **Frontend** | Vercel (Next.js 15) | `https://qtrace-web.vercel.app` | `vercel.json`, `apps/web/vercel.json` | `GET /` & `GET /learn/bell-state` |
| **Backend** | Render / Railway (FastAPI / Python 3.12) | `https://qtrace-api.onrender.com` / `https://qtrace-api.up.railway.app` | `render.yaml`, `railway.toml` | `GET /health` & `GET /ready` |
| **Database** | MongoDB Atlas (M0 Free Tier) | `mongodb+srv://...` | Server-side connection string | `seed.py --check` |

> [!IMPORTANT]
> **Account and Credential Security:**
> Real cloud resources must be created only using team-owned accounts. Never commit real credentials, database passwords, or API keys to git. URL placeholders (`https://qtrace-web.vercel.app` and `https://qtrace-api.up.railway.app`) are updated in DNS/platform routing after initial creation.

---

## Safe Environment Selection

Q-Trace is designed to run seamlessly either offline (using the in-memory repository) or in the cloud (using MongoDB Atlas).

### Local Offline Demo (Venue Default)
For the venue demo or when reliable internet cannot be guaranteed:
- Run `bash scripts/demo-local.sh`
- `DEMO_LOCAL=1` and `DEMO_FALLBACK=1` are forced.
- In-memory repository is used automatically; no Atlas or cloud LLM key is needed.

### Cloud Deployment (MongoDB Atlas + Vercel + Railway)
For staging or live deployment:
1. Copy `.env.production.example` as a reference for environment variables.
2. Configure **Vercel** environment variables:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://qtrace-api.up.railway.app`
3. Configure **Railway** environment variables:
   - `WEB_ORIGIN`: `https://qtrace-web.vercel.app`
   - `MONGODB_URI`: `mongodb+srv://qtrace_admin:<PASSWORD>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
   - `MONGODB_DB`: `qtrace_prod`
   - `DEMO_LOCAL`: `0`
   - `DEMO_FALLBACK`: `1`
   - `ENABLE_QISKIT`: `1`
   - `ENABLE_PENNYLANE`: `1`
   - `ENABLE_TUTOR_CLOUD`: `0` (or `1` if cloud provider key is provisioned)
   - `QTRACE_SIM_TIMEOUT_S`: `1.5`

---

## Platform Deployment Checklists

### 1. Vercel (Next.js Frontend)
- **Project Name:** `qtrace-web`
- **Framework Preset:** Next.js
- **Root Directory:** `./` (uses root `vercel.json` and `pnpm --filter web build`) or `apps/web` (uses `apps/web/vercel.json`)
- **Build Command:** `pnpm --filter web build`
- **Output Directory:** `apps/web/.next`
- **Install Command:** `pnpm install`
- **Environment Variables:**
  - `NEXT_PUBLIC_API_BASE_URL`: Set to the Railway API URL.
- **Verification:**
  - Open `https://qtrace-web.vercel.app/`
  - Open `https://qtrace-web.vercel.app/learn/bell-state`
  - Confirm page renders with 0 console errors.

### 2. Railway / Render (FastAPI Backend)

#### Option A: Render (Free Web Service or Blueprint)
- **Service Name:** `qtrace-api`
- **Environment / Runtime:** `Python 3`
- **Root Directory:** `apps/api`
- **Build Command:** `pip install --upgrade pip && pip install ".[quantum]"`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`
- **Plan:** Free
- **Health Check Path:** `/health`
- **Environment Variables:**
  - `PYTHON_VERSION`: `3.12.0`
  - `MONGODB_URI`: Atlas connection string
  - `MONGODB_DB`: `qtrace_prod`
  - `DEMO_LOCAL`: `0`
  - `DEMO_FALLBACK`: `1`
  - `ENABLE_QISKIT`: `1`
  - `ENABLE_PENNYLANE`: `1`
  - `ENABLE_TUTOR_CLOUD`: `0`
  - `QTRACE_SIM_TIMEOUT_S`: `1.5`
  - `WEB_ORIGIN`: Vercel frontend URL (e.g. `https://qtrace-web.vercel.app`)
- **Verification:**
  - `curl -sf https://qtrace-api.onrender.com/health` returns `{"status":"ok"}`
  - `curl -sf https://qtrace-api.onrender.com/ready` returns `{"status":"ready"}`

#### Option B: Railway (FastAPI Backend)
- **Service Name:** `qtrace-api`
- **Builder:** `NIXPACKS`
- **Start Command:** `uv run --project apps/api uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`
- **Healthcheck Path:** `/health`
- **Healthcheck Timeout:** 300 seconds
- **Worker Policy:** Single worker (`--workers 1`). In-memory caches and session stores require single-worker consistency.
- **CORS Setup:** Ensure `WEB_ORIGIN` matches the Vercel deployed domain (e.g. `https://qtrace-web.vercel.app`).
- **Verification:**
  - `curl -sf https://qtrace-api.up.railway.app/health` returns `{"status":"ok"}`
  - `curl -sf https://qtrace-api.up.railway.app/ready` returns `{"status":"ready"}`

### 3. MongoDB Atlas M0 (Free Tier)
- **Cluster Tier:** M0 Sandbox (free tier).
- **Cluster Region:** Closest AWS/GCP region to venue (e.g. Mumbai `ap-south-1`).
- **Database User:** `qtrace_admin` with `readWriteAnyDatabase` or scoped to `qtrace_prod`.
- **Network Access:** Add `0.0.0.0/0` (Allow Access from Anywhere) for the duration of the hackathon to allow Railway dynamic IP egress.
- **Schema Enforcement:** `SCHEMA_VERSION = 1` locked via `apps/api/app/repositories/schema_freeze.py`.

---

## Live Seed and Pre-Warm Commands

Before directing judges or users to the live deployment, seed the deterministic demo cohort and pre-warm backend simulation engines:

### 1. Verify Parity & Schema Freeze
```bash
uv run --project apps/api pytest apps/api/tests/unit/data/test_schema_freeze.py -q
uv run --project apps/api pytest apps/api/tests/unit/data/test_repository_contract.py -q
```

### 2. Seed Live Atlas Database
Set `MONGODB_URI` and `MONGODB_DB` to target the live Atlas cluster, then execute:
```bash
uv run --project apps/api python apps/api/scripts/seed.py
```

### 3. Verify Seed Completeness
```bash
uv run --project apps/api python apps/api/scripts/seed.py --check
```

### 4. Optional Seed Reset (Development / Fresh Run)
```bash
uv run --project apps/api python apps/api/scripts/seed.py --reset
```

---

## Live Smoke Verification (`scripts/smoke-live.sh`)

Use `scripts/smoke-live.sh` to certify the deployed environment without exposing secrets:

```bash
# Verify against deployed live URLs
bash scripts/smoke-live.sh --web-url https://qtrace-web.vercel.app --api-url https://qtrace-api.up.railway.app

# Auto mode (reads DEPLOYED_WEB_URL / DEPLOYED_API_URL or validates staging contract)
bash scripts/smoke-live.sh

# Local staging validation mode
bash scripts/smoke-live.sh --mode local
```

### Verification Checks Performed by `smoke-live.sh`:
1. **Deployed Web Reachability:** Validates HTTP 200 on `/` and `/learn/bell-state`.
2. **API Health:** Validates HTTP 200 and `{"status":"ok"}` on `/health`.
3. **API Readiness:** Validates HTTP 200 and `{"status":"ready"}` on `/ready`, verifying Aer primary adapter.
4. **Seeded Bell Module:** Validates HTTP 200 on `/v1/modules/bell-state` with `mod_bell` entity, learning content blocks, and prediction checkpoint.
5. **Zero-Key-Leak Guarantee:** Verifies that no API keys, database connection strings, or internal IDs (`_id` / `$oid`) leak in headers or bodies.

---

## Pre-Warm Ritual (T-10m Before Pitching)

1. Ping API `/health` and `/ready` to wake any sleeping serverless containers.
2. Ping Web `/` and `/learn/bell-state` to ensure CDN caches are warm.
3. Run `bash scripts/smoke-live.sh` once.
4. If cloud latency >1500ms or venue Wi-Fi becomes unstable, activate the Local Mirror fallback:
   ```bash
   bash scripts/demo-local.sh
   ```
