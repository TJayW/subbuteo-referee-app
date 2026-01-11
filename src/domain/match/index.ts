/**
 * Domain/Match Module Barrel
 * Central export point for match domain logic
 */

// Types
export type * from './types';

// Selectors
export {
  selectAppliedEvents,
  selectIsTimeTraveling,
  selectTeamStats,
  selectTeamTotals,
  selectAppliedEventCount,
  selectTotalEventCount,
  selectMatchSummary,
} from './selectors';

// Stats Calculator
export { calculateTeamStats, deriveStats } from './stats-calculator';

// Action Gating
export {
  ACTION_GATES,
  GATE_ERROR_MESSAGES,
} from './action-gating';
export type { ActionGatingContext } from './action-gating';
