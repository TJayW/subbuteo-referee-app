/**
 * Audio Helper Utilities
 * Pure functions for audio value validation
 */

import { AUDIO_DEFAULTS } from '@/constants/defaults';

/**
 * Clamp audio volume to valid range [0, 1]
 * Handles legacy incorrect values (e.g., 70 instead of 0.7)
 */
export function clampVolume(value: unknown): number {
  if (typeof value !== 'number') return AUDIO_DEFAULTS.MASTER_VOLUME;
  const clamped = Math.max(AUDIO_DEFAULTS.MIN_VOLUME, Math.min(AUDIO_DEFAULTS.MAX_VOLUME, value));
  return isNaN(clamped) ? AUDIO_DEFAULTS.MASTER_VOLUME : clamped;
}
