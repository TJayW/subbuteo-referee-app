/**
 * Audio Adapter Barrel
 * Central export point for audio engine and utilities
 * (Hooks moved to @/hooks/)
 */

export { default as AudioEngine } from './audio-engine';

export {
  getSoundsForEvent,
  hasAudioForEvent,
  EVENT_SOUND_MAP,
} from './audio-map';
export type { SoundPlayOptions, EventSoundMapping } from './audio-map';

export {
  getSoundMetadata,
  getSoundsForCategory,
  SOUND_MANIFEST,
} from './audio-manifest';
export type { SoundCategory, SoundMetadata } from './audio-manifest';

export {
  loadAudioSettingsFromStorage,
  saveAudioSettingsToStorage,
} from './audio-persistence';

export {
  CATEGORY_LABELS,
  CATEGORY_TEST_SOUNDS,
} from './constants';

