/**
 * useActionGating Hook
 * Manages action gating context and pending actions during time travel
 * 
 * RESPONSIBILITY: Coordinate action execution with history state
 * Separates concerns from AppShell (Single Responsibility Principle)
 */

import { useEffect, useRef } from 'react';
import { ACTION_GATES, GATE_ERROR_MESSAGES } from '@/domain/match/action-gating';
import type { ActionGatingContext } from '@/domain/match/action-gating';
import type { EventType, TeamKey } from '@/domain/match/types';
import logger from '@/utils/logger';

interface UseActionGatingProps {
  matchState: {
    period: string;
    isRunning: boolean;
    cursor: number;
    events: any[];
  };
  globalHistory: {
    isTimeTraveling: boolean;
    jumpToPresent: () => void;
  };
  eventHistory: {
    isTimeTraveling: boolean;
    jumpToPresent: () => void;
  };
  onAddEvent: (type: EventType, team: TeamKey) => void;
  onPlayPause: () => void;
}

export interface UseActionGatingReturn {
  handleAddEvent: (type: EventType, team: TeamKey) => void;
  handlePlayPause: () => void;
  getGatingContext: () => ActionGatingContext;
}

export function useActionGating({
  matchState,
  globalHistory,
  eventHistory,
  onAddEvent,
  onPlayPause,
}: UseActionGatingProps): UseActionGatingReturn {
  const pendingEventRef = useRef<{ type: EventType; team: TeamKey } | null>(null);
  const pendingToggleTimerRef = useRef(false);

  // Action gating context factory
  const getGatingContext = (): ActionGatingContext => ({
    globalHistoryAtHead: !globalHistory.isTimeTraveling,
    eventCursorAtHead: !eventHistory.isTimeTraveling,
    period: matchState.period,
    isTimerRunning: matchState.isRunning,
  });

  // Execute pending actions once global history returns to head (auto-jump must not require double-click)
  useEffect(() => {
    if (globalHistory.isTimeTraveling) return;

    if (pendingEventRef.current) {
      const pending = pendingEventRef.current;
      pendingEventRef.current = null;
      handleAddEvent(pending.type, pending.team);
    }

    if (pendingToggleTimerRef.current) {
      pendingToggleTimerRef.current = false;
      handlePlayPause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalHistory.isTimeTraveling]);

  // Event handlers with conflict resolution (§D.2 RULE 3)
  const handleAddEvent = (type: EventType, team: TeamKey) => {
    const ctx = getGatingContext();

    // RULE 3: Auto-jump to present in BOTH systems before recording
    if (!ctx.globalHistoryAtHead) {
      pendingEventRef.current = { type, team };
      globalHistory.jumpToPresent();
      return;
    }

    const willForceEventCursorToHead = !ctx.eventCursorAtHead;
    if (willForceEventCursorToHead) {
      // Jump cursor to head; reducer will handle correct sequencing.
      eventHistory.jumpToPresent();
    }

    const gateCtx: ActionGatingContext = {
      ...ctx,
      globalHistoryAtHead: true,
      eventCursorAtHead: true,
    };

    if (!ACTION_GATES.RECORD_EVENT(gateCtx)) {
      logger.warn(GATE_ERROR_MESSAGES.RECORD_EVENT_PERIOD);
      return;
    }

    onAddEvent(type, team);
  };

  const handlePlayPause = () => {
    const ctx = getGatingContext();

    if (!ACTION_GATES.TOGGLE_TIMER(ctx)) {
      if (!ctx.globalHistoryAtHead) {
        pendingToggleTimerRef.current = true;
        globalHistory.jumpToPresent();
        return;
      }
      logger.warn(GATE_ERROR_MESSAGES.TOGGLE_TIMER_TIME_TRAVEL);
      return;
    }

    onPlayPause();
  };

  return {
    handleAddEvent,
    handlePlayPause,
    getGatingContext,
  };
}
