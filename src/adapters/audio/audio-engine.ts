/**
 * Web Audio API engine
 * 
 * Manages:
 * - AudioContext lifecycle (init only after user gesture)
 * - Master gain + category gains (per-category volume control)
 * - Buffer preloading and caching
 * - Safe fallback to no-op if AudioContext unavailable
 * 
 * Usage:
 *   const engine = AudioEngine.getInstance();
 *   await engine.init(); // Call after user gesture
 *   engine.play('goal', { delay: 200 });
 */

import type { SoundCategory } from '@/adapters/audio/audio-manifest';
import { getSoundMetadata } from '@/adapters/audio/audio-manifest';
import logger from '@/utils/logger';

type AudioContextType = AudioContext | (Record<string, unknown> & { state?: string });

interface PlayOptions {
  delay?: number;
  volume?: number; // 0-1 multiplier
}

/**
 * Singleton AudioEngine
 */
class AudioEngine {
  private static instance: AudioEngine;
  private audioContext: AudioContextType | null = null;
  private masterGain: GainNode | null = null;
  private categoryGains: Record<SoundCategory, GainNode> = {
    referee: null as unknown as GainNode,
    crowd: null as unknown as GainNode,
    ui: null as unknown as GainNode,
    matchControl: null as any,
  };
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private isInitialized = false;
  private isInitializing = false;
  private masterVolume = 0.6;
  private enabled = true;

  private constructor() {}

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Initialize AudioContext + gains (call only after user gesture)
   */
  async init(): Promise<void> {
    if (this.isInitialized || this.isInitializing) return;
    this.isInitializing = true;

    try {
      // Try to create AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        logger.warn('AudioContext not supported in this browser');
        this.isInitializing = false;
        return;
      }

      this.audioContext = new AudioContextClass() as AudioContextType;

      // Resume if suspended (iOS/Chrome policy)
      if (this.audioContext.state === 'suspended') {
        await (this.audioContext as any).resume();
      }

      // Create master gain
      this.masterGain = (this.audioContext as AudioContext).createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect((this.audioContext as AudioContext).destination);

      // Create category gains
      for (const category of ['referee', 'crowd', 'ui', 'matchControl'] as const) {
        const gain = (this.audioContext as AudioContext).createGain();
        gain.gain.value = 1.0;
        gain.connect(this.masterGain);
        this.categoryGains[category] = gain;
      }

      this.isInitialized = true;
      logger.debug('[AudioEngine] Initialized successfully');
    } catch (error) {
      logger.error('[AudioEngine] Initialization failed:', error);
      this.audioContext = null;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Check if ready to play sounds
   */
  isReady(): boolean {
    return this.isInitialized && this.audioContext !== null && this.enabled;
  }

  /**
   * Play a sound by ID
   */
  async play(soundId: string, options: PlayOptions = {}): Promise<void> {
    if (!this.isReady()) return;

    const metadata = getSoundMetadata(soundId);
    if (!metadata) {
      logger.warn(`[AudioEngine] Sound not found: ${soundId}`);
      return;
    }

    try {
      // Preload buffer if not cached
      if (!this.bufferCache.has(soundId)) {
        await this.preload([soundId]);
      }

      const buffer = this.bufferCache.get(soundId);
      if (!buffer) return;

      const delay = (options.delay ?? 0) / 1000; // convert ms to seconds
      const ctx = this.audioContext as AudioContext;
      const now = ctx.currentTime;

      // Create source
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Connect: source → category gain → master gain → destination
      const categoryGain = this.categoryGains[metadata.category];
      source.connect(categoryGain);

      // Apply volume override if provided
      if (options.volume !== undefined) {
        const gainNode = ctx.createGain();
        gainNode.gain.value = Math.max(0, Math.min(1, options.volume));
        source.disconnect();
        source.connect(gainNode);
        gainNode.connect(categoryGain);
      }

      // Play with delay
      source.start(now + delay);
    } catch (error) {
      logger.warn(`[AudioEngine] Failed to play ${soundId}:`, error);
    }
  }

  /**
   * Preload sounds into buffer cache
   */
  async preload(soundIds: string[]): Promise<void> {
    if (!this.isReady()) return;

    const ctx = this.audioContext as AudioContext;

    for (const soundId of soundIds) {
      if (this.bufferCache.has(soundId)) continue;

      const metadata = getSoundMetadata(soundId);
      if (!metadata) {
        logger.warn(`[AudioEngine] Cannot preload unknown sound: ${soundId}`);
        continue;
      }

      try {
        const response = await fetch(metadata.path);
        if (!response.ok) {
          logger.warn(`[AudioEngine] Sound file not found: ${metadata.path}`);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrayBuffer);
        this.bufferCache.set(soundId, decoded);
      } catch (error) {
        logger.warn(`[AudioEngine] Failed to preload ${soundId}:`, error);
      }
    }
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  /**
   * Get current master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Set category volume (0-1)
   */
  setCategoryVolume(category: SoundCategory, volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    const gain = this.categoryGains[category];
    if (gain) {
      gain.gain.value = clamped;
    }
  }

  /**
   * Get category volume
   */
  getCategoryVolume(category: SoundCategory): number {
    const gain = this.categoryGains[category];
    return gain ? gain.gain.value : 1.0;
  }

  /**
   * Toggle mute
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = enabled ? this.masterVolume : 0;
    }
  }

  /**
   * Get enabled state
   */
  getEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Clear buffer cache (for memory management)
   */
  clearCache(): void {
    this.bufferCache.clear();
  }

  /**
   * Get AudioContext state for debugging
   */
  getState(): string {
    return this.audioContext?.state ?? 'not-initialized';
  }
}

export default AudioEngine;
