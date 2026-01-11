/**
 * EventLogCard - Event history display and navigation
 * Temporary stub - will be refactored during filesystem reorganization
 */
import React from 'react';
import type { DomainMatchState, TeamKey, ComputedTeamStats, MatchEvent } from '@/domain/match/types';

interface EventLogCardProps {
  state: DomainMatchState;
  teamStats?: ComputedTeamStats;
  selectedTeam?: TeamKey;
  homeTeamName: string;
  awayTeamName: string;
  onDeleteEvent: (eventId: string) => void;
  onUpdateEvent: (event: MatchEvent) => void;
  onSetCursor: (cursor: number) => void;
  canNavigateEventCursor?: boolean;
  canNavigate?: boolean;  // Alternative prop name for backward compatibility
  layout?: 'sidebar' | 'horizontal' | 'mobile';
}

export const EventLogCard: React.FC<EventLogCardProps> = () => {
  return (
    <div className="p-4 border border-slate-200 rounded-lg">
      <p className="text-sm text-slate-600">EventLogCard stub - implementation needed</p>
    </div>
  );
};
