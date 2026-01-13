/**
 * Console Types
 * Defines the 3-state console system used by both desktop and mobile implementations
 */

import type {
  DomainMatchState,
  TeamKey,
  EventType,
  ComputedTeamStats,
  MatchEvent,
  RegulationPeriod,
  MatchPhase,
} from '@/domain/match/types';

/**
 * Console State - 3 livelli identici per desktop e mobile
 * 1. Minimized: Solo handle visibile
 * 2. ActionBar: Barra veloce con bottoni eventi principali
 * 3. Full: Console completa con tutte le card
 */
export type ConsoleState = 'minimized' | 'actionbar' | 'full';

/**
 * Console Orientation
 * - horizontal: Mobile (dal basso verso l'alto)
 * - vertical: Desktop/Tablet (da sinistra verso destra)
 */
export type ConsoleOrientation = 'horizontal' | 'vertical';

/**
 * Console Size Configuration
 * Definisce le dimensioni per i 3 stati
 */
export interface ConsoleSizeConfig {
  /** Dimensione minima (solo handle) */
  minimized: number;
  /** Dimensione ActionBar (barra veloce) */
  actionbar: number;
  /** Dimensione massima (console completa) */
  full: number;
}

/**
 * Shared Console Props
 * Props comuni a tutte le implementazioni console (desktop/mobile)
 */
export interface BaseConsoleProps {
  // Match state
  state: DomainMatchState;
  teamStats: ComputedTeamStats;
  selectedTeam: TeamKey;
  onSelectTeam: (team: TeamKey) => void;
  
  // Match controls
  onPlayPause: () => void;
  onAddEvent: (type: EventType, team: TeamKey) => void;
  onAddTime: (seconds: number) => void;
  onRemoveTime: (seconds: number) => void;
  
  // Team configuration
  homeTeamName: string;
  awayTeamName: string;
  
  // Period management
  onSetPeriod?: (period: string) => void;
  onSetTotalPeriodSeconds?: (seconds: number) => void;
  defaultExtraTimeDurationMinutes?: number;
  
  // Event management
  onDeleteEvent?: (eventId: string) => void;
  onUpdateEvent?: (event: MatchEvent) => void;
  onSetCursor?: (cursor: number) => void;
  canNavigateEventCursor?: boolean;
  
  // Timer controls
  onToggleTimerLock?: () => void;
  onSetExactTime?: (seconds: number) => void;
  timerLocked?: boolean;
  
  // Advanced match controls
  onAddRecovery?: (period: RegulationPeriod, seconds: number) => void;
  onSetRecovery?: (period: RegulationPeriod, seconds: number) => void;
  onRequireExtraTime?: (enabled: boolean) => void;
  onAllowOverride?: (enabled: boolean) => void;
  onEndPeriod?: () => void;
  onSkipHalftime?: () => void;
  onTerminateMatch?: () => void;
  onSetMatchPhase?: (phase: MatchPhase) => void;
  
  // State management
  onSuspend?: (reason: string) => void;
  onResume?: () => void;
  onReset?: () => void;
  onUndoDomain?: () => void;
  onRedoDomain?: () => void;
  undoDomainAvailable?: boolean;
  redoDomainAvailable?: boolean;
}

/**
 * Console Resize Props
 * Props per gestione resize e stati
 */
export interface ConsoleResizeProps {
  /** Stato console corrente */
  consoleState: ConsoleState;
  /** Callback cambio stato */
  onStateChange: (state: ConsoleState) => void;
  /** Dimensione corrente (px) */
  size: number;
  /** Callback cambio dimensione */
  onSizeChange: (size: number) => void;
  /** Callback fine drag */
  onResizeEnd?: (finalSize: number) => void;
}
