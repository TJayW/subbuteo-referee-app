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

type HoldActionOptions = {
  duration?: number;
  guard?: () => boolean;
  onGuardFail?: () => void;
};

const useHoldAction = (onComplete: () => void, options: HoldActionOptions = {}) => {
  const { duration = HOLD_DURATION_MS, guard, onGuardFail } = options;
  const [progress, setProgress] = useState(0);
  const holdRaf = useRef<number | null>(null);
  const holdStart = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (holdRaf.current) {
      cancelAnimationFrame(holdRaf.current);
    }
    holdRaf.current = null;
    holdStart.current = null;
    setProgress(0);
  }, []);

  const runHold = useCallback(() => {
    if (!holdStart.current) return;
    const elapsed = Date.now() - holdStart.current;
    const nextProgress = Math.min(100, (elapsed / duration) * 100);
    setProgress(nextProgress);
    if (elapsed >= duration) {
      onComplete();
      clear();
      return;
    }
    holdRaf.current = requestAnimationFrame(runHold);
  }, [clear, duration, onComplete]);

  const start = useCallback(
    (e?: React.PointerEvent<HTMLButtonElement>) => {
      if (guard && !guard()) {
        onGuardFail?.();
        return;
      }
      holdStart.current = Date.now();
      if (e?.currentTarget && 'setPointerCapture' in e.currentTarget) {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
      runHold();
    },
    [guard, onGuardFail, runHold]
  );

  const end = useCallback(() => {
    clear();
  }, [clear]);

  return { progress, start, end, clear };
};

interface HoldButtonProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  progress: number;
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onKeyDown: () => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
  onKeyUp: () => void;
  tone: string;
  progressTone: string;
}

const HoldButton: React.FC<HoldButtonProps> = ({
  label,
  icon: Icon,
  progress,
  onPointerDown,
  onKeyDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyUp,
  tone,
  progressTone,
}) => (
  <button
    onPointerDown={onPointerDown}
    onPointerUp={onPointerUp}
    onPointerLeave={onPointerLeave}
    onPointerCancel={onPointerCancel}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onKeyDown();
      }
    }}
    onKeyUp={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onKeyUp();
      }
    }}
    className={`relative w-full px-3 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border ${tone}`}
  >
    <Icon className="w-4 h-4" />
    {label}
    {progress > 0 && (
      <span
        className={`absolute left-0 bottom-0 h-0.5 ${progressTone}`}
        style={{ width: `${progress}%` }}
      />
    )}
  </button>
);

export const MatchControlCard: React.FC<MatchControlCardProps> = ({
  state,
  homeTeamGoals,
  awayTeamGoals,
  phaseActions,
  configActions,
  emergencyActions,
}) => {
  const [suspensionReason, setSuspensionReason] = useState('');
  const [holdHint, setHoldHint] = useState<string | null>(null);

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

  const suspendHold = useHoldAction(
    () => {
      const reason = suspensionReason.trim();
      if (!reason) return;
      emergencyActions.onSuspend(reason);
      setSuspensionReason('');
    },
    {
      guard: () => !!suspensionReason.trim(),
      onGuardFail: () => setHoldHint('Inserisci un motivo prima di sospendere'),
    }
  );

  const terminateHold = useHoldAction(() => phaseActions.onTerminateMatch());
  const resetHold = useHoldAction(() => emergencyActions.onReset());

  return (
    <div className="console-card p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="console-kicker">Decisioni gara</p>
          <p className="text-sm font-bold text-slate-900">{phaseLabel}</p>
          <span
            className={`console-pill ${
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
          <ActionButton
            action="secondary"
            size="sm"
            onClick={() => configActions.onRequireExtraTime(!state.requireExtraTime)}
          >
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

      <div className="console-card-muted p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Sospensione</span>
          <span className="text-[11px] text-slate-500">Tieni premuto 3s</span>
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
              onChange={(e) => {
                setSuspensionReason(e.target.value);
                setHoldHint(null);
              }}
              rows={2}
            />
          <HoldButton
            label="Sospendi"
            icon={PauseCircle}
            progress={suspendHold.progress}
            onPointerDown={(e) => {
              setHoldHint(null);
              suspendHold.start(e);
            }}
            onKeyDown={() => {
              setHoldHint(null);
              suspendHold.start();
            }}
            onPointerUp={suspendHold.end}
            onPointerLeave={suspendHold.end}
            onPointerCancel={suspendHold.end}
            onKeyUp={suspendHold.end}
            tone="border-amber-200 bg-amber-50 text-amber-800"
            progressTone="bg-amber-500"
          />
            {holdHint && <p className="text-[11px] text-amber-700">{holdHint}</p>}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Azioni critiche</span>
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <HoldButton
            label="Termina gara"
            icon={ShieldOff}
            progress={terminateHold.progress}
            onPointerDown={terminateHold.start}
            onKeyDown={() => terminateHold.start()}
            onPointerUp={terminateHold.end}
            onPointerLeave={terminateHold.end}
            onPointerCancel={terminateHold.end}
            onKeyUp={terminateHold.end}
            tone="border-red-200 bg-red-50 text-red-700"
            progressTone="bg-red-500"
          />
          <HoldButton
            label="Reset"
            icon={RefreshCw}
            progress={resetHold.progress}
            onPointerDown={resetHold.start}
            onKeyDown={() => resetHold.start()}
            onPointerUp={resetHold.end}
            onPointerLeave={resetHold.end}
            onPointerCancel={resetHold.end}
            onKeyUp={resetHold.end}
            tone="border-slate-200 bg-slate-100 text-slate-700"
            progressTone="bg-slate-500"
          />
        </div>
        <div className="text-[11px] text-slate-500">
          Risultato: <span className="font-mono font-semibold">{homeTeamGoals} - {awayTeamGoals}</span>
        </div>
      </div>
    </div>
  );
};
