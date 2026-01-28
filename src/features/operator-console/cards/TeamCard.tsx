/**
 * TeamCard - Rebuilt active team + quick events
 */
import React, { useMemo } from 'react';
import type { DomainMatchState, TeamKey, EventType, ComputedTeamStats, MatchEvent } from '@/domain/match/types';
import { EVENT_BUTTONS } from '@/constants/console';
import { getEventMetadata, formatEventTime } from '@/utils/event-helpers';

interface TeamCardProps {
  state?: DomainMatchState;
  teamStats?: ComputedTeamStats;
  selectedTeam: TeamKey;
  onSelectTeam: (team: TeamKey) => void;
  onAddEvent: (type: EventType, team: TeamKey) => void;
  homeTeamName: string;
  awayTeamName: string;
  lastEvent: MatchEvent | null;
  layout?: 'sidebar' | 'horizontal' | 'mobile';
}

export const TeamCard: React.FC<TeamCardProps> = ({
  selectedTeam,
  onSelectTeam,
  onAddEvent,
  homeTeamName,
  awayTeamName,
  state,
  teamStats,
  lastEvent,
}) => {
  const homeGoals = teamStats?.home.goals ?? '-';
  const awayGoals = teamStats?.away.goals ?? '-';
  const isDisabled = state?.period === 'finished';

  const lastEventDisplay = useMemo(() => {
    if (!lastEvent) return null;
    const meta = getEventMetadata(lastEvent.type);
    return {
      label: meta.label,
      icon: meta.icon,
      time: formatEventTime(lastEvent.secondsInPeriod),
      team: lastEvent.team === 'home' ? homeTeamName : awayTeamName,
    };
  }, [lastEvent, homeTeamName, awayTeamName]);

  return (
    <div className="ui-surface p-4 space-y-4" data-testid="team-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="ui-kicker">Squadra attiva</p>
          <p className="text-sm font-semibold text-slate-900 truncate">
            {selectedTeam === 'home' ? homeTeamName : awayTeamName}
          </p>
        </div>
        <span
          className={`ui-chip ${
            selectedTeam === 'home'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-sky-50 text-sky-700 border-sky-200'
          }`}
        >
          {selectedTeam === 'home' ? 'CASA' : 'OSPITE'}
        </span>
      </div>

      <div role="radiogroup" aria-label="Seleziona squadra" className="grid grid-cols-2 gap-2">
        <button
          role="radio"
          aria-checked={selectedTeam === 'home'}
          aria-label={`Seleziona ${homeTeamName}`}
          onClick={() => onSelectTeam('home')}
          className={`rounded-lg border px-3 py-2 flex items-center justify-between gap-2 text-sm font-semibold transition-all ${
            selectedTeam === 'home'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="truncate">{homeTeamName}</span>
          <span className="text-lg font-bold tabular-nums">{homeGoals}</span>
        </button>
        <button
          role="radio"
          aria-checked={selectedTeam === 'away'}
          aria-label={`Seleziona ${awayTeamName}`}
          onClick={() => onSelectTeam('away')}
          className={`rounded-lg border px-3 py-2 flex items-center justify-between gap-2 text-sm font-semibold transition-all ${
            selectedTeam === 'away'
              ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="truncate">{awayTeamName}</span>
          <span className="text-lg font-bold tabular-nums">{awayGoals}</span>
        </button>
      </div>

      {lastEventDisplay && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{lastEventDisplay.icon}</span>
            <span className="font-semibold text-slate-700 truncate">{lastEventDisplay.label}</span>
            <span className="text-slate-500 truncate">({lastEventDisplay.team})</span>
          </div>
          <span className="font-mono text-slate-500">{lastEventDisplay.time}</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {EVENT_BUTTONS.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.type}
              onClick={() => onAddEvent(button.type, selectedTeam)}
              disabled={isDisabled}
              aria-label={`Aggiungi ${button.label}`}
              className={`h-14 rounded-lg flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${button.bg} ${button.color} ${button.hoverBg}`}
            >
              <Icon className="w-4 h-4" />
              <span>{button.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
