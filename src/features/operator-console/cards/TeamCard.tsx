/**
 * TeamCard - Team selection and event buttons
 * Temporary stub - will be refactored during filesystem reorganization
 */
import React from 'react';
import type { DomainMatchState, TeamKey, EventType, ComputedTeamStats, MatchEvent } from '@/domain/match/types';

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

export const TeamCard: React.FC<TeamCardProps> = () => {
  return (
    <div className="p-4 border border-slate-200 rounded-lg">
      <p className="text-sm text-slate-600">TeamCard stub - implementation needed</p>
    </div>
  );
};
