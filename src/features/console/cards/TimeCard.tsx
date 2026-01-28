/**
 * TimeCard - Timer control and period management
 * Minimal implementation for tests
 */
import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { DomainMatchState, MatchEvent } from '@/domain/match/types';
import { PERIOD_LABELS } from '@/constants/periods';

interface TimeCardProps {
  state: DomainMatchState;
  displayTime: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onAddTime: (seconds: number) => void;
  onRemoveTime: (seconds: number) => void;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onSetPeriod?: (period: string) => void;
  onSetTotalPeriodSeconds?: (seconds: number) => void;
  onSetExactTime?: (seconds: number) => void;
  onToggleTimerLock?: () => void;
  timerLocked?: boolean;
  defaultExtraTimeDurationMinutes?: number;
  lastEvent?: MatchEvent | null;
  layout?: 'panel' | 'horizontal' | 'mobile';
  onSettingsClick?: () => void;
}

export const TimeCard: React.FC<TimeCardProps> = ({
  state,
  displayTime,
  isPlaying,
  onPlayPause,
}) => {
  const periodLabel = PERIOD_LABELS[state.period] ?? state.period.replace(/_/g, ' ');
  const statusLabel =
    state.matchStatus === 'suspended'
      ? 'Sospesa'
      : state.matchStatus === 'finished'
      ? 'Terminata'
      : state.matchStatus === 'paused'
      ? 'In pausa'
      : state.matchStatus === 'in_progress'
      ? 'In corso'
      : 'Pronta';

  return (
    <div className="ui-surface p-4 space-y-3" data-testid="time-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ui-kicker">Cronometro</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-slate-900 tabular-nums font-display" aria-live="polite">
              {displayTime}
            </span>
            <span className="ui-chip bg-slate-50 text-slate-600 border-slate-200">{statusLabel}</span>
          </div>
        </div>
        <span className="ui-chip bg-white text-slate-700 border-slate-200">{periodLabel}</span>
      </div>
      
      <button
        onClick={onPlayPause}
        aria-label={isPlaying ? "Pausa cronometro" : "Avvia il cronometro"}
        aria-pressed={isPlaying}
        disabled={state.period === 'pre_match'}
        className={`w-full h-14 rounded-lg flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0 ${
          isPlaying
            ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
            : 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700'
        }`}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        {isPlaying ? 'Pausa' : 'Avvia'}
      </button>

      {state.timerLocked && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 text-center">
          Timer bloccato: sblocca per modifiche al tempo
        </div>
      )}
    </div>
  );
};
