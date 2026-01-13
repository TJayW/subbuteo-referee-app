import type {
  DomainMatchState,
  DomainAction,
  MatchEvent,
  MatchPhase,
} from '@/domain/match/types';
import { MATCH_TIMING_DEFAULTS, TEAM_DEFAULTS } from '@/constants/defaults';
import { minutesToSeconds } from '@/utils/time-helpers';
import {
  canTransition,
  defaultNextPhases,
  phaseToPeriod,
  transitionToPhase,
  toggleRecoveryPhase,
} from '@/domain/match/fsm';

/**
 * Generate unique event ID
 */
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create initial domain match state (pre_match, no events)
 */
export function createInitialDomainMatchState(
  periodMinutes: number = MATCH_TIMING_DEFAULTS.PERIOD_DURATION_MINUTES,
  timeoutLimit: number = TEAM_DEFAULTS.TIMEOUT_LIMIT_PER_TEAM
): DomainMatchState {
  return {
    matchId: generateEventId(),
    createdAt: Date.now(),
    events: [],
    cursor: 0,
    isRunning: false,
    elapsedSeconds: 0,
    period: 'pre_match',
    matchPhase: 'prematch_ready',
    totalPeriodSeconds: minutesToSeconds(periodMinutes),
    recoverySeconds: {},
    requireExtraTime: true,
    allowPhaseOverride: false,
    timerLocked: false,
    matchStatus: 'not_started',
    timeoutLimitPerTeam: timeoutLimit,
  };
}

/**
 * Core domain reducer
 * 
 * Principles:
 * 1. Append events to events[]
 * 2. cursor = applied event count
 * 3. undo: cursor--
 * 4. redo: cursor++
 * 5. add event while cursor < events.length: truncate future, append added
 * 6. TICK and SET_RUNNING only mutate state (not events)
 */
export function domainReducer(state: DomainMatchState, action: DomainAction): DomainMatchState {
  switch (action.type) {
    case 'ADD_EVENT': {
      // If cursor < events.length, we're in time-travel mode: truncate future events
      const truncatedEvents =
        state.cursor < state.events.length
          ? state.events.slice(0, state.cursor)
          : state.events;

      // Create added event with generated ID
      const addedEvent: MatchEvent = {
        ...action.payload,
        id: generateEventId(),
      };

      // Append event
      const addedEvents = [...truncatedEvents, addedEvent];

      // Move cursor to end
      return {
        ...state,
        events: addedEvents,
        cursor: addedEvents.length,
      };
    }

    case 'UNDO': {
      // Decrement cursor (cannot go below 0)
      return {
        ...state,
        cursor: Math.max(0, state.cursor - 1),
      };
    }

    case 'REDO': {
      // Increment cursor (cannot go beyond events.length)
      return {
        ...state,
        cursor: Math.min(state.events.length, state.cursor + 1),
      };
    }

    case 'SET_CURSOR': {
      // Direct cursor control (event-scoped undo/redo)
      const newCursor = Math.max(0, Math.min(action.payload, state.events.length));
      return {
        ...state,
        cursor: newCursor,
      };
    }

    case 'DELETE_EVENT': {
      // Remove event from array and adjust cursor
      const newEvents = state.events.filter((e: MatchEvent) => e.id !== action.payload);
      const newCursor = Math.min(state.cursor, newEvents.length);
      return {
        ...state,
        events: newEvents,
        cursor: newCursor,
      };
    }

    case 'UPDATE_EVENT': {
      // Replace event in array
      const newEvents = state.events.map((e: MatchEvent) =>
        e.id === action.payload.id ? action.payload : e
      );
      return {
        ...state,
        events: newEvents,
      };
    }

    case 'TICK': {
      // Timer tick (UI state only, not an event)
      if (
        !state.isRunning ||
        state.period === 'pre_match' ||
        state.period === 'finished' ||
        state.period === 'suspended' ||
        state.period === 'terminated'
      ) {
        return state;
      }
      return {
        ...state,
        elapsedSeconds: state.elapsedSeconds + 1,
      };
    }

    case 'SET_RUNNING': {
      // Start/pause timer
      return {
        ...state,
        isRunning: action.payload,
      };
    }

    case 'SET_PERIOD': {
      const targetPhase = Object.entries(phaseToPeriod as Record<any, any>)
        .find(([, p]) => p === action.payload)?.[0] as MatchPhase | undefined;

      if (targetPhase && canTransition(state, targetPhase)) {
        return {
          ...transitionToPhase(state, targetPhase),
          elapsedSeconds: 0,
        };
      }

      // Fallback: keep old behavior if override is enabled
      if (state.allowPhaseOverride && targetPhase) {
        return {
          ...transitionToPhase(state, targetPhase),
          elapsedSeconds: 0,
        };
      }

      return state;
    }

    case 'SET_ELAPSED_SECONDS': {
      // Manually set elapsed seconds (for time adjustments)
      return {
        ...state,
        elapsedSeconds: Math.max(0, action.payload),
      };
    }

    case 'SET_TOTAL_PERIOD_SECONDS': {
      // Set total period duration (for extra time configuration)
      return {
        ...state,
        totalPeriodSeconds: Math.max(60, action.payload),
      };
    }

    case 'SET_TIMER_LOCKED': {
      return {
        ...state,
        timerLocked: action.payload,
      };
    }

    case 'SET_MATCH_PHASE': {
      if (!canTransition(state, action.payload)) {
        return state;
      }
      return transitionToPhase(state, action.payload);
    }

    case 'ADD_RECOVERY_SECONDS': {
      const { period, seconds } = action.payload;
      const current = state.recoverySeconds[period] ?? 0;
      const updatedRecovery = Math.max(0, current + seconds);
      const updatedMap = { ...state.recoverySeconds, [period]: updatedRecovery };
      const shouldToggleRecovery = phaseToPeriod(state.matchPhase) === period && updatedRecovery > 0;
      const nextState = {
        ...state,
        recoverySeconds: updatedMap,
        totalPeriodSeconds:
          phaseToPeriod(state.matchPhase) === period
            ? Math.max(state.totalPeriodSeconds, state.elapsedSeconds + updatedRecovery)
            : state.totalPeriodSeconds,
      };
      return shouldToggleRecovery ? toggleRecoveryPhase(nextState, period) : nextState;
    }

    case 'SET_RECOVERY_SECONDS': {
      const { period, seconds } = action.payload;
      const updatedMap = { ...state.recoverySeconds, [period]: Math.max(0, seconds) };
      const shouldToggleRecovery = phaseToPeriod(state.matchPhase) === period && seconds > 0;
      const nextState = {
        ...state,
        recoverySeconds: updatedMap,
        totalPeriodSeconds:
          phaseToPeriod(state.matchPhase) === period
            ? Math.max(state.totalPeriodSeconds, state.elapsedSeconds + seconds)
            : state.totalPeriodSeconds,
      };
      return shouldToggleRecovery ? toggleRecoveryPhase(nextState, period) : nextState;
    }

    case 'SET_REQUIRE_EXTRA_TIME': {
      return {
        ...state,
        requireExtraTime: action.payload,
      };
    }

    case 'SET_ALLOW_PHASE_OVERRIDE': {
      return {
        ...state,
        allowPhaseOverride: action.payload,
      };
    }

    case 'END_PERIOD': {
      const nextOptions = defaultNextPhases(state);
      const target = nextOptions[0];
      if (!target) return state;
      return transitionToPhase(state, target);
    }

    case 'SKIP_HALFTIME': {
      if (state.matchPhase === 'first_half_regulation' || state.matchPhase === 'first_half_recovery') {
        return transitionToPhase(state, 'second_half_regulation');
      }
      return state;
    }

    case 'TERMINATE_MATCH': {
      return transitionToPhase(state, 'terminated');
    }

    case 'SET_MATCH_STATUS': {
      return {
        ...state,
        matchStatus: action.payload,
      };
    }

    case 'SUSPEND_MATCH': {
      return {
        ...transitionToPhase(state, 'suspended'),
        suspensionReason: action.payload,
      };
    }

    case 'RESUME_MATCH': {
      if (state.matchStatus !== 'suspended') return state;
      return {
        ...state,
        matchStatus: 'paused',
        period: phaseToPeriod(state.matchPhase),
        suspensionReason: undefined,
      };
    }

    case 'RESET_MATCH': {
      // Full reset to initial state
      return createInitialDomainMatchState(
        state.totalPeriodSeconds / 60,
        state.timeoutLimitPerTeam
      );
    }

    case 'REPLACE_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
}

