/**
 * Storage adapter constants
 * Version and key management for settings persistence
 */

import { STORAGE_KEYS } from '@/constants/storage';

/**
 * Storage schema version
 * Increment when making breaking changes to SettingsState schema
 * 
 * Version history:
 * 1: Initial version
 * 2: Added homeTeamConfig, awayTeamConfig, officiating
 * 3: Added displayName field to TeamConfig
 * 4: Added halftimeDurationMinutes, timeoutDurationSeconds, extratimeIntervalMinutes
 */
export const STORAGE_VERSION = 4;

/**
 * Storage keys (re-exported from shared for adapter isolation)
 */
export const STORAGE_KEY = STORAGE_KEYS.SETTINGS;
export const VERSION_KEY = STORAGE_KEYS.SETTINGS_VERSION;
