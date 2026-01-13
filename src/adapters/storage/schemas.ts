/**
 * Zod schemas for storage validation
 * Validates persisted state loaded from localStorage
 */

import { z } from 'zod';

/**
 * Match event schema
 */
const MatchEventSchema = z.object({
  id: z.string(),
  type: z.string(), // EventType enum - validate as string for flexibility
  team: z.enum(['home', 'away', 'system']),
  timestamp: z.number(),
  period: z.string(), // Period enum
  secondsInPeriod: z.number(),
  delta: z.number().optional(),
  note: z.string().optional(),
});



/**
 * Domain match state schema
 * Validates persisted match state structure
 */
export const MatchStateSchema = z.object({
  matchId: z.string(),
  createdAt: z.number(),
  
  // Event stream
  events: z.array(MatchEventSchema),
  cursor: z.number(),
  
  // Timer state
  isRunning: z.boolean(),
  elapsedSeconds: z.number(),
  
  // Match metadata
  period: z.string(), // Period enum
  matchPhase: z.string(), // MatchPhase enum
  totalPeriodSeconds: z.number(),
  recoverySeconds: z.record(z.string(), z.number()).optional().default({}),
  requireExtraTime: z.boolean(),
  allowPhaseOverride: z.boolean(),
  timerLocked: z.boolean(),
  
  // Match status
  matchStatus: z.enum(['not_started', 'in_progress', 'paused', 'suspended', 'finished', 'terminated']),
  suspensionReason: z.string().optional(),
  
  // Settings
  timeoutLimitPerTeam: z.number(),
});

/**
 * Type inference for validated match state
 */
export type ValidatedMatchState = z.infer<typeof MatchStateSchema>;
