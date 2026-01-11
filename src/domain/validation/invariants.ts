import type { DomainMatchState, RegulationPeriod } from '@/domain/match/types';
import { phaseToPeriod } from '@/domain/match/fsm';

const DEV = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

function assert(condition: boolean, message: string) {
  if (DEV && !condition) {
    throw new Error(`Invariant failed: ${message}`);
  }
}

export function assertMatchInvariants(state: DomainMatchState) {
  if (!DEV) return;

  // Timer bounds
  assert(state.elapsedSeconds >= 0, 'elapsedSeconds negative');
  assert(state.totalPeriodSeconds >= 60, 'totalPeriodSeconds too small');
  assert(state.elapsedSeconds <= state.totalPeriodSeconds, 'elapsedSeconds exceeds total');

  // Terminal states pause timer
  if (state.matchPhase === 'terminated' || state.matchPhase === 'postmatch_complete') {
    assert(!state.isRunning, 'timer running in terminal phase');
    assert(state.matchStatus === 'terminated', 'matchStatus mismatch in terminal phase');
  }

  // Suspended state coherence
  if (state.matchStatus === 'suspended') {
    assert(!state.isRunning, 'timer running while suspended');
    assert(state.matchPhase === 'suspended', 'phase mismatch while suspended');
  }

  // Recovery mapping coherence
  const period = phaseToPeriod(state.matchPhase) as RegulationPeriod | undefined;
  if (period && state.matchPhase.toString().includes('recovery')) {
    const configured = state.recoverySeconds[period] ?? 0;
    assert(configured > 0, 'recovery phase without configured recovery time');
  }

  // Override behavior guard
  if (!state.allowPhaseOverride) {
    // No direct assertion here; transitions are guarded by commands.
  }
}
