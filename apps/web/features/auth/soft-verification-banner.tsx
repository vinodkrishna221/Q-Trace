'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

export function SoftVerificationBanner() {
  const { user, resendVerification } = useAuthStore();
  const [isSending, setIsSending] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  // Only render if user is logged in and not verified
  if (!user || user.isVerified) {
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    setFeedback(null);
    try {
      const msg = await resendVerification();
      setFeedback(msg || 'Verification email sent!');
    } catch {
      setFeedback('Failed to resend. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs px-4 py-2"
        role="alert"
        aria-live="polite"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Please verify your email address (
              <strong className="font-mono">{user.email}</strong>) to unlock
              permanent circuit sharing and state-vector cloud exports.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {feedback ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 font-mono"
              >
                <Check className="w-3 h-3" />
                {feedback}
              </motion.span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isSending}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface border border-amber-500/30 text-amber-900 dark:text-amber-100 hover:bg-surface-raised transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSending && <RefreshCw className="w-3 h-3 animate-spin" />}
                Resend Verification Link
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
