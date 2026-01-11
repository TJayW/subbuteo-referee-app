/**
 * Event-sourced data model for Subbuteo Referee System
 * 
 * Core principle:
 * - All domain state changes are represented as immutable events
 * - events[] is append-only
 * - cursor indicates how many events are "applied" (0..events.length)
 * - Undo/Redo: cursor moves back/forward on the same event stream
 * - When an added event is added while cursor < events.length, truncate future events
 */

// Event Types: Core events + Recent metrics + System events
export type EventType =
  | 'goal'
  | 'foul'
  | 'yellow_card'
  | 'red_card'
  | 'timeout'
  | 'shot'            // (recent): Tiri (shots)
  | 'shot_on_target'  // (recent): Tiri in porta (shots on target)
  | 'corner'          // (recent): Angoli (corners)
  | 'throw_in'        // (recent): Rimesse laterali (throw-in)
  | 'period_start'
  | 'period_end'
  | 'match_start'
  | 'match_end'
  | 'note'
  // System/control events (for audit trail)
  | 'phase_transition'  // Phase change (e.g., first_half → half_time)
  | 'clock_started'     // Timer started
  | 'clock_paused'      // Timer paused
  | 'clock_set'         // Manual time set
  | 'clock_adjusted'    // Time adjustment (±seconds)
  | 'stoppage_added'    // Stoppage time added
  | 'match_suspended'   // Match suspended
  | 'match_resumed';    // Match resumed from suspension

export type TeamKey = 'home' | 'away' | 'system'; // 'system' for non-team events
export type Period =
  | 'pre_match'
  | 'first_half'
  | 'first_half_recovery'
  | 'half_time'
  | 'second_half'
  | 'second_half_recovery'
  | 'extra_time_interval'
  | 'extra_time_1'
  | 'extra_time_1_recovery'
  | 'extra_time_2'
  | 'extra_time_2_recovery'
  | 'shootout'
  | 'penalties'
  | 'finished'
  | 'suspended'
  | 'terminated';

export type RegulationPeriod =
  | 'first_half'
  | 'second_half'
  | 'extra_time_1'
  | 'extra_time_2';

export type MatchPhase =
  | 'prematch_ready'
  | 'first_half_regulation'
  | 'first_half_recovery'
  | 'half_time_interval'
  | 'second_half_regulation'
  | 'second_half_recovery'
  | 'extra_time_interval'
  | 'extra_time_first_regulation'
  | 'extra_time_first_recovery'
  | 'extra_time_second_regulation'
  | 'extra_time_second_recovery'
  | 'penalties'
  | 'postmatch_complete'
  | 'suspended'
  | 'terminated'
  | 'resetting';

/**
 * Immutable domain event
 * Every state change is captured here
 */
export interface MatchEvent {
  id: string;
  type: EventType;
  team: TeamKey;
  timestamp: number; // Unix milliseconds
  period: Period;
  secondsInPeriod: number; // elapsed seconds in current period
  delta?: number; // +1 (default), -1 (undo via event), etc. Only apply via time-travel, not emitted directly
  note?: string;
}

/**
 * Derived team statistics (computed from events)
 */
export interface TeamStats {
  name: string;
  goals: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  timeouts: number;
  shots: number;           // NEW
  shotsOnTarget: number;   // NEW
  corners: number;         // NEW
  throwIns: number;        // NEW: Rimesse laterali
}

/**
 * Domain state: Event-sourced match state
 * 
 * SEPARATION:
 * - events[] + cursor: immutable event stream + playhead
 * - Derived totals computed from applied events via selectors
 * - Never store totals in state; use memoized selectors instead
 */
export interface DomainMatchState {
  matchId: string;
  createdAt: number;
  
  // Event stream (append-only)
  events: MatchEvent[];
  cursor: number; // Applied event count: 0..events.length. undo decrements, redo increments
  
  // Timer state (stateful, not event-driven)
  // ASSUMPTION: Timer ticks are UI-only state; period transitions emitted as events
  isRunning: boolean;
  elapsedSeconds: number; // seconds elapsed in current period
  
  // Match metadata
  period: Period;
  matchPhase: MatchPhase; // Explicit FSM phase
  totalPeriodSeconds: number; // configured half/period duration
  recoverySeconds: Partial<Record<RegulationPeriod, number>>; // stoppage time per regulation period
  requireExtraTime: boolean; // tie-break rule toggle
  allowPhaseOverride: boolean; // operator override toggle
  timerLocked: boolean; // guard against edits while running
  
  // Match status (for FSM)
  matchStatus: 'not_started' | 'in_progress' | 'paused' | 'suspended' | 'finished' | 'terminated';
  suspensionReason?: string; // if suspended, reason/note
  
  // Settings (mutable config)
  timeoutLimitPerTeam: number;
}

/**
 * UI state: Non-domain, transient state
 * (drawer open/close, selected team, selected action, etc.)
 */
export interface UIState {
  selectedTeam: TeamKey;
  selectedEventType: EventType | null;
  showEventLog: boolean;
  showSettings: boolean;
  showStats: boolean;
  showExport: boolean;
  timeTravelWarning: boolean; // Show banner if cursor < events.length
}

/**
 * Team color (primary + optional secondary for contrast)
 */
export interface TeamColor {
  primary: string; // hex color (e.g., "#10b981")
  secondary?: string; // hex color for borders/accents
}

/**
 * Player in a formation
 */
export interface Player {
  id: string;
  name: string;
  number?: number;
  position?: string; // e.g. "GK", "DEF", "MID", "ATT" or free-text
  isCaptain?: boolean;
}

/**
 * Team formation / lineup
 */
export interface Formation {
  name: string; // e.g. "4-3-3"
  players: Player[];
}

/**
 * Team configuration (colors + formation + display name + coach)
 */
export interface TeamConfig {
  color: TeamColor;
  formation: Formation;
  displayName: string; // Editable team name (e.g., "FM Group", "HDB", "Italia")
  coach?: string; // Optional coach/manager name
}

/**
 * Match officiating
 */
export interface MatchOfficiating {
  referee1: string; // required
  referee2?: string; // optional
}

/**
 * Settings
 */
export interface SettingsState {
  // Match timing configuration
  periodDurationMinutes: number; // Duration of each half (regular time)
  halftimeDurationMinutes?: number; // Interval/halftime duration
  extratimeDurationMinutes?: number; // Duration of extra time periods
  extratimeIntervalMinutes?: number; // Interval between extra time periods
  timeoutsPerTeam: number; // Number of timeouts allowed per team
  timeoutDurationSeconds?: number; // Duration of a single timeout
  
  // Audio/UI preferences
  vibrationEnabled: boolean;
  audioEnabled: boolean;
  audioVolume: number; // 0-1
  categoryGains?: {
    // Optional for backward compat; defaults in AudioTab
    referee: number; // 0-1
    crowd: number;
    ui: number;
    matchControl: number;
  };
  
  // Team information
  homeTeamName: string;
  awayTeamName: string;
  // Team configurations
  homeTeamConfig: TeamConfig;
  awayTeamConfig: TeamConfig;
  // Match officiating
  officiating: MatchOfficiating;
}

/**
 * Root app state
 * CANONICAL SOURCE - renamed 'domain' → 'matchState' for consistency with usage
 */
export interface AppState {
  matchState: DomainMatchState;  // Renamed from 'domain' to match actual usage
  ui: UIState;
  settings: SettingsState;
}

/**
 * Derived team stats (read-only, computed from applied events)
 */
export interface ComputedTeamStats {
  home: TeamStats;
  away: TeamStats;
}

/**
 * Reducer actions: Only domain events
 */
export type DomainAction =
  | {
      type: 'ADD_EVENT';
      payload: Omit<MatchEvent, 'id'>;
    }
  | {
      type: 'UNDO';
    }
  | {
      type: 'REDO';
    }
    | {
        type: 'SET_TIMER_LOCKED';
        payload: boolean;
      }
    | {
        type: 'SET_MATCH_PHASE';
        payload: MatchPhase;
      }
    | {
        type: 'ADD_RECOVERY_SECONDS';
        payload: { period: RegulationPeriod; seconds: number };
      }
    | {
        type: 'SET_RECOVERY_SECONDS';
        payload: { period: RegulationPeriod; seconds: number };
      }
    | {
        type: 'SET_REQUIRE_EXTRA_TIME';
        payload: boolean;
      }
    | {
        type: 'SET_ALLOW_PHASE_OVERRIDE';
        payload: boolean;
      }
    | {
        type: 'END_PERIOD';
      }
    | {
        type: 'SKIP_HALFTIME';
      }
    | {
        type: 'TERMINATE_MATCH';
      }
  | {
      type: 'SET_CURSOR';
      payload: number; // directly set cursor position (event-scoped undo/redo)
    }
  | {
      type: 'DELETE_EVENT';
      payload: string; // event id
    }
  | {
      type: 'UPDATE_EVENT';
      payload: MatchEvent;
    }
  | {
      type: 'TICK';
    } // Timer tick (internal state only, not an event)
  | {
      type: 'SET_RUNNING';
      payload: boolean;
    }
  | {
      type: 'SET_PERIOD';
      payload: Period;
    }
  | {
      type: 'SET_ELAPSED_SECONDS';
      payload: number;
    }
  | {
      type: 'SET_TOTAL_PERIOD_SECONDS';
      payload: number;
    }
  | {
      type: 'SET_MATCH_STATUS';
      payload: DomainMatchState['matchStatus'];
    }
  | {
      type: 'SUSPEND_MATCH';
      payload: string; // reason
    }
  | {
      type: 'RESUME_MATCH';
    }
  | {
      type: 'RESET_MATCH';
    }
  | {
      type: 'REPLACE_STATE';
      payload: DomainMatchState;
    };
