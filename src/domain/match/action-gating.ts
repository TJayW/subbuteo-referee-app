/**
 * Action Gating Rules - Enterprise-Grade Operator Console
 * 
 * Defines when operator actions are allowed based on current system state.
 * Prevents invalid operations that could lead to data inconsistency or confusion.
 * 
 * Spec Reference: §B.2 Action Gating Rules
 */

export interface ActionGatingContext {
  /** Is global history at head (no past time-travel)? */
  globalHistoryAtHead: boolean;
  /** Is event cursor at head (cursor === events.length)? */
  eventCursorAtHead: boolean;
  /** Current period */
  period: string;
  /** Is timer currently running? */
  isTimerRunning: boolean;
}

/**
 * ACTION_GATES - Pure functions that determine if actions are allowed
 * 
 * Each gate returns:
 * - true: Action allowed
 * - false: Action gated (should show error/toast)
 */
export const ACTION_GATES = {
  /**
   * P0: Can record new event?
   * 
   * RULE 1: Must be at present in BOTH systems (no time-travel active)
   * RULE 2: Cannot record in pre_match or finished periods
   */
  RECORD_EVENT: (ctx: ActionGatingContext): boolean => {
    // RULE 1: Must be at present in BOTH systems
    if (!ctx.globalHistoryAtHead || !ctx.eventCursorAtHead) {
      return false; // Auto-jump to present first (handled by caller)
    }
    // RULE 2: Cannot record in finished
    // ASSUMPTION (P0 reliability): pre_match events are allowed (recorded at t=0) to avoid operator no-op.
    if (ctx.period === 'finished') {
      return false;
    }
    return true;
  },
  
  /**
   * P0: Can start/stop timer?
   * 
   * RULE 1: Must be at global head (no global time-travel)
   * RULE 2: Cannot start in pre_match (but can pause if running)
   */
  TOGGLE_TIMER: (ctx: ActionGatingContext): boolean => {
    // RULE 1: Must be at global head
    if (!ctx.globalHistoryAtHead) {
      return false;
    }
    // RULE 2: Cannot start in pre_match (but can pause if already running)
    if (ctx.isTimerRunning) {
      return true;
    }
    if (ctx.period === 'pre_match' || ctx.period === 'finished') {
      return false;
    }
    return true;
  },
  
  /**
   * P1: Can navigate event cursor (undo/redo in event log)?
   * 
   * RULE: Global history must be at head
   * Rationale: Cannot navigate events while globally time-traveling
   *            (would create confusing "double time-travel" state)
   */
  NAVIGATE_EVENT_CURSOR: (ctx: ActionGatingContext): boolean => {
    // RULE: Global history must be at head
    return ctx.globalHistoryAtHead;
  },
  
  /**
   * P1: Can undo globally?
   * 
   * Always allowed (but pauses timer if running - handled by caller)
   */
  GLOBAL_UNDO: (): boolean => {
    // Always allowed
    return true;
  },
  
  /**
   * P2: Can change period (via control center)?
   * 
   * RULE 1: Must be at present in both systems
   * RULE 2: Timer must be paused
   */
  CHANGE_PERIOD: (ctx: ActionGatingContext): boolean => {
    // RULE 1: Must be at present in both systems
    if (!ctx.globalHistoryAtHead || !ctx.eventCursorAtHead) {
      return false;
    }
    // RULE 2: Timer must be paused
    if (ctx.isTimerRunning) {
      return false;
    }
    return true;
  },
} as const;

/**
 * Gate error messages (localized Italian)
 */
export const GATE_ERROR_MESSAGES = {
  RECORD_EVENT_TIME_TRAVEL: 'Impossibile registrare evento durante time-travel. Torna al presente.',
  RECORD_EVENT_PERIOD: 'Impossibile registrare evento in questo periodo.',
  TOGGLE_TIMER_TIME_TRAVEL: 'Impossibile controllare timer durante time-travel globale.',
  TOGGLE_TIMER_PRE_MATCH: 'Impossibile avviare timer prima dell\'inizio della partita.',
  NAVIGATE_EVENT_CURSOR: 'Impossibile navigare eventi durante time-travel globale.',
  CHANGE_PERIOD_TIME_TRAVEL: 'Impossibile cambiare periodo durante time-travel.',
  CHANGE_PERIOD_TIMER_RUNNING: 'Ferma il timer prima di cambiare periodo.',
} as const;
