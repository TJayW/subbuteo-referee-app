/**
 * Audio sound manifest
 * Maps sound IDs to file paths and metadata
 * 
 * ASSUMPTION: All sounds stored in public/sounds/ as .wav files
 * In production, would use an asset bundler, but here we reference public paths.
 * If a sound file is missing, the audio engine will log a warning but continue gracefully.
 */

export type SoundCategory = 'referee' | 'crowd' | 'ui' | 'matchControl';

export interface SoundMetadata {
  id: string;
  path: string;
  category: SoundCategory;
  duration: number; // seconds (approximate)
  description: string;
}

export const SOUND_MANIFEST: Record<string, SoundMetadata> = {
  // Referee sounds
  whistle_start: {
    id: 'whistle_start',
    path: '/sounds/whistle_start.wav',
    category: 'referee',
    duration: 1.0,
    description: 'Start whistle (period begins)',
  },
  whistle_end: {
    id: 'whistle_end',
    path: '/sounds/whistle_end.wav',
    category: 'referee',
    duration: 1.0,
    description: 'End whistle (period ends)',
  },
  foul_whistle: {
    id: 'foul_whistle',
    path: '/sounds/foul_whistle.wav',
    category: 'referee',
    duration: 0.3,
    description: 'Sharp whistle (foul)',
  },
  yellow_card: {
    id: 'yellow_card',
    path: '/sounds/yellow_card.wav',
    category: 'referee',
    duration: 0.25,
    description: 'Card ding (yellow)',
  },
  red_card: {
    id: 'red_card',
    path: '/sounds/red_card.wav',
    category: 'referee',
    duration: 0.3,
    description: 'Card buzz (red)',
  },

  // Crowd sounds
  crowd_cheer: {
    id: 'crowd_cheer',
    path: '/sounds/crowd_cheer.wav',
    category: 'crowd',
    duration: 1.5,
    description: 'Crowd cheer (goal)',
  },
  crowd_groan: {
    id: 'crowd_groan',
    path: '/sounds/crowd_groan.wav',
    category: 'crowd',
    duration: 1.0,
    description: 'Crowd groan (match end)',
  },
  goal_horn: {
    id: 'goal_horn',
    path: '/sounds/goal_horn.wav',
    category: 'crowd',
    duration: 0.5,
    description: 'Goal horn (subtle)',
  },
  applause: {
    id: 'applause',
    path: '/sounds/applause.wav',
    category: 'crowd',
    duration: 2.0,
    description: 'Applause',
  },
  ambient_crowd: {
    id: 'ambient_crowd',
    path: '/sounds/ambient_crowd.wav',
    category: 'crowd',
    duration: 5.0,
    description: 'Ambient crowd loop (background)',
  },

  // UI sounds
  ui_tick: {
    id: 'ui_tick',
    path: '/sounds/ui_tick.wav',
    category: 'ui',
    duration: 0.1,
    description: 'UI tick (click)',
  },
  ui_confirm: {
    id: 'ui_confirm',
    path: '/sounds/ui_confirm.wav',
    category: 'ui',
    duration: 0.15,
    description: 'UI confirm (positive action)',
  },
  ui_error: {
    id: 'ui_error',
    path: '/sounds/ui_error.wav',
    category: 'ui',
    duration: 0.15,
    description: 'UI error (negative action)',
  },
  step_back: {
    id: 'step_back',
    path: '/sounds/step_back.wav',
    category: 'ui',
    duration: 0.15,
    description: 'Step back (undo)',
  },
  step_forward: {
    id: 'step_forward',
    path: '/sounds/step_forward.wav',
    category: 'ui',
    duration: 0.15,
    description: 'Step forward (redo)',
  },
  swish: {
    id: 'swish',
    path: '/sounds/swish.wav',
    category: 'ui',
    duration: 0.2,
    description: 'Swish (generic UI)',
  },
  card_flip: {
    id: 'card_flip',
    path: '/sounds/card_flip.wav',
    category: 'ui',
    duration: 0.2,
    description: 'Card flip (visual feedback)',
  },

  // Match control sounds
  period_whistle: {
    id: 'period_whistle',
    path: '/sounds/period_whistle.wav',
    category: 'matchControl',
    duration: 0.8,
    description: 'Period start whistle',
  },
  timeout_bell: {
    id: 'timeout_bell',
    path: '/sounds/timeout_bell.wav',
    category: 'matchControl',
    duration: 0.5,
    description: 'Timeout buzzer',
  },
  buzzer: {
    id: 'buzzer',
    path: '/sounds/buzzer.wav',
    category: 'matchControl',
    duration: 0.3,
    description: 'Buzzer (generic)',
  },
  match_end_chime: {
    id: 'match_end_chime',
    path: '/sounds/match_end_chime.wav',
    category: 'matchControl',
    duration: 1.5,
    description: 'Match end chime',
  },

  // Action sounds
  shot_swish: {
    id: 'shot_swish',
    path: '/sounds/shot_swish.wav',
    category: 'ui',
    duration: 0.2,
    description: 'Shot swish',
  },
  shot_on_target: {
    id: 'shot_on_target',
    path: '/sounds/shot_on_target.wav',
    category: 'ui',
    duration: 0.3,
    description: 'Shot on target',
  },
  corner_kick: {
    id: 'corner_kick',
    path: '/sounds/corner_kick.wav',
    category: 'ui',
    duration: 0.4,
    description: 'Corner kick',
  },
  ball_bounce: {
    id: 'ball_bounce',
    path: '/sounds/ball_bounce.wav',
    category: 'ui',
    duration: 0.15,
    description: 'Ball bounce',
  },
};

/**
 * Get a sound by ID, returns null if not found (graceful fallback)
 */
export function getSoundMetadata(id: string): SoundMetadata | null {
  return SOUND_MANIFEST[id] || null;
}

/**
 * Get all sounds for a category
 */
export function getSoundsForCategory(category: SoundCategory): SoundMetadata[] {
  return Object.values(SOUND_MANIFEST).filter((s) => s.category === category);
}
