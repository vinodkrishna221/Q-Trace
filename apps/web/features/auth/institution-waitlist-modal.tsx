'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Sparkles,
  Users,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { authClient } from '@/lib/auth-client';
import { InstitutionWaitlistResponse } from '@/lib/auth-types';

interface InstitutionWaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstitutionWaitlistModal({
  open,
  onOpenChange,
}: InstitutionWaitlistModalProps) {
  const [fullName, setFullName] = React.useState('');
  const [workEmail, setWorkEmail] = React.useState('');
  const [institutionName, setInstitutionName] = React.useState('');
  const [role, setRole] = React.useState('PROFESSOR');
  const [expectedStudents, setExpectedStudents] = React.useState(60);
  const [notes, setNotes] = React.useState('');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successResult, setSuccessResult] =
    React.useState<InstitutionWaitlistResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await authClient.submitWaitlist({
        fullName,
        workEmail,
        institutionName,
        role,
        expectedStudents: Number(expectedStudents) || 50,
        notes: notes.trim() || undefined,
      });
      setSuccessResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to submit waitlist request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog exit animation
    setTimeout(() => {
      setSuccessResult(null);
      setError(null);
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose} className="max-w-xl">
        <AnimatePresence mode="wait">
          {!successResult ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider text-accent border-accent/30">
                    Early Access Pilot
                  </Badge>
                </div>
                <DialogTitle>Institutional Classrooms & University Cohorts</DialogTitle>
                <DialogDescription>
                  Q-Trace multi-seat classroom accounts provide centralized grading, Flight
                  Recorder cohort telemetry, and LMS integration for quantum physics and CSE courses.
                </DialogDescription>
              </DialogHeader>

              {/* Feature Roadmap Teaser */}
              <div className="mb-5 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-raised border border-border-subtle">
                  <Users className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-text-secondary">Cohort Misconception Clustering</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-raised border border-border-subtle">
                  <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-text-secondary">Canvas & Blackboard LTI Sync</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-2.5 rounded-lg bg-danger/10 border border-danger/25 text-danger text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="inst-name" requiredIndicator>
                      Full Name
                    </Label>
                    <Input
                      id="inst-name"
                      required
                      placeholder="Dr. Elena Vance"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="inst-email" requiredIndicator>
                      Academic / Work Email
                    </Label>
                    <Input
                      id="inst-email"
                      type="email"
                      required
                      placeholder="evance@mit.edu"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="inst-univ" requiredIndicator>
                      Institution or University
                    </Label>
                    <Input
                      id="inst-univ"
                      required
                      placeholder="Massachusetts Institute of Technology"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="inst-role">Academic Role</Label>
                    <select
                      id="inst-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-border-default bg-surface px-3 py-1 text-sm text-text-primary shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus cursor-pointer"
                    >
                      <option value="PROFESSOR">Professor / Faculty</option>
                      <option value="DEPARTMENT_CHAIR">Department Chair</option>
                      <option value="LAB_DIRECTOR">Quantum Lab Director</option>
                      <option value="TEACHING_ASSISTANT">Teaching Assistant / Instructor</option>
                      <option value="OTHER">Other Academic Lead</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="inst-size">Expected Students per Semester</Label>
                    <Input
                      id="inst-size"
                      type="number"
                      min={10}
                      max={5000}
                      value={expectedStudents}
                      onChange={(e) => setExpectedStudents(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="inst-notes">Course Topic / Lab Focus</Label>
                    <Input
                      id="inst-notes"
                      placeholder="Intro to Quantum Computing, Fall Lab"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                    {isSubmitting ? 'Queueing Request...' : 'Join Institutional Pilot'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22 }}
              className="text-center py-4 space-y-4"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div>
                <Badge variant="outline" className="text-xs uppercase font-mono tracking-wider text-emerald-600 border-emerald-500/30 mb-2">
                  Priority Pilot Queued
                </Badge>
                <h3 className="text-xl font-semibold text-text-primary">
                  You are #{successResult.waitlistPosition} on the Pilot Waitlist
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1 leading-relaxed">
                  Thank you, <strong>{fullName}</strong>. We have dispatched a confirmation to{' '}
                  <span className="font-mono text-text-primary">{workEmail}</span>. Our
                  academic architecture team will reach out with early provisioning.
                </p>
              </div>

              <div className="pt-2">
                <Button onClick={handleClose} className="w-full sm:w-auto">
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
