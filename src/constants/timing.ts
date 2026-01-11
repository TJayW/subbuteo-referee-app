/**
 * Timing constants
 * CANONICAL SOURCE for all timing-related values (debounce, animation, delays)
 */

/**
 * Debounce delays (milliseconds)
 */
export const DEBOUNCE = {
  /** State save to localStorage */
  SAVE: 500,
  
  /** Search input */
  SEARCH: 300,
  
  /** Resize observer */
  RESIZE: 150,
  
  /** General UI input */
  INPUT: 200,
} as const;

/**
 * Animation durations (milliseconds)
 * Match Tailwind transition durations
 */
export const ANIMATION_DURATION = {
  /** Fast transitions (opacity, colors) */
  FAST: 150,
  
  /** Normal transitions (most animations) */
  NORMAL: 200,
  
  /** Slow transitions (complex layouts) */
  SLOW: 300,
  
  /** Extra slow (major state changes) */
  EXTRA_SLOW: 500,
} as const;

/**
 * Animation easing functions
 * Match Tailwind easing
 */
export const EASING = {
  DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
  IN: 'cubic-bezier(0.4, 0, 1, 1)',         // ease-in
  OUT: 'cubic-bezier(0, 0, 0.2, 1)',        // ease-out
  LINEAR: 'linear',
} as const;

/**
 * Toast/notification durations (milliseconds)
 */
export const NOTIFICATION_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
  PERSISTENT: Infinity,
} as const;

/**
 * Audio latency target (milliseconds)
 */
export const AUDIO_LATENCY_TARGET = 100;
