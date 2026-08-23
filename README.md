# ⚛️ Q-Trace — Quantum Flight Recorder & Learning Platform

> **Q-Trace** is an AI-assisted quantum computing learning platform where learners predict, build, simulate, inspect, and repair quantum circuits. Featuring the **Quantum Flight Recorder**, Q-Trace pinpoints the exact gate where a learner's conceptual model diverged, provides evidence-grounded tutoring, and tracks progress.

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- **Node.js**: v20+ (v24 recommended) & **pnpm**: v10+
- **Python**: v3.12+

### 2. Environment Setup
```bash
# Copy the environment template
cp .env.example .env
```

### 3. Install & Run

#### Frontend (`apps/web` — Next.js 15 App Router):
```bash
# Install frontend dependencies
pnpm install

# Run the web development server (http://localhost:3000)
pnpm dev:web
```

#### Backend API (`apps/api` — FastAPI Modular Monolith):
```bash
# Install backend in a virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -e "./apps/api[quantum,dev]"

# Run backend API server (http://localhost:8000)
uvicorn apps.api.app.main:app --reload --port 8000
```

### 4. Layout & Environment Check
```bash
bash scripts/check-layout.sh
```

---

## 📁 Repository Structure

```
├── apps/
│   ├── web/                     # Next.js 15+ App Router frontend
│   │   ├── app/                 # App Router pages and layouts
│   │   ├── components/          # Shared UI components
│   │   ├── features/            # Circuit workspace & learning features
│   │   ├── tests/               # Unit, fixture, and acceptance tests
│   │   └── e2e/                 # Playwright end-to-end tests
│   └── api/                     # FastAPI backend modular monolith
│       ├── app/
│       │   ├── main.py          # Application entrypoint & health routes
│       │   ├── routers/         # API domain routers (circuits, sim, tutor)
│       │   ├── services/        # Quantum runtime, diagnosis, and tutor services
│       │   ├── repositories/    # MongoDB Atlas & in-memory seed stores
│       │   ├── prompts/         # Structured evidence prompts
│       │   └── models/          # Domain schemas & validation
│       └── tests/               # Unit, contract, fixture, security tests
├── board/
│   ├── contracts/               # Shared API, circuit, and event contracts
│   ├── STATUS.md                # Live project heartbeat and glance-source
│   ├── DECISIONS.md             # Architecture decisions and contract changes
│   └── TEAM.md                  # Team member roles, tracks, and shift plan
├── docs/                        # PRD, Architecture, and Schema documentation
├── missions/                    # Per-member mission briefs
├── plans/                       # Per-track phase plans and task DAGs
└── scripts/                     # Tooling, smoke tests, and check scripts
```

---

## 🌿 Git Branch & PR Conventions

- **Branch Naming:** `feat/<track>/<card-id>-<short-description>`
  - Example: `feat/story-ship/ship-1-scaffold-the-monorepo-and-environment`
  - Example: `feat/learning-ux/ux-1-create-the-learner-application-shell`
  - Example: `feat/simulation-api/sim-1-create-the-fastapi-service-boundary`
- **Commit Messages:** Conventional Commits (`feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`)
- **Rules:**
  - One card per branch.
  - Run the card's exact TEST command before marking complete.
  - Every PR requires a fresh-session Warden review before merge.
  - Contracts in `board/contracts/` change only via version bump + DECISIONS entry + consumer ping.

---

# ⚔️ WarRoom System

Operated under the **WarRoom** hackathon operating system. Persona rules and workflows are located in `.agents/`.
