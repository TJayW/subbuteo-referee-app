/**
 * Match control constants
 */

import type { Period } from '@/domain/match/types';

/**
 * Time adjustment presets (in seconds)
 */
export const TIME_ADJUSTMENTS = [10, -10];

/**
 * Duration presets (in minutes)
 */
export const DURATION_PRESETS = [45, 40, 30, 20, 15, 10];

/**
 * Stats metrics labels (for dashboard)
 */
export const STATS_METRICS = [
  { key: 'goals', label: 'Gol' },
  { key: 'shots', label: 'Tiri' },
  { key: 'shotsOnTarget', label: 'Tiri in Porta' },
  { key: 'corners', label: 'Angoli' },
  { key: 'throwIns', label: 'Rimesse' },
  { key: 'fouls', label: 'Falli' },
  { key: 'yellowCards', label: 'Gialli' },
  { key: 'redCards', label: 'Rossi' },
  { key: 'timeouts', label: 'Timeout' },
] as const;

/**
 * Period sequence for navigation (using correct Period types)
 */
export const PERIOD_SEQUENCE: readonly Period[] = [
  'pre_match',
  'first_half',
  'first_half_recovery',
  'half_time',
  'second_half',
  'second_half_recovery',
  'extra_time_interval',
  'extra_time_1',
  'extra_time_1_recovery',
  'extra_time_2',
  'extra_time_2_recovery',
  'shootout',
  'penalties',
  'finished',
] as const;
