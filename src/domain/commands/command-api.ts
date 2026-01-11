import { createInitialDomainMatchState } from '@/hooks/use-match-reducer';
import { MATCH_TIMING_DEFAULTS } from '@/constants/defaults';
import type { DomainMatchState, MatchPhase, RegulationPeriod } from '@/domain/match/types';
import { canTransition, defaultNextPhases, phaseToPeriod, toggleRecoveryPhase, transitionToPhase } from '@/domain/match/fsm';
import type {
  CommandResult,
  CommandFailure,
  CommandSuccess,
  CommandContext,
  SuspendPayload,
  ExactTimePayload,
  DurationPresetPayload,
  RecoveryPayload,
  TieBreakRule,
} from './types';
import { assertMatchInvariants } from '@/domain/validation/invariants';

const DEV = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

function success(nextState: DomainMatchState): CommandSuccess {
  if (DEV) {
    assertMatchInvariants(nextState);
  }
  return { ok: true, nextState };
}

function fail(code: CommandFailure['code'], message: string, meta?: CommandFailure['meta']): CommandFailure {
  return { ok: false, code, message, meta };
}

function ensureNotTerminal(state: DomainMatchState): CommandFailure | null {
  if (state.matchPhase === 'terminated' || state.matchPhase === 'postmatch_complete') {
    return fail('terminated', 'Match is terminated');
  }
  return null;
}

function ensureNotSuspended(state: DomainMatchState): CommandFailure | null {
  if (state.matchStatus === 'suspended') {
    return fail('suspended', 'Match is suspended');
  }
  return null;
}

export function commandStartTimer(ctx: CommandContext): CommandResult {
  const block = ensureNotTerminal(ctx.state) || ensureNotSuspended(ctx.state);
  if (block) return block;
  if (ctx.state.isRunning) return fail('already_state', 'Timer already running');
  return success({ ...ctx.state, isRunning: true, matchStatus: 'in_progress' });
}

export function commandPauseTimer(ctx: CommandContext): CommandResult {
  if (!ctx.state.isRunning) return fail('already_state', 'Timer already paused');
  return success({ ...ctx.state, isRunning: false, matchStatus: 'paused' });
}

export function commandToggleTimerLock(ctx: CommandContext): CommandResult {
  return success({ ...ctx.state, timerLocked: !ctx.state.timerLocked });
}

export function commandAdjustTimeBy(ctx: CommandContext, deltaSeconds: number): CommandResult {
  if (ctx.state.timerLocked) return fail('timer_locked', 'Timer is locked');
  const next = ctx.state.elapsedSeconds + deltaSeconds;
  if (next < 0 || next > ctx.state.totalPeriodSeconds) {
    return fail('out_of_bounds', 'Time adjustment exceeds bounds', { next });
  }
  return success({ ...ctx.state, elapsedSeconds: next });
}

export function commandSetExactTime(ctx: CommandContext, payload: ExactTimePayload): CommandResult {
  if (ctx.state.timerLocked) return fail('timer_locked', 'Timer is locked');
  const block = ensureNotTerminal(ctx.state);
  if (block) return block;
  let seconds = payload.seconds;
  if (seconds == null && payload.mmss) {
    const [m, s] = payload.mmss.split(':');
    const minsNum = parseInt(m || '0', 10);
    const secsNum = parseInt(s || '0', 10);
    seconds = minsNum * 60 + secsNum;
  }
  if (seconds == null || Number.isNaN(seconds)) {
    return fail('invalid_payload', 'Missing or invalid time');
  }
  if (seconds < 0 || seconds > ctx.state.totalPeriodSeconds) {
    return fail('out_of_bounds', 'Exact time must be within period bounds', { seconds });
  }
  return success({ ...ctx.state, elapsedSeconds: seconds });
}

export function commandSetPeriodDurationPreset(
  ctx: CommandContext,
  payload: DurationPresetPayload
): CommandResult {
  if (ctx.state.timerLocked) return fail('timer_locked', 'Timer is locked');
  let seconds = payload.seconds;
  if (seconds == null && payload.presetId) {
    switch (payload.presetId) {
      case 'regulation':
        seconds = MATCH_TIMING_DEFAULTS.PERIOD_DURATION_MINUTES * 60;
        break;
      case 'extra_time':
        seconds = MATCH_TIMING_DEFAULTS.EXTRA_TIME_DURATION_MINUTES * 60;
        break;
      case 'shootout':
        seconds = 5 * 60;
        break;
      default:
        break;
    }
  }
  if (seconds == null || Number.isNaN(seconds) || seconds < 60) {
    return fail('invalid_payload', 'Invalid duration preset');
  }
  return success({ ...ctx.state, totalPeriodSeconds: seconds });
}

function resolveRecoveryPeriod(state: DomainMatchState): RegulationPeriod | null {
  const p = state.period;
  if (p === 'first_half' || p === 'first_half_recovery') return 'first_half';
  if (p === 'second_half' || p === 'second_half_recovery') return 'second_half';
  if (p === 'extra_time_1' || p === 'extra_time_1_recovery') return 'extra_time_1';
  if (p === 'extra_time_2' || p === 'extra_time_2_recovery') return 'extra_time_2';
  return null;
}

export function commandAddRecovery(ctx: CommandContext, payload: RecoveryPayload): CommandResult {
  if (ctx.state.timerLocked) return fail('timer_locked', 'Timer is locked');
  const target = payload.period ?? resolveRecoveryPeriod(ctx.state);
  if (!target) return fail('invalid_recovery_context', 'No recovery period available');
  const current = ctx.state.recoverySeconds[target] ?? 0;
  const updated = Math.max(0, current + payload.seconds);
  const nextMap = { ...ctx.state.recoverySeconds, [target]: updated };
  const shouldToggle = phaseToPeriod(ctx.state.matchPhase) === target && updated > 0;
  const nextState: DomainMatchState = {
    ...ctx.state,
    recoverySeconds: nextMap,
    totalPeriodSeconds:
      phaseToPeriod(ctx.state.matchPhase) === target
        ? Math.max(ctx.state.totalPeriodSeconds, ctx.state.elapsedSeconds + updated)
        : ctx.state.totalPeriodSeconds,
  };
  return success(shouldToggle ? toggleRecoveryPhase(nextState, target) : nextState);
}

export function commandSetRecovery(ctx: CommandContext, payload: RecoveryPayload): CommandResult {
  if (ctx.state.timerLocked) return fail('timer_locked', 'Timer is locked');
  const target = payload.period ?? resolveRecoveryPeriod(ctx.state);
  if (!target) return fail('invalid_recovery_context', 'No recovery period available');
  const sanitized = Math.max(0, payload.seconds);
  const nextMap = { ...ctx.state.recoverySeconds, [target]: sanitized };
  const shouldToggle = phaseToPeriod(ctx.state.matchPhase) === target && sanitized > 0;
  const nextState: DomainMatchState = {
    ...ctx.state,
    recoverySeconds: nextMap,
    totalPeriodSeconds:
      phaseToPeriod(ctx.state.matchPhase) === target
        ? Math.max(ctx.state.totalPeriodSeconds, ctx.state.elapsedSeconds + sanitized)
        : ctx.state.totalPeriodSeconds,
  };
  return success(shouldToggle ? toggleRecoveryPhase(nextState, target) : nextState);
}

export function commandEndSegment(ctx: CommandContext): CommandResult {
  if (ctx.state.timerLocked) return fail('timer_locked', 'Timer is locked');
  const block = ensureNotTerminal(ctx.state) || ensureNotSuspended(ctx.state);
  if (block) return block;
  const nextOptions = defaultNextPhases(ctx.state);
  if (!nextOptions.length) return fail('illegal_phase_transition', 'No valid next phase');
  const target = nextOptions[0];
  if (target === ctx.state.matchPhase) {
    return fail('not_applicable', 'Already at end of segment');
  }
  return success(transitionToPhase(ctx.state, target));
}

export function commandSkipHalftime(ctx: CommandContext): CommandResult {
  if (ctx.state.timerLocked) return fail('timer_locked', 'Timer is locked');
  if (
    ctx.state.matchPhase === 'first_half_regulation' ||
    ctx.state.matchPhase === 'first_half_recovery'
  ) {
    return success(transitionToPhase(ctx.state, 'second_half_regulation'));
  }
  return fail('not_applicable', 'Skip halftime only allowed during first half');
}

export function commandSetOverrideJumps(ctx: CommandContext, enabled: boolean): CommandResult {
  return success({ ...ctx.state, allowPhaseOverride: enabled });
}

export function commandJumpToPhase(ctx: CommandContext, target: MatchPhase): CommandResult {
  if (ctx.state.timerLocked) return fail('timer_locked', 'Timer is locked');
  if (!ctx.state.allowPhaseOverride && !canTransition(ctx.state, target)) {
    return fail('phase_override_disabled', 'Override not enabled for jump');
  }
  const terminalBlock = ensureNotTerminal(ctx.state);
  if (terminalBlock) return terminalBlock;
  return success(transitionToPhase(ctx.state, target));
}

export function commandSetTieBreakRule(ctx: CommandContext, rule: TieBreakRule): CommandResult {
  // Map rules onto existing requireExtraTime flag
  const requireExtraTime = rule !== 'pens_only';
  return success({ ...ctx.state, requireExtraTime });
}

export function commandSuspend(ctx: CommandContext, payload: SuspendPayload): CommandResult {
  const block = ensureNotTerminal(ctx.state);
  if (block) return block;
  if (ctx.state.matchStatus === 'suspended') {
    return fail('already_state', 'Match already suspended');
  }
  const reason = payload.note?.trim() || payload.reasonPreset;
  if (!reason) {
    return fail('invalid_payload', 'Suspend requires a reason');
  }
  const nextState: DomainMatchState = {
    ...transitionToPhase(ctx.state, 'suspended'),
    isRunning: false,
    matchStatus: 'suspended',
    suspensionReason: reason,
  };
  return success(nextState);
}

export function commandResume(ctx: CommandContext): CommandResult {
  if (ctx.state.matchStatus !== 'suspended') {
    return fail('not_applicable', 'Match is not suspended');
  }
  // Determine the phase to return to based on period
  let targetPhase: MatchPhase;
  switch (ctx.state.period) {
    case 'first_half':
      targetPhase = 'first_half_regulation';
      break;
    case 'second_half':
      targetPhase = 'second_half_regulation';
      break;
    case 'extra_time_1':
      targetPhase = 'extra_time_first_regulation';
      break;
    case 'extra_time_2':
      targetPhase = 'extra_time_second_regulation';
      break;
    case 'half_time':
      targetPhase = 'half_time_interval';
      break;
    case 'extra_time_interval':
      targetPhase = 'extra_time_interval';
      break;
    default:
      targetPhase = 'first_half_regulation';
  }
  return success({
    ...transitionToPhase(ctx.state, targetPhase),
    matchStatus: 'in_progress',
    isRunning: false,
    suspensionReason: undefined,
  });
}

export function commandTerminate(ctx: CommandContext): CommandResult {
  if (ctx.state.matchPhase === 'terminated') {
    return fail('already_state', 'Already terminated');
  }
  return success({
    ...transitionToPhase(ctx.state, 'terminated'),
    isRunning: false,
    matchStatus: 'terminated',
  });
}

export function commandReset(ctx: CommandContext, confirmToken?: string): CommandResult {
  // Allow reset from any state, including terminated
  if (confirmToken !== 'confirm_reset') {
    return fail('confirm_required', 'Reset requires confirmation token');
  }
  const nextState = createInitialDomainMatchState(
    ctx.state.totalPeriodSeconds / 60,
    ctx.state.timeoutLimitPerTeam
  );
  return success(nextState);
}

export const MatchCommands = {
  startTimer: commandStartTimer,
  pauseTimer: commandPauseTimer,
  toggleTimerLock: commandToggleTimerLock,
  adjustTimeBy: commandAdjustTimeBy,
  setExactTime: commandSetExactTime,
  setPeriodDurationPreset: commandSetPeriodDurationPreset,
  addRecovery: commandAddRecovery,
  setRecovery: commandSetRecovery,
  endSegment: commandEndSegment,
  skipHalftime: commandSkipHalftime,
  setOverrideJumps: commandSetOverrideJumps,
  jumpToPhase: commandJumpToPhase,
  setTieBreakRule: commandSetTieBreakRule,
  suspend: commandSuspend,
  resume: commandResume,
  terminate: commandTerminate,
  reset: commandReset,
};
