/**
 * Pure selector functions for derived state
 * 
 * These selectors compute totals from applied events
 * (respecting cursor position for undo/redo)
 * 
 * Performance targets:
 * - Selector execution: <50ms
 * - Memoization cache hit rate: >90%
 */

import type { DomainMatchState, MatchEvent, TeamKey, TeamStats, ComputedTeamStats } from '@/domain/match/types';

// Memoization cache for selectTeamStats
const memoCache = new Map<string, ComputedTeamStats>();
const MAX_CACHE_SIZE = 100;

/**
 * Clear memoization cache (for testing)
 */
export function clearSelectorCache(): void {
  memoCache.clear();
}

/**
 * Get applied events (respecting cursor position for time-travel)
 */
export function selectAppliedEvents(state: DomainMatchState): MatchEvent[] {
  return state.events.slice(0, state.cursor);
}

/**
 * Check if we are time-traveling (viewing past state)
 */
export function selectIsTimeTraveling(state: DomainMatchState): boolean {
  return state.cursor < state.events.length;
}

/**
 * Calculate team stats from a list of events
 */
function calculateTeamStats(events: MatchEvent[], team: TeamKey): TeamStats {
  let goals = 0;
  let fouls = 0;
  let yellowCards = 0;
  let redCards = 0;
  let timeouts = 0;
  let shots = 0;
  let shotsOnTarget = 0;
  let corners = 0;
  let throwIns = 0;

  for (const event of events) {
    if (event.team !== team) continue;
    
    const delta = event.delta || 1;
    switch (event.type) {
      case 'goal':
        goals += delta;
        break;
      case 'foul':
        fouls += delta;
        break;
      case 'yellow_card':
        yellowCards += delta;
        break;
      case 'red_card':
        redCards += delta;
        break;
      case 'timeout':
        timeouts += delta;
        break;
      case 'shot':
        shots += delta;
        break;
      case 'shot_on_target':
        shotsOnTarget += delta;
        break;
      case 'corner':
        corners += delta;
        break;
      case 'throw_in':
        throwIns += delta;
        break;
    }
  }

  return {
    name: '', // Name comes from settings, not state
    goals,
    fouls,
    yellowCards,
    redCards,
    timeouts,
    shots,
    shotsOnTarget,
    corners,
    throwIns,
  };
}

/**
 * Get all team stats (home + away) from applied events
 * 
 * Memoized with cache key: `${cursor}-${events.length}`
 * Performance target: <50ms execution time
 */
export function selectTeamStats(state: DomainMatchState): ComputedTeamStats {
  // Cache key: cursor position + event count
  const cacheKey = `${state.cursor}-${state.events.length}`;
  
  // Check cache first
  const cached = memoCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Compute if not cached
  const appliedEvents = selectAppliedEvents(state);
  const result: ComputedTeamStats = {
    home: calculateTeamStats(appliedEvents, 'home'),
    away: calculateTeamStats(appliedEvents, 'away'),
  };
  
  // Store in cache with LRU eviction
  memoCache.set(cacheKey, result);
  if (memoCache.size > MAX_CACHE_SIZE) {
    const firstKey = memoCache.keys().next().value;
    if (firstKey) memoCache.delete(firstKey);
  }
  
  return result;
}

/**
 * Get single team stats
 */
export function selectTeamTotals(state: DomainMatchState, team: TeamKey): TeamStats {
  const appliedEvents = selectAppliedEvents(state);
  return calculateTeamStats(appliedEvents, team);
}

/**
 * Get count of applied events
 */
export function selectAppliedEventCount(state: DomainMatchState): number {
  return state.cursor;
}

/**
 * Get total event count (including future events)
 */
export function selectTotalEventCount(state: DomainMatchState): number {
  return state.events.length;
}

/**
 * Get match summary for export
 */
export function selectMatchSummary(state: DomainMatchState) {
  const stats = selectTeamStats(state);
  const appliedEvents = selectAppliedEvents(state);

  return {
    period: state.period,
    elapsedSeconds: state.elapsedSeconds,
    isRunning: state.isRunning,
    totalPeriodSeconds: state.totalPeriodSeconds,
    eventCount: state.cursor,
    totalEventCount: state.events.length,
    isTimeTraveling: selectIsTimeTraveling(state),
    homeStats: stats.home,
    awayStats: stats.away,
    appliedEvents,
  };
}
