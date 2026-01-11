import type { SettingsState, DomainMatchState } from '@/domain/match/types';
import { STORAGE_VERSION, STORAGE_KEY, VERSION_KEY } from './constants';
import { STORAGE_KEYS } from '@/constants/storage';
import { clampVolume, MATCH_TIMING_DEFAULTS, TEAM_DEFAULTS, AUDIO_DEFAULTS } from '@/constants/defaults';

// Removed: clampAudioVolume - now using clampVolume from @/domain/constants/defaults

/**
 * Normalize prior settings to current schema format
 */
function normalizeStorageState(prior: any): SettingsState {
  // Helper to ensure TeamConfig has displayName
  const ensureTeamConfigDisplayName = (config: any, defaultName: string) => {
    return {
      color: config?.color ?? { primary: '#10b981' },
      formation: config?.formation ?? { name: '4-4-2', players: [] },
      displayName: config?.displayName ?? defaultName,
    };
  };

  const defaults: SettingsState = {
    // Match timing
    periodDurationMinutes: prior.periodDurationMinutes ?? MATCH_TIMING_DEFAULTS.PERIOD_DURATION_MINUTES,
    halftimeDurationMinutes: prior.halftimeDurationMinutes ?? MATCH_TIMING_DEFAULTS.HALFTIME_DURATION_MINUTES,
    extratimeDurationMinutes: prior.extratimeDurationMinutes ?? MATCH_TIMING_DEFAULTS.EXTRA_TIME_DURATION_MINUTES,
    extratimeIntervalMinutes: prior.extratimeIntervalMinutes ?? MATCH_TIMING_DEFAULTS.EXTRA_TIME_INTERVAL_MINUTES,
    timeoutsPerTeam: prior.timeoutsPerTeam ?? TEAM_DEFAULTS.TIMEOUT_LIMIT_PER_TEAM,
    timeoutDurationSeconds: prior.timeoutDurationSeconds ?? TEAM_DEFAULTS.TIMEOUT_DURATION_SECONDS,
    // Audio/UI
    vibrationEnabled: prior.vibrationEnabled ?? true,
    audioEnabled: prior.audioEnabled ?? true,
    audioVolume: clampVolume(prior.audioVolume),
    categoryGains: prior.categoryGains ?? AUDIO_DEFAULTS.CATEGORY_GAINS,
    homeTeamName: prior.homeTeamName ?? TEAM_DEFAULTS.DEFAULT_HOME_NAME,
    awayTeamName: prior.awayTeamName ?? TEAM_DEFAULTS.DEFAULT_AWAY_NAME,
    // Recent fields with defaults; ensure displayName is present
    homeTeamConfig: ensureTeamConfigDisplayName(prior.homeTeamConfig, TEAM_DEFAULTS.DEFAULT_HOME_NAME),
    awayTeamConfig: ensureTeamConfigDisplayName(prior.awayTeamConfig, TEAM_DEFAULTS.DEFAULT_AWAY_NAME),
    officiating: prior.officiating ?? {
      referee1: '',
      referee2: '',
    },
  };
  return defaults;
}

/**
 * Load settings from localStorage with schema versioning and validation
 */
export function loadSettingsFromStorage(): SettingsState | null {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const currentVersion = parseInt(storedVersion || '1', 10);

    if (currentVersion < STORAGE_VERSION) {
      // Perform schema normalization
      const oldData = localStorage.getItem(STORAGE_KEY);
      if (!oldData) return null;

      const parsed = JSON.parse(oldData);
      const normalized = normalizeStorageState(parsed);

      // Save normalized data with current version
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION.toString());

      return normalized;
    }

    // Already at current version
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data) as SettingsState;
    
    // Validate and clamp audioVolume on load (safety layer)
    if (parsed.audioVolume !== undefined && parsed.audioVolume !== clampVolume(parsed.audioVolume)) {
      parsed.audioVolume = clampVolume(parsed.audioVolume);
      // Re-save with corrected value
      saveSettingsToStorage(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load settings from storage:', error);
    return null;
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettingsToStorage(settings: SettingsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION.toString());
  } catch (error) {
    console.error('Failed to save settings to storage:', error);
  }
}

/**
 * Load match state from localStorage
 */
export function loadMatchStateFromStorage(): DomainMatchState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MATCH);
    if (!data) return null;
    return JSON.parse(data) as DomainMatchState;
  } catch (error) {
    console.error('Failed to load match state from storage:', error);
    return null;
  }
}

/**
 * Save match state to localStorage
 */
export function saveMatchStateToStorage(matchState: DomainMatchState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCH, JSON.stringify(matchState));
  } catch (error) {
    console.error('Failed to save match state to storage:', error);
  }
}

