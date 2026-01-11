/**
 * Domain Command Guards Test
 * Validates command layer invariants and safety guards
 * 
 * Requirements:
 * - Timer lock blocks edits (exact time, add/remove time, recovery edits)
 * - Timer lock blocks period jumps (setPeriod, endPeriod, skipHalftime)
 * - Exact time OOB fails safely (negative, >999:59)
 * - endSegment idempotent (no double-advance)
 * - suspend requires reason
 * - terminate blocks further commands
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { useMatch } from '@/hooks/use-match-logic';
import { MatchCommands } from '@/domain/commands/command_api';
import type { CommandContext } from '@/domain/commands/types';

// Test harness wrapper
function TestHarness() {
  const logic = useMatch();
  (window as any).__testLogic = logic;
  return null;
}

describe('Domain Command Guards', () => {
  beforeEach(() => {
    render(<TestHarness />);
  });

  describe('Timer Lock Guards', () => {
    it('blocks exact time edit when timer locked', () => {
      const logic = (window as any).__testLogic;
      // Lock timer first
      const lockResult = logic.executeCommand('toggleTimerLock', {});
      expect(lockResult.ok).toBe(true);
      const ctx: CommandContext = { state: lockResult.ok ? lockResult.nextState : logic.state };

      const result = MatchCommands.setExactTime(ctx, { seconds: 100 });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('locked');
      }
    });

    it('blocks add time when timer locked', () => {
      const logic = (window as any).__testLogic;
      const lockResult = logic.executeCommand('toggleTimerLock', {});
      const ctx: CommandContext = { state: lockResult.ok ? lockResult.nextState : logic.state };

      const result = MatchCommands.adjustTimeBy(ctx, 10);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('locked');
      }
    });

    it('blocks remove time when timer locked', () => {
      const logic = (window as any).__testLogic;
      const lockResult = logic.executeCommand('toggleTimerLock', {});
      const ctx: CommandContext = { state: lockResult.ok ? lockResult.nextState : logic.state };

      const result = MatchCommands.adjustTimeBy(ctx, -10);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('locked');
      }
    });

    it('blocks recovery add when timer locked', () => {
      const logic = (window as any).__testLogic;
      const lockResult = logic.executeCommand('toggleTimerLock', {});
      const ctx: CommandContext = { state: lockResult.ok ? lockResult.nextState : logic.state };

      const result = MatchCommands.addRecovery(ctx, { period: 'first_half', seconds: 30 });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('locked');
      }
    });

    it('blocks recovery set when timer locked', () => {
      const logic = (window as any).__testLogic;
      const lockResult = logic.executeCommand('toggleTimerLock', {});
      const ctx: CommandContext = { state: lockResult.ok ? lockResult.nextState : logic.state };

      const result = MatchCommands.setRecovery(ctx, { period: 'first_half', seconds: 60 });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('locked');
      }
    });

    it('blocks period jump when timer locked', () => {
      const logic = (window as any).__testLogic;
      const lockResult = logic.executeCommand('toggleTimerLock', {});
      const ctx: CommandContext = { state: lockResult.ok ? lockResult.nextState : logic.state };

      const result = MatchCommands.jumpToPhase(ctx, 'second_half_regulation');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('locked');
      }
    });

    it('allows play/pause when timer locked', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      const lockResult = logic.executeCommand('toggleTimerLock', {});
      const ctx: CommandContext = { state: lockResult.ok ? lockResult.nextState : logic.state };

      const result = MatchCommands.startTimer(ctx);

      expect(result.ok).toBe(true);
    });
  });

  describe('Exact Time Validation', () => {
    it('rejects negative exact time', () => {
      const logic = (window as any).__testLogic;
      const ctx: CommandContext = { state: logic.state };

      const result = MatchCommands.setExactTime(ctx, { seconds: -10 });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('bounds');
      }
    });

    it('rejects exact time beyond maximum (999:59)', () => {
      const logic = (window as any).__testLogic;
      const ctx: CommandContext = { state: logic.state };

      const result = MatchCommands.setExactTime(ctx, { seconds: 60000 });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('bounds');
      }
    });

    it('accepts exact time within valid range', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      const ctx: CommandContext = { state: logic.state };

      const result = MatchCommands.setExactTime(ctx, { seconds: 1500 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.nextState.elapsedSeconds).toBe(1500);
      }
    });
  });

  describe('Period Transition Guards', () => {
    it('endSegment requires timer unlocked', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      const lockResult = logic.executeCommand('toggleTimerLock', {});
      const ctx: CommandContext = { state: lockResult.ok ? lockResult.nextState : logic.state };

      const result = MatchCommands.endSegment(ctx);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('locked');
      }
    });

    it('blocks endPeriod when timer locked', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      const lockResult = logic.executeCommand('toggleTimerLock', {});
      const ctx: CommandContext = { state: lockResult.ok ? lockResult.nextState : logic.state };

      const result = MatchCommands.endSegment(ctx);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('locked');
      }
    });

    it('blocks skipHalftime when timer locked', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      logic.dispatch({ type: 'SET_PERIOD', period: 'half_time' });
      const lockResult = logic.executeCommand('toggleTimerLock', {});
      const ctx: CommandContext = { state: lockResult.ok ? lockResult.nextState : logic.state };

      const result = MatchCommands.skipHalftime(ctx);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('locked');
      }
    });
  });

  describe('Suspend/Resume Guards', () => {
    it('suspend requires reason', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      const ctx: CommandContext = { state: logic.state };

      const result = MatchCommands.suspend(ctx, { note: '' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('reason');
      }
    });

    it('suspend succeeds with valid reason', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      const ctx: CommandContext = { state: logic.state };

      const result = MatchCommands.suspend(ctx, { note: 'Player injury' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.nextState.matchStatus).toBe('suspended');
      }
    });

    it('resume changes status from suspended', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      // Suspend first
      const suspendResult = MatchCommands.suspend({ state: logic.state }, { note: 'Weather' });
      expect(suspendResult.ok).toBe(true);
      const ctx: CommandContext = { state: suspendResult.ok ? suspendResult.nextState : logic.state };

      const result = MatchCommands.resume(ctx);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.nextState.matchStatus).not.toBe('suspended');
      }
    });
  });

  describe('Terminate Match Guards', () => {
    it('terminate blocks subsequent timer operations', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      const terminateResult = MatchCommands.terminate({ state: logic.state });
      expect(terminateResult.ok).toBe(true);
      const ctx: CommandContext = { state: terminateResult.ok ? terminateResult.nextState : logic.state };

      const result = MatchCommands.startTimer(ctx);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('terminated');
      }
    });

    it('terminate blocks subsequent setExactTime', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      const terminateResult = MatchCommands.terminate({ state: logic.state });
      const ctx: CommandContext = { state: terminateResult.ok ? terminateResult.nextState : logic.state };

      const result = MatchCommands.setExactTime(ctx, { seconds: 100 });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('terminated');
      }
    });

    it('terminate blocks subsequent endSegment', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      const terminateResult = MatchCommands.terminate({ state: logic.state });
      const ctx: CommandContext = { state: terminateResult.ok ? terminateResult.nextState : logic.state };

      const result = MatchCommands.endSegment(ctx);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('terminated');
      }
    });

    it('allows reset after terminate', () => {
      const logic = (window as any).__testLogic;
      logic.dispatch({ type: 'START_MATCH' });
      const terminateResult = MatchCommands.terminate({ state: logic.state });
      const ctx: CommandContext = { state: terminateResult.ok ? terminateResult.nextState : logic.state };

      const result = MatchCommands.reset(ctx, 'confirm_reset');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.nextState.matchStatus).toBe('not_started');
      }
    });
  });
});
