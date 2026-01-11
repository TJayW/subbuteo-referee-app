import type { DomainMatchState, MatchPhase, Period, RegulationPeriod } from '@/domain/match/types';

export const PHASE_LABELS: Record<MatchPhase, string> = {
  prematch_ready: 'Pre-Match',
  first_half_regulation: '1st Half',
  first_half_recovery: '1st Half · Recovery',
  half_time_interval: 'Halftime',
  second_half_regulation: '2nd Half',
  second_half_recovery: '2nd Half · Recovery',
  extra_time_interval: 'ET Interval',
  extra_time_first_regulation: 'ET 1st',
  extra_time_first_recovery: 'ET 1st · Recovery',
  extra_time_second_regulation: 'ET 2nd',
  extra_time_second_recovery: 'ET 2nd · Recovery',
  penalties: 'Penalties',
  postmatch_complete: 'Full Time',
  suspended: 'Suspended',
  terminated: 'Terminated',
  resetting: 'Resetting',
};

export const PHASE_TO_PERIOD: Record<MatchPhase, Period> = {
  prematch_ready: 'pre_match',
  first_half_regulation: 'first_half',
  first_half_recovery: 'first_half_recovery',
  half_time_interval: 'half_time',
  second_half_regulation: 'second_half',
  second_half_recovery: 'second_half_recovery',
  extra_time_interval: 'extra_time_interval',
  extra_time_first_regulation: 'extra_time_1',
  extra_time_first_recovery: 'extra_time_1_recovery',
  extra_time_second_regulation: 'extra_time_2',
  extra_time_second_recovery: 'extra_time_2_recovery',
  penalties: 'penalties',
  postmatch_complete: 'finished',
  suspended: 'suspended',
  terminated: 'terminated',
  resetting: 'pre_match',
};

const REGULATION_PHASES: MatchPhase[] = [
  'first_half_regulation',
  'second_half_regulation',
  'extra_time_first_regulation',
  'extra_time_second_regulation',
];

export function phaseToPeriod(phase: MatchPhase): Period {
  return PHASE_TO_PERIOD[phase];
}

export function isRecoveryPhase(phase: MatchPhase): boolean {
  return phase.endsWith('recovery');
}

export function regulationForRecovery(phase: MatchPhase): RegulationPeriod | null {
  switch (phase) {
    case 'first_half_regulation':
    case 'first_half_recovery':
      return 'first_half';
    case 'second_half_regulation':
    case 'second_half_recovery':
      return 'second_half';
    case 'extra_time_first_regulation':
    case 'extra_time_first_recovery':
      return 'extra_time_1';
    case 'extra_time_second_regulation':
    case 'extra_time_second_recovery':
      return 'extra_time_2';
    default:
      return null;
  }
}

export function defaultNextPhases(state: DomainMatchState): MatchPhase[] {
  const { matchPhase, requireExtraTime } = state;
  switch (matchPhase) {
    case 'prematch_ready':
      return ['first_half_regulation'];
    case 'first_half_regulation':
      return ['first_half_recovery', 'half_time_interval'];
    case 'first_half_recovery':
      return ['half_time_interval'];
    case 'half_time_interval':
      return ['second_half_regulation'];
    case 'second_half_regulation':
      return requireExtraTime ? ['second_half_recovery', 'extra_time_interval'] : ['second_half_recovery', 'postmatch_complete'];
    case 'second_half_recovery':
      return requireExtraTime ? ['extra_time_interval'] : ['postmatch_complete'];
    case 'extra_time_interval':
      return ['extra_time_first_regulation', 'extra_time_second_regulation'];
    case 'extra_time_first_regulation':
      return ['extra_time_first_recovery', 'extra_time_interval'];
    case 'extra_time_first_recovery':
      return ['extra_time_interval'];
    case 'extra_time_second_regulation':
      return ['extra_time_second_recovery', 'penalties', 'postmatch_complete'];
    case 'extra_time_second_recovery':
      return ['penalties', 'postmatch_complete'];
    case 'penalties':
      return ['postmatch_complete'];
    case 'suspended':
      return REGULATION_PHASES;
    default:
      return [];
  }
}

export function canTransition(state: DomainMatchState, target: MatchPhase): boolean {
  if (state.matchPhase === 'terminated' || state.matchPhase === 'postmatch_complete') {
    return false;
  }
  if (state.allowPhaseOverride) return true;
  return defaultNextPhases(state).includes(target);
}

export function transitionToPhase(state: DomainMatchState, target: MatchPhase): DomainMatchState {
  const next: DomainMatchState = {
    ...state,
    matchPhase: target,
    period: phaseToPeriod(target),
  };

  if (target === 'suspended') {
    return {
      ...next,
      matchStatus: 'suspended',
      isRunning: false,
    };
  }

  if (target === 'terminated') {
    return {
      ...next,
      matchStatus: 'terminated',
      isRunning: false,
    };
  }

  if (target === 'postmatch_complete') {
    return {
      ...next,
      matchStatus: 'finished',
      isRunning: false,
    };
  }

  // Default: ensure running flag only allowed in regulation phases
  if (!REGULATION_PHASES.includes(target)) {
    return { ...next, isRunning: false, matchStatus: 'paused' };
  }

  return next;
}

export function toggleRecoveryPhase(state: DomainMatchState, period: RegulationPeriod): DomainMatchState {
  const mapping: Record<RegulationPeriod, MatchPhase> = {
    first_half: 'first_half_recovery',
    second_half: 'second_half_recovery',
    extra_time_1: 'extra_time_first_recovery',
    extra_time_2: 'extra_time_second_recovery',
  };

  const target = mapping[period];
  return transitionToPhase(state, target);
}

export function startRegulationFor(period: RegulationPeriod): MatchPhase {
  const mapping: Record<RegulationPeriod, MatchPhase> = {
    first_half: 'first_half_regulation',
    second_half: 'second_half_regulation',
    extra_time_1: 'extra_time_first_regulation',
    extra_time_2: 'extra_time_second_regulation',
  };
  return mapping[period];
}

export function isRegulationPhase(phase: MatchPhase): boolean {
  return REGULATION_PHASES.includes(phase);
}
