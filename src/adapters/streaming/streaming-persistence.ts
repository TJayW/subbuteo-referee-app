/**
 * Streaming Persistence Adapter
 * 
 * Persists streaming state to localStorage for recovery after browser refresh.
 * Implements adapter pattern - domain doesn't know about localStorage.
 */

import type { StreamingState } from '@/domain/streaming';

const STORAGE_KEY = 'subbuteo-streaming-state';

export interface StreamingPersistence {
  save(state: StreamingState): void;
  load(): StreamingState | null;
  clear(): void;
  hasActiveStream(): boolean;
}

class LocalStorageStreamingPersistence implements StreamingPersistence {
  save(state: StreamingState): void {
    try {
      // Don't persist errors or transient state
      const persistable = {
        ...state,
        lastError: null,
        status: state.status === 'active' ? 'disconnected' : state.status,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch (err) {
      console.error('Failed to persist streaming state:', err);
    }
  }

  load(): StreamingState | null {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) return null;

      const state = JSON.parse(json) as StreamingState;
      
      // Validate loaded state
      if (!state || typeof state !== 'object') return null;
      
      return state;
    } catch (err) {
      console.error('Failed to load streaming state:', err);
      return null;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear streaming state:', err);
    }
  }

  hasActiveStream(): boolean {
    const state = this.load();
    return state?.streamKey !== null && state?.status !== 'idle';
  }
}

export const streamingPersistence: StreamingPersistence = new LocalStorageStreamingPersistence();

/**
 * Hook to auto-persist streaming state
 */
export function useStreamingPersistence(state: StreamingState) {
  // Auto-save on state change
  if (typeof window !== 'undefined') {
    streamingPersistence.save(state);
  }
}

/**
 * Recover stream after page refresh
 * Returns true if recovery is possible
 */
export function canRecoverStream(): boolean {
  return streamingPersistence.hasActiveStream();
}

/**
 * Get stream key for recovery
 */
export function getRecoveryStreamKey(): string | null {
  const state = streamingPersistence.load();
  return state?.streamKey || null;
}
