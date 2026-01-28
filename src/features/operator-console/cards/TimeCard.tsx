/**
 * TimeCard - Rebuilt match clock + time controls
 * Optimized for fast operations and minimal cognitive load.
 */
import React, { useMemo, useState, useCallback } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Lock, Unlock, Flag, ChevronDown, ChevronUp, PencilLine } from 'lucide-react';
import type { DomainMatchState, MatchEvent, RegulationPeriod } from '@/domain/match/types';
import { PERIOD_LABELS } from '@/constants/periods';

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
  onEndPeriod?: () => void;
  timerLocked?: boolean;
  defaultExtraTimeDurationMinutes?: number;
  lastEvent?: MatchEvent | null;
  layout?: 'sidebar' | 'horizontal' | 'mobile';
  onSettingsClick?: () => void;
  onAddRecovery?: (period: RegulationPeriod, seconds: number) => void;
  onSetRecovery?: (period: RegulationPeriod, seconds: number) => void;
}

const durationPresets = [45, 40, 30, 20, 15, 10];

const formatClock = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const parseClockInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(':');
  if (parts.length > 2) return null;

  const mins = parseInt(parts[0], 10);
  const secs = parts.length === 2 ? parseInt(parts[1], 10) : 0;
  if (Number.isNaN(mins) || Number.isNaN(secs)) return null;
  if (mins < 0 || secs < 0 || secs > 59) return null;
  return mins * 60 + secs;
};

export const TimeCard: React.FC<TimeCardProps> = ({
  state,
  isPlaying,
  onPlayPause,
  onAddTime,
  onRemoveTime,
  onPreviousPeriod,
  onNextPeriod,
  onSetTotalPeriodSeconds,
  onSetExactTime,
  onToggleTimerLock,
  onEndPeriod,
  timerLocked,
  onAddRecovery,
  onSetRecovery,
}) => {
  const displayTime = formatClock(state.elapsedSeconds);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayTime);
  const [editError, setEditError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stoppageMinutes, setStoppageMinutes] = useState(1);

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

  const currentRecoveryPeriod = useMemo<RegulationPeriod | null>(() => {
    if (state.period === 'first_half' || state.period === 'first_half_recovery') return 'first_half';
    if (state.period === 'second_half' || state.period === 'second_half_recovery') return 'second_half';
    if (state.period === 'extra_time_1' || state.period === 'extra_time_1_recovery') return 'extra_time_1';
    if (state.period === 'extra_time_2' || state.period === 'extra_time_2_recovery') return 'extra_time_2';
    return null;
  }, [state.period]);

  const currentRecoveryValue = currentRecoveryPeriod
    ? state.recoverySeconds[currentRecoveryPeriod] ?? 0
    : 0;

  const beginInlineEdit = useCallback(() => {
    if (timerLocked) return;
    setEditValue(displayTime);
    setEditError(null);
    setIsEditing(true);
  }, [displayTime, timerLocked]);

  const commitInlineEdit = useCallback(() => {
    if (!onSetExactTime) {
      setIsEditing(false);
      return;
    }
    const parsed = parseClockInput(editValue);
    if (parsed === null) {
      setEditError('Formato non valido (mm:ss)');
      return;
    }
    if (parsed > state.totalPeriodSeconds) {
      setEditError('Oltre il limite del periodo');
      return;
    }
    onSetExactTime(parsed);
    setIsEditing(false);
    setEditError(null);
  }, [editValue, onSetExactTime, state.totalPeriodSeconds]);

  const cancelInlineEdit = useCallback(() => {
    setIsEditing(false);
    setEditError(null);
  }, []);

  return (
    <div className="ui-surface p-4 space-y-4" data-testid="time-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="ui-kicker">Cronometro</p>
          <div className="flex items-center gap-2">
            <span className="ui-chip bg-slate-50 text-slate-700 border-slate-200">{periodLabel}</span>
            <span className="ui-chip bg-white text-slate-700 border-slate-200">{statusLabel}</span>
          </div>
        </div>
        <button
          onClick={() => onToggleTimerLock?.()}
          disabled={!onToggleTimerLock}
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${
            timerLocked
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-white text-slate-700 border-slate-200'
          }`}
          aria-label={timerLocked ? 'Sblocca timer' : 'Blocca timer'}
        >
          {timerLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          {timerLocked ? 'Bloccato' : 'Libero'}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitInlineEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitInlineEdit();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelInlineEdit();
                  }
                }}
                className="w-28 ui-input text-center font-display text-lg"
                aria-label="Imposta tempo (mm:ss)"
                autoFocus
              />
              <button
                onClick={commitInlineEdit}
                className="px-2 py-1 text-xs font-semibold rounded-md bg-sky-600 text-white hover:bg-sky-700"
              >
                OK
              </button>
            </div>
          ) : (
            <button
              type="button"
              onDoubleClick={beginInlineEdit}
              onClick={() => undefined}
              className="text-3xl font-semibold text-slate-900 tabular-nums font-display tracking-tight"
              aria-label="Doppio click per modificare il tempo"
            >
              {displayTime}
            </button>
          )}
          {editError && <span className="text-xs text-red-600">{editError}</span>}
          {!isEditing && (
            <button
              type="button"
              onClick={beginInlineEdit}
              disabled={timerLocked}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 disabled:opacity-40"
            >
              <PencilLine className="w-3 h-3" />
              Modifica tempo
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPreviousPeriod}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Periodo precedente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextPeriod}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Periodo successivo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pausa cronometro' : 'Avvia cronometro'}
          aria-pressed={isPlaying}
          role="switch"
          disabled={state.period === 'pre_match'}
          className={`h-12 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            isPlaying
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pausa' : 'Avvia'}
        </button>
        <button
          onClick={() => onEndPeriod?.()}
          disabled={timerLocked || !onEndPeriod}
          className="h-12 rounded-lg flex items-center justify-center gap-2 font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          <Flag className="w-4 h-4" />
          Termina periodo
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onRemoveTime(10)}
          disabled={timerLocked}
          className="flex-1 h-10 rounded-md border border-red-200 text-red-700 bg-red-50 text-xs font-semibold hover:bg-red-100 disabled:opacity-40"
        >
          -10s
        </button>
        <button
          onClick={() => onAddTime(10)}
          disabled={timerLocked}
          className="flex-1 h-10 rounded-md border border-emerald-200 text-emerald-700 bg-emerald-50 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-40"
        >
          +10s
        </button>
      </div>

      {timerLocked && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 text-center">
          Timer bloccato: sblocca per modifiche al tempo
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAdvanced((prev) => !prev)}
        className="flex items-center justify-between w-full text-xs font-semibold text-slate-600"
      >
        <span>Avanzate</span>
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showAdvanced && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>Durata periodo</span>
              <span className="text-[11px] text-slate-500">Totale {Math.round(state.totalPeriodSeconds / 60)}m</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {durationPresets.map((m) => (
                <button
                  key={m}
                  onClick={() => onSetTotalPeriodSeconds?.(m * 60)}
                  className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-200"
                  disabled={timerLocked}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>Recupero</span>
              <span className="text-[11px] text-slate-500">Configurato {currentRecoveryValue / 60}m</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStoppageMinutes(Math.max(0, stoppageMinutes - 1))}
                className="p-2 bg-slate-100 rounded"
                disabled={timerLocked}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold text-slate-900 tabular-nums">{stoppageMinutes}m</span>
              <button
                onClick={() => setStoppageMinutes(stoppageMinutes + 1)}
                className="p-2 bg-slate-100 rounded"
                disabled={timerLocked}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => currentRecoveryPeriod && onAddRecovery?.(currentRecoveryPeriod, stoppageMinutes * 60)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={!currentRecoveryPeriod || timerLocked}
              >
                Aggiungi recupero
              </button>
            </div>
            {currentRecoveryPeriod && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Imposta recupero (min)</span>
                <input
                  type="number"
                  min={0}
                  value={(currentRecoveryValue / 60).toFixed(0)}
                  onChange={(e) => onSetRecovery?.(currentRecoveryPeriod, Math.max(0, Number(e.target.value)) * 60)}
                  className="w-16 ui-input"
                  disabled={timerLocked}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
