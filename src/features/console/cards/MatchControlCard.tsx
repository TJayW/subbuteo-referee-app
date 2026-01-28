import React, { useMemo, useState } from 'react';
import {
  Play,
  Pause,
  Lock,
  Unlock,
  Plus,
  Minus,
  Flag,
  AlertTriangle,
  CornerUpRight,
  ChevronRight,
  Clock,
  RefreshCw,
  ShieldOff,
  Undo2,
  Redo2,
  PauseCircle,
} from 'lucide-react';
import type { RegulationPeriod, MatchPhase } from '@/domain/match/types';
import { PHASE_LABELS, defaultNextPhases } from '@/domain/match/fsm';
import { TIME_ADJUSTMENTS, DURATION_PRESETS } from '@/constants/match-control';
import { ActionButton, IconButton } from '@/ui/primitives';
import type { MatchControlCardProps } from './MatchControlCard.types';

export const MatchControlCard: React.FC<MatchControlCardProps> = ({
  state,
  isPlaying,
  homeTeamGoals,
  awayTeamGoals,
  timerActions,
  recoveryActions,
  phaseActions,
  configActions,
  emergencyActions,
  historyActions,
}) => {
  const [suspensionReason, setSuspensionReason] = useState('');
  const [confirmTerminate, setConfirmTerminate] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmEmergency, setConfirmEmergency] = useState(false);
  const [exactMinutes, setExactMinutes] = useState('');
  const [exactSeconds, setExactSeconds] = useState('');
  const [stoppageMinutes, setStoppageMinutes] = useState(1);

  const PHASE_LABELS_IT: Partial<Record<MatchPhase, string>> = {
    prematch_ready: 'Pre-partita',
    first_half_regulation: '1o tempo',
    first_half_recovery: '1o tempo - Recupero',
    half_time_interval: 'Intervallo',
    second_half_regulation: '2o tempo',
    second_half_recovery: '2o tempo - Recupero',
    extra_time_interval: 'Intervallo suppl.',
    extra_time_first_regulation: 'Suppl. 1',
    extra_time_first_recovery: 'Suppl. 1 - Recupero',
    extra_time_second_regulation: 'Suppl. 2',
    extra_time_second_recovery: 'Suppl. 2 - Recupero',
    penalties: 'Rigori',
    postmatch_complete: 'Fine partita',
    suspended: 'Sospesa',
    terminated: 'Terminata',
    resetting: 'Reset in corso',
  };

  const phaseLabel = PHASE_LABELS_IT[state.matchPhase] ?? PHASE_LABELS[state.matchPhase];
  const statusLabel =
    state.matchStatus === 'suspended'
      ? 'Sospesa'
      : state.matchStatus === 'terminated'
      ? 'Terminata'
      : state.matchStatus === 'finished'
      ? 'Terminata'
      : isPlaying
      ? 'In corso'
      : 'In pausa';

  const nextPhases = useMemo(() => defaultNextPhases(state), [state]);

  const handleExactSubmit = () => {
    const mins = parseInt(exactMinutes, 10) || 0;
    const secs = parseInt(exactSeconds, 10) || 0;
    const total = mins * 60 + secs;
    if (total < 0 || total > state.totalPeriodSeconds) return;
    timerActions.onSetExactTime(total);
    setExactMinutes('');
    setExactSeconds('');
  };

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

  const dangerousButton = (
    label: string,
    onClick: () => void,
    confirmFlag: boolean,
    setFlag: (v: boolean) => void,
    IconComp: React.ComponentType<any>,
    color: string
  ) => (
    <button
      onClick={() => {
        if (!confirmFlag) {
          setFlag(true);
          return;
        }
        onClick();
        setFlag(false);
      }}
      className={`w-full px-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors border ${
        confirmFlag ? 'bg-red-600 text-white border-red-700' : color
      }`}
    >
      <IconComp className="w-4 h-4" />
      {confirmFlag ? 'Conferma' : label}
    </button>
  );

  return (
    <div className="ui-surface p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="ui-kicker">Fase gara</p>
          <p className="text-sm font-bold text-slate-900">{phaseLabel}</p>
          <span className={`ui-chip ${state.matchStatus === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' : isPlaying ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={timerActions.onToggleTimerLock}
            className={`px-2.5 py-1.5 rounded-md text-xs border ${state.timerLocked ? 'border-amber-200 text-amber-800 bg-amber-50' : 'border-slate-200 text-slate-700 bg-white'}`}
          >
            {state.timerLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          {historyActions?.onUndo && (
            <IconButton
              size="sm"
              variant="ghost"
              onClick={historyActions.onUndo}
              disabled={historyActions.undoDisabled}
              title="Annulla evento"
            >
              <Undo2 className="w-4 h-4" />
            </IconButton>
          )}
          {historyActions?.onRedo && (
            <IconButton
              size="sm"
              variant="ghost"
              onClick={historyActions.onRedo}
              disabled={historyActions.redoDisabled}
              title="Ripeti evento"
            >
              <Redo2 className="w-4 h-4" />
            </IconButton>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ActionButton action={isPlaying ? 'warning' : 'success'} size="sm" onClick={timerActions.onPlayPause} className="flex-1">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pausa' : 'Avvia'}
          </ActionButton>
          <ActionButton action="primary" size="sm" onClick={phaseActions.onEndPeriod} className="flex-1">
            <Flag className="w-4 h-4" />
            Termina periodo
          </ActionButton>
        </div>
        <div className="flex items-center gap-1">
          {TIME_ADJUSTMENTS.map((delta) => (
            <button
              key={delta}
              onClick={() => timerActions.onAddTime(delta)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                delta > 0 ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-red-200 text-red-700 bg-red-50'
              }`}
            >
              {delta > 0 ? '+' : ''}{delta}s
            </button>
          ))}
        </div>
        {state.timerLocked && (
          <p className="text-[11px] text-amber-700">Timer bloccato: sblocca per modificare tempo o fase.</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Controlli tempo</span>
          <span className="text-[11px] text-slate-500">Totale {Math.round(state.totalPeriodSeconds / 60)}m</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={exactMinutes}
            onChange={(e) => setExactMinutes(e.target.value)}
            className="w-16 ui-input"
            placeholder="mm"
            min={0}
          />
          <span className="text-slate-500">:</span>
          <input
            type="number"
            value={exactSeconds}
            onChange={(e) => setExactSeconds(e.target.value)}
            className="w-16 ui-input"
            placeholder="ss"
            min={0}
            max={59}
          />
          <ActionButton action="primary" size="sm" onClick={handleExactSubmit} disabled={state.timerLocked}>
            Imposta
          </ActionButton>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DURATION_PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => timerActions.onSetTotalPeriodSeconds(m * 60)}
              className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-200"
              disabled={state.timerLocked}
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
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xl font-bold text-slate-900">{stoppageMinutes}m</span>
          <button
            onClick={() => setStoppageMinutes(stoppageMinutes + 1)}
            className="p-2 bg-slate-100 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
          <ActionButton
            action="success"
            size="sm"
            onClick={() => currentRecoveryPeriod && recoveryActions.onAddRecovery(currentRecoveryPeriod, stoppageMinutes * 60)}
            className="flex-1"
            disabled={!currentRecoveryPeriod || state.timerLocked}
          >
            Aggiungi recupero
          </ActionButton>
        </div>
        {currentRecoveryPeriod && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Imposta recupero (min)</span>
            <input
              type="number"
              min={0}
              value={(currentRecoveryValue / 60).toFixed(0)}
              onChange={(e) => recoveryActions.onSetRecovery(currentRecoveryPeriod, Math.max(0, Number(e.target.value)) * 60)}
              className="w-16 ui-input"
              disabled={state.timerLocked}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Fase e decisioni</span>
          <label className="flex items-center gap-2 text-[11px]">
            <input
              type="checkbox"
              checked={state.allowPhaseOverride}
              onChange={(e) => configActions.onAllowOverride(e.target.checked)}
              className="accent-slate-900"
            />
            Forza transizioni
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton action="secondary" size="sm" onClick={phaseActions.onSkipHalftime} disabled={state.timerLocked}>
            <CornerUpRight className="w-4 h-4" />
            Salta intervallo
          </ActionButton>
          <ActionButton action="secondary" size="sm" onClick={() => configActions.onRequireExtraTime(!state.requireExtraTime)}>
            <Clock className="w-4 h-4" />
            {state.requireExtraTime ? 'Supplementari: si' : 'Supplementari: no'}
          </ActionButton>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] text-slate-600">Prossime fasi consentite</p>
          <div className="flex flex-wrap gap-2">
            {nextPhases.map((phase) => (
              <button
                key={phase}
                onClick={() => phaseActions.onSetMatchPhase(phase)}
                className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-1 hover:bg-slate-200"
                disabled={state.timerLocked}
              >
                <ChevronRight className="w-3 h-3" />
                {PHASE_LABELS_IT[phase] ?? PHASE_LABELS[phase]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Stato gara</span>
        </div>
        {state.matchStatus === 'suspended' ? (
          <ActionButton action="success" size="sm" onClick={emergencyActions.onResume} className="w-full">
            <Play className="w-4 h-4" />
            Riprendi
          </ActionButton>
        ) : (
          <div className="space-y-2">
            <textarea
              className="ui-textarea"
              placeholder="Motivo sospensione"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              rows={2}
            />
            <ActionButton
              action="warning"
              size="sm"
              onClick={() => suspensionReason.trim() && emergencyActions.onSuspend(suspensionReason.trim())}
              className="w-full"
            >
              <PauseCircle className="w-4 h-4" />
              Sospendi
            </ActionButton>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
          {dangerousButton('Termina gara', phaseActions.onTerminateMatch, confirmTerminate, setConfirmTerminate, ShieldOff, 'bg-red-50 text-red-700 border-red-200')}
          {dangerousButton('Reset', emergencyActions.onReset, confirmReset, setConfirmReset, RefreshCw, 'bg-slate-100 text-slate-700 border-slate-200')}
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>Emergenza</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <button
            onClick={() => {
              if (!confirmEmergency) {
                setConfirmEmergency(true);
                return;
              }
              phaseActions.onTerminateMatch();
              setConfirmEmergency(false);
            }}
            className={`w-full px-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 border ${
              confirmEmergency ? 'bg-red-600 text-white border-red-700' : 'bg-red-100 text-red-700 border-red-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> {confirmEmergency ? 'Conferma termine' : "Termina d'emergenza"}
          </button>
        </div>
        <div className="text-[11px] text-slate-500">
          Risultato: <span className="font-mono font-semibold">{homeTeamGoals} - {awayTeamGoals}</span>
        </div>
      </div>
    </div>
  );
};
