/**
 * Audio adapter constants
 * Version and key management for audio settings persistence
 */

import { STORAGE_KEYS } from '@/constants/storage';
import type { SoundCategory } from './audio-manifest';

/**
 * Audio storage schema version
 * Increment when making breaking changes to audio settings schema
 * 
 * Version history:
 * 1: Initial version with AudioSettingsV1
 */
export const AUDIO_STORAGE_VERSION = 1;

/**
 * Storage keys (re-exported from shared for adapter isolation)
 */
export const AUDIO_SETTINGS_KEY = STORAGE_KEYS.AUDIO_SETTINGS;
export const AUDIO_VERSION_KEY = STORAGE_KEYS.AUDIO_VERSION;

/**
 * Audio category labels (Italian)
 * CANONICAL SOURCE - moved from audio_tab.tsx and audio_settings_section.tsx
 */
export const CATEGORY_LABELS: Record<SoundCategory, string> = {
  referee: 'Arbitro',
  crowd: 'Pubblico',
  ui: 'Interfaccia',
  matchControl: 'Controllo Partita',
} as const;

/**
 * Test sound IDs for each category
 * CANONICAL SOURCE - moved from audio_tab.tsx and audio_settings_section.tsx
 */
export const CATEGORY_TEST_SOUNDS: Record<SoundCategory, string> = {
  referee: 'whistle_short',
  crowd: 'crowd_cheer_goal',
  ui: 'ui_click',
  matchControl: 'period_start',
} as const;

