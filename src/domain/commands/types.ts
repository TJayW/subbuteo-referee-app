import type { DomainMatchState, RegulationPeriod } from '@/domain/match/types';

export type CommandSuccess = { ok: true; nextState: DomainMatchState };
export type CommandFailureCode =
  | 'timer_locked'
  | 'illegal_phase_transition'
  | 'phase_override_disabled'
  | 'out_of_bounds'
  | 'already_state'
  | 'suspended'
  | 'terminated'
  | 'invalid_recovery_context'
  | 'invalid_payload'
  | 'confirm_required'
  | 'not_applicable';

export type CommandFailure = {
  ok: false;
  code: CommandFailureCode;
  message: string;
  meta?: Record<string, string | number | boolean>;
};

export type CommandResult = CommandSuccess | CommandFailure;

export interface CommandContext {
  state: DomainMatchState;
  nowMs?: number;
}

export interface SuspendPayload {
  reasonPreset?: 'weather' | 'injury' | 'crowd' | 'light' | 'other';
  note?: string;
}

export interface ExactTimePayload {
  seconds?: number;
  mmss?: string;
}

export interface DurationPresetPayload {
  seconds?: number;
  presetId?: 'regulation' | 'extra_time' | 'shootout';
}

export interface RecoveryPayload {
  period?: RegulationPeriod;
  seconds: number;
}

export type TieBreakRule = 'extra_time_then_pens' | 'extra_time_only' | 'pens_only';
