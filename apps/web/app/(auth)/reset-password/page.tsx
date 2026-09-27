'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid recovery token. Please request a new recovery link.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authClient.resetPassword(token, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Recovery link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border-default bg-surface shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="pt-6 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent mb-2">
          <Lock className="h-4 w-4" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-text-primary">
          Choose New Password
        </CardTitle>
        <CardDescription className="text-xs text-text-secondary">
          Enter a strong password of at least 8 characters to secure your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/25 text-danger text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="new-pass" requiredIndicator>
                New Password
              </Label>
              <Input
                id="new-pass"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-pass" requiredIndicator>
                Confirm New Password
              </Label>
              <Input
                id="confirm-pass"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gap-2 h-9 font-medium"
            >
              {isSubmitting ? 'Updating Password...' : 'Save New Password'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-text-primary">Password Updated</h4>
              <p className="text-xs text-text-secondary mt-1">
                Your password has been changed. All active sessions have been invalidated for security.
              </p>
            </div>
            <Button
              onClick={() => router.push('/login')}
              className="w-full gap-2"
            >
              Sign In with New Password
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <React.Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Loading reset form...</div>}>
        <ResetPasswordForm />
      </React.Suspense>
    </motion.div>
  );
}
