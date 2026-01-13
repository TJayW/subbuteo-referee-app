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
import type { RegulationPeriod } from '@/domain/match/types';
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

  const phaseLabel = PHASE_LABELS[state.matchPhase];

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
      className={`w-full px-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
        confirmFlag ? 'bg-red-600 text-white' : color
      }`}
    >
      <IconComp className="w-4 h-4" />
      {confirmFlag ? 'Confirm' : label}
    </button>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-3 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold text-slate-600">Phase</p>
          <p className="text-sm font-bold text-slate-900">{phaseLabel}</p>
          <p className="text-[11px] text-slate-500">{state.matchStatus === 'suspended' ? 'Suspended' : isPlaying ? 'Running' : 'Paused'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={timerActions.onToggleTimerLock}
            className={`px-2 py-1 rounded text-xs border ${state.timerLocked ? 'border-red-200 text-red-700 bg-red-50' : 'border-slate-200 text-slate-700'}`}
          >
            {state.timerLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          {state.matchStatus === 'suspended' && (
            <span className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Suspended</span>
          )}
          {historyActions?.onUndo && (
            <IconButton
              size="sm"
              variant="ghost"
              onClick={historyActions.onUndo}
              disabled={historyActions.undoDisabled}
              title="Undo"
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
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </IconButton>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={timerActions.onPlayPause}
            className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 ${
              isPlaying ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={phaseActions.onEndPeriod}
            className="flex-1 px-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 bg-slate-900 text-white"
          >
            <Flag className="w-4 h-4" />
            End segment
          </button>
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
          <p className="text-[11px] text-red-600">Timer locked: unlock to edit time or change phase.</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Time controls</span>
          <span className="text-[11px] text-slate-500">Total {Math.round(state.totalPeriodSeconds / 60)}m</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={exactMinutes}
            onChange={(e) => setExactMinutes(e.target.value)}
            className="w-16 border border-slate-200 rounded px-2 py-1 text-sm"
            placeholder="mm"
            min={0}
          />
          <span className="text-slate-500">:</span>
          <input
            type="number"
            value={exactSeconds}
            onChange={(e) => setExactSeconds(e.target.value)}
            className="w-16 border border-slate-200 rounded px-2 py-1 text-sm"
            placeholder="ss"
            min={0}
            max={59}
          />
          <button
            onClick={handleExactSubmit}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
            disabled={state.timerLocked}
          >
            Set exact
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DURATION_PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => timerActions.onSetTotalPeriodSeconds(m * 60)}
              className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-800"
              disabled={state.timerLocked}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Recovery</span>
          <span className="text-[11px] text-slate-500">Configured {currentRecoveryValue / 60}m</span>
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
          <button
            onClick={() => currentRecoveryPeriod && recoveryActions.onAddRecovery(currentRecoveryPeriod, stoppageMinutes * 60)}
            className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold"
            disabled={!currentRecoveryPeriod || state.timerLocked}
          >
            Add recovery
          </button>
        </div>
        {currentRecoveryPeriod && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Set recovery (min)</span>
            <input
              type="number"
              min={0}
              value={(currentRecoveryValue / 60).toFixed(0)}
              onChange={(e) => recoveryActions.onSetRecovery(currentRecoveryPeriod, Math.max(0, Number(e.target.value)) * 60)}
              className="w-16 border border-slate-200 rounded px-2 py-1 text-sm"
              disabled={state.timerLocked}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Phase & Decision</span>
          <label className="flex items-center gap-2 text-[11px]">
            <input
              type="checkbox"
              checked={state.allowPhaseOverride}
              onChange={(e) => configActions.onAllowOverride(e.target.checked)}
            />
            Override
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton action="secondary" size="sm" onClick={phaseActions.onSkipHalftime} disabled={state.timerLocked}>
            <CornerUpRight className="w-4 h-4" />
            Skip halftime
          </ActionButton>
          <ActionButton action="secondary" size="sm" onClick={() => configActions.onRequireExtraTime(!state.requireExtraTime)}>
            <Clock className="w-4 h-4" />
            {state.requireExtraTime ? 'Tie-break on' : 'Tie-break off'}
          </ActionButton>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] text-slate-600">Allowed next steps</p>
          <div className="flex flex-wrap gap-2">
            {nextPhases.map((phase) => (
              <button
                key={phase}
                onClick={() => phaseActions.onSetMatchPhase(phase)}
                className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-1"
                disabled={state.timerLocked}
              >
                <ChevronRight className="w-3 h-3" />
                {PHASE_LABELS[phase]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Status</span>
        </div>
        {state.matchStatus === 'suspended' ? (
          <button
            className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
            onClick={emergencyActions.onResume}
          >
            <Play className="w-4 h-4" />
            Resume
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Suspend reason"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              rows={2}
            />
            <button
              className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              onClick={() => suspensionReason.trim() && emergencyActions.onSuspend(suspensionReason.trim())}
            >
              <PauseCircle className="w-4 h-4" />
              Suspend
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
          {dangerousButton('Terminate', phaseActions.onTerminateMatch, confirmTerminate, setConfirmTerminate, ShieldOff, 'bg-red-50 text-red-700')}
          {dangerousButton('Reset', emergencyActions.onReset, confirmReset, setConfirmReset, RefreshCw, 'bg-slate-100 text-slate-700')}
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>Emergency</span>
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
            className={`w-full px-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 ${
              confirmEmergency ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> {confirmEmergency ? 'Confirm end' : 'Emergency End'}
          </button>
        </div>
        <div className="text-[11px] text-slate-500">
          Score: <span className="font-mono font-semibold">{homeTeamGoals} - {awayTeamGoals}</span>
        </div>
      </div>
    </div>
  );
};
