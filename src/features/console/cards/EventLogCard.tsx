/**
 * EventLogCard - Event history display and navigation
 * Pure UI component - all logic extracted
 */
import React from 'react';
import { Undo2 } from 'lucide-react';
import type { DisplayMatchEvent } from '@/utils/event-display-helpers';

interface EventLogCardProps {
  appliedEvents: DisplayMatchEvent[];
  recentEvents: DisplayMatchEvent[];
  isEventCursorActive: boolean;
  currentCursor: number;
  totalEvents: number;
  canNavigate: boolean;
  homeTeamName: string;
  awayTeamName: string;
  onUndoLastEvent: () => void;
  layout?: 'panel' | 'horizontal' | 'mobile';
}

export const EventLogCard: React.FC<EventLogCardProps> = ({
  appliedEvents,
  recentEvents,
  isEventCursorActive,
  currentCursor,
  totalEvents,
  canNavigate,
  homeTeamName,
  awayTeamName,
  onUndoLastEvent,
}) => {
  return (
    <div className="ui-surface p-4 space-y-3" data-testid="event-log-card" role="log" aria-label="Registro eventi">
      <div
        data-testid="event-status-surface"
        data-active={isEventCursorActive ? 'true' : 'false'}
        className="flex items-center justify-between gap-3"
      >
        <div>
          <p className="ui-kicker">Registro</p>
          <h3 className="text-sm font-semibold text-slate-900">
            Eventi {appliedEvents.length > 0 ? `(${appliedEvents.length})` : ''}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isEventCursorActive && (
            <span className="ui-chip bg-amber-50 text-amber-800 border-amber-200">
              Revisione {currentCursor}/{totalEvents}
            </span>
          )}
          {appliedEvents.length > 0 && canNavigate && (
            <button
              onClick={onUndoLastEvent}
              aria-label="Annulla ultimo evento"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {appliedEvents.length === 0 && (
        <p className="text-sm text-slate-500">Nessun evento registrato. Avvia la partita per iniziare.</p>
      )}

      {appliedEvents.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentEvents.map((event, idx) => {
            const teamName = event.team === 'home' ? homeTeamName : awayTeamName;
            const minutes = event.minutes;
            return (
              <div key={event.id || idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-100">
                <span className="font-medium text-slate-900 truncate max-w-[120px]">{teamName}</span>
                <span className="text-slate-600">{event.type}</span>
                <span className="text-slate-500 tabular-nums">{minutes}'</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
