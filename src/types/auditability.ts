/**
 * Auditability Types - Observability Requirements
 * 
 * Defines what must be visible at all times for operator situational awareness
 * and regulatory/audit compliance.
 * 
 * Spec Reference: §B.2 Auditability Rules
 */

/**
 * Snapshot of system state for audit trail
 */
export interface AuditabilitySnapshot {
  /** Unix timestamp (milliseconds) */
  timestamp: number;
  /** Global history position */
  globalHistoryPosition: { current: number; total: number };
  /** Event cursor position */
  eventCursorPosition: { current: number; total: number };
  /** Current period */
  period: string;
  /** Elapsed time in seconds */
  elapsedSeconds: number;
  /** Total events count */
  eventsCount: number;
  /** Last event type (if any) */
  lastEventType: string | null;
  /** Is timer running? */
  timerRunning: boolean;
}

/**
 * AUDITABILITY REQUIREMENTS
 * 
 * Defines what indicators must be visible at all times vs. conditionally.
 * These are binding requirements for operator console UI.
 */
export const AUDITABILITY_REQUIREMENTS = {
  /**
   * RULE: These indicators must be visible at ALL times
   * (regardless of time-travel state, period, or other conditions)
   */
  ALWAYS_VISIBLE: [
    'currentScore',
    'currentPeriod',
    'timerDisplay',
    'selectedTeam',
  ] as const,
  
  /**
   * RULE: These indicators must be visible when time-traveling
   * (either global history or event cursor not-at-head)
   */
  TIME_TRAVEL_VISIBLE: [
    'globalHistoryPosition',
    'eventCursorPosition',
    'jumpToPresentCTA',
  ] as const,
  
  /**
   * RULE: Snapshot frequency for audit trail
   * Auto-save to localStorage every 10s
   */
  SNAPSHOT_INTERVAL_MS: 10000, // 10s
  
  /**
   * RULE: Persist to localStorage on these events
   * Ensures audit trail survives refresh/crash
   */
  PERSIST_ON: [
    'eventRecorded',
    'periodChanged',
    'globalUndo',
    'globalRedo',
  ] as const,
} as const;
