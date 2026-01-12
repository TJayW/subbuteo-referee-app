/**
 * Audio-specific storage persistence and validation
 * Handles schema versioning for audio settings separately from general settings
 * 
 * ASSUMPTION: Audio settings stored in 'subbuteo_audio_settings'
 * Version history:
 * 1: Initial audio settings (volume 0-1, enabled boolean, category gains)
 */

import { AUDIO_STORAGE_VERSION, AUDIO_SETTINGS_KEY, AUDIO_VERSION_KEY } from './constants';
import { clampVolume, AUDIO_DEFAULTS } from '@/constants/defaults';
import logger from '@/utils/logger';

export interface AudioSettingsV1 {
  masterVolume: number; // 0.0-1.0
  enabled: boolean;
  categoryGains: {
    referee: number;
    crowd: number;
    ui: number;
    matchControl: number;
  };
  lastVolume: number; // Volume before mute
}

// Removed: clampNormal - now using clampVolume from @/domain/constants/defaults

/**
 * Get default audio settings
 */
function getDefaultAudioSettings(): AudioSettingsV1 {
  return {
    masterVolume: AUDIO_DEFAULTS.MASTER_VOLUME,
    enabled: true,
    categoryGains: AUDIO_DEFAULTS.CATEGORY_GAINS,
    lastVolume: AUDIO_DEFAULTS.MASTER_VOLUME,
  };
}

/**
 * Validate and normalize audio settings from localStorage
 */
export function loadAudioSettingsFromStorage(): AudioSettingsV1 {
  try {
    const storedVersion = localStorage.getItem(AUDIO_VERSION_KEY);
    const currentVersion = parseInt(storedVersion || '0', 10);

    if (currentVersion !== AUDIO_STORAGE_VERSION) {
      // Try to load prior data and normalize/validate
      const priorData = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (priorData) {
        const parsed = JSON.parse(priorData);
        const validated = validateAudioSettings(parsed);
        saveAudioSettingsToStorage(validated);
        return validated;
      }
      // No prior data; use defaults
      const defaults = getDefaultAudioSettings();
      saveAudioSettingsToStorage(defaults);
      return defaults;
    }

    // Current version present
    const data = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!data) {
      const defaults = getDefaultAudioSettings();
      saveAudioSettingsToStorage(defaults);
      return defaults;
    }

    const parsed = JSON.parse(data);
    return validateAudioSettings(parsed);
  } catch (error) {
    logger.warn('Audio settings load failed, using defaults:', error);
    return getDefaultAudioSettings();
  }
}

/**
 * Validate audio settings object (clamp volumes, check types)
 */
export function validateAudioSettings(data: any): AudioSettingsV1 {
  const defaults = getDefaultAudioSettings();

  return {
    masterVolume: clampVolume(data?.masterVolume),
    enabled: typeof data?.enabled === 'boolean' ? data.enabled : defaults.enabled,
    categoryGains: {
      referee: clampVolume(data?.categoryGains?.referee),
      crowd: clampVolume(data?.categoryGains?.crowd),
      ui: clampVolume(data?.categoryGains?.ui),
      matchControl: clampVolume(data?.categoryGains?.matchControl),
    },
    lastVolume: clampVolume(data?.lastVolume),
  };
}

/**
 * Save audio settings to localStorage with version
 */
export function saveAudioSettingsToStorage(settings: AudioSettingsV1): void {
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem(AUDIO_VERSION_KEY, AUDIO_STORAGE_VERSION.toString());
  } catch (error) {
    logger.error('Failed to save audio settings:', error);
  }
}

/**
 * Clear audio settings from storage (for reset/debug)
 */
export function clearAudioSettingsFromStorage(): void {
  try {
    localStorage.removeItem(AUDIO_SETTINGS_KEY);
    localStorage.removeItem(AUDIO_VERSION_KEY);
  } catch (error) {
    logger.error('Failed to clear audio settings:', error);
  }
}
