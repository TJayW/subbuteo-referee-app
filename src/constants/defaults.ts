/**
 * Domain default values
 * Canonical source for match defaults (timing, limits, initial values)
 */

/**
 * Match timing defaults (minutes)
 * CANONICAL SOURCE - use these for all default initializations
 */
export const MATCH_TIMING_DEFAULTS = {
  /** Regular period duration (each half) */
  PERIOD_DURATION_MINUTES: 45,
  
  /** Halftime interval duration */
  HALFTIME_DURATION_MINUTES: 15,
  
  /** Extra time period duration (each period) */
  EXTRA_TIME_DURATION_MINUTES: 15,
  
  /** Interval between extra time periods */
  EXTRA_TIME_INTERVAL_MINUTES: 5,
  
  /** Minimum period duration (1 minute) */
  MIN_PERIOD_DURATION_MINUTES: 1,
  
  /** Minimum period duration in seconds */
  MIN_PERIOD_DURATION_SECONDS: 60,
} as const;

/**
 * Team defaults
 */
export const TEAM_DEFAULTS = {
  /** Default number of timeouts per team */
  TIMEOUT_LIMIT_PER_TEAM: 1,
  
  /** Default timeout duration (seconds) */
  TIMEOUT_DURATION_SECONDS: 60,
  
  /** Default team names */
  DEFAULT_HOME_NAME: 'Casa',
  DEFAULT_AWAY_NAME: 'Ospite',
} as const;

/**
 * Audio defaults
 */
export const AUDIO_DEFAULTS = {
  /** Default master volume (0-1 range) */
  MASTER_VOLUME: 0.6,
  
  /** Default category gains (0-1 range) */
  CATEGORY_GAINS: {
    referee: 1.0,
    crowd: 0.8,
    ui: 0.9,
    matchControl: 1.0,
  },
  
  /** Volume clamp range */
  MIN_VOLUME: 0.0,
  MAX_VOLUME: 1.0,
} as const;


