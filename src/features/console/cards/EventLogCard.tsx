/**
 * EventLogCard - Rebuilt timeline with navigation and history actions
 */
import React, { useMemo } from 'react';
import { Undo2, Redo2, CornerDownLeft } from 'lucide-react';
import type { DisplayMatchEvent } from '@/utils/event-display-helpers';
import { getEventMetadata } from '@/utils/event-helpers';
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
    <div
      className="console-card h-full p-4 flex flex-col gap-3"
      data-testid="event-log-card"
      role="log"
      aria-label="Registro eventi"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="console-kicker">Registro eventi</p>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Timeline</h3>
            <span className="console-pill">
              {appliedEvents.length > 0 ? `${appliedEvents.length} eventi` : 'Nessun evento'}
            </span>
            {isEventCursorActive && (
              <span className="console-pill bg-amber-50 text-amber-800 border-amber-200">
                Revisione {currentCursor}/{totalEvents}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">Seleziona un evento per spostarti nella timeline.</p>
        </div>
        <div className="flex items-center gap-1">
          {onUndoDomain && (
            <IconButton
              size="sm"
              variant="ghost"
              onClick={onUndoDomain}
              disabled={undoDisabled}
              title="Annulla (globale)"
              className="rounded-xl"
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
              className="rounded-xl"
            >
              <Redo2 className="w-4 h-4" />
            </IconButton>
          )}
          {appliedEvents.length > 0 && canNavigate && (
            <button
              onClick={onUndoLastEvent}
              aria-label="Torna indietro di un evento"
              className="h-8 w-8 rounded-xl border border-slate-200/70 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {appliedEvents.length === 0 && (
        <div className="console-card-muted px-3 py-2 text-sm text-slate-500">
          Nessun evento registrato. Avvia la partita per iniziare.
        </div>
      )}

      {appliedEvents.length > 0 && (
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {visibleEvents.map((event, idx) => {
            const meta = getEventMetadata(event.type);
            const teamName = event.team === 'home' ? homeTeamName : awayTeamName;
            const eventIndex = appliedEvents.length - visibleEvents.length + idx + 1;
            const note = event.note?.trim();
            return (
              <button
                key={event.id || idx}
                onClick={() => canNavigate && onSetCursor?.(eventIndex)}
                className="group w-full text-left flex items-center gap-3 rounded-xl border border-slate-100/80 bg-white/90 px-3 py-2 text-xs transition-all hover:bg-slate-50"
              >
                <div className="h-8 w-8 rounded-xl bg-slate-900/5 text-base flex items-center justify-center">
                  {meta.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 truncate">{meta.label}</span>
                    <span className="text-[10px] text-slate-400">#{eventIndex}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {teamName}
                    {note ? ` · ${note}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-slate-600">{event.minutes}'</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isEventCursorActive && (
        <button
          onClick={handleJumpToPresent}
          className="w-full h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100"
        >
          Torna al presente
        </button>
      )}
    </div>
  );
};
