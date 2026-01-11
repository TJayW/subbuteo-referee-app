/**
 * Match configuration
 * Runtime config for match behavior, timing, and defaults
 */

import { MATCH_TIMING_DEFAULTS, TEAM_DEFAULTS } from '@/constants/defaults';

/**
 * Match configuration object
 * CANONICAL SOURCE for match runtime config
 */
export const matchConfig = {
  /** Default period duration (minutes) */
  defaultPeriodMinutes: MATCH_TIMING_DEFAULTS.PERIOD_DURATION_MINUTES,
  
  /** Default halftime duration (minutes) */
  defaultHalftimeMinutes: MATCH_TIMING_DEFAULTS.HALFTIME_DURATION_MINUTES,
  
  /** Default extra time duration (minutes) */
  defaultExtraTimeMinutes: MATCH_TIMING_DEFAULTS.EXTRA_TIME_DURATION_MINUTES,
  
  /** Default extra time interval (minutes) */
  defaultExtraTimeIntervalMinutes: MATCH_TIMING_DEFAULTS.EXTRA_TIME_INTERVAL_MINUTES,
  
  /** Timeout limit per team */
  defaultTimeoutLimit: TEAM_DEFAULTS.TIMEOUT_LIMIT_PER_TEAM,
  
  /** Timeout duration (seconds) */
  defaultTimeoutDurationSeconds: TEAM_DEFAULTS.TIMEOUT_DURATION_SECONDS,
  
  /** Timer tick interval (milliseconds) */
  timerTickIntervalMs: 1000,
  
  /** Event log virtualization threshold */
  eventLogVirtualizationThreshold: 100,
} as const;
