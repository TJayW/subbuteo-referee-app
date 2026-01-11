/**
 * useEventHistory: Event-scoped undo/redo
 * 
 * Manages undo/redo ONLY for the event stream cursor.
 * Does NOT affect global app settings, match config, etc.
 */

import { useCallback } from 'react';

interface UseEventHistoryProps {
  cursor: number;
  eventsLength: number;
  onSetCursor: (cursor: number) => void;
}

interface UseEventHistoryReturn {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isTimeTraveling: boolean;
  jumpToPresent: () => void;
  getHistoryPosition: () => { current: number; total: number };
}

/**
 * Event-only history management
 * Works by moving the cursor back/forward on the event stream
 */
export function useEventHistory({
  cursor,
  eventsLength,
  onSetCursor,
}: UseEventHistoryProps): UseEventHistoryReturn {
  
  /**
   * Undo: move cursor back
   */
  const undo = useCallback(() => {
    if (cursor > 0) {
      onSetCursor(cursor - 1);
    }
  }, [cursor, onSetCursor]);

  /**
   * Redo: move cursor forward
   */
  const redo = useCallback(() => {
    if (cursor < eventsLength) {
      onSetCursor(cursor + 1);
    }
  }, [cursor, eventsLength, onSetCursor]);

  /**
   * Jump to present (cursor = eventsLength)
   */
  const jumpToPresent = useCallback(() => {
    if (cursor < eventsLength) {
      onSetCursor(eventsLength);
    }
  }, [cursor, eventsLength, onSetCursor]);

  /**
   * Get current position
   */
  const getHistoryPosition = useCallback(() => {
    return {
      current: cursor,
      total: eventsLength,
    };
  }, [cursor, eventsLength]);

  // Derived state
  const canUndo = cursor > 0;
  const canRedo = cursor < eventsLength;
  const isTimeTraveling = cursor < eventsLength;

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    isTimeTraveling,
    jumpToPresent,
    getHistoryPosition,
  };
}
