/**
 * useMatchAudio Hook
 * 
 * Subscribes to match state changes and plays appropriate sounds
 * Single source of truth for event → sound mapping integration
 * 
 * CRITICAL: Initialize AudioEngine on first user gesture, not on mount
 */

import { useEffect, useRef } from 'react';
import type { DomainMatchState, EventType } from '@/domain/match/types';
import AudioEngine from '@/adapters/audio/audio-engine';
import { getSoundsForEvent } from '@/adapters/audio/audio-map';
import { getSoundMetadata } from '@/adapters/audio/audio-manifest';
import logger from '@/utils/logger';

interface UseMatchAudioProps {
  matchState: DomainMatchState;
  audioEnabled: boolean;
  masterVolume: number; // 0-1
  categoryGains: Record<string, number>; // 0-1
  onAudioInit?: () => void; // Called when AudioContext initialized
}

export function useMatchAudio({
  matchState,
  audioEnabled,
  masterVolume,
  categoryGains,
  onAudioInit,
}: UseMatchAudioProps): void {
  const engine = AudioEngine.getInstance();
  const prevCursorRef = useRef(matchState.cursor);
  const prevEventCountRef = useRef(matchState.events.length);
  const isInitializing = useRef(false);

  /**
   * Update engine volume and category gains when settings change
   */
  useEffect(() => {
    if (!engine) return;

    engine.setMasterVolume(masterVolume);
    engine.setEnabled(audioEnabled);

    // Update category gains
    for (const [category, gain] of Object.entries(categoryGains)) {
      engine.setCategoryVolume(category as 'referee' | 'crowd' | 'ui' | 'matchControl', gain);
    }
  }, [audioEnabled, masterVolume, categoryGains, engine]);

  /**
   * Detect added events and play sounds
   */
  useEffect(() => {
    if (!audioEnabled) return;

    const addedEvent = matchState.events[matchState.cursor - 1];
    if (!addedEvent) return;

    // Check if this is an added event (cursor moved forward)
    const isCursorAdvanced = matchState.cursor > prevCursorRef.current;
    if (!isCursorAdvanced) return;

    // Get sounds for this event
    const sounds = getSoundsForEvent(addedEvent.type as EventType);
    if (sounds.length === 0) return;

    // Initialize audio on first sound play (user gesture requirement)
    const initAndPlay = async () => {
      try {
        if (!engine.isReady() && !isInitializing.current) {
          isInitializing.current = true;
          await engine.init();
          isInitializing.current = false;
          onAudioInit?.();
        }

        // Play all sounds for this event (with delays)
        for (const soundSpec of sounds) {
          const metadata = getSoundMetadata(soundSpec.soundId);
          if (!metadata) {
            logger.warn(`Sound not found: ${soundSpec.soundId}`);
            continue;
          }

          await engine.play(soundSpec.soundId, {
            delay: soundSpec.delay,
            volume: soundSpec.volume,
          });
        }
      } catch (error) {
        logger.error('Audio playback failed:', error);
      }
    };

    initAndPlay();
  }, [matchState.events, matchState.cursor, audioEnabled, engine, onAudioInit]);

  /**
   * Handle undo sounds
   */
  useEffect(() => {
    if (!audioEnabled) return;

    const didUndo = matchState.cursor < prevCursorRef.current;
    if (!didUndo) return;

    const undoSounds = getSoundsForEvent('undo');
    if (undoSounds.length === 0) return;

    const playUndoSound = async () => {
      try {
        if (!engine.isReady()) await engine.init();

        for (const soundSpec of undoSounds) {
          await engine.play(soundSpec.soundId, {
            delay: soundSpec.delay,
            volume: soundSpec.volume,
          });
        }
      } catch (error) {
        logger.warn('Undo sound failed:', error);
      }
    };

    playUndoSound();
  }, [matchState.cursor, audioEnabled, engine]);

  /**
   * Handle redo sounds
   */
  useEffect(() => {
    if (!audioEnabled) return;

    const didRedo = matchState.cursor > prevCursorRef.current && matchState.cursor <= prevEventCountRef.current;
    if (!didRedo) return;

    const redoSounds = getSoundsForEvent('redo');
    if (redoSounds.length === 0) return;

    const playRedoSound = async () => {
      try {
        if (!engine.isReady()) await engine.init();

        for (const soundSpec of redoSounds) {
          await engine.play(soundSpec.soundId, {
            delay: soundSpec.delay,
            volume: soundSpec.volume,
          });
        }
      } catch (error) {
        logger.warn('Redo sound failed:', error);
      }
    };

    playRedoSound();
  }, [matchState.cursor, audioEnabled, engine]);

  /**
   * Update refs after effects run
   */
  useEffect(() => {
    prevCursorRef.current = matchState.cursor;
    prevEventCountRef.current = matchState.events.length;
  }, [matchState.cursor, matchState.events.length]);

  /**
   * Preload common sounds on mount (with delay to avoid blocking)
   */
  useEffect(() => {
    const preload = async () => {
      try {
        if (!engine.isReady()) await engine.init();

        const commonSounds = [
          'whistle_end',
          'foul_whistle',
          'crowd_cheer',
          'ui_tick',
          'period_whistle',
          'timeout_bell',
        ];
        await engine.preload(commonSounds);
      } catch (error) {
        logger.warn('Preload failed:', error);
      }
    };

    // Delay preload to avoid initialization on page load
    const timer = setTimeout(preload, 1000);
    return () => clearTimeout(timer);
  }, [engine]);
}
