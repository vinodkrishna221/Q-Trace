'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight, ShieldAlert, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth-store';
import { PersonaTag } from '@/lib/auth-types';
import { InstitutionWaitlistModal } from '@/features/auth/institution-waitlist-modal';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuthStore();

  const [displayName, setDisplayName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const personaTag: PersonaTag = 'LEARNER';

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        displayName,
        username,
        email,
        password,
        personaTag,
      });
      router.push('/learn/bell-state');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGitHubOAuth = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    window.location.href = `${apiBase}/v1/auth/github/login`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg"
      >
        <Card className="border-border-default bg-surface shadow-lg rounded-2xl overflow-hidden">
          {/* Header Bar with Institutional Switcher Pill */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border-subtle bg-surface-raised/40">
            <span className="text-xs font-semibold text-text-primary tracking-tight">
              Create your Q-Trace Account
            </span>

            <button
              type="button"
              onClick={() => setIsWaitlistOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-text-secondary bg-surface border border-border-default hover:text-accent hover:border-accent transition-all cursor-pointer shadow-2xs"
            >
              <Building2 className="w-3 h-3 text-accent" />
              <span>For Institutions (Coming Soon) ↗</span>
            </button>
          </div>

          <CardHeader className="pt-5 pb-3">
            <CardTitle className="text-2xl font-bold tracking-tight text-text-primary">
              Begin your quantum journey
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Zero-install quantum circuit simulation and AI-guided Flight Recorder diagnostics.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="displayName" requiredIndicator>
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    required
                    placeholder="Alex Chen"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="username" requiredIndicator>
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="quantum_alex"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" requiredIndicator>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="alex@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" requiredIndicator>
                  Password (min 8 characters)
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
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
                <UserPlus className="w-3.5 h-3.5" />
                {isSubmitting ? 'Creating account...' : 'Create Account'}
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

            {/* 1-Click GitHub OAuth */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGitHubOAuth}
              className="w-full gap-2 h-9 text-xs font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continue with GitHub
            </Button>

            <div className="text-center pt-2">
              <span className="text-xs text-text-secondary">
                Already registered?{' '}
                <Link href="/login" className="text-accent font-semibold hover:underline">
                  Sign in
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <InstitutionWaitlistModal
        open={isWaitlistOpen}
        onOpenChange={setIsWaitlistOpen}
      />
    </>
  );
}
