/**
 * StatsMatrixCard: Dense comparison matrix of all team stats
 * Optional per-period breakdown
 */

import React, { useState } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import type { ComputedTeamStats, SettingsState } from '@/domain/match/types';
import type { PeriodStats } from '@/domain/match/stats-selectors';
import { STATS_METRICS } from '@/constants/match-control';
import { PERIOD_LABELS } from '@/constants/periods';
import { BarChart3 } from 'lucide-react';
import { SegmentedControl } from '@/ui/primitives';

interface StatsMatrixCardProps {
  teamStats: ComputedTeamStats;
  settings: SettingsState;
  periodBreakdown: PeriodStats[];
}

export const StatsMatrixCard: React.FC<StatsMatrixCardProps> = ({
  teamStats,
  settings,
  periodBreakdown,
}) => {
  const [viewMode, setViewMode] = useState<'total' | 'period'>('total');

  const home = teamStats.home;
  const away = teamStats.away;
  const homeDisplayName = settings.homeTeamConfig.displayName;
  const awayDisplayName = settings.awayTeamConfig.displayName;

  // Build metrics dynamically from STATS_METRICS constant
  const metrics = STATS_METRICS.map(m => ({
    label: m.label,
    homeValue: home[m.key as keyof typeof home] as number,
    awayValue: away[m.key as keyof typeof away] as number,
  }));

  return (
    <DashboardCard
      title="Matrice Statistiche"
      icon={<BarChart3 size={18} />}
      compact
      actions={
        <SegmentedControl
          size="sm"
          value={viewMode}
          onChange={(value) => setViewMode(value as 'total' | 'period')}
          options={[
            { value: 'total', label: 'Totale' },
            { value: 'period', label: 'Per Periodo' },
          ]}
        />
      }
    >
      {viewMode === 'total' ? (
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 text-xs font-semibold text-slate-600 pb-2 border-b border-slate-200">
            <div>Metrica</div>
            <div className="text-right w-12">{homeDisplayName}</div>
            <div className="text-right w-12">{awayDisplayName}</div>
            <div className="w-16"></div>
          </div>

          {/* Rows */}
          {metrics.map((metric) => {
            const total = metric.homeValue + metric.awayValue;
            const homePercent = total > 0 ? (metric.homeValue / total) * 100 : 50;

            return (
              <div
                key={metric.label}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center text-xs py-1 hover:bg-slate-50 rounded"
              >
                <div className="font-medium text-slate-700">{metric.label}</div>
                <div className="text-right w-12 font-semibold text-slate-900">
                  {metric.homeValue}
                </div>
                <div className="text-right w-12 font-semibold text-slate-900">
                  {metric.awayValue}
                </div>
                <div className="w-16">
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all"
                      style={{ width: `${homePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {periodBreakdown.map((period) => (
            <div key={period.period} className="border-l-2 border-sky-500 pl-3">
              <div className="text-xs font-semibold text-slate-700 mb-1">
                {PERIOD_LABELS[period.period] || period.period}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-600">Gol:</span>{' '}
                  <span className="font-semibold">{period.homeGoals}-{period.awayGoals}</span>
                </div>
                <div>
                  <span className="text-slate-600">Tiri:</span>{' '}
                  <span className="font-semibold">{period.homeShots}-{period.awayShots}</span>
                </div>
                <div>
                  <span className="text-slate-600">Falli:</span>{' '}
                  <span className="font-semibold">{period.homeFouls}-{period.awayFouls}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
};
