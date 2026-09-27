"""Email dispatcher service with Resend integration and local console fallback.
Conforms to docs/AUTH-SYSTEM-DESIGN.md Section 1, 4.1, 4.5, and test_resend_console_fallback.
"""

from __future__ import annotations

import logging
import os
import httpx

logger = logging.getLogger("qtrace.services.email")

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
DEMO_LOCAL = os.getenv("DEMO_LOCAL", "1") == "1"
APP_URL = os.getenv("APP_URL", "http://localhost:3000")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "Q-Trace <onboarding@resend.dev>")


class EmailService:
    """Dispatches transactional emails via Resend or logs to console when running locally."""

    def __init__(self, api_key: str = RESEND_API_KEY, demo_local: bool = DEMO_LOCAL) -> None:
        self.api_key = api_key
        self.demo_local = demo_local

    async def _send(self, to_email: str, subject: str, html_content: str, text_content: str) -> bool:
        if not self.api_key or self.demo_local:
            # Automatic local console fallback
            print(f"\n[DEMO EMAIL FALLBACK] To: {to_email} | Subject: {subject}")
            print(f"[DEMO EMAIL BODY]\n{text_content}\n" + "=" * 50)
            logger.info("Local demo email logged for %s: %s", to_email, subject)
            return True

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "from": SENDER_EMAIL,
                        "to": [to_email],
                        "subject": subject,
                        "html": html_content,
                        "text": text_content,
                    },
                )
                if res.is_success:
                    logger.info("Dispatched transactional email to %s (id: %s)", to_email, res.json().get("id"))
                    return True
                else:
                    logger.warning("Resend API rejected dispatch to %s: %s", to_email, res.text)
                    return False
        except Exception as exc:
            logger.error("Failed to send transactional email to %s: %s", to_email, exc)
            return False

    async def send_verification_email(self, to_email: str, token: str, user_name: str) -> bool:
        """Send 24-hr email verification link."""
        verify_url = f"{APP_URL}/verify-email?token={token}"
        subject = "Verify your Q-Trace Quantum Learning Account"
        text = (
            f"Hello {user_name},\n\n"
            f"Welcome to Q-Trace! Please verify your email address to unlock persistent circuit sharing:\n"
            f"{verify_url}\n\n"
            f"This link will expire in 24 hours.\n\n"
            f"— The Q-Trace Quantum Architecture Team"
        )
        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #0b0a43; margin-top: 0;">Welcome to Q-Trace</h2>
            <p style="color: #31306b; font-size: 14px; line-height: 1.6;">Hello <strong>{user_name}</strong>,</p>
            <p style="color: #31306b; font-size: 14px; line-height: 1.6;">Please confirm your email address to enable state-vector circuit sharing and live session exports.</p>
            <div style="margin: 24px 0;">
                <a href="{verify_url}" style="background-color: #2a2882; color: #ffffff; padding: 10px 20px; border-radius: 9999px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #5a5895; font-size: 12px;">Or copy and paste this URL into your browser:<br/><a href="{verify_url}" style="color: #2a2882;">{verify_url}</a></p>
        </div>
        """
        return await self._send(to_email, subject, html, text)

    async def send_password_reset_email(self, to_email: str, token: str) -> bool:
        """Send 15-min single-use password recovery email."""
        reset_url = f"{APP_URL}/reset-password?token={token}"
        subject = "Reset your Q-Trace Password"
        text = (
            f"Hello,\n\n"
            f"A password reset request was initiated for your Q-Trace account.\n"
            f"Click the link below to set a new password:\n"
            f"{reset_url}\n\n"
            f"This link is single-use and will expire in 15 minutes.\n"
            f"If you did not request this, you can safely ignore this message.\n\n"
            f"— The Q-Trace Security Team"
        )
        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #0b0a43; margin-top: 0;">Q-Trace Password Recovery</h2>
            <p style="color: #31306b; font-size: 14px; line-height: 1.6;">Click below to reset your password. This link expires in 15 minutes.</p>
            <div style="margin: 24px 0;">
                <a href="{reset_url}" style="background-color: #2a2882; color: #ffffff; padding: 10px 20px; border-radius: 9999px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #5a5895; font-size: 12px;">Link: <a href="{reset_url}" style="color: #2a2882;">{reset_url}</a></p>
        </div>
        """
        return await self._send(to_email, subject, html, text)

    async def send_waitlist_confirmation(self, to_email: str, full_name: str, position: int) -> bool:
        """Send institutional early-access waitlist priority confirmation."""
        subject = f"Q-Trace Institutional Pilot: You are #{position} on the Priority Waitlist"
        text = (
            f"Dear {full_name},\n\n"
            f"Thank you for requesting early access to the Q-Trace Institutional Classroom Platform.\n"
            f"Your request has been queued at position #{position}.\n\n"
            f"Our educational architecture team will review your cohort requirements and follow up with pilot provisioning details.\n\n"
            f"— Q-Trace Academic Partnerships"
        )
        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #0b0a43; margin-top: 0;">Institutional Early Access Queued</h2>
            <p style="color: #31306b; font-size: 14px;">Dear <strong>{full_name}</strong>,</p>
            <p style="color: #31306b; font-size: 14px;">You are confirmed at <strong>#{position}</strong> on our priority classroom pilot list.</p>
            <p style="color: #5a5895; font-size: 12px;">We will contact you shortly with instructor dashboard provisioning.</p>
        </div>
        """
        return await self._send(to_email, subject, html, text)


email_service = EmailService()
