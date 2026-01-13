/**
 * Period Helper Utilities
 * Pure functions for period validation
 */

import { PLAYING_PERIODS } from '@/constants/periods';
import type { Period } from '@/domain/match/types';

/**
 * Check if period is active/playing
 */
export function isPlayingPeriod(period: Period): boolean {
  return (PLAYING_PERIODS as readonly string[]).includes(period);
}
