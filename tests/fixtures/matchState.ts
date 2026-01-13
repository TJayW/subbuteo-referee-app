/**
 * Deterministic match state fixtures for export testing
 * Seeded with predictable IDs, timestamps, and events
 */

import type { DomainMatchState, MatchEvent } from '@/domain/match/types';

/**
 * Fixed timestamp for deterministic tests
 * 2025-01-15T10:00:00.000Z
 */
export const FIXTURE_BASE_TIMESTAMP = 1736935200000;

/**
 * Seeded match events with deterministic IDs and timestamps
 */
export const FIXTURE_EVENTS: MatchEvent[] = [
  {
    id: 'evt-match-start-001',
    type: 'match_start',
    team: 'system',
    timestamp: FIXTURE_BASE_TIMESTAMP,
    period: 'first_half',
    secondsInPeriod: 0,
  },
  {
    id: 'evt-goal-home-001',
    type: 'goal',
    team: 'home',
    timestamp: FIXTURE_BASE_TIMESTAMP + 300000, // +5 minutes
    period: 'first_half',
    secondsInPeriod: 300,
    note: 'Penalty kick',
  },
  {
    id: 'evt-foul-away-001',
    type: 'foul',
    team: 'away',
    timestamp: FIXTURE_BASE_TIMESTAMP + 420000, // +7 minutes
    period: 'first_half',
    secondsInPeriod: 420,
  },
  {
    id: 'evt-yellow-away-001',
    type: 'yellow_card',
    team: 'away',
    timestamp: FIXTURE_BASE_TIMESTAMP + 600000, // +10 minutes
    period: 'first_half',
    secondsInPeriod: 600,
    note: 'Dissent',
  },
  {
    id: 'evt-goal-away-001',
    type: 'goal',
    team: 'away',
    timestamp: FIXTURE_BASE_TIMESTAMP + 900000, // +15 minutes
    period: 'first_half',
    secondsInPeriod: 900,
  },
  {
    id: 'evt-period-end-001',
    type: 'period_end',
    team: 'system',
    timestamp: FIXTURE_BASE_TIMESTAMP + 1200000, // +20 minutes
    period: 'first_half',
    secondsInPeriod: 1200,
  },
];

/**
 * Complete seeded match state for export tests
 * Configured for deterministic validation
 */
export const FIXTURE_MATCH_STATE: DomainMatchState = {
  matchId: 'match-fixture-001',
  createdAt: FIXTURE_BASE_TIMESTAMP,
  
  events: FIXTURE_EVENTS,
  cursor: FIXTURE_EVENTS.length, // All events applied
  
  isRunning: false,
  elapsedSeconds: 1200, // 20 minutes elapsed
  
  period: 'first_half',
  matchPhase: 'first_half_regulation',
  totalPeriodSeconds: 1200, // 20-minute halves
  recoverySeconds: {
    first_half: 60, // 1 minute stoppage
  },
  requireExtraTime: false,
  allowPhaseOverride: false,
  timerLocked: false,
  
  matchStatus: 'paused',
  
  timeoutLimitPerTeam: 1,
};

/**
 * Test team names for exports
 */
export const FIXTURE_HOME_TEAM = 'AC Subbuteo';
export const FIXTURE_AWAY_TEAM = 'FC Flickers';

/**
 * Expected counts for validation
 */
export const FIXTURE_EXPECTATIONS = {
  totalEvents: FIXTURE_EVENTS.length,
  homeGoals: 1,
  awayGoals: 1,
  yellowCards: 1,
  fouls: 1,
  systemEvents: 2, // match_start, period_end
};
