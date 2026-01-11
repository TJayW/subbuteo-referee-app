/**
 * useGlobalHistory: Global application state history
 * 
 * Manages undo/redo for ALL app state changes (settings, match config, events, etc.)
 * This is the "whole app" history that affects everything.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface GlobalHistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseGlobalHistoryReturn<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isTimeTraveling: boolean;
  jumpToPresent: () => void;
  getHistoryPosition: () => { current: number; total: number };
}

export function useGlobalHistory<T>(
  initialState: T,
  options: { maxHistory?: number } = {}
): UseGlobalHistoryReturn<T> {
  const { maxHistory = 50 } = options;
  
  const [history, setHistory] = useState<GlobalHistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const ignoreNextSetRef = useRef(false);

  /**
   * Set state with history tracking
   */
  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    if (ignoreNextSetRef.current) {
      ignoreNextSetRef.current = false;
      return;
    }

    setHistory((prev) => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev.present)
        : newState;

      // Don't record if state hasn't actually changed
      if (nextState === prev.present) {
        return prev;
      }

      const newPast = [...prev.past, prev.present];
      
      // Limit history size
      const trimmedPast = newPast.length > maxHistory 
        ? newPast.slice(-maxHistory)
        : newPast;

      return {
        past: trimmedPast,
        present: nextState,
        future: [], // Clear future on new action
      };
    });
  }, [maxHistory]);

  /**
   * Undo: move present to future, restore from past
   */
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];
      const newFuture = [prev.present, ...prev.future];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  /**
   * Redo: restore from future
   */
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const newPast = [...prev.past, prev.present];
      const newPresent = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  /**
   * Jump to present (clear time travel)
   */
  const jumpToPresent = useCallback(() => {
    if (history.future.length === 0) return;

    setHistory((prev) => {
      // Move all future states to past
      const allStates = [prev.present, ...prev.future];
      const newPresent = allStates[allStates.length - 1];
      const newPast = [...prev.past, ...allStates.slice(0, -1)];

      return {
        past: newPast.slice(-maxHistory),
        present: newPresent,
        future: [],
      };
    });
  }, [history.future.length, maxHistory]);

  /**
   * Get current position in history
   */
  const getHistoryPosition = useCallback(() => {
    const current = history.past.length + 1;
    const total = history.past.length + 1 + history.future.length;
    return { current, total };
  }, [history.past.length, history.future.length]);

  /**
   * Keyboard shortcuts (Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z)
   */
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      // Also support Ctrl+Y for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [undo, redo]);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    isTimeTraveling: history.future.length > 0,
    jumpToPresent,
    getHistoryPosition,
  };
}
