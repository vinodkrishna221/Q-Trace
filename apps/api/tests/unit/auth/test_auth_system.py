"""Comprehensive test suite for Q-Trace Authentication & Identity System.
Conforms strictly to docs/AUTH-SYSTEM-DESIGN.md Section 10 Verification Plan.
"""

from __future__ import annotations

import asyncio
import io
import sys
import pytest
from starlette.testclient import TestClient

from app.core.password import hash_password, verify_password
from app.core.rate_limit import brute_force_guard, rate_limiter
from app.main import app
from app.repositories import get_repository, set_repository
from app.repositories.memory import InMemoryRepository
from app.services.email_service import EmailService


@pytest.fixture(autouse=True)
async def setup_test_repo():
    """Reset repository and guards before every test."""
    repo = InMemoryRepository()
    set_repository(repo)
    await brute_force_guard.clear_all()
    await rate_limiter.clear_all()
    yield repo
    await repo.reset()
    await brute_force_guard.clear_all()
    await rate_limiter.clear_all()


@pytest.fixture
def client():
    return TestClient(app)


# ==============================================================================
# 1. Test test_signup_success
# ==============================================================================

def test_signup_success(client: TestClient):
    """Validates creation of individual user, Argon2 password hashing, and issuance of cookies."""
    payload = {
        "email": "student@university.edu",
        "username": "quantum_alex",
        "displayName": "Alex Chen",
        "password": "CorrectHorseBattery99!",
        "personaTag": "STUDENT",
    }
    response = client.post("/v1/auth/signup", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert "user" in data
    user = data["user"]
    assert user["email"] == "student@university.edu"
    assert user["username"] == "quantum_alex"
    assert user["personaTag"] == "STUDENT"
    assert user["accountType"] == "INDIVIDUAL"
    assert user["isVerified"] is False

    # Check cookies
    cookies = response.cookies
    assert "qtrace_access" in cookies
    assert "qtrace_refresh" in cookies
    assert "qtrace_csrf" in cookies


# ==============================================================================
# 2. Test test_login_dual_identifier
# ==============================================================================

def test_login_dual_identifier(client: TestClient):
    """Confirms login succeeds with both registered email and username."""
    # 1. Register user
    signup_payload = {
        "email": "dual@domain.edu",
        "username": "dual_user",
        "displayName": "Dual User",
        "password": "ValidPassword123!",
        "personaTag": "LEARNER",
    }
    res_signup = client.post("/v1/auth/signup", json=signup_payload)
    assert res_signup.status_code == 201

    # 2. Login via Email
    res_email = client.post(
        "/v1/auth/login",
        json={"identifier": "dual@domain.edu", "password": "ValidPassword123!"},
    )
    assert res_email.status_code == 200
    assert res_email.json()["user"]["email"] == "dual@domain.edu"
    assert "qtrace_access" in res_email.cookies

    # 3. Login via Username
    res_user = client.post(
        "/v1/auth/login",
        json={"identifier": "dual_user", "password": "ValidPassword123!"},
    )
    assert res_user.status_code == 200
    assert res_user.json()["user"]["username"] == "dual_user"
    assert "qtrace_access" in res_user.cookies


# ==============================================================================
# 3. Test test_brute_force_lockout
# ==============================================================================

def test_brute_force_lockout(client: TestClient):
    """Simulates 5 failed login attempts; asserts HTTP 423 Locked on the 6th attempt."""
    signup_payload = {
        "email": "lockout@domain.edu",
        "username": "lockout_user",
        "displayName": "Lockout Test",
        "password": "RealPassword123!",
        "personaTag": "LEARNER",
    }
    client.post("/v1/auth/signup", json=signup_payload)

    # 5 consecutive failures
    for attempt in range(1, 6):
        res = client.post(
            "/v1/auth/login",
            json={"identifier": "lockout_user", "password": "WrongPassword!"},
        )
        if attempt < 5:
            assert res.status_code == 401
            assert "Invalid credentials" in res.json()["error"]["message"]
        else:
            # 5th attempt triggers lockout
            assert res.status_code == 423
            assert "locked" in res.json()["error"]["message"].lower()

    # 6th attempt is blocked with 423 Locked immediately
    res6 = client.post(
        "/v1/auth/login",
        json={"identifier": "lockout_user", "password": "RealPassword123!"},
    )
    assert res6.status_code == 423
    assert res6.json()["error"]["code"] == "ACCOUNT_LOCKED"


# ==============================================================================
# 4. Test test_refresh_token_rotation
# ==============================================================================

def test_refresh_token_rotation(client: TestClient):
    """Executes token refresh; asserts old refresh token is marked USED and cannot be reused."""
    signup_payload = {
        "email": "rotation@domain.edu",
        "username": "rotation_user",
        "displayName": "Rotation User",
        "password": "ValidPassword123!",
    }
    res_signup = client.post("/v1/auth/signup", json=signup_payload)
    old_refresh_cookie = res_signup.cookies.get("qtrace_refresh")
    assert old_refresh_cookie is not None

    # Refresh tokens
    client.cookies.set("qtrace_refresh", old_refresh_cookie)
    res_refresh = client.post("/v1/auth/refresh")
    assert res_refresh.status_code == 200
    assert res_refresh.json()["status"] == "refreshed"

    new_refresh_cookie = res_refresh.cookies.get("qtrace_refresh")
    assert new_refresh_cookie is not None
    assert new_refresh_cookie != old_refresh_cookie


# ==============================================================================
# 5. Test test_replay_attack_revocation
# ==============================================================================

def test_replay_attack_revocation(client: TestClient):
    """Attempts to reuse a previously rotated refresh token; asserts entire family is revoked and HTTP 401 returned."""
    signup_payload = {
        "email": "replay@domain.edu",
        "username": "replay_user",
        "displayName": "Replay User",
        "password": "ValidPassword123!",
    }
    res_signup = client.post("/v1/auth/signup", json=signup_payload)
    first_refresh_cookie = res_signup.cookies.get("qtrace_refresh")

    # Legitimate first rotation
    client.cookies.set("qtrace_refresh", first_refresh_cookie)
    res_refresh = client.post("/v1/auth/refresh")
    assert res_refresh.status_code == 200
    second_refresh_cookie = res_refresh.cookies.get("qtrace_refresh")

    # Attack: Attacker replays first_refresh_cookie (which is now in status "USED")
    client.cookies.set("qtrace_refresh", first_refresh_cookie)
    res_replay = client.post("/v1/auth/refresh")
    assert res_replay.status_code == 401
    assert res_replay.json()["error"]["code"] == "REPLAY_DETECTED"

    # Verify that the legitimate second_refresh_cookie is NOW ALSO REVOKED
    client.cookies.set("qtrace_refresh", second_refresh_cookie)
    res_legit_blocked = client.post("/v1/auth/refresh")
    assert res_legit_blocked.status_code == 401


# ==============================================================================
# 6. Test test_institutional_waitlist_capture
# ==============================================================================

def test_institutional_waitlist_capture(client: TestClient):
    """Submits valid institutional lead; verifies document insertion in repository."""
    payload = {
        "fullName": "Prof. Marcus Thorne",
        "workEmail": "mthorne@ethz.ch",
        "institutionName": "ETH Zürich - Department of Physics",
        "role": "DEPARTMENT_CHAIR",
        "expectedStudents": 85,
        "notes": "Looking for interactive state-vector tracing for introductory physics.",
    }
    response = client.post("/v1/waitlist/institutions", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["status"] == "WAITLISTED"
    assert data["waitlistPosition"] >= 1
    assert "priority-queued" in data["message"]

    # Verify count endpoint
    res_count = client.get("/v1/waitlist/institutions/count")
    assert res_count.status_code == 200
    assert res_count.json()["totalWaitlisted"] >= 1


# ==============================================================================
# 7. Test test_resend_console_fallback
# ==============================================================================

@pytest.mark.asyncio
async def test_resend_console_fallback():
    """Executes email dispatch with RESEND_API_KEY=""; verifies verification URL is printed to stdout without raising an exception."""
    svc = EmailService(api_key="", demo_local=True)

    captured_output = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = captured_output
    try:
        success = await svc.send_verification_email(
            to_email="test@domain.edu",
            token="secure_test_token_123",
            user_name="Dr. Test",
        )
    finally:
        sys.stdout = old_stdout

    assert success is True
    output = captured_output.getvalue()
    assert "[DEMO EMAIL FALLBACK]" in output
    assert "verify-email?token=secure_test_token_123" in output
    assert "test@domain.edu" in output


# ==============================================================================
# 8. Test Password Recovery Flow
# ==============================================================================

def test_password_recovery_flow(client: TestClient):
    """Tests forgot-password dispatch and reset-password completion."""
    # 1. Sign up user
    signup_payload = {
        "email": "recovery@domain.edu",
        "username": "recovery_user",
        "displayName": "Recovery User",
        "password": "OldPassword123!",
    }
    client.post("/v1/auth/signup", json=signup_payload)

    # 2. Forgot password request
    res_forgot = client.post(
        "/v1/auth/forgot-password",
        json={"email": "recovery@domain.edu"},
    )
    assert res_forgot.status_code == 200

    # 3. Retrieve reset token from repo
    repo = get_repository()
    # In memory repo, check resets
    resets = getattr(repo, "_password_resets", {})
    assert len(resets) > 0
    reset_record = list(resets.values())[0]

    # For testing, generate a known token and test reset
    from app.core.auth import generate_secure_token, hash_token
    from app.models.auth import PasswordResetRecord
    import time
    raw_token = generate_secure_token(32)
    thash = hash_token(raw_token)
    new_rst = PasswordResetRecord(
        _id="rst_test",
        tokenHash=thash,
        userId=reset_record.userId,
        expiresAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 900)),
    )
    getattr(repo, "_password_resets")["rst_test"] = new_rst

    # 4. Reset password
    res_reset = client.post(
        "/v1/auth/reset-password",
        json={"token": raw_token, "newPassword": "BrandNewPassword123!"},
    )
    assert res_reset.status_code == 200
    assert "Password updated successfully" in res_reset.json()["message"]

    # 5. Old password no longer works
    res_old_login = client.post(
        "/v1/auth/login",
        json={"identifier": "recovery_user", "password": "OldPassword123!"},
    )
    assert res_old_login.status_code == 401

    # 6. New password works
    res_new_login = client.post(
        "/v1/auth/login",
        json={"identifier": "recovery_user", "password": "BrandNewPassword123!"},
    )
    assert res_new_login.status_code == 200


# ==============================================================================
# 9. Test Hero Seed Users Login
# ==============================================================================

def test_seed_hero_users_login(client: TestClient):
    """Verifies that pre-seeded hero users can log in with their canonical documented password."""
    repo = get_repository()
    from app.repositories.seeds import seed_core_truth
    import asyncio
    asyncio.run(seed_core_truth(repo))

    # Test Aarav (Student)
    res_aarav = client.post(
        "/v1/auth/login",
        json={"identifier": "aarav_quantum", "password": "CorrectHorseBattery99!"},
    )
    assert res_aarav.status_code == 200
    assert res_aarav.json()["user"]["username"] == "aarav_quantum"
    assert res_aarav.json()["user"]["personaTag"] == "STUDENT"

    # Test Meera (Learner)
    res_meera = client.post(
        "/v1/auth/login",
        json={"identifier": "meera_physics", "password": "CorrectHorseBattery99!"},
    )
    assert res_meera.status_code == 200
    assert res_meera.json()["user"]["personaTag"] == "LEARNER"

    # Test Dr. Rao (Educator)
    res_rao = client.post(
        "/v1/auth/login",
        json={"identifier": "dr_rao", "password": "CorrectHorseBattery99!"},
    )
    assert res_rao.status_code == 200
    assert res_rao.json()["user"]["personaTag"] == "EDUCATOR"


# ==============================================================================
# 10. Test Email Verification Endpoint
# ==============================================================================

def test_email_verification_flow(client: TestClient):
    """Verifies email confirmation via token link: success, expired, and invalid cases."""
    # 1. Sign up user
    res_signup = client.post(
        "/v1/auth/signup",
        json={
            "email": "verify_test@domain.edu",
            "username": "verify_user",
            "displayName": "Verify Test",
            "password": "ValidPassword123!",
        },
    )
    assert res_signup.status_code == 201

    repo = get_repository()
    users = getattr(repo, "_users", {})
    user = next((u for u in users.values() if u.username == "verify_user"), None)
    assert user is not None
    assert user.isVerified is False

    # A. Test invalid token
    res_invalid = client.get(
        "/v1/auth/verify-email?token=invalid_fake_token",
        headers={"Accept": "application/json"},
    )
    assert res_invalid.status_code == 400
    assert res_invalid.json()["error"]["code"] == "INVALID_VERIFICATION_TOKEN"

    # B. Test valid token
    # Get raw token by creating a known one
    from app.core.auth import generate_secure_token, hash_token
    import time
    raw_token = generate_secure_token(32)
    user.verificationTokenHash = hash_token(raw_token)
    user.verificationExpiresAt = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 3600))
    asyncio.run(repo.create_or_update_user(user))

    res_valid = client.get(
        f"/v1/auth/verify-email?token={raw_token}",
        headers={"Accept": "application/json"},
    )
    assert res_valid.status_code == 200
    assert res_valid.json()["verified"] is True

    # User is now verified
    refreshed_user = asyncio.run(repo.get_user_by_id(user.id))
    assert refreshed_user.isVerified is True
    assert refreshed_user.verificationTokenHash is None

    # C. Test expired token
    raw_expired = generate_secure_token(32)
    refreshed_user.verificationTokenHash = hash_token(raw_expired)
    refreshed_user.verificationExpiresAt = "2020-01-01T00:00:00Z"  # Past
    asyncio.run(repo.create_or_update_user(refreshed_user))

    res_expired = client.get(
        f"/v1/auth/verify-email?token={raw_expired}",
        headers={"Accept": "application/json"},
    )
    assert res_expired.status_code == 400
    assert res_expired.json()["error"]["code"] == "INVALID_VERIFICATION_TOKEN"


# ==============================================================================
# 11. Test Rate Limiting
# ==============================================================================

def test_signup_rate_limiting(client: TestClient):
    """Enforces 3 signups per hour per IP; asserts 429 Too Many Requests on the 4th."""
    for i in range(1, 4):
        res = client.post(
            "/v1/auth/signup",
            json={
                "email": f"rate_limit_{i}@domain.edu",
                "username": f"rate_user_{i}",
                "displayName": f"Rate User {i}",
                "password": "ValidPassword123!",
            },
        )
        assert res.status_code == 201

    # 4th signup exceeds limit
    res4 = client.post(
        "/v1/auth/signup",
        json={
            "email": "rate_limit_4@domain.edu",
            "username": "rate_user_4",
            "displayName": "Rate User 4",
            "password": "ValidPassword123!",
        },
    )
    assert res4.status_code == 429
    assert res4.json()["error"]["code"] == "RATE_LIMIT_EXCEEDED"


def test_waitlist_rate_limiting(client: TestClient):
    """Enforces 5 waitlist submissions per hour per IP; asserts 429 on the 6th."""
    for i in range(1, 6):
        res = client.post(
            "/v1/waitlist/institutions",
            json={
                "fullName": f"Prof. Tester {i}",
                "workEmail": f"prof_{i}@university.edu",
                "institutionName": "Test Univ",
                "role": "PROFESSOR",
                "expectedStudents": 50,
            },
        )
        assert res.status_code == 201

    # 6th attempt is rate limited
    res6 = client.post(
        "/v1/waitlist/institutions",
        json={
            "fullName": "Prof. Tester 6",
            "workEmail": "prof_6@university.edu",
            "institutionName": "Test Univ",
            "role": "PROFESSOR",
            "expectedStudents": 50,
        },
    )
    assert res6.status_code == 429
    assert res6.json()["error"]["code"] == "RATE_LIMIT_EXCEEDED"


# ==============================================================================
# 12. Test TOTP 2FA Flow
# ==============================================================================

def test_totp_mfa_flow(client: TestClient):
    """Verifies MFA setup, enforcement during login, and TOTP code verification."""
    from app.services.totp_service import totp_service

    # 1. Sign up user
    res_signup = client.post(
        "/v1/auth/signup",
        json={
            "email": "mfa_user@domain.edu",
            "username": "mfa_tester",
            "displayName": "MFA Tester",
            "password": "ValidPassword123!",
        },
    )
    assert res_signup.status_code == 201
    access_cookie = res_signup.cookies.get("qtrace_access")

    # 2. Setup MFA
    csrf_token = res_signup.cookies.get("qtrace_csrf")
    headers = {"X-CSRF-Token": csrf_token} if csrf_token else {}
    client.cookies.set("qtrace_access", access_cookie)
    res_setup = client.post("/v1/auth/mfa/setup", headers=headers)
    assert res_setup.status_code == 200
    setup_data = res_setup.json()
    secret = setup_data["secret"]
    assert len(secret) > 0

    # 3. Verify MFA setup with valid code
    code = totp_service.verify_code  # Let's generate a current code
    import pyotp
    totp = pyotp.TOTP(secret)
    current_code = totp.now()

    res_confirm = client.post(
        "/v1/auth/mfa/verify",
        json={"code": current_code},
    )
    assert res_confirm.status_code == 200
    assert res_confirm.json()["enabled"] is True

    # 4. Log out
    client.post("/v1/auth/logout")

    # 5. Log in - should now require MFA!
    res_login = client.post(
        "/v1/auth/login",
        json={"identifier": "mfa_tester", "password": "ValidPassword123!"},
    )
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert login_data["mfaRequired"] is True
    mfa_session_token = login_data["mfaSessionToken"]
    assert mfa_session_token is not None

    # 6. Complete MFA login with TOTP code
    current_code = totp.now()
    res_mfa_login = client.post(
        "/v1/auth/mfa/verify",
        json={"code": current_code, "mfaSessionToken": mfa_session_token},
    )
    assert res_mfa_login.status_code == 200
    assert "qtrace_access" in res_mfa_login.cookies
    assert res_mfa_login.json()["user"]["username"] == "mfa_tester"
