/**
 * Match state helpers and calculations
 */

import type { DomainMatchState, MatchEvent } from '@/domain/match/types';

/**
 * Get applied events up to cursor
 */
export function getAppliedEvents(events: MatchEvent[], cursor?: number): MatchEvent[] {
  const currentCursor = cursor ?? events.length;
  return events.slice(0, currentCursor);
}

/**
 * Get last event from applied events
 */
export function getLastEvent(appliedEvents: MatchEvent[]): MatchEvent | null {
  return appliedEvents.length > 0 ? appliedEvents[appliedEvents.length - 1] : null;
}

/**
 * Check if event cursor is active (not at end)
 */
export function isEventCursorActive(cursor: number, totalEvents: number): boolean {
  return cursor < totalEvents;
}

/**
 * Check if match is playing (running and not pre_match)
 */
export function isMatchPlaying(state: DomainMatchState): boolean {
  return state.isRunning && state.period !== 'pre_match';
}

/**
 * Check if match is active (not pre_match or finished)
 */
export function isMatchActive(period: DomainMatchState['period']): boolean {
  return period !== 'pre_match' && period !== 'finished';
}

/**
 * Get recent events (last N)
 */
export function getRecentEvents(events: MatchEvent[], count: number): MatchEvent[] {
  return events.slice(-count);
}

/**
 * Get period index from sequence
 */
export function getPeriodIndex(
  period: DomainMatchState['period'],
  sequence: readonly DomainMatchState['period'][]
): number {
  return sequence.indexOf(period);
}

/**
 * Get next period from sequence
 */
export function getNextPeriod(
  currentPeriod: DomainMatchState['period'],
  sequence: readonly DomainMatchState['period'][]
): DomainMatchState['period'] | null {
  const currentIndex = getPeriodIndex(currentPeriod, sequence);
  if (currentIndex === -1 || currentIndex === sequence.length - 1) {
    return null;
  }
  return sequence[currentIndex + 1];
}

/**
 * Get previous period from sequence
 */
export function getPreviousPeriod(
  currentPeriod: DomainMatchState['period'],
  sequence: readonly DomainMatchState['period'][]
): DomainMatchState['period'] | null {
  const currentIndex = getPeriodIndex(currentPeriod, sequence);
  if (currentIndex <= 0) {
    return null;
  }
  return sequence[currentIndex - 1];
}
