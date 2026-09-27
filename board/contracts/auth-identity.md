# Contract: Authentication & Identity (`auth-identity.md`)

> **Version:** 1.0.0  
> **Status:** Ratified (Decision 16)  
> **Protocol:** REST JSON + HttpOnly Cookies + CSRF Double-Submit  
> **Backend Service:** FastAPI (`apps/api`)  
> **Consumers:** Next.js App Router (`apps/web`)  

---

## 1. Authentication Endpoints

### 1.1 POST `/v1/auth/signup`
Creates an individual learner account.

**Request Body:**
```json
{
  "displayName": "Alex Chen",
  "username": "quantum_alex",
  "email": "alex@gmail.com",
  "password": "SecurePassword123!",
  "personaTag": "LEARNER"
}
```

**Response (HTTP 201 Created):**
```json
{
  "user": {
    "id": "usr_94f830a12e4b",
    "email": "alex@gmail.com",
    "username": "quantum_alex",
    "displayName": "Alex Chen",
    "accountType": "INDIVIDUAL",
    "personaTag": "LEARNER",
    "isVerified": false,
    "avatarUrl": null,
    "learnerProfileId": "lp_usr_94f830a12e4b",
    "mfaEnabled": false,
    "createdAt": "2026-09-27T10:00:00Z"
  },
  "message": "Account created successfully."
}
```
**Cookies Set:**
- `qtrace_access` (HttpOnly, Secure, SameSite=Lax, Max-Age=900)
- `qtrace_refresh` (HttpOnly, Secure, SameSite=Lax, Max-Age=604800)
- `qtrace_csrf` (Secure, SameSite=Lax, Max-Age=604800)

---

### 1.2 POST `/v1/auth/login`
Authenticates via email OR username. Supports brute-force lockout (5 failed attempts -> 15 min lock).

**Request Body:**
```json
{
  "identifier": "quantum_alex",
  "password": "SecurePassword123!"
}
```

**Standard Response (HTTP 200 OK):**
```json
{
  "user": {
    "id": "usr_94f830a12e4b",
    "email": "alex@gmail.com",
    "username": "quantum_alex",
    "displayName": "Alex Chen",
    "accountType": "INDIVIDUAL",
    "personaTag": "LEARNER",
    "isVerified": false,
    "avatarUrl": null,
    "learnerProfileId": "lp_usr_94f830a12e4b",
    "mfaEnabled": false,
    "createdAt": "2026-09-27T10:00:00Z"
  },
  "message": "Login successful."
}
```

**MFA Challenge Response (HTTP 200 OK):**
```json
{
  "mfaRequired": true,
  "mfaSessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Two-factor authentication code required."
}
```

---

### 1.3 POST `/v1/auth/mfa/verify`
Verifies 6-digit TOTP code during login challenge or setup confirmation.

**Request Body:**
```json
{
  "code": "123456",
  "mfaSessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (HTTP 200 OK):**
```json
{
  "user": {
    "id": "usr_94f830a12e4b",
    "email": "alex@gmail.com",
    "username": "quantum_alex",
    "displayName": "Alex Chen",
    "accountType": "INDIVIDUAL",
    "personaTag": "LEARNER",
    "isVerified": false,
    "avatarUrl": null,
    "learnerProfileId": "lp_usr_94f830a12e4b",
    "mfaEnabled": true,
    "createdAt": "2026-09-27T10:00:00Z"
  },
  "message": "2FA verification successful."
}
```

---

### 1.4 POST `/v1/auth/refresh`
Performs atomic refresh token rotation. Revokes token family on replay attack.

**Response (HTTP 200 OK):**
```json
{
  "message": "Tokens successfully refreshed."
}
```

---

### 1.5 GET `/v1/auth/me`
Retrieves currently authenticated session.

**Response (HTTP 200 OK):**
```json
{
  "user": {
    "id": "usr_94f830a12e4b",
    "email": "alex@gmail.com",
    "username": "quantum_alex",
    "displayName": "Alex Chen",
    "accountType": "INDIVIDUAL",
    "personaTag": "LEARNER",
    "isVerified": false,
    "avatarUrl": null,
    "learnerProfileId": "lp_usr_94f830a12e4b",
    "mfaEnabled": false,
    "createdAt": "2026-09-27T10:00:00Z"
  }
}
```

---

### 1.6 POST `/v1/auth/logout`
Clears access, refresh, and CSRF cookies.

**Response (HTTP 200 OK):**
```json
{
  "message": "Logged out successfully."
}
```

---

## 2. Institutional Waitlist Gateway

### 2.1 POST `/v1/waitlist/institution`
Captures institutional pilot leads and returns priority queue ranking.

**Request Body:**
```json
{
  "fullName": "Prof. Marcus Thorne",
  "workEmail": "mthorne@ethz.ch",
  "institutionName": "ETH Zurich",
  "role": "PROFESSOR",
  "expectedStudents": 60,
  "notes": "Fall semester quantum computing course"
}
```

**Response (HTTP 201 Created):**
```json
{
  "status": "PRIORITY_QUEUED",
  "waitlistPosition": 42,
  "message": "Thank you for registering. Your institution has been queued for early access."
}
```

---

## 3. Password Recovery & Email Verification

- `POST /v1/auth/forgot-password`: Generates single-use 15-minute reset token and dispatches email.
- `POST /v1/auth/reset-password`: Consumes reset token and sets Argon2id password hash; revokes all existing refresh tokens.
- `GET /v1/auth/verify-email?token=<token>`: Validates email token; responds with JSON 200 (or 302 redirect for browser URL clicks).
- `POST /v1/auth/resend-verification`: Rate-limited resend of verification token.
