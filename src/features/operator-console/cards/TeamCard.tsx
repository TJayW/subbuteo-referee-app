/**
 * TeamCard - Team selection and event buttons
 * Full implementation with radiogroup and event buttons
 */
import React from 'react';
import type { DomainMatchState, TeamKey, EventType, ComputedTeamStats, MatchEvent } from '@/domain/match/types';
import { EVENT_BUTTONS } from '@/constants/console';

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
}) => {
  const homeGoals = teamStats?.home.goals ?? '-';
  const awayGoals = teamStats?.away.goals ?? '-';
  const isDisabled = state?.period === 'finished';

  return (
    <div className="ui-surface p-4 space-y-4" data-testid="team-card-b1-b5-fixed">
      <div className="flex items-center justify-between gap-3">
        <div>
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

      {/* Team Selection Radiogroup */}
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

      {/* Event Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        {EVENT_BUTTONS.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.type}
              onClick={() => onAddEvent(button.type, selectedTeam)}
              disabled={isDisabled}
              aria-label={`Aggiungi ${button.label}`}
              className={`h-12 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${button.bg} ${button.color} ${button.hoverBg}`}
            >
              <Icon className="w-4 h-4" />
              {button.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
