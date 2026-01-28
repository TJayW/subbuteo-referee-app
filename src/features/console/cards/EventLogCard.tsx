/**
 * EventLogCard - Rebuilt timeline with navigation and history actions
 */
import React, { useMemo } from 'react';
import { Undo2, Redo2, CornerDownLeft } from 'lucide-react';
import type { DisplayMatchEvent } from '@/utils/event-display-helpers';
import { IconButton } from '@/ui/primitives';

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
  onSetCursor?: (cursor: number) => void;
  onUndoDomain?: () => void;
  onRedoDomain?: () => void;
  undoDisabled?: boolean;
  redoDisabled?: boolean;
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
  onSetCursor,
  onUndoDomain,
  onRedoDomain,
  undoDisabled,
  redoDisabled,
}) => {
  const visibleEvents = useMemo(() => recentEvents.slice(-8), [recentEvents]);

  const handleJumpToPresent = () => {
    if (onSetCursor) onSetCursor(totalEvents);
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
                Revisione {currentCursor}/{totalEvents}
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
          {appliedEvents.length > 0 && canNavigate && (
            <button
              onClick={onUndoLastEvent}
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
          {visibleEvents.map((event, idx) => {
            const teamName = event.team === 'home' ? homeTeamName : awayTeamName;
            const eventIndex = appliedEvents.length - visibleEvents.length + idx + 1;
            return (
              <button
                key={event.id || idx}
                onClick={() => canNavigate && onSetCursor?.(eventIndex)}
                className="w-full text-left flex items-center justify-between gap-3 text-xs p-2 rounded border border-slate-100 bg-slate-50 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{event.icon}</span>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{event.label}</div>
                    <div className="text-slate-500 truncate">{teamName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-slate-500">{event.minutes}'</div>
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
