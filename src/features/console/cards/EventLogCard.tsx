/**
 * EventLogCard - Event history display and navigation
 * Minimal implementation with event undo button for tests
 */
import React from 'react';
import { Undo2 } from 'lucide-react';
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
  layout?: 'panel' | 'horizontal' | 'mobile';
}

export const EventLogCard: React.FC<EventLogCardProps> = ({
  state,
  homeTeamName,
  awayTeamName,
  onSetCursor,
  canNavigateEventCursor = true,
  canNavigate = true,
}) => {
  const events = state.events || [];
  const canNav = canNavigateEventCursor || canNavigate;
  const currentCursor = state.cursor ?? events.length;
  const appliedEvents = events.slice(0, currentCursor);
  const isEventCursorActive = currentCursor < events.length;

  const handleUndoLastEvent = () => {
    if (appliedEvents.length > 0 && canNav) {
      onSetCursor(appliedEvents.length - 1);
    }
  };

  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-white space-y-3" data-testid="event-log-card" role="log" aria-label="Registro eventi">
      <div 
        data-testid="event-status-surface" 
        data-active={isEventCursorActive ? 'true' : 'false'}
        className="flex items-center justify-between"
      >
        <h3 className="font-semibold text-slate-900">
          {isEventCursorActive ? `${currentCursor}/${events.length}` : `Eventi (${appliedEvents.length})`}
        </h3>
        {appliedEvents.length > 0 && canNav && (
          <button
            onClick={handleUndoLastEvent}
            aria-label="Annulla ultimo evento"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            <Undo2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {appliedEvents.length === 0 && (
        <p className="text-sm text-slate-500">Nessun evento registrato</p>
      )}

      {appliedEvents.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {appliedEvents.slice(-5).map((event, idx) => {
            const teamName = event.team === 'home' ? homeTeamName : awayTeamName;
            const minutes = Math.floor(event.timestamp / 60);
            return (
              <div key={event.id || idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded">
                <span className="font-medium">{teamName}</span>
                <span className="text-slate-600">{event.type}</span>
                <span className="text-slate-500">{minutes}'</span>
              </div>
            );
          })}
        </div>
      )}

      {isEventCursorActive && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          Visualizzando evento {currentCursor} di {events.length}
        </div>
      )}
    </div>
  );
};
