import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  AlertTriangle,
  ShieldOff,
  RefreshCw,
  PauseCircle,
  Play,
  ChevronRight,
  CornerUpRight,
  Clock,
} from 'lucide-react';
import type { MatchPhase } from '@/domain/match/types';
import { PHASE_LABELS, defaultNextPhases } from '@/domain/match/fsm';
import { ActionButton } from '@/ui/primitives';
import type { MatchControlCardProps } from './MatchControlCard.types';

const HOLD_DURATION_MS = 3000;

export const MatchControlCard: React.FC<MatchControlCardProps> = ({
  state,
  homeTeamGoals,
  awayTeamGoals,
  phaseActions,
  configActions,
  emergencyActions,
}) => {
  const [suspensionReason, setSuspensionReason] = useState('');
  const [confirmTerminate, setConfirmTerminate] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmEmergency, setConfirmEmergency] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdHint, setHoldHint] = useState<string | null>(null);
  const holdRaf = useRef<number | null>(null);
  const holdStart = useRef<number | null>(null);

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
      : state.isRunning
      ? 'In corso'
      : 'In pausa';

  const nextPhases = useMemo(() => defaultNextPhases(state), [state]);

  const clearHold = useCallback(() => {
    if (holdRaf.current) {
      cancelAnimationFrame(holdRaf.current);
    }
    holdRaf.current = null;
    holdStart.current = null;
    setHoldProgress(0);
  }, []);

  const runHold = useCallback(() => {
    if (!holdStart.current) return;
    const elapsed = Date.now() - holdStart.current;
    const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
    setHoldProgress(progress);
    if (elapsed >= HOLD_DURATION_MS) {
      const reason = suspensionReason.trim();
      if (reason) {
        emergencyActions.onSuspend(reason);
        setSuspensionReason('');
      }
      clearHold();
      return;
    }
    holdRaf.current = requestAnimationFrame(runHold);
  }, [clearHold, emergencyActions, suspensionReason]);

  const handleHoldStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!suspensionReason.trim()) {
      setHoldHint('Inserisci un motivo prima di sospendere');
      return;
    }
    setHoldHint(null);
    holdStart.current = Date.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    runHold();
  };

  const handleHoldEnd = () => {
    clearHold();
  };

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
          <p className="ui-kicker">Decisioni gara</p>
          <p className="text-sm font-bold text-slate-900">{phaseLabel}</p>
          <span
            className={`ui-chip ${
              state.matchStatus === 'suspended'
                ? 'bg-red-50 text-red-700 border-red-200'
                : state.isRunning
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {statusLabel}
          </span>
        </div>
        <div className="text-xs text-slate-600 font-semibold">
          {homeTeamGoals} - {awayTeamGoals}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Regole e fase</span>
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
          <ActionButton action="secondary" size="sm" onClick={phaseActions.onSkipHalftime}>
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
            <button
              onPointerDown={handleHoldStart}
              onPointerUp={handleHoldEnd}
              onPointerLeave={handleHoldEnd}
              onPointerCancel={handleHoldEnd}
              className="relative w-full px-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 border border-amber-200 bg-amber-50 text-amber-800"
            >
              <PauseCircle className="w-4 h-4" />
              Tieni premuto 3s per sospendere
              {holdProgress > 0 && (
                <span
                  className="absolute left-0 bottom-0 h-0.5 bg-amber-500"
                  style={{ width: `${holdProgress}%` }}
                />
              )}
            </button>
            {holdHint && <p className="text-[11px] text-amber-700">{holdHint}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
        {dangerousButton('Termina gara', phaseActions.onTerminateMatch, confirmTerminate, setConfirmTerminate, ShieldOff, 'bg-red-50 text-red-700 border-red-200')}
        {dangerousButton('Reset', emergencyActions.onReset, confirmReset, setConfirmReset, RefreshCw, 'bg-slate-100 text-slate-700 border-slate-200')}
      </div>

      <div className="border-t border-slate-200 pt-3 space-y-2">
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
        <div className="text-[11px] text-slate-500">
          Risultato: <span className="font-mono font-semibold">{homeTeamGoals} - {awayTeamGoals}</span>
        </div>
      </div>
    </div>
  );
};
