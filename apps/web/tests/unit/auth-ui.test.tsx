import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import SignupPage from '@/app/(auth)/signup/page';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import ResetPasswordPage from '@/app/(auth)/reset-password/page';
import { SoftVerificationBanner } from '@/features/auth/soft-verification-banner';
import { InstitutionWaitlistModal } from '@/features/auth/institution-waitlist-modal';
import { useAuthStore } from '@/lib/auth-store';
import { authClient } from '@/lib/auth-client';

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/login',
}));

describe('Authentication & Identity UI Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    useAuthStore.setState({
      user: null,
      isLoading: false,
      error: null,
    });
  });

  it('renders login page with Linear precision elements and Institutional Coming Soon badge', () => {
    render(<LoginPage />);

    expect(screen.getByText('Sign In to Q-Trace')).toBeDefined();
    expect(screen.getByText('Welcome back')).toBeDefined();
    expect(screen.getByLabelText(/Email or Username/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeDefined();
    expect(screen.getByText(/Continue with GitHub/i)).toBeDefined();

    // Institutional Early Access Pill
    const instBtn = screen.getByText(/For Institutions \(Coming Soon\)/i);
    expect(instBtn).toBeDefined();
  });

  it('opens Institutional Waitlist Modal when clicking the Coming Soon pill', () => {
    render(<LoginPage />);

    const instBtn = screen.getByText(/For Institutions \(Coming Soon\)/i);
    fireEvent.click(instBtn);

    expect(screen.getByText(/Institutional Classrooms & University Cohorts/i)).toBeDefined();
    expect(screen.getByLabelText(/Academic \/ Work Email/i)).toBeDefined();
  });

  it('submits Institutional Waitlist and displays priority queue position', async () => {
    const handleClose = vi.fn();
    render(<InstitutionWaitlistModal open={true} onOpenChange={handleClose} />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Prof. Marcus Thorne' },
    });
    fireEvent.change(screen.getByLabelText(/Academic \/ Work Email/i), {
      target: { value: 'mthorne@ethz.ch' },
    });
    fireEvent.change(screen.getByLabelText(/Institution or University/i), {
      target: { value: 'ETH Zurich' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Join Institutional Pilot/i }));

    await waitFor(() => {
      expect(screen.getByText(/Priority Pilot Queued/i)).toBeDefined();
    });
  });

  it('renders individual signup page with clean form fields and password validation', () => {
    render(<SignupPage />);

    expect(screen.getByText(/Create your Q-Trace Account/i)).toBeDefined();
    expect(screen.getByLabelText(/Display Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Username/i)).toBeDefined();
    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByPlaceholderText('alex@gmail.com')).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeDefined();
  });

  it('transitions to 2FA TOTP verification view and completes login on valid code', async () => {
    // Mock login returning MFA requirement
    const loginSpy = vi.spyOn(useAuthStore.getState(), 'login').mockResolvedValueOnce({
      success: false,
      mfaRequired: true,
      mfaSessionToken: 'sess_mfa_token_xyz',
    });
    const verifySpy = vi.spyOn(useAuthStore.getState(), 'verifyMfa').mockResolvedValueOnce(true);

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email or Username/i), {
      target: { value: 'mfa_user' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'ValidPassword123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Two-Factor Authentication/i)).toBeDefined();
    });

    // Enter 6-digit TOTP code
    const codeInput = screen.getByLabelText(/Verification or Backup Code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify & Continue/i }));

    await waitFor(() => {
      expect(verifySpy).toHaveBeenCalledWith('123456', 'sess_mfa_token_xyz');
      expect(mockPush).toHaveBeenCalledWith('/learn/bell-state');
    });
  });

  it('allows returning from 2FA prompt back to credentials form', async () => {
    vi.spyOn(useAuthStore.getState(), 'login').mockResolvedValueOnce({
      success: false,
      mfaRequired: true,
      mfaSessionToken: 'sess_mfa_token_xyz',
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email or Username/i), {
      target: { value: 'mfa_user' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'ValidPassword123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Two-Factor Authentication/i)).toBeDefined();
    });

    // Click back to credentials
    fireEvent.click(screen.getByText(/Back to credentials/i));

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeDefined();
      expect(screen.getByLabelText(/Email or Username/i)).toBeDefined();
    });
  });

  it('renders Forgot Password page and handles link dispatch', async () => {
    vi.spyOn(authClient, 'forgotPassword').mockResolvedValueOnce({
      message: 'Reset link dispatched',
    });

    render(<ForgotPasswordPage />);

    expect(screen.getByText('Reset Password')).toBeDefined();
    fireEvent.change(screen.getByLabelText(/Account Email Address/i), {
      target: { value: 'aarav@university.edu' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Link/i }));

    await waitFor(() => {
      expect(screen.getByText(/If an account exists with/i)).toBeDefined();
    });
  });

  it('renders Reset Password page and enforces password confirmation match', async () => {
    mockSearchParams = new URLSearchParams('token=valid_reset_token_123');

    render(<ResetPasswordPage />);

    expect(screen.getByText('Choose New Password')).toBeDefined();

    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm New Password/i), {
      target: { value: 'MismatchPassword123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save New Password/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeDefined();
    });
  });

  it('submits Reset Password form successfully with valid matching password', async () => {
    mockSearchParams = new URLSearchParams('token=valid_reset_token_123');
    const resetSpy = vi.spyOn(authClient, 'resetPassword').mockResolvedValueOnce({
      message: 'Password updated successfully.',
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'NewSecretPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm New Password/i), {
      target: { value: 'NewSecretPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save New Password/i }));

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledWith('valid_reset_token_123', 'NewSecretPass123!');
      expect(screen.getByText('Password Updated')).toBeDefined();
    });
  });

  it('renders Soft Email Verification Banner when authenticated user is not verified', () => {
    useAuthStore.setState({
      user: {
        id: 'usr_test',
        email: 'student@mit.edu',
        username: 'test_student',
        displayName: 'Test Student',
        accountType: 'INDIVIDUAL',
        personaTag: 'STUDENT',
        isVerified: false,
      },
      isLoading: false,
      error: null,
    });

    render(<SoftVerificationBanner />);

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(/student@mit.edu/i)).toBeDefined();
    expect(screen.getByText(/Resend Verification Link/i)).toBeDefined();
  });

  it('hides Soft Email Verification Banner when user is verified', () => {
    useAuthStore.setState({
      user: {
        id: 'usr_test',
        email: 'verified@mit.edu',
        username: 'verified_student',
        displayName: 'Verified Student',
        accountType: 'INDIVIDUAL',
        personaTag: 'STUDENT',
        isVerified: true,
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(<SoftVerificationBanner />);
    expect(container.firstChild).toBeNull();
  });
});
