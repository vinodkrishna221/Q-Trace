'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authClient.forgotPassword(email);
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch recovery email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <Card className="border-border-default bg-surface shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="pt-6 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent mb-2">
            <KeyRound className="h-4 w-4" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-text-primary">
            Reset Password
          </CardTitle>
          <CardDescription className="text-xs text-text-secondary">
            Enter your registered email address and we will dispatch a single-use recovery link.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/25 text-danger text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" requiredIndicator>
                  Account Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="alex@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 h-9 font-medium"
              >
                {isSubmitting ? 'Dispatching Link...' : 'Send Recovery Link'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                If an account exists with <strong className="font-mono text-text-primary">{email}</strong>,
                we have dispatched a 15-minute recovery link. Please check your inbox.
              </p>
            </div>
          )}

          <div className="text-center pt-2 border-t border-border-subtle">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
