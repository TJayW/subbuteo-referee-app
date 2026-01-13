/**
 * TimeCard - Timer control and period management
 * Minimal implementation for tests
 */
import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { DomainMatchState, MatchEvent } from '@/domain/match/types';

interface TimeCardProps {
  state: DomainMatchState;
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
  isPlaying,
  onPlayPause,
}) => {
  const minutes = Math.floor(state.elapsedSeconds / 60);
  const seconds = state.elapsedSeconds % 60;
  const displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-white space-y-3" data-testid="time-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Tempo</h3>
        <span className="text-2xl font-mono font-bold text-slate-900">{displayTime}</span>
      </div>
      
      <button
        onClick={onPlayPause}
        aria-label={isPlaying ? "Pausa cronometro" : "Avvia il cronometro"}
        aria-pressed={isPlaying}
        role="switch"
        disabled={state.period === 'pre_match'}
        className={`w-full h-14 rounded-lg flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 ${
          isPlaying
            ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
            : 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700'
        }`}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        {isPlaying ? 'Pausa' : 'Avvia'}
      </button>

      <div className="text-xs text-slate-600 text-center capitalize">
        {state.period.replace(/_/g, ' ')}
      </div>
    </div>
  );
};
