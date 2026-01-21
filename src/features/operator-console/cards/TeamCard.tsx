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
}) => {
  const homeInitial = homeTeamName.charAt(0).toUpperCase();
  const awayInitial = awayTeamName.charAt(0).toUpperCase();
  
  // Allow events even in pre_match for testing purposes
  const isDisabled = state?.period === 'finished';

  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-white space-y-4" data-testid="team-card-b1-b5-fixed">
      {/* Team Selection Radiogroup */}
      <div role="radiogroup" aria-label="Seleziona squadra" className="flex gap-2">
        <button
          role="radio"
          aria-checked={selectedTeam === 'home'}
          aria-label={`Seleziona ${homeTeamName}`}
          onClick={() => onSelectTeam('home')}
          className={`flex-1 h-12 rounded-lg flex items-center justify-center font-bold text-base transition-all ${
            selectedTeam === 'home'
              ? 'bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-400'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {homeInitial}
        </button>
        <button
          role="radio"
          aria-checked={selectedTeam === 'away'}
          aria-label={`Seleziona ${awayTeamName}`}
          onClick={() => onSelectTeam('away')}
          className={`flex-1 h-12 rounded-lg flex items-center justify-center font-bold text-base transition-all ${
            selectedTeam === 'away'
              ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-400'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {awayInitial}
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
