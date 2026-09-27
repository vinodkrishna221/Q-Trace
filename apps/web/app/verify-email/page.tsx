'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth-store';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = React.useState<'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'error'
  );
  const [message, setMessage] = React.useState<string>('');
  const checkSession = useAuthStore((s) => s.checkSession);

  React.useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in URL.');
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    fetch(`${apiBase}/v1/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    })
      .then(async (res) => {
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          // ignore
        }

        if (res.ok && data?.verified) {
          setStatus('success');
          setMessage(data.message || 'Your email address has been verified! Full circuit cloud sharing is now active.');
          checkSession();
        } else {
          setStatus('error');
          setMessage(data?.error?.message || 'Verification link has expired or has already been used.');
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Failed to verify email. Please request a new verification link.');
      });
  }, [token, checkSession]);

  return (
    <Card className="border-border-default bg-surface shadow-lg rounded-2xl overflow-hidden max-w-md w-full">
      <CardHeader className="pt-6 pb-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-2">
          {status === 'verifying' && <RefreshCw className="h-6 w-6 text-accent animate-spin" />}
          {status === 'success' && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          )}
          {status === 'error' && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
              <ShieldAlert className="h-6 w-6" />
            </div>
          )}
        </div>

        <CardTitle className="text-xl font-bold tracking-tight text-text-primary">
          {status === 'verifying' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified'}
          {status === 'error' && 'Verification Issue'}
        </CardTitle>
        <CardDescription className="text-xs text-text-secondary">
          {message}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 text-center">
        {status === 'success' && (
          <Button onClick={() => router.push('/learn/bell-state')} className="w-full gap-2">
            Proceed to Quantum Workspace
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}

        {status === 'error' && (
          <Button onClick={() => router.push('/learn/bell-state')} variant="outline" className="w-full">
            Return to Workspace
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

import { QTraceLogo } from '@/components/ui/q-trace-logo';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-canvas text-text-primary selection:bg-accent/20">
      {/* Top Brand Bar */}
      <header className="w-full flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <QTraceLogo variant="full" size="sm" showSubtext={false} />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <React.Suspense fallback={<div className="text-xs text-text-muted">Loading...</div>}>
          <VerifyEmailContent />
        </React.Suspense>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-text-muted border-t border-border-subtle">
        <p>Mathematical representation, not physical trajectory. · Linear Precision Quantum Instrument</p>
      </footer>
    </div>
  );
}
