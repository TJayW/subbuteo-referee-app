/**
 * EventLogCard - Rebuilt timeline with navigation and history actions
 */
import React, { useMemo } from 'react';
import { Undo2, Redo2, CornerDownLeft } from 'lucide-react';
import type { DomainMatchState, TeamKey, ComputedTeamStats, MatchEvent } from '@/domain/match/types';
import { getEventMetadata, formatEventTime } from '@/utils/event-helpers';
import { IconButton } from '@/ui/primitives';

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
  canNavigate?: boolean;
  onUndoDomain?: () => void;
  onRedoDomain?: () => void;
  undoDisabled?: boolean;
  redoDisabled?: boolean;
  layout?: 'sidebar' | 'horizontal' | 'mobile';
}

export const EventLogCard: React.FC<EventLogCardProps> = ({
  state,
  homeTeamName,
  awayTeamName,
  onSetCursor,
  canNavigateEventCursor = true,
  canNavigate = true,
  onUndoDomain,
  onRedoDomain,
  undoDisabled,
  redoDisabled,
}) => {
  const events = state.events || [];
  const canNav = canNavigateEventCursor || canNavigate;
  const currentCursor = state.cursor ?? events.length;
  const appliedEvents = events.slice(0, currentCursor);
  const isEventCursorActive = currentCursor < events.length;

  const recentEvents = useMemo(() => appliedEvents.slice(-8), [appliedEvents]);

  const handleUndoLastEvent = () => {
    if (appliedEvents.length > 0 && canNav) {
      onSetCursor(appliedEvents.length - 1);
    }
  };

  const handleJumpToPresent = () => {
    onSetCursor(events.length);
  };

  return (
    <div className="ui-surface p-4 space-y-3" data-testid="event-log-card" role="log" aria-label="Registro eventi">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ui-kicker">Registro eventi</p>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              {appliedEvents.length > 0 ? `${appliedEvents.length} eventi` : 'Nessun evento'}
            </h3>
            {isEventCursorActive && (
              <span className="ui-chip bg-amber-50 text-amber-800 border-amber-200">
                Revisione {currentCursor}/{events.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onUndoDomain && (
            <IconButton
              size="sm"
              variant="ghost"
              onClick={onUndoDomain}
              disabled={undoDisabled}
              title="Annulla (globale)"
            >
              <Undo2 className="w-4 h-4" />
            </IconButton>
          )}
          {onRedoDomain && (
            <IconButton
              size="sm"
              variant="ghost"
              onClick={onRedoDomain}
              disabled={redoDisabled}
              title="Ripeti (globale)"
            >
              <Redo2 className="w-4 h-4" />
            </IconButton>
          )}
          {appliedEvents.length > 0 && canNav && (
            <button
              onClick={handleUndoLastEvent}
              aria-label="Torna indietro di un evento"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {appliedEvents.length === 0 && (
        <p className="text-sm text-slate-500">Nessun evento registrato. Avvia la partita per iniziare.</p>
      )}

      {appliedEvents.length > 0 && (
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {recentEvents.map((event, idx) => {
            const meta = getEventMetadata(event.type);
            const teamName = event.team === 'home' ? homeTeamName : awayTeamName;
            const time = formatEventTime(event.secondsInPeriod ?? 0);
            const eventIndex = appliedEvents.length - recentEvents.length + idx + 1;
            return (
              <button
                key={event.id || idx}
                onClick={() => canNav && onSetCursor(eventIndex)}
                className="w-full text-left flex items-center justify-between gap-3 text-xs p-2 rounded border border-slate-100 bg-slate-50 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{meta.icon}</span>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{meta.label}</div>
                    <div className="text-slate-500 truncate">{teamName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-slate-500">{time}</div>
                  <div className="text-[10px] text-slate-400">#{eventIndex}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isEventCursorActive && (
        <button
          onClick={handleJumpToPresent}
          className="w-full h-9 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100"
        >
          Torna al presente
        </button>
      )}
    </div>
  );
};
