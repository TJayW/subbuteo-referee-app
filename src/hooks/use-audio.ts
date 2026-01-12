/**
 * useAudio Hook (UPDATED)
 * 
 * Syncs with AudioEngine singleton
 * Volume/enabled state is now managed in AppShell (settings)
 * This hook is kept for backward compatibility, returns refs to engine state
 * 
 * NOTE: Use useMatchAudio for current event-sound integration
 */

import { useCallback, useState, useEffect } from 'react';
import AudioEngine from '@/adapters/audio/audio-engine';
import logger from '@/utils/logger';

export function useAudio() {
  const engine = AudioEngine.getInstance();
  const [volume, setVolume] = useState(0.6);
  const [isEnabled, setIsEnabled] = useState(true);

  /**
   * Sync local state with engine
   */
  const syncToEngine = useCallback(() => {
    engine.setMasterVolume(volume);
    engine.setEnabled(isEnabled);
  }, [volume, isEnabled, engine]);

  useEffect(() => {
    syncToEngine();
  }, [volume, isEnabled, syncToEngine]);

  /**
   * Initialize audio on first call (will be called by useMatchAudio)
   */
  const initAudio = useCallback(async () => {
    try {
      await engine.init();
    } catch (error) {
      logger.warn('Audio initialization failed:', error);
    }
  }, [engine]);

  return {
    volume,
    setVolume,
    isEnabled,
    setIsEnabled,
    initAudio,
    engine, // expose for direct access if needed
  };
}

