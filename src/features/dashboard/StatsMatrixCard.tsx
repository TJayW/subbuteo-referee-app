/**
 * StatsMatrixCard: Dense comparison matrix of all team stats
 * Optional per-period breakdown
 */

import React, { useState, useMemo } from 'react';
import { DashboardCard } from './DashboardCard';
import type { DomainMatchState, ComputedTeamStats, SettingsState } from '@/domain/match/types';
import { selectPeriodBreakdown } from './dashboard-selectors';
import { BarChart3 } from 'lucide-react';

interface StatsMatrixCardProps {
  state: DomainMatchState;
  teamStats: ComputedTeamStats;
  settings: SettingsState;
}

export const StatsMatrixCard: React.FC<StatsMatrixCardProps> = ({
  state,
  teamStats,
  settings,
}) => {
  const [viewMode, setViewMode] = useState<'total' | 'period'>('total');
  const periodBreakdown = useMemo(() => selectPeriodBreakdown(state), [state]);

  const home = teamStats.home;
  const away = teamStats.away;
  const homeDisplayName = settings.homeTeamConfig.displayName;
  const awayDisplayName = settings.awayTeamConfig.displayName;

  const metrics = [
    { label: 'Gol', homeValue: home.goals, awayValue: away.goals },
    { label: 'Tiri', homeValue: home.shots, awayValue: away.shots },
    { label: 'Tiri in Porta', homeValue: home.shotsOnTarget, awayValue: away.shotsOnTarget },
    { label: 'Angoli', homeValue: home.corners, awayValue: away.corners },
    { label: 'Rimesse', homeValue: home.throwIns, awayValue: away.throwIns },
    { label: 'Falli', homeValue: home.fouls, awayValue: away.fouls },
    { label: 'Gialli', homeValue: home.yellowCards, awayValue: away.yellowCards },
    { label: 'Rossi', homeValue: home.redCards, awayValue: away.redCards },
    { label: 'Timeout', homeValue: home.timeouts, awayValue: away.timeouts },
  ];

  const periodLabels: Record<string, string> = {
    pre_match: 'Pre',
    first_half: '1° T',
    half_time: 'Int',
    second_half: '2° T',
    extra_time_1: 'S1',
    extra_time_2: 'S2',
    shootout: 'Rig',
    finished: 'Fine',
  };

  return (
    <DashboardCard
      title="Matrice Statistiche"
      icon={<BarChart3 size={18} />}
      compact
      actions={
        <div className="flex bg-white border border-slate-200 rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode('total')}
            className={`px-2 py-1 text-xs font-medium transition-colors ${
              viewMode === 'total'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Totale
          </button>
          <button
            onClick={() => setViewMode('period')}
            className={`px-2 py-1 text-xs font-medium transition-colors ${
              viewMode === 'period'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Per Periodo
          </button>
        </div>
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
                      className="h-full bg-blue-500 transition-all"
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
            <div key={period.period} className="border-l-2 border-blue-500 pl-3">
              <div className="text-xs font-semibold text-slate-700 mb-1">
                {periodLabels[period.period] || period.period}
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
