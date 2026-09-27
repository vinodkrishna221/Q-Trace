# Q-Trace Authentication & Identity System Design
## High-Level Architecture, Low-Level Design (LLD), Security Specifications & Workflow Flows

> **Target Audience:** Engineering, Architecture Reviewers, Security Auditors, and Product Team  
> **Status:** Approved Architectural Specification (Post /grill-me Alignment)  
> **Scope:** Primary implementation focused on **Individual Learners, Students, and Independent Educators**, with an interactive **"Coming Soon" Early-Access Gateway for Institutions**.  
> **Design Language:** Linear Precision Quantum Instrument (`docs/DESIGN-SYSTEM.md`)  
> **Tech Stack Alignment:** FastAPI (Python 3.12) + PyMongo (MongoDB Atlas) + PyJWT + Argon2id + Next.js 15 App Router + Tailwind v4 + Resend API  

---

## 1. Executive Summary & Design Principles

Q-Trace is an advanced quantum learning platform and state-vector circuit workspace. This document specifies the complete, production-grade identity, signup, and login architecture.

### Key Architectural Tenets
1. **Unified Backend Security Boundary:** Authentication logic, token issuance, credential hashing, and authorization guards live natively in the **FastAPI (`apps/api`)** service. This ensures that sensitive quantum simulation endpoints and student progress repositories share a single, zero-trust security perimeter without reliance on third-party auth subscriptions.
2. **Defensive In-Depth Token Architecture:** Session persistence utilizes **HttpOnly, Secure, SameSite=Lax cookies** carrying short-lived JWT access tokens (15 minutes) and rotating refresh tokens (7 days). Tokens are never exposed to browser JavaScript, neutralizing Cross-Site Scripting (XSS) token theft.
3. **OWASP/NIST Cryptographic Rigor:** Passwords are protected using **Argon2id** (`argon2-cffi`), the state of the art in memory-hard hashing resistant to GPU/ASIC brute-force cracking.
4. **Resilient Developer Experience:** Transactional emails (verification and password resets) run via **Resend** with an automatic **local console fallback** when running offline or in demo environments (`DEMO_LOCAL=1`), guaranteeing zero blocked development loops.
5. **Progressive Persona Modeling:** A unified data schema represents all individuals (General Learners, Self-Study Students, Independent Educators) with persona tags, while Institutional Multi-Seat Organizations (Universities, Schools, Cohorts) are cleanly decoupled and surfaced through an interactive **"Coming Soon" Waitlist** interface.

---

## 2. System Architecture & Component Topology

The authentication subsystem spans three tiers: the Next.js Client Layer, the FastAPI Security & Auth Core, and the MongoDB Atlas Data Store.

```mermaid
flowchart TD
    subgraph CLIENT["Client Tier (Next.js 15 App Router)"]
        UI_AUTH["Auth Screens\n(/login, /signup, /reset-password)"]
        MODAL_INST["Institutional 'Coming Soon' Modal\n(Waitlist Capture)"]
        HTTP_CLIENT["Frontend API Client\n(Credentials: 'include', CSRF Header)"]
        BANNER["Soft Email Verification Banner"]
    end

    subgraph GATEWAY["FastAPI Security Gateway (apps/api)"]
        CORS["CORS & Origin Verification Middleware"]
        RATE_LIMIT["Slowapi Rate Limiter\n(5 req/min login, 3 req/hr signup)"]
        CSRF_GUARD["Double-Submit CSRF Verification Middleware"]
        AUTH_ROUTER["Auth Router (/v1/auth/*)"]
        TOKEN_SRV["Token Service (PyJWT: Access + Refresh)"]
        HASH_SRV["Argon2id Cryptographic Service"]
        LOCKOUT_SRV["Lockout & Brute-Force Guard (5 Failed Tries -> 15m)"]
        EMAIL_DISPATCH["Email Dispatcher (Resend API / Terminal Fallback)"]
        GITHUB_OAUTH["GitHub OAuth 2.0 Handler"]
        MFA_SRV["TOTP Authenticator Service (pyotp)"]
    end

    subgraph STORAGE["Data & Persistence Tier (MongoDB Atlas)"]
        COL_USERS[("users\n(Credentials, Personas, 2FA)")]
        COL_SESSIONS[("refresh_tokens\n(Family Rotation, Expirations)")]
        COL_RESETS[("password_resets\n(Hashed Single-Use Tokens)")]
        COL_WAITLIST[("institution_waitlist\n(Leads & Pilot Inquiries)")]
        COL_LEARNER[("learner_profiles\n(Progress, Active Paths)")]
    end

    UI_AUTH -->|1. Submit Form| HTTP_CLIENT
    MODAL_INST -->|Submit Waitlist| HTTP_CLIENT
    HTTP_CLIENT -->|2. HTTPS with SameSite Cookies| CORS
    CORS --> RATE_LIMIT
    RATE_LIMIT --> CSRF_GUARD
    CSRF_GUARD --> AUTH_ROUTER

    AUTH_ROUTER --> HASH_SRV
    AUTH_ROUTER --> LOCKOUT_SRV
    AUTH_ROUTER --> TOKEN_SRV
    AUTH_ROUTER --> GITHUB_OAUTH
    AUTH_ROUTER --> MFA_SRV
    AUTH_ROUTER --> EMAIL_DISPATCH

    AUTH_ROUTER --> COL_USERS
    TOKEN_SRV --> COL_SESSIONS
    AUTH_ROUTER --> COL_RESETS
    AUTH_ROUTER --> COL_WAITLIST
    AUTH_ROUTER -.->|Initialize| COL_LEARNER
```

---

## 3. User Personas & Account Modeling

To balance immediate individual focus with institutional roadmapping, the system utilizes a **Unified Account Model**.

| Dimension | Individual: General Learner | Individual: Self-Study Student | Individual: Independent Educator | Institutional Organization |
|---|---|---|---|---|
| **Account Type** | `INDIVIDUAL` | `INDIVIDUAL` | `INDIVIDUAL` | `INSTITUTION` *(Coming Soon)* |
| **Persona Tag** | `LEARNER` | `STUDENT` | `EDUCATOR` | `ORGANIZATION` |
| **Primary Goal** | Intuitive quantum exploration, Bell state intuition | University coursework, syllabus alignment, exam review | Class demo prep, curriculum authoring, circuit prototyping | Departmental seat management, cohort telemetry, LMS integration |
| **Auth Method** | Email/Username + Password, GitHub OAuth | Email/Username + Password, GitHub OAuth | Email/Username + Password, GitHub OAuth | SAML / SSO / Google Workspace *(Roadmap)* |
| **Access State** | **Live & Active Now** | **Live & Active Now** | **Live & Active Now** | **Coming Soon (Waitlist Active)** |
| **Linked Profile** | Seeded/Created `LearnerProfile` | Seeded/Created `LearnerProfile` | Seeded/Created `LearnerProfile` + Instructor Views | `Cohort` & `Organization` records |

---

## 4. End-to-End User Journeys & Flow Diagrams

### 4.1 Individual Sign-Up Flow (Start to Finish)

Users can sign up using Email, Display Name, Username, and Password, or 1-click GitHub OAuth.

```mermaid
sequenceDiagram
    autonumber
    actor User as Learner / Student / Educator
    participant Browser as Web Browser (Next.js)
    participant API as FastAPI Backend (/v1/auth)
    participant Limiter as Slowapi & Lockout
    participant DB as MongoDB (users collection)
    participant Mailer as Resend Email Service

    User->>Browser: Enters Name, Username, Email, Password, Persona
    Browser->>Browser: Client-side Zod validation (Password >= 8 chars, email regex)
    Browser->>API: POST /v1/auth/signup (Payload + CSRF Token)
    API->>Limiter: Check IP signup rate (<= 3 per hour)
    alt Rate limit exceeded
        API-->>Browser: 429 Too Many Requests
    end
    API->>DB: Check if Email or Username already exists
    alt Email or Username taken
        API-->>Browser: 409 Conflict ("Email or Username already registered")
    end
    API->>API: Hash password with Argon2id (memory=64MB, iterations=3, parallelism=4)
    API->>API: Generate 24-hr Email Verification Token (secrets.token_urlsafe(32))
    API->>DB: Insert new User Document (isVerified=False, role=INDIVIDUAL, personaTag)
    API->>DB: Auto-provision initial LearnerProfile & LearningPath
    API->>Mailer: Async dispatch verification link (or console print in DEMO_LOCAL)
    API->>API: Issue 15-min Access Token & 7-day Refresh Token
    API->>DB: Store initial Refresh Token family
    API-->>Browser: 201 Created + Set-Cookie (qtrace_access, qtrace_refresh, qtrace_csrf)
    Browser->>Browser: Direct redirect to /learn workspace with Soft Verification Banner visible
```

### 4.2 Individual Login & Brute-Force Lockout Flow

Login supports either Email or Username as the login identifier.

```mermaid
sequenceDiagram
    autonumber
    actor User as Individual User
    participant Browser as Web Browser
    participant API as FastAPI Backend (/v1/auth/login)
    participant Lockout as Brute-Force Tracker
    participant DB as MongoDB (users)
    participant Token as Token Service

    User->>Browser: Submits Identifier (Email or Username) + Password
    Browser->>API: POST /v1/auth/login
    API->>Lockout: Check if account/IP is locked out
    alt Account currently locked
        API-->>Browser: 423 Locked ("Too many failed attempts. Try again in 15 minutes.")
    end
    API->>DB: Lookup user by email OR username
    alt User not found
        API->>Lockout: Record failed attempt for IP
        API-->>Browser: 401 Unauthorized ("Invalid credentials")
    end
    API->>API: Verify password with Argon2id
    alt Password invalid
        API->>Lockout: Increment failed attempts (attempt count += 1)
        alt attempt count >= 5
            API->>Lockout: Set lockout until (now + 15 minutes)
            API-->>Browser: 423 Locked ("Account locked for 15 minutes due to consecutive failures.")
        else
            API-->>Browser: 401 Unauthorized ("Invalid credentials. X attempts remaining.")
        end
    end
    API->>Lockout: Reset failed attempt counter to 0
    alt User has TOTP 2FA enabled
        API-->>Browser: 200 OK + {"mfaRequired": true, "mfaSessionToken": "..."}
        Note over Browser, API: User enters 6-digit TOTP code (handled via /v1/auth/mfa/verify)
    else Standard Flow
        API->>Token: Issue fresh Access Token (15m) + New Refresh Token (7d)
        API->>DB: Save Refresh Token family record
        API-->>Browser: 200 OK + Set-Cookie headers
        Browser->>Browser: Transition to active quantum workspace
    end
```

### 4.3 GitHub OAuth 2.0 Flow (2-Step Fast Sign-In)

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer / Researcher
    participant Browser as Web Browser
    participant API as FastAPI Backend
    participant GitHub as GitHub OAuth Server
    participant DB as MongoDB

    User->>Browser: Clicks "Continue with GitHub"
    Browser->>API: GET /v1/auth/github/login
    API->>API: Generate cryptographic state parameter (prevent OAuth CSRF)
    API-->>Browser: 302 Redirect to https://github.com/login/oauth/authorize?client_id=...&state=...
    Browser->>GitHub: User approves application permissions
    GitHub-->>Browser: 302 Redirect to /v1/auth/github/callback?code=...&state=...
    Browser->>API: GET /v1/auth/github/callback?code=...&state=...
    API->>API: Validate state parameter against cookie/cache
    API->>GitHub: POST https://github.com/login/oauth/access_token (code, client_id, client_secret)
    GitHub-->>API: Returns GitHub Access Token
    API->>GitHub: GET https://api.github.com/user + GET /user/emails
    GitHub-->>API: Returns GitHub ID, username, verified email, avatar
    API->>DB: Find user by githubId or verified email
    alt User exists
        API->>DB: Update lastLoginAt, avatarUrl
    else New User
        API->>DB: Insert new User (isVerified=True, accountType=INDIVIDUAL, githubId)
        API->>DB: Initialize default LearnerProfile
    end
    API->>API: Issue standard Q-Trace Access + Refresh tokens
    API-->>Browser: 302 Redirect to /learn + Set-Cookie (qtrace_access, qtrace_refresh)
```

### 4.4 Refresh Token Family Rotation & Anti-Replay Flow

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Web Browser
    participant API as FastAPI Backend (/v1/auth/refresh)
    participant DB as MongoDB (refresh_tokens)

    Note over Browser, API: Access Token expires after 15 minutes
    Browser->>API: POST /v1/auth/refresh (Carries qtrace_refresh cookie)
    API->>DB: Lookup refresh token hash in DB
    alt Token record NOT found or Expired
        API-->>Browser: 401 Unauthorized (Force re-login)
    else Token found but status == "REVOKED" or "USED" (REPLAY DETECTED!)
        Note over API, DB: Breach detected! An attacker has presented an old rotated token!
        API->>DB: Revoke ALL tokens belonging to this FamilyId immediately
        API-->>Browser: 401 Unauthorized ("Security alert: Session invalidated. Please log in again.")
    else Token found and status == "ACTIVE"
        API->>DB: Mark current token as "USED"
        API->>API: Generate new Access Token (15m) + new Refresh Token (7d, same FamilyId)
        API->>DB: Insert new Refresh Token as "ACTIVE"
        API-->>Browser: 200 OK + Updated Set-Cookie headers
    end
```

### 4.5 Password Reset & Account Recovery Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Browser as Next.js Web App
    participant API as FastAPI Backend
    participant DB as MongoDB
    participant Mailer as Resend Email Service

    User->>Browser: Enters email on /forgot-password
    Browser->>API: POST /v1/auth/forgot-password {"email": "..."}
    API->>DB: Lookup user by email
    alt User exists
        API->>API: Generate 15-min token = secrets.token_urlsafe(32)
        API->>API: Compute SHA-256 hash of token
        API->>DB: Store reset record {tokenHash, userId, expiresAt: now + 15m, used: false}
        API->>Mailer: Send email with link https://qtrace.app/reset-password?token=...
    end
    API-->>Browser: 200 OK ("If that email exists, reset instructions have been dispatched.")
    Note over API-->>Browser: Prevents user enumeration by returning identical 200 response

    User->>Browser: Clicks reset link in email
    Browser->>User: Displays /reset-password screen with new password input
    User->>Browser: Submits New Password
    Browser->>API: POST /v1/auth/reset-password {"token": "...", "newPassword": "..."}
    API->>API: Compute SHA-256 hash of incoming token
    API->>DB: Find active, non-expired, non-used reset record
    alt Token invalid or expired
        API-->>Browser: 400 Bad Request ("Reset link expired or already used.")
    end
    API->>API: Hash new password with Argon2id
    API->>DB: Update user passwordHash
    API->>DB: Mark reset token as used=True
    API->>DB: Revoke ALL active refresh token families for this user (Kill all sessions)
    API-->>Browser: 200 OK ("Password updated successfully. Please log in.")
```

### 4.6 Institutional "Coming Soon" & Waitlist Flow

```mermaid
sequenceDiagram
    autonumber
    actor Educator as University Professor / Lab Director
    participant Browser as Next.js Client
    participant Modal as "Coming Soon" Waitlist Modal
    participant API as FastAPI (/v1/waitlist/institutions)
    participant DB as MongoDB (institution_waitlist)
    participant Mailer as Resend Service

    Educator->>Browser: Clicks "Institutions & Classrooms" toggle or button
    Browser->>Modal: Opens Linear-Precision Modal with "Coming Soon" Pill
    Modal->>Educator: Displays feature roadmap (Cohort grading, Flight Recorder analytics, LMS sync)
    Educator->>Modal: Enters Name, University, Role, Email, Estimated Cohort Size
    Modal->>API: POST /v1/waitlist/institutions (Payload)
    API->>API: Validate academic email & payload fields
    API->>DB: Upsert record into institution_waitlist collection
    API->>Mailer: Send internal notification to founding team & confirmation to educator
    API-->>Modal: 201 Created {"status": "enrolled", "message": "You are #42 on the pilot waitlist"}
    Modal->>Educator: Displays confirmation card with priority pilot badge
```

---

## 5. Low-Level Database Schema (MongoDB Atlas)

All schemas conform to `docs/SCHEMA.md` conventions: stable string IDs, `schemaVersion: 1`, and strict ISO-8601 timestamps.

### 5.1 `users` Collection
Represents individual accounts across all learner personas.

```json
{
  "_id": "usr_7f8a9b2c3d4e",
  "email": "aarav.sharma@domain.edu",
  "username": "aarav_quantum",
  "displayName": "Aarav Sharma",
  "passwordHash": "$argon2id$v=19$m=65536,t=3,p=4$...",
  "accountType": "INDIVIDUAL",
  "personaTag": "STUDENT",
  "isVerified": true,
  "verificationTokenHash": null,
  "verificationExpiresAt": null,
  "githubId": "12345678",
  "githubUsername": "aarav-sh",
  "avatarUrl": "https://avatars.githubusercontent.com/u/12345678",
  "mfa": {
    "enabled": false,
    "totpSecret": null,
    "backupCodes": []
  },
  "lockout": {
    "failedAttempts": 0,
    "lockedUntil": null
  },
  "learnerProfileId": "lp_aarav",
  "schemaVersion": 1,
  "createdAt": "2026-09-26T06:30:00Z",
  "updatedAt": "2026-09-26T06:30:00Z"
}
```

**Indexes:**
- `unique_email`: `{ "email": 1 }` (unique)
- `unique_username`: `{ "username": 1 }` (unique)
- `sparse_github_id`: `{ "githubId": 1 }` (unique, sparse)
- `learner_profile_ref`: `{ "learnerProfileId": 1 }`

---

### 5.2 `refresh_tokens` Collection
Stores active and historic refresh tokens for family rotation and replay detection.

```json
{
  "_id": "rtk_91a2b3c4d5e6",
  "tokenHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "userId": "usr_7f8a9b2c3d4e",
  "familyId": "fam_3a4b5c6d7e8f",
  "status": "ACTIVE",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "ipAddress": "192.0.2.45",
  "expiresAt": "2026-10-03T06:30:00Z",
  "createdAt": "2026-09-26T06:30:00Z"
}
```

**Indexes:**
- `token_hash_lookup`: `{ "tokenHash": 1 }` (unique)
- `user_family_lookup`: `{ "userId": 1, "familyId": 1 }`
- `ttl_expiry`: `{ "expiresAt": 1 }` (expireAfterSeconds: 0 — MongoDB auto-eviction)

---

### 5.3 `password_resets` Collection
Single-use time-limited recovery records.

```json
{
  "_id": "rst_4e5f6a7b8c9d",
  "tokenHash": "8f434346648f6b96df89dda901c5176b10e6d83961dd3c1ac88b59b2dc327aa4",
  "userId": "usr_7f8a9b2c3d4e",
  "used": false,
  "expiresAt": "2026-09-26T06:45:00Z",
  "createdAt": "2026-09-26T06:30:00Z"
}
```

**Indexes:**
- `reset_token_lookup`: `{ "tokenHash": 1 }` (unique)
- `ttl_reset_expiry`: `{ "expiresAt": 1 }` (expireAfterSeconds: 0)

---

### 5.4 `institution_waitlist` Collection
Captures prospective institutional leads and classroom pilot requests.

```json
{
  "_id": "wtl_5a6b7c8d9e0f",
  "fullName": "Dr. Elena Vance",
  "workEmail": "evance@mit.edu",
  "institutionName": "Massachusetts Institute of Technology",
  "role": "PROFESSOR",
  "expectedStudents": 120,
  "notes": "Interested in Bell-state Flight Recorder for Fall Quantum Mechanics lab.",
  "status": "PENDING_REVIEW",
  "schemaVersion": 1,
  "createdAt": "2026-09-26T06:30:00Z"
}
```

**Indexes:**
- `waitlist_email`: `{ "workEmail": 1 }` (unique)
- `waitlist_created`: `{ "createdAt": -1 }`

---

## 6. Low-Level API Contract Specifications

All endpoints prefix: `/v1/auth` and `/v1/waitlist`.  
Security headers: `Content-Type: application/json`, `X-CSRF-Token: <token>`.

### 6.1 Authentication Endpoints Matrix

| HTTP Method | Route | Description | Rate Limit | Auth Required |
|---|---|---|---|---|
| `POST` | `/v1/auth/signup` | Register new individual user | 3 / hour / IP | No |
| `POST` | `/v1/auth/login` | Authenticate with Email/Username + Password | 5 / min / IP | No |
| `POST` | `/v1/auth/refresh` | Rotate refresh token & issue new access token | 20 / min | Cookie |
| `POST` | `/v1/auth/logout` | Revoke current session & clear cookies | None | Cookie |
| `POST` | `/v1/auth/logout-all` | Revoke all active sessions on all devices | 5 / min | User JWT |
| `GET` | `/v1/auth/me` | Fetch authenticated user profile & persona | None | User JWT |
| `POST` | `/v1/auth/forgot-password` | Request password reset email | 3 / 15m / IP | No |
| `POST` | `/v1/auth/reset-password` | Execute password reset with email token | 5 / 15m / IP | No |
| `GET` | `/v1/auth/verify-email` | Confirm email address with token | None | No |
| `POST` | `/v1/auth/resend-verification` | Resend verification email | 2 / 10m / User | User JWT |
| `GET` | `/v1/auth/github/login` | Initiate GitHub OAuth authorization | 10 / min | No |
| `GET` | `/v1/auth/github/callback` | Exchange code for tokens & redirect | 10 / min | No |
| `POST` | `/v1/auth/mfa/setup` | Generate TOTP secret & QR code | 3 / 10m | User JWT |
| `POST` | `/v1/auth/mfa/verify` | Confirm TOTP setup or submit 2FA login code | 5 / min | User/MFA Token |
| `POST` | `/v1/waitlist/institutions` | Submit institutional pilot request | 5 / hour / IP | No |

---

### 6.2 Endpoint Contract Details

#### 1. `POST /v1/auth/signup`
**Request Body:**
```json
{
  "email": "student@university.edu",
  "username": "quantum_alex",
  "displayName": "Alex Chen",
  "password": "CorrectHorseBattery99!",
  "personaTag": "STUDENT"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "usr_9a8b7c6d5e",
    "email": "student@university.edu",
    "username": "quantum_alex",
    "displayName": "Alex Chen",
    "accountType": "INDIVIDUAL",
    "personaTag": "STUDENT",
    "isVerified": false,
    "learnerProfileId": "lp_usr_9a8b7c6d5e"
  },
  "message": "Account created. Soft access granted. Verification email dispatched."
}
```
**Response Headers:**
```http
Set-Cookie: qtrace_access=<jwt>; Path=/; Max-Age=900; HttpOnly; Secure; SameSite=Lax
Set-Cookie: qtrace_refresh=<token>; Path=/v1/auth; Max-Age=604800; HttpOnly; Secure; SameSite=Lax
Set-Cookie: qtrace_csrf=<csrf_token>; Path=/; Max-Age=604800; Secure; SameSite=Lax
```

---

#### 2. `POST /v1/auth/login`
**Request Body:**
```json
{
  "identifier": "quantum_alex",
  "password": "CorrectHorseBattery99!"
}
```
*Note: `identifier` accepts either the registered email or the username.*

**Response (200 OK):**
```json
{
  "user": {
    "id": "usr_9a8b7c6d5e",
    "email": "student@university.edu",
    "username": "quantum_alex",
    "displayName": "Alex Chen",
    "accountType": "INDIVIDUAL",
    "personaTag": "STUDENT",
    "isVerified": false
  },
  "mfaRequired": false
}
```

---

#### 3. `POST /v1/waitlist/institutions`
**Request Body:**
```json
{
  "fullName": "Prof. Marcus Thorne",
  "workEmail": "mthorne@ethz.ch",
  "institutionName": "ETH Zürich - Department of Physics",
  "role": "DEPARTMENT_CHAIR",
  "expectedStudents": 85,
  "notes": "Looking for interactive state-vector tracing for introductory physics."
}
```

**Response (201 Created):**
```json
{
  "status": "WAITLISTED",
  "waitlistPosition": 37,
  "message": "Thank you, Prof. Thorne. Your institutional request has been priority-queued."
}
```

---

## 7. Backend Implementation Architecture (FastAPI)

The backend implementation resides in `apps/api/app/` adhering to the existing modular monolith pattern.

```
apps/api/app/
├── core/
│   ├── auth.py              # PyJWT access/refresh token encoding & decoding
│   ├── password.py          # Argon2id hasher & verifier (argon2-cffi)
│   ├── security.py          # Double-submit CSRF & Origin validation middleware
│   └── rate_limit.py        # Slowapi instance & custom lockout key extractors
├── repositories/
│   ├── user_repo.py         # MongoDB interface for users collection
│   ├── session_repo.py      # Refresh token family management & invalidations
│   └── waitlist_repo.py     # Institutional waitlist persistence
├── services/
│   ├── email_service.py     # Resend client + local terminal print fallback
│   ├── oauth_github.py      # GitHub OAuth 2.0 exchange and user synchronization
│   └── totp_service.py      # PyOTP 2FA generator and backup code validator
└── routers/
    ├── auth.py              # Route handlers for signup, login, refresh, logout
    └── waitlist.py          # Route handler for institutional waitlist submissions
```

### 7.1 Argon2id Password Hashing Engine
The cryptographic hasher is configured according to OWASP recommendations:
- **Algorithm:** Argon2id (Version 19)
- **Time Cost (Iterations):** 3
- **Memory Cost:** 65,536 KiB (64 MiB)
- **Parallelism:** 4 threads
- **Hash Output Length:** 32 bytes
- **Salt Length:** 16 bytes cryptographically random (`os.urandom(16)`)

### 7.2 JWT Token Payload Specification
Access tokens carry strictly non-sensitive identity claims:
```json
{
  "sub": "usr_9a8b7c6d5e",
  "email": "student@university.edu",
  "username": "quantum_alex",
  "role": "INDIVIDUAL",
  "persona": "STUDENT",
  "iss": "qtrace-api",
  "iat": 1790404200,
  "exp": 1790405100
}
```

---

## 8. Frontend UI/UX Design System Specification

The UI matches `docs/DESIGN-SYSTEM.md` (**"Linear Precision Quantum Instrument"**).

### 8.1 Visual Components & Token Mapping
- **Canvas Background:** `--bg-canvas` (`#ffffff` light / `#08090a` dark)
- **Card Containers:** `--bg-surface` (`#f9fafb` light / `#121316` dark) with hairline `--border-default` (`rgba(255,255,255,0.08)` in dark mode).
- **Primary Action Buttons:** High-precision Sky accent (`--accent`: `#0284c7` light / `#38bdf8` dark).
- **Input Fields:** Crisp, monochromatic with focus ring `--border-strong` and subtle background `--bg-surface-raised`.

### 8.2 Form Design & Micro-Interactions
1. **Streamlined Individual Signup:** Form is 100% focused on effortless individual registration (Display Name, Username, Email with standard `alex@gmail.com` placeholder, and Password). Automatically assigns `LEARNER` persona tag in the background, eliminating extraneous questions.
2. **Institutional Coming-Soon Gateway:** A discreet, elevated badge on the auth card header:
   ```
   Create your Q-Trace Account  |  [ For Institutions (Coming Soon) ↗ ]
   ```
   Clicking triggers the Glassmorphism Waitlist Modal (`InstitutionWaitlistModal`) without page navigation.
3. **Soft Verification Banner:**
   - Position: Top-fixed hairline strip below navigation.
   - Tone: Subtle Amber (`--warning-subtle`).
   - Content: *"Verify your email address (alex@gmail.com) to unlock permanent circuit sharing."*
   - CTA: `[ Resend Verification Link ]` with inline confirmation.
4. **Header Navigation Clean-up:**
   - Synthetic demo persona switcher (`RoleSwitcher`) removed from the main header navigation to eliminate confusion with production session state. Authenticated sessions display active user profile with persona badge and sign-out controls.

---

## 9. Security Hardening & Threat Mitigation Matrix

| Threat / Attack Vector | Severity | Mitigation Architecture |
|---|---|---|
| **Credential Stuffing / Password Brute-Force** | **High** | `slowapi` limits login to 5 attempts/minute. 5 consecutive failures trigger an automatic 15-minute account lockout. |
| **XSS Token Theft** | **Critical** | Tokens reside in `HttpOnly` cookies, preventing any client-side JavaScript (`document.cookie`) access. |
| **Cross-Site Request Forgery (CSRF)** | **High** | Dual defense: `SameSite=Lax` browser cookie enforcement + Double-Submit `X-CSRF-Token` header verification on all mutating requests (`POST`, `PUT`, `DELETE`). |
| **Stolen Refresh Token Replay** | **Critical** | Refresh Token Family Rotation. If a previously consumed refresh token is presented, all sessions in that token family are instantly invalidated. |
| **Password Database Breach** | **Critical** | Argon2id memory-hard hashing prevents offline cracking via high-end consumer or cloud GPUs. |
| **User Enumeration / Timing Attacks** | **Medium** | Constant-time password comparison (`hmac.compare_digest`); generic error messages ("Invalid credentials") on login; identical 200 response on forgot-password requests regardless of user existence. |
| **Denial of Service (DoS) via Email Flooding** | **Medium** | Rate limit of 3 forgot-password and 2 verification resends per 15 minutes per IP/User. |

---

## 10. Verification & Smoke Test Plan

To guarantee system stability, the following automated test cases are defined:

1. **Test `test_signup_success`:** Validates creation of individual user, Argon2 password hashing, and issuance of `qtrace_access` and `qtrace_refresh` cookies.
2. **Test `test_login_dual_identifier`:** Confirms login succeeds with both registered email and username.
3. **Test `test_brute_force_lockout`:** Simulates 5 failed login attempts; asserts HTTP 423 Locked on the 6th attempt.
4. **Test `test_refresh_token_rotation`:** Executes token refresh; asserts old refresh token is marked "USED" and cannot be reused.
5. **Test `test_replay_attack_revocation`:** Attempts to reuse a previously rotated refresh token; asserts entire family is revoked and HTTP 401 returned.
6. **Test `test_institutional_waitlist_capture`:** Submits valid institutional lead; verifies document insertion in MongoDB `institution_waitlist`.
7. **Test `test_resend_console_fallback`:** Executes email dispatch with `RESEND_API_KEY=""`; verifies verification URL is formatted and printed to stdout without raising an exception.

---

## 11. Rollout Phases & Roadmap

```mermaid
timeline
    title Authentication Rollout Milestones
    Phase 1 (Current Core) : Individual Sign-up (Email & Username) : GitHub OAuth Integration : Soft Email Verification : Argon2id & Slowapi Lockout : Linear Auth Screens
    Phase 2 (Immediate Follow-up) : Optional TOTP 2FA Settings : Password Reset Flow via Resend : Profile Persona Personalization
    Phase 3 (Institutional Launch) : University SSO & SAML : Multi-Seat Classroom Licenses : Instructor Cohort Dashboard : LMS LTI Integration
```

*(End of Specification)*
