/**
 * useAppSettings Hook
 * Manages application settings with persistence and validation
 * 
 * RESPONSIBILITY: Settings state management, persistence, and defaults
 * Separates concerns from AppShell (Single Responsibility Principle)
 */

import { useEffect } from 'react';
import type { SettingsState } from '@/domain/match/types';
import { createDefaultTeamConfig } from '@/domain/settings/defaults';
import { loadSettingsFromStorage, saveSettingsToStorage } from '@/adapters/storage/storage-persistence';
import { loadAudioSettingsFromStorage } from '@/adapters/audio/audio-persistence';

export interface UseAppSettingsReturn {
  settings: SettingsState;
  setSettings: (updater: SettingsState | ((prev: SettingsState) => SettingsState)) => void;
}

interface UseAppSettingsProps {
  globalHistory: {
    state: { settings: SettingsState };
    setState: (updater: (prev: any) => any) => void;
  };
}

export function useAppSettings({ globalHistory }: UseAppSettingsProps): UseAppSettingsReturn {
  const settings = globalHistory.state.settings;

  // Helper to update settings in global state
  const setSettings = (updater: SettingsState | ((prev: SettingsState) => SettingsState)) => {
    globalHistory.setState((prev: any) => ({
      ...prev,
      settings: typeof updater === 'function' ? updater(prev.settings) : updater,
    }));
  };

  // Load audio settings on mount and clamp values
  useEffect(() => {
    loadAudioSettingsFromStorage();
    
    // Ensure volume is clamped to [0, 1]
    const clampedVolume = Math.max(0, Math.min(1, settings.audioVolume));
    if (clampedVolume !== settings.audioVolume) {
      setSettings((prev: SettingsState) => ({
        ...prev,
        audioVolume: clampedVolume,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist settings to localStorage on change
  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  return {
    settings,
    setSettings,
  };
}

/**
 * Get default settings with schema versioning
 * Pure function - can be used in initializers
 */
export function getDefaultSettings(): SettingsState {
  const stored = loadSettingsFromStorage();
  if (stored) return stored;

  return {
    // Match timing
    periodDurationMinutes: 45,
    halftimeDurationMinutes: 15,
    extratimeDurationMinutes: 15,
    extratimeIntervalMinutes: 5,
    timeoutsPerTeam: 1,
    timeoutDurationSeconds: 60,
    // Audio/UI
    vibrationEnabled: true,
    audioEnabled: true,
    audioVolume: 0.6,
    categoryGains: {
      referee: 1.0,
      crowd: 0.8,
      ui: 0.9,
      matchControl: 1.0,
    },
    // Team info
    homeTeamName: 'Casa',
    awayTeamName: 'Ospite',
    homeTeamConfig: createDefaultTeamConfig('emerald', 'Casa'),
    awayTeamConfig: createDefaultTeamConfig('blue', 'Ospite'),
    // Officiating
    officiating: {
      referee1: '',
      referee2: '',
    },
  };
}
