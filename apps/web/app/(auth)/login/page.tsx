'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ArrowRight, ArrowLeft, ShieldAlert, ShieldCheck, KeyRound, Building2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth-store';
import { InstitutionWaitlistModal } from '@/features/auth/institution-waitlist-modal';

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyMfa } = useAuthStore();

  const [step, setStep] = React.useState<'credentials' | 'mfa'>('credentials');
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [mfaCode, setMfaCode] = React.useState('');
  const [mfaSessionToken, setMfaSessionToken] = React.useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = React.useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await login({ identifier, password });
      if (res.mfaRequired) {
        setMfaSessionToken(res.mfaSessionToken || null);
        setStep('mfa');
      } else {
        router.push('/learn/bell-state');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your username/email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const ok = await verifyMfa(mfaCode.trim(), mfaSessionToken || undefined);
      if (ok) {
        router.push('/learn/bell-state');
      } else {
        setErrorMessage('Verification failed. Invalid or expired code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGitHubOAuth = () => {
    setIsGitHubLoading(true);
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    window.location.href = `${apiBase}/v1/auth/github/login?origin=${encodeURIComponent(origin)}`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <Card className="border-border-default bg-surface shadow-lg rounded-2xl overflow-hidden">
          {/* Header Bar with Institutional Switcher Pill */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border-subtle bg-surface-raised/40">
            <span className="text-xs font-semibold text-text-primary tracking-tight">
              Sign In to Q-Trace
            </span>

            {/* Institutional Early Access Pill (docs/AUTH-SYSTEM-DESIGN.md Section 8.2) */}
            <button
              type="button"
              onClick={() => setIsWaitlistOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-text-secondary bg-surface border border-border-default hover:text-accent hover:border-accent transition-all cursor-pointer shadow-2xs"
            >
              <Building2 className="w-3 h-3 text-accent" />
              <span>For Institutions (Coming Soon) ↗</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
              >
                <CardHeader className="pt-5 pb-2">
                  <CardTitle className="text-2xl font-bold tracking-tight text-text-primary">
                    Welcome back
                  </CardTitle>
                  <CardDescription className="text-xs text-text-secondary">
                    Enter your credentials to access your quantum workspace and state traces.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 rounded-lg bg-danger/10 border border-danger/25 text-danger text-xs flex items-start gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-snug">{errorMessage}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="identifier" requiredIndicator>
                        Email or Username
                      </Label>
                      <Input
                        id="identifier"
                        type="text"
                        required
                        autoComplete="username"
                        placeholder="quantum_alex or alex@gmail.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" requiredIndicator>
                          Password
                        </Label>
                        <Link
                          href="/forgot-password"
                          className="text-xs text-accent hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full gap-2 mt-2 h-9 font-medium"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border-subtle" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-surface px-2 text-text-muted">Or continue with</span>
                    </div>
                  </div>

                  {/* 1-Click GitHub OAuth (docs/AUTH-SYSTEM-DESIGN.md Section 4.3) */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGitHubOAuth}
                    disabled={isGitHubLoading}
                    className="w-full gap-2 h-9 text-xs font-medium"
                  >
                    {isGitHubLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    )}
                    <span>{isGitHubLoading ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
                  </Button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-text-secondary">
                      Don&apos;t have an account?{' '}
                      <Link href="/signup" className="text-accent font-semibold hover:underline">
                        Sign up
                      </Link>
                    </span>
                  </div>
                </CardContent>
              </motion.div>
            ) : (
              <motion.div
                key="mfa"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <CardHeader className="pt-5 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent mb-2">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-text-primary">
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription className="text-xs text-text-secondary">
                    Enter the 6-digit verification code from your authenticator app (or an 8-character emergency backup code).
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 rounded-lg bg-danger/10 border border-danger/25 text-danger text-xs flex items-start gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-snug">{errorMessage}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleMfaSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="mfa-code" requiredIndicator>
                        Verification or Backup Code
                      </Label>
                      <Input
                        id="mfa-code"
                        type="text"
                        required
                        autoFocus
                        autoComplete="one-time-code"
                        placeholder="123456"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        className="text-center font-mono text-lg tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-sm h-11"
                        maxLength={9}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || mfaCode.trim().length < 6}
                      className="w-full gap-2 h-9 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isSubmitting ? 'Verifying Code...' : 'Verify & Continue'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('credentials');
                        setErrorMessage(null);
                        setMfaCode('');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer py-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to credentials</span>
                    </button>
                  </form>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <InstitutionWaitlistModal
        open={isWaitlistOpen}
        onOpenChange={setIsWaitlistOpen}
      />
    </>
  );
}
