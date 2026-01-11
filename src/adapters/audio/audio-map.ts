/**
 * Event → Sound mapping
 * Defines which sounds play for each match event and action
 * 
 * This is the single source of truth for audio design decisions.
 * Maps domain events and UI actions to one or more sound effects with timing.
 */

import type { EventType } from '@/domain/match/types';
import type { SoundCategory } from './audio-manifest';

export interface SoundPlayOptions {
  soundId: string;
  delay?: number; // milliseconds before playing
  category?: SoundCategory; // override manifest category (rare)
  volume?: number; // 0-1 multiplier override (rare)
}

export interface EventSoundMapping {
  eventType: EventType | 'undo' | 'redo';
  sounds: SoundPlayOptions[];
  description: string;
}

/**
 * Core event → sounds mapping
 * Order matters: sounds play in sequence (with delay).
 */
export const EVENT_SOUND_MAP: Record<string, EventSoundMapping> = {
  goal: {
    eventType: 'goal',
    sounds: [
      { soundId: 'whistle_end', delay: 0 },
      { soundId: 'crowd_cheer', delay: 200 },
      { soundId: 'goal_horn', delay: 500, volume: 0.3 }, // Subtle horn
    ],
    description: 'Goal scored: whistle + crowd cheer + subtle horn',
  },
  foul: {
    eventType: 'foul',
    sounds: [
      { soundId: 'foul_whistle', delay: 0 },
      { soundId: 'ui_tick', delay: 300 },
    ],
    description: 'Foul called: sharp whistle + tick',
  },
  yellow_card: {
    eventType: 'yellow_card',
    sounds: [
      { soundId: 'whistle_end', delay: 0 },
      { soundId: 'yellow_card', delay: 150 },
    ],
    description: 'Yellow card: whistle + card ding',
  },
  red_card: {
    eventType: 'red_card',
    sounds: [
      { soundId: 'whistle_end', delay: 0 },
      { soundId: 'red_card', delay: 150 },
    ],
    description: 'Red card: whistle + card buzz',
  },
  timeout: {
    eventType: 'timeout',
    sounds: [
      { soundId: 'timeout_bell', delay: 0 },
      { soundId: 'ui_confirm', delay: 600 },
    ],
    description: 'Timeout: bell + confirm',
  },
  shot: {
    eventType: 'shot',
    sounds: [{ soundId: 'shot_swish', delay: 0 }],
    description: 'Shot attempted: swish',
  },
  shot_on_target: {
    eventType: 'shot_on_target',
    sounds: [
      { soundId: 'shot_on_target', delay: 0 },
      { soundId: 'ui_tick', delay: 300 },
    ],
    description: 'Shot on target: impact + tick',
  },
  corner: {
    eventType: 'corner',
    sounds: [{ soundId: 'corner_kick', delay: 0 }],
    description: 'Corner awarded: corner kick sound',
  },
  period_start: {
    eventType: 'period_start',
    sounds: [{ soundId: 'period_whistle', delay: 0 }],
    description: 'Period start: long whistle',
  },
  period_end: {
    eventType: 'period_end',
    sounds: [
      { soundId: 'whistle_end', delay: 0 },
      { soundId: 'ui_confirm', delay: 600 },
    ],
    description: 'Period end: whistle + confirm',
  },
  match_start: {
    eventType: 'match_start',
    sounds: [{ soundId: 'period_whistle', delay: 0 }],
    description: 'Match start: kick-off whistle',
  },
  match_end: {
    eventType: 'match_end',
    sounds: [
      { soundId: 'match_end_chime', delay: 0 },
      { soundId: 'crowd_groan', delay: 800, volume: 0.5 }, // Subtle groan
    ],
    description: 'Match end: chime + subtle crowd',
  },
  undo: {
    eventType: 'undo',
    sounds: [{ soundId: 'step_back', delay: 0 }],
    description: 'Undo action: step back sound',
  },
  redo: {
    eventType: 'redo',
    sounds: [{ soundId: 'step_forward', delay: 0 }],
    description: 'Redo action: step forward sound',
  },
};

/**
 * Get all sounds for a given event
 */
export function getSoundsForEvent(
  eventType: EventType | 'undo' | 'redo'
): SoundPlayOptions[] {
  const mapping = EVENT_SOUND_MAP[eventType];
  return mapping?.sounds ?? [];
}

/**
 * Check if an event has audio
 */
export function hasAudioForEvent(eventType: EventType | 'undo' | 'redo'): boolean {
  return eventType in EVENT_SOUND_MAP;
}
