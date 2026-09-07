'use client';

import * as React from 'react';
import { InstructorInsight } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, Table } from 'lucide-react';

interface CohortAnalyticsChartProps {
  insight: InstructorInsight;
  forceStaticFallback?: boolean;
}

export function CohortAnalyticsChart({
  insight,
  forceStaticFallback = false,
}: CohortAnalyticsChartProps) {
  const [showTableFallback, setShowTableFallback] = React.useState(forceStaticFallback);

  const { moduleCompletion, challengePassRate, topMisconceptions, learnerCount } = insight;

  // Compute aggregated distribution data
  const bellCompletion = moduleCompletion.find((m) => m.moduleId === 'mod_bell');
  const completionRate = bellCompletion
    ? Math.round((bellCompletion.completed / bellCompletion.assigned) * 100)
    : 0;

  const repairChallenge = challengePassRate.find((c) => c.challengeId === 'ch_bell_repair');
  const passRate = repairChallenge ? Math.round(repairChallenge.rate * 100) : 0;

  const primaryMisconception = topMisconceptions[0];
  const misconceptionRate = primaryMisconception
    ? Math.round((primaryMisconception.learnerCount / (learnerCount || 1)) * 100)
    : 0;

  return (
    <Card className="border-line bg-panel shadow-lg" data-testid="cohort-analytics-chart-card">
      <CardHeader className="pb-3 border-b border-line bg-raised/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <CardTitle className="text-sm text-ink font-semibold">
              Cohort Performance & Misconception Distribution
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTableFallback(!showTableFallback)}
              className="text-[11px] font-mono text-ink-dim hover:text-accent flex items-center gap-1 px-2 py-1 rounded bg-abyss border border-line cursor-pointer"
              data-testid="toggle-chart-fallback-btn"
            >
              <Table className="w-3 h-3" />
              <span>{showTableFallback ? 'Show Visual Chart' : 'Show Table Fallback'}</span>
            </button>
            <Badge variant="outline" className="text-[9px] font-mono">
              1-CHART COHORT VIEW
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs text-ink-dim">
          Aggregated cohort telemetry across {learnerCount} learners in {insight.cohortId}.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-6">
        {!showTableFallback ? (
          /* Responsive SVG Chart Representation */
          <div className="space-y-4" data-testid="cohort-svg-chart">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              {/* Metric 1: Module Completion */}
              <div className="p-3.5 rounded-lg bg-abyss border border-line space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-ink-dim">Module Progress Rate</span>
                  <span className="text-evidence font-bold">{completionRate}%</span>
                </div>
                <div className="w-full h-3 bg-raised rounded overflow-hidden">
                  <div
                    className="h-full bg-evidence rounded transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                    data-testid="chart-bar-completion"
                  />
                </div>
                <div className="text-[10px] text-ink-faint">
                  {bellCompletion ? `${bellCompletion.completed}/${bellCompletion.assigned} learners` : 'N/A'}
                </div>
              </div>

              {/* Metric 2: Challenge Pass Rate */}
              <div className="p-3.5 rounded-lg bg-abyss border border-line space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-ink-dim">Repair Pass Rate</span>
                  <span className="text-accent font-bold">{passRate}%</span>
                </div>
                <div className="w-full h-3 bg-raised rounded overflow-hidden">
                  <div
                    className="h-full bg-accent rounded transition-all duration-500"
                    style={{ width: `${passRate}%` }}
                    data-testid="chart-bar-passrate"
                  />
                </div>
                <div className="text-[10px] text-ink-faint">
                  {repairChallenge ? `${repairChallenge.passed}/${repairChallenge.attempted} attempts` : 'N/A'}
                </div>
              </div>

              {/* Metric 3: Misconception Prevalence */}
              <div className="p-3.5 rounded-lg bg-abyss border border-line space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-ink-dim">Misconception Rate</span>
                  <span className="text-caution font-bold">{misconceptionRate}%</span>
                </div>
                <div className="w-full h-3 bg-raised rounded overflow-hidden">
                  <div
                    className="h-full bg-caution rounded transition-all duration-500"
                    style={{ width: `${misconceptionRate}%` }}
                    data-testid="chart-bar-misconception"
                  />
                </div>
                <div className="text-[10px] text-ink-faint truncate">
                  {primaryMisconception ? `${primaryMisconception.learnerCount} learners affected` : 'None'}
                </div>
              </div>
            </div>

            {/* Visual SVG Comparison Chart */}
            <div className="rounded-lg bg-abyss border border-line p-4">
              <div className="text-[11px] font-mono text-ink-dim mb-3 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-accent" />
                <span>Relative Distribution Across Cohort (N={learnerCount})</span>
              </div>
              <svg
                viewBox="0 0 600 120"
                className="w-full h-28"
                role="img"
                aria-label="Cohort analytics chart comparing completion, repair pass, and misconception rates"
                data-testid="cohort-analytics-svg"
              >
                {/* Background grid lines */}
                <line x1="120" y1="20" x2="560" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="120" y1="60" x2="560" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="120" y1="100" x2="560" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                {/* Row 1: Module Completion */}
                <text x="10" y="24" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                  Completion
                </text>
                <rect x="120" y="14" width="440" height="14" rx="3" fill="#1E293B" />
                <rect
                  x="120"
                  y="14"
                  width={`${Math.min(440, Math.max(0, (completionRate / 100) * 440))}`}
                  height="14"
                  rx="3"
                  fill="#10B981"
                />
                <text x="568" y="25" fill="#10B981" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {completionRate}%
                </text>

                {/* Row 2: Pass Rate */}
                <text x="10" y="64" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                  Repair Pass
                </text>
                <rect x="120" y="54" width="440" height="14" rx="3" fill="#1E293B" />
                <rect
                  x="120"
                  y="54"
                  width={`${Math.min(440, Math.max(0, (passRate / 100) * 440))}`}
                  height="14"
                  rx="3"
                  fill="#06B6D4"
                />
                <text x="568" y="65" fill="#06B6D4" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {passRate}%
                </text>

                {/* Row 3: Misconception */}
                <text x="10" y="104" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                  Divergence
                </text>
                <rect x="120" y="94" width="440" height="14" rx="3" fill="#1E293B" />
                <rect
                  x="120"
                  y="94"
                  width={`${Math.min(440, Math.max(0, (misconceptionRate / 100) * 440))}`}
                  height="14"
                  rx="3"
                  fill="#F59E0B"
                />
                <text x="568" y="105" fill="#F59E0B" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {misconceptionRate}%
                </text>
              </svg>
            </div>
          </div>
        ) : (
          /* Accessible Table Fallback */
          <div
            className="rounded-lg border border-line bg-abyss overflow-hidden text-xs font-mono"
            data-testid="cohort-table-fallback"
          >
            <table className="w-full text-left">
              <thead className="bg-raised text-ink-dim border-b border-line">
                <tr>
                  <th className="p-3">Cohort Metric</th>
                  <th className="p-3">Value / Count</th>
                  <th className="p-3">Percentage / Rate</th>
                  <th className="p-3">Sample Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                <tr>
                  <td className="p-3 text-evidence font-bold">Module Completion (Bell State)</td>
                  <td className="p-3">{bellCompletion?.completed || 0} learners</td>
                  <td className="p-3 text-evidence">{completionRate}%</td>
                  <td className="p-3 text-ink-faint">{bellCompletion?.assigned || 30} assigned</td>
                </tr>
                <tr>
                  <td className="p-3 text-accent font-bold">Challenge Pass (ch_bell_repair)</td>
                  <td className="p-3">{repairChallenge?.passed || 0} passed</td>
                  <td className="p-3 text-accent">{passRate}%</td>
                  <td className="p-3 text-ink-faint">{repairChallenge?.attempted || 24} attempts</td>
                </tr>
                <tr>
                  <td className="p-3 text-caution font-bold">Top Misconception (Entanglement)</td>
                  <td className="p-3">{primaryMisconception?.occurrences || 0} occurrences</td>
                  <td className="p-3 text-caution">{misconceptionRate}% of cohort</td>
                  <td className="p-3 text-ink-faint">{learnerCount} learners</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
