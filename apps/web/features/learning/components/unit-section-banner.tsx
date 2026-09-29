'use client';

import * as React from 'react';
import { BookOpen, Compass, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnitGuidebookModal } from './unit-guidebook-modal';
import { cn } from '@/lib/utils';

export interface UnitSectionBannerProps {
  unitNumber?: number | string;
  unitTitle?: string;
  subtitle?: string;
  completedCount?: number;
  totalCount?: number;
  accentRailColor?: string;
  onOpenGuidebook?: () => void;
  className?: string;
  testId?: string;
}

export function UnitSectionBanner({
  unitNumber = 1,
  unitTitle = 'THE QUANTUM COMPASS',
  subtitle = 'Single-Qubit Rotations & Superposition',
  completedCount = 3,
  totalCount = 6,
  accentRailColor,
  onOpenGuidebook,
  className,
  testId,
}: UnitSectionBannerProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const percentage = totalCount > 0 ? Math.min(100, Math.max(0, Math.round((completedCount / totalCount) * 100))) : 0;

  const handleOpenGuidebook = () => {
    setIsModalOpen(true);
    if (onOpenGuidebook) {
      onOpenGuidebook();
    }
  };

  const handleCloseGuidebook = () => {
    setIsModalOpen(false);
  };

  // Format full title display: e.g. "UNIT 1: THE QUANTUM COMPASS"
  const formattedFullTitle = unitTitle.toUpperCase().startsWith('UNIT')
    ? unitTitle
    : `UNIT ${unitNumber}: ${unitTitle}`;

  return (
    <>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface text-text-primary shadow-xs transition-all duration-200 hover:border-border-medium',
          className
        )}
        data-testid={testId || 'unit-section-banner'}
      >
        {/* Precision Laser Accent Rail */}
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-violet to-accent-hover"
          style={accentRailColor ? { background: accentRailColor } : undefined}
          data-testid="unit-accent-rail"
        />

        {/* Content Container */}
        <div className="p-5 md:p-6 space-y-4">
          {/* Top Row: Unit Info & Guidebook Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-accent uppercase">
                  <Compass className="h-3 w-3" />
                  Unit {unitNumber}
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Stage Progress
                </span>
              </div>
              <h2 className="text-base md:text-lg font-bold tracking-tight text-text-primary">
                {formattedFullTitle}
              </h2>
              <p className="text-xs md:text-sm text-text-secondary">
                {subtitle}
              </p>
            </div>

            {/* Guidebook Button */}
            <div className="shrink-0 flex items-center">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handleOpenGuidebook}
                aria-label={`Open Unit ${unitNumber} Guidebook`}
                data-testid="unit-guidebook-button"
                className="group border-border-medium bg-surface hover:bg-surface-raised active:bg-surface-active text-text-primary flex items-center gap-2 px-4 shadow-xs"
              >
                <BookOpen className="h-3.5 w-3.5 text-accent group-hover:scale-105 transition-transform" />
                <span>Guidebook 📖</span>
              </Button>
            </div>
          </div>

          {/* Bottom Row: Milled Progress Gauge */}
          <div className="space-y-1.5 pt-1 border-t border-border-subtle/50">
            <div className="flex items-center justify-between text-xs">
              <span
                className="font-medium text-text-secondary"
                data-testid="unit-progress-count"
              >
                {completedCount}/{totalCount} Completed
              </span>
              <span className="font-mono text-xs font-semibold text-text-primary">
                {percentage}%
              </span>
            </div>

            {/* Milled Progress Fill Bar */}
            <div
              className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-sunken border border-border-subtle/70"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Unit ${unitNumber} completion progress`}
              data-testid="unit-progress-bar"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-violet transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${percentage}%` }}
                data-testid="unit-progress-fill"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Guidebook Cheatsheet Modal */}
      <UnitGuidebookModal
        open={isModalOpen}
        onClose={handleCloseGuidebook}
        unitNumber={unitNumber}
        unitTitle={formattedFullTitle}
      />
    </>
  );
}
