import React from 'react';
import { Clock, Lock, Unlock, History } from 'lucide-react';
import type { DomainMatchState } from '@/domain/match/types';
import { PERIOD_LABELS } from '@/constants/periods';

interface ConsoleStatusStripProps {
  state: DomainMatchState;
  isEventCursorActive: boolean;
  currentCursor: number;
  totalEvents: number;
}

const statusTone: Record<DomainMatchState['matchStatus'], string> = {
  not_started: 'bg-slate-100 text-slate-700 border-slate-200',
  in_progress: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  finished: 'bg-slate-100 text-slate-700 border-slate-200',
  terminated: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabel: Record<DomainMatchState['matchStatus'], string> = {
  not_started: 'Pronta',
  in_progress: 'In corso',
  paused: 'In pausa',
  suspended: 'Sospesa',
  finished: 'Terminata',
  terminated: 'Terminata',
};

export const ConsoleStatusStrip: React.FC<ConsoleStatusStripProps> = ({
  state,
  isEventCursorActive,
  currentCursor,
  totalEvents,
}) => {
  return (
    <div className="console-card-muted px-3 py-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className={`console-pill ${statusTone[state.matchStatus]}`}>
          {statusLabel[state.matchStatus]}
        </span>
        <span className="console-pill bg-white text-slate-700 border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          {PERIOD_LABELS[state.period] ?? state.period}
        </span>
        {state.timerLocked && (
          <span className="console-pill bg-amber-50 text-amber-800 border-amber-200">
            <Lock className="w-3.5 h-3.5" />
            Timer bloccato
          </span>
        )}
        {!state.timerLocked && (
          <span className="console-pill bg-slate-50 text-slate-600 border-slate-200">
            <Unlock className="w-3.5 h-3.5" />
            Timer libero
          </span>
        )}
      </div>

      {isEventCursorActive && (
        <span className="console-pill bg-amber-50 text-amber-800 border-amber-200">
          <History className="w-3.5 h-3.5" />
          Revisione eventi {currentCursor}/{totalEvents}
        </span>
      )}
    </div>
  );
};
