/**
 * MatchControlCard Types
 * Grouped props following Interface Segregation Principle
 */

import type { DomainMatchState, MatchPhase, RegulationPeriod } from '@/domain/match/types';

/**
 * Timer control actions
 */
export interface TimerActions {
  onPlayPause: () => void;
  onToggleTimerLock: () => void;
  onAddTime: (seconds: number) => void;
  onSetExactTime: (seconds: number) => void;
  onSetTotalPeriodSeconds: (seconds: number) => void;
}

/**
 * Recovery time actions
 */
export interface RecoveryActions {
  onAddRecovery: (period: RegulationPeriod, seconds: number) => void;
  onSetRecovery: (period: RegulationPeriod, seconds: number) => void;
}

/**
 * Phase/period control actions
 */
export interface PhaseActions {
  onEndPeriod: () => void;
  onSkipHalftime: () => void;
  onSetMatchPhase: (phase: MatchPhase) => void;
  onTerminateMatch: () => void;
}

/**
 * Match configuration actions
 */
export interface MatchConfigActions {
  onRequireExtraTime: (enabled: boolean) => void;
  onAllowOverride: (enabled: boolean) => void;
}

/**
 * Emergency actions
 */
export interface EmergencyActions {
  onSuspend: (reason: string) => void;
  onResume: () => void;
  onReset: () => void;
}

/**
 * History actions
 */
export interface HistoryActions {
  onUndo?: () => void;
  onRedo?: () => void;
  undoDisabled?: boolean;
  redoDisabled?: boolean;
}

/**
 * Main MatchControlCard props (Interface Segregation compliant)
 */
export interface MatchControlCardProps {
  state: DomainMatchState;
  isPlaying: boolean;
  homeTeamGoals: number;
  awayTeamGoals: number;
  timerActions: TimerActions;
  recoveryActions: RecoveryActions;
  phaseActions: PhaseActions;
  configActions: MatchConfigActions;
  emergencyActions: EmergencyActions;
  historyActions?: HistoryActions;
}
