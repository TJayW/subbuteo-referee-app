/**
 * Period-related constants
 * Canonical source for period labels and mappings
 */

import type { Period, TeamKey } from '@/domain/match/types';

/**
 * Period display labels (Italian)
 * CANONICAL SOURCE - do not duplicate
 */
export const PERIOD_LABELS: Partial<Record<Period, string>> = {
  pre_match: 'Pre-Partita',
  first_half: '1° Tempo',
  half_time: 'Intervallo',
  second_half: '2° Tempo',
  extra_time_1: '1° Supplementare',
  extra_time_2: '2° Supplementare',
  shootout: 'Rigori',
  finished: 'Terminata',
  suspended: 'Sospesa',
};

/**
 * Team role labels (Italian)
 * CANONICAL SOURCE - do not duplicate
 */
export const ROLE_LABELS: Record<TeamKey, string> = {
  home: 'CASA',
  away: 'OSPITE',
  system: 'SISTEMA',
};

/**
 * Playing periods (excludes pre_match, half_time, finished, suspended)
 */
export const PLAYING_PERIODS: readonly Period[] = [
  'first_half',
  'second_half',
  'extra_time_1',
  'extra_time_2',
  'shootout',
] as const;
