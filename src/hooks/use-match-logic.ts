import { useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import type { DomainMatchState, DomainAction, TeamKey, EventType } from '@/domain/match/types';
import { domainReducer, createInitialDomainMatchState } from '@/hooks/use-match-reducer';
import { selectAppliedEvents, selectTeamStats } from '@/domain/match/selectors';
import { DEBOUNCE } from '@/constants/timing';
import { MATCH_TIMING_DEFAULTS, TEAM_DEFAULTS } from '@/constants/defaults';
import { saveMatchStateToStorage } from '@/adapters/storage';
import { MatchCommands } from '@/domain/commands/command-api';
import type { CommandResult } from '@/domain/commands/types';

export interface UseMatchReturn {
  state: DomainMatchState;
  dispatch: (action: DomainAction) => void;
  addEvent: (type: EventType, team: TeamKey, delta?: number, note?: string) => void;
  executeCommand: <K extends keyof typeof MatchCommands>(
    command: K,
    payload?: Parameters<(typeof MatchCommands)[K]>[1]
  ) => CommandResult;
  undoCommand: () => CommandResult;
  redoCommand: () => CommandResult;
  canUndo: boolean;
  canRedo: boolean;
  appliedEvents: ReturnType<typeof selectAppliedEvents>;
  teamStats: ReturnType<typeof selectTeamStats>;
}

// Removed: DEBOUNCE_SAVE - now using DEBOUNCE.SAVE from @/lib/constants

/**
 * Event-sourced match logic hook
 * 
 * Manages:
 * - Domain state: events[], cursor, timer
 * - Event stream with undo/redo
 * - Local storage persistence
 * 
 * NOTE: Audio effects are now handled by useMatchAudio (see AppShell)
 * This separation keeps domain logic and audio effects decoupled
 */
export function useMatch(): UseMatchReturn {
  const initialState = createInitialDomainMatchState(
    MATCH_TIMING_DEFAULTS.PERIOD_DURATION_MINUTES,
    TEAM_DEFAULTS.TIMEOUT_LIMIT_PER_TEAM
  );
  const [matchState, dispatch] = useReducer(domainReducer, initialState);
  const stateRef = useRef(matchState);
  const undoStack = useRef<DomainMatchState[]>([]);
  const redoStack = useRef<DomainMatchState[]>([]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failure = useCallback(
    (message: string): CommandResult => ({ ok: false, code: 'not_applicable', message }),
    []
  );

  useEffect(() => {
    stateRef.current = matchState;
  }, [matchState]);

  // Memoize derived selectors
  const appliedEvents = useMemo(() => selectAppliedEvents(matchState), [matchState]);
  const teamStats = useMemo(() => selectTeamStats(matchState), [matchState]);

  /**
   * Safe dispatch: reducer is source of truth; persistence is handled in an effect
   * to avoid saving stale state from closures.
   */
  const safeDispatch = useCallback((action: DomainAction) => {
    dispatch(action);
  }, []);

  const pushState = useCallback((next: DomainMatchState) => {
    const current = stateRef.current;
    if (next === current) return;
    undoStack.current.push(current);
    redoStack.current = [];
    dispatch({ type: 'REPLACE_STATE', payload: next });
  }, []);

  /**
   * Persist to localStorage after slight delay when matchState changes
   */
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveMatchStateToStorage(matchState);
    }, DEBOUNCE.SAVE);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [matchState]);

  /**
   * Add a domain event
   * Automatically determines period and time based on current state
   */
  const addEvent = useCallback(
    (type: EventType, team: TeamKey, delta: number = 1, note?: string) => {
      const nextState = domainReducer(stateRef.current, {
        type: 'ADD_EVENT',
        payload: {
          type,
          team,
          timestamp: Date.now(),
          period: stateRef.current.period,
          secondsInPeriod: stateRef.current.elapsedSeconds,
          delta,
          note,
        },
      });
      pushState(nextState);
    },
    [pushState]
  );

  const executeCommand = useCallback<UseMatchReturn['executeCommand']>((command, payload) => {
    const state = stateRef.current;
    const handler = MatchCommands[command];
    // @ts-expect-error -- payload handled per command signature
    const result = handler({ state }, payload);
    if (result.ok) {
      pushState(result.nextState);
    }
    return result;
  }, [pushState]);

  const undoCommand = useCallback((): CommandResult => {
    const prev = undoStack.current.pop();
    if (!prev) return failure('Nothing to undo');
    const current = stateRef.current;
    redoStack.current.push(current);
    dispatch({ type: 'REPLACE_STATE', payload: prev });
    return { ok: true, nextState: prev };
  }, []);

  const redoCommand = useCallback((): CommandResult => {
    const next = redoStack.current.pop();
    if (!next) return failure('Nothing to redo');
    const current = stateRef.current;
    undoStack.current.push(current);
    dispatch({ type: 'REPLACE_STATE', payload: next });
    return { ok: true, nextState: next };
  }, [failure]);

  /**
   * Timer interval: tick every second if running
   */
  useEffect(() => {
    if (!matchState.isRunning || matchState.period === 'pre_match' || matchState.period === 'finished') {
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => clearInterval(interval);
  }, [matchState.isRunning, matchState.period]);

  return {
    state: matchState,
    dispatch: safeDispatch,
    addEvent,
    executeCommand,
    undoCommand,
    redoCommand,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    appliedEvents,
    teamStats,
  };
}