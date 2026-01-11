/**
 * MatchOverviewCard: Hero card with score, key stats, and event timeline
 */

import React, { useMemo } from 'react';
import { DashboardCard } from './DashboardCard';
import type { DomainMatchState, ComputedTeamStats, SettingsState, MatchEvent } from '@/domain/match/types';
import { selectRecentTimeline } from './dashboard-selectors';
import { getEventMetadata, formatEventTime } from '@/utils/event-helpers';
import { getContrastTextColor } from '@/domain/settings/defaults';
import { Trophy, Activity } from 'lucide-react';

interface MatchOverviewCardProps {
  state: DomainMatchState;
  teamStats: ComputedTeamStats;
  settings: SettingsState;
}

export const MatchOverviewCard: React.FC<MatchOverviewCardProps> = ({
  state,
  teamStats,
  settings,
}) => {
  const recentEvents = useMemo(() => selectRecentTimeline(state, 8), [state]);
  
  const home = teamStats.home;
  const away = teamStats.away;
  const homeColor = settings.homeTeamConfig.color.primary;
  const awayColor = settings.awayTeamConfig.color.primary;
  const homeDisplayName = settings.homeTeamConfig.displayName;
  const awayDisplayName = settings.awayTeamConfig.displayName;

  const periodLabels: Record<string, string> = {
    pre_match: 'Pre-Partita',
    first_half: '1° Tempo',
    half_time: 'Intervallo',
    second_half: '2° Tempo',
    extra_time_1: 'Supplementare 1',
    extra_time_2: 'Supplementare 2',
    shootout: 'Rigori',
    finished: 'Finita',
    suspended: 'Sospesa',
  };

  const statusBadge = () => {
    if (state.matchStatus === 'suspended') {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded">
          SOSPESA
        </span>
      );
    }
    if (state.matchStatus === 'finished') {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-800 rounded">
          FINITA
        </span>
      );
    }
    if (state.isRunning) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded flex items-center gap-1">
          <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
          IN CORSO
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded">
        IN PAUSA
      </span>
    );
  };

  return (
    <DashboardCard
      title="Panoramica Match"
      icon={<Trophy size={18} />}
      subtitle={periodLabels[state.period] || state.period}
      actions={statusBadge()}
    >
      <div className="space-y-6">
        {/* Score & Primary Stats */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
          {/* HOME TEAM */}
          <div className="text-center">
            <div
              className="inline-block text-sm font-semibold px-3 py-1.5 rounded-md mb-3"
              style={{
                backgroundColor: homeColor,
                color: getContrastTextColor(homeColor),
              }}
            >
              {homeDisplayName}
            </div>
            <div className="text-6xl font-black text-slate-900 leading-none">
              {home.goals}
            </div>
          </div>

          {/* VS Divider */}
          <div className="text-2xl font-bold text-slate-300">VS</div>

          {/* AWAY TEAM */}
          <div className="text-center">
            <div
              className="inline-block text-sm font-semibold px-3 py-1.5 rounded-md mb-3"
              style={{
                backgroundColor: awayColor,
                color: getContrastTextColor(awayColor),
              }}
            >
              {awayDisplayName}
            </div>
            <div className="text-6xl font-black text-slate-900 leading-none">
              {away.goals}
            </div>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Shots */}
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-600 mb-1">Tiri</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-slate-900">{home.shots}</span>
              <span className="text-xs text-slate-400">-</span>
              <span className="text-lg font-bold text-slate-900">{away.shots}</span>
            </div>
          </div>

          {/* Shots on Target */}
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xs text-blue-700 mb-1">In Porta</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-blue-900">{home.shotsOnTarget}</span>
              <span className="text-xs text-blue-300">-</span>
              <span className="text-lg font-bold text-blue-900">{away.shotsOnTarget}</span>
            </div>
          </div>

          {/* Corners */}
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-600 mb-1">Angoli</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-slate-900">{home.corners}</span>
              <span className="text-xs text-slate-400">-</span>
              <span className="text-lg font-bold text-slate-900">{away.corners}</span>
            </div>
          </div>

          {/* Throw-ins */}
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-600 mb-1">Rimesse</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-slate-900">{home.throwIns}</span>
              <span className="text-xs text-slate-400">-</span>
              <span className="text-lg font-bold text-slate-900">{away.throwIns}</span>
            </div>
          </div>

          {/* Fouls */}
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-600 mb-1">Falli</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-slate-900">{home.fouls}</span>
              <span className="text-xs text-slate-400">-</span>
              <span className="text-lg font-bold text-slate-900">{away.fouls}</span>
            </div>
          </div>

          {/* Yellow Cards */}
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-xs text-yellow-700 mb-1">Gialli</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-yellow-900">{home.yellowCards}</span>
              <span className="text-xs text-yellow-300">-</span>
              <span className="text-lg font-bold text-yellow-900">{away.yellowCards}</span>
            </div>
          </div>

          {/* Red Cards */}
          <div className="bg-red-50 rounded-lg p-3 text-center">
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
                  : 'bg-blue-50 border-blue-300';

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
