/**
 * MatchOverviewCard: Hero card with score, key stats, and event timeline
 */

import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import type { DomainMatchState, ComputedTeamStats, SettingsState, MatchEvent } from '@/domain/match/types';
import { getEventMetadata, formatEventTime } from '@/utils/event-helpers';
import { getContrastTextColor } from '@/domain/settings/defaults';
import { PERIOD_LABELS } from '@/constants/periods';
import { Trophy, Activity } from 'lucide-react';

interface MatchOverviewCardProps {
  state: DomainMatchState;
  teamStats: ComputedTeamStats;
  settings: SettingsState;
  recentEvents: MatchEvent[];
}

export const MatchOverviewCard: React.FC<MatchOverviewCardProps> = ({
  state,
  teamStats,
  settings,
  recentEvents,
}) => {
  
  const home = teamStats.home;
  const away = teamStats.away;
  const homeColor = settings.homeTeamConfig.color.primary;
  const awayColor = settings.awayTeamConfig.color.primary;
  const homeDisplayName = settings.homeTeamConfig.displayName;
  const awayDisplayName = settings.awayTeamConfig.displayName;

  const statusBadge = () => {
    if (state.matchStatus === 'suspended') {
      return (
        <span className="ui-badge bg-red-50 text-red-700 border-red-200">
          SOSPESA
        </span>
      );
    }
    if (state.matchStatus === 'finished') {
      return (
        <span className="ui-badge bg-slate-100 text-slate-700 border-slate-200">
          FINITA
        </span>
      );
    }
    if (state.isRunning) {
      return (
        <span className="ui-badge bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
          IN CORSO
        </span>
      );
    }
    return (
      <span className="ui-badge bg-amber-50 text-amber-700 border-amber-200">
        IN PAUSA
      </span>
    );
  };

  return (
    <DashboardCard
      title="Panoramica Match"
      icon={<Trophy size={18} />}
      subtitle={PERIOD_LABELS[state.period] || state.period}
      actions={statusBadge()}
    >
      <div className="space-y-6">
        {/* Score & Primary Stats */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
          {/* HOME TEAM */}
          <div className="text-center">
            <div
              className="inline-block text-sm font-semibold px-3 py-1.5 rounded-md mb-3 shadow-sm"
              style={{
                backgroundColor: homeColor,
                color: getContrastTextColor(homeColor),
              }}
            >
              {homeDisplayName}
            </div>
            <div className="text-6xl font-black text-slate-900 leading-none font-display tabular-nums">
              {home.goals}
            </div>
          </div>

          {/* VS Divider */}
          <div className="text-2xl font-bold text-slate-300">VS</div>

          {/* AWAY TEAM */}
          <div className="text-center">
            <div
              className="inline-block text-sm font-semibold px-3 py-1.5 rounded-md mb-3 shadow-sm"
              style={{
                backgroundColor: awayColor,
                color: getContrastTextColor(awayColor),
              }}
            >
              {awayDisplayName}
            </div>
            <div className="text-6xl font-black text-slate-900 leading-none font-display tabular-nums">
              {away.goals}
            </div>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Shots */}
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
            <div className="text-xs text-slate-600 mb-1">Tiri</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-slate-900">{home.shots}</span>
              <span className="text-xs text-slate-400">-</span>
              <span className="text-lg font-bold text-slate-900">{away.shots}</span>
            </div>
          </div>

          {/* Shots on Target */}
          <div className="bg-sky-50 rounded-lg p-3 text-center border border-sky-100">
            <div className="text-xs text-sky-700 mb-1">In Porta</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-sky-900">{home.shotsOnTarget}</span>
              <span className="text-xs text-sky-300">-</span>
              <span className="text-lg font-bold text-sky-900">{away.shotsOnTarget}</span>
            </div>
          </div>

          {/* Corners */}
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
            <div className="text-xs text-slate-600 mb-1">Angoli</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-slate-900">{home.corners}</span>
              <span className="text-xs text-slate-400">-</span>
              <span className="text-lg font-bold text-slate-900">{away.corners}</span>
            </div>
          </div>

          {/* Throw-ins */}
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
            <div className="text-xs text-slate-600 mb-1">Rimesse</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-slate-900">{home.throwIns}</span>
              <span className="text-xs text-slate-400">-</span>
              <span className="text-lg font-bold text-slate-900">{away.throwIns}</span>
            </div>
          </div>

          {/* Fouls */}
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
            <div className="text-xs text-slate-600 mb-1">Falli</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-slate-900">{home.fouls}</span>
              <span className="text-xs text-slate-400">-</span>
              <span className="text-lg font-bold text-slate-900">{away.fouls}</span>
            </div>
          </div>

          {/* Yellow Cards */}
          <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
            <div className="text-xs text-yellow-700 mb-1">Gialli</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-yellow-900">{home.yellowCards}</span>
              <span className="text-xs text-yellow-300">-</span>
              <span className="text-lg font-bold text-yellow-900">{away.yellowCards}</span>
            </div>
          </div>

          {/* Red Cards */}
          <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
            <div className="text-xs text-red-700 mb-1">Rossi</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-red-900">{home.redCards}</span>
              <span className="text-xs text-red-300">-</span>
              <span className="text-lg font-bold text-red-900">{away.redCards}</span>
            </div>
          </div>
        </div>

        {/* Recent Events Timeline */}
        {recentEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-700">Ultimi Eventi</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentEvents.map((event: MatchEvent) => {
                const meta = getEventMetadata(event.type);
                const isHome = event.team === 'home';
                const bgColor = isHome
                  ? 'bg-slate-100 border-slate-300'
                  : 'bg-sky-50 border-sky-200';

                return (
                  <div
                    key={event.id}
                    className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs ${bgColor}`}
                  >
                    <span className="font-mono text-slate-600">
                      {formatEventTime(event.secondsInPeriod)}
                    </span>
                    <span>{meta.icon}</span>
                    <span className="font-medium text-slate-900">{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};
