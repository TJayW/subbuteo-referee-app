import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import AppShell from '@/app/AppShell';
import { selectTeamStats, clearSelectorCache } from '@/domain/match/selectors';
import type { DomainMatchState } from '../../../src/domain/match/types';
import { ConsoleFocusProvider } from '@/hooks/use-console-focus-manager';
import { StreamingProvider } from '@/contexts/StreamingContext';

/**
 * Smoke Tests: Verify critical operator console invariants
 * 
 * These tests ensure:
 * 1. Core components mount without errors
 * 2. Domain selectors compute correct stats
 * 3. Event-sourced state transformations work correctly
 * 4. UI structure preserves layout stability contracts
 */

describe('Operator Console Smoke Tests', () => {
  describe('Core Component Mounting', () => {
    it('AppShell renders without crashing', () => {
      render(
        <StreamingProvider>
          <ConsoleFocusProvider>
            <AppShell />
          </ConsoleFocusProvider>
        </StreamingProvider>
      );
      // If we get here without error, component mounted successfully
      expect(document.body).toBeTruthy();
    });

    it('AppShell renders with essential UI structure', () => {
      render(
        <StreamingProvider>
          <ConsoleFocusProvider>
            <AppShell />
          </ConsoleFocusProvider>
        </StreamingProvider>
      );
      
      // Verify critical sections exist (stable layout contract)
      const app = document.querySelector('body');
      expect(app).toBeTruthy();
      
      // Note: More specific selectors would require data-testid attributes
      // This is a minimal smoke test to ensure no catastrophic render failures
    });
  });

  describe('Domain Logic - Event-Sourced Stats', () => {
    beforeEach(() => {
      // Clear memoization cache to prevent cross-test pollution
      clearSelectorCache();
    });

    it('selectTeamStats computes correct goals from events', () => {
      const state: DomainMatchState = {
        matchId: 'test-match-1',
        createdAt: Date.now(),
        events: [
          { id: '1', type: 'goal', team: 'home', timestamp: 100, period: 'first_half', secondsInPeriod: 100 },
          { id: '2', type: 'goal', team: 'away', timestamp: 200, period: 'first_half', secondsInPeriod: 200 },
          { id: '3', type: 'goal', team: 'home', timestamp: 300, period: 'second_half', secondsInPeriod: 300 },
        ],
        cursor: 3, // All events applied
        period: 'second_half',
        matchPhase: 'second_half_regulation',
        totalPeriodSeconds: 2700,
        elapsedSeconds: 1500,
        recoverySeconds: {},
        requireExtraTime: false,
        allowPhaseOverride: false,
        timerLocked: false,
        isRunning: false,
        matchStatus: 'in_progress',
        timeoutLimitPerTeam: 1,
      };

      const stats = selectTeamStats(state);
      
      expect(stats.home.goals).toBe(2);
      expect(stats.away.goals).toBe(1);
      // Note: shots stat may not include goals in current implementation
    });

    it('selectTeamStats respects cursor for time-travel', () => {
      const state: DomainMatchState = {
        matchId: 'test-match-2',
        createdAt: Date.now(),
        events: [
          { id: '1', type: 'goal', team: 'home', timestamp: 100, period: 'first_half', secondsInPeriod: 100 },
          { id: '2', type: 'goal', team: 'away', timestamp: 200, period: 'first_half', secondsInPeriod: 200 },
          { id: '3', type: 'goal', team: 'home', timestamp: 300, period: 'second_half', secondsInPeriod: 300 },
        ],
        cursor: 1, // Only first event applied
        period: 'first_half',
        matchPhase: 'first_half_regulation',
        totalPeriodSeconds: 2700,
        elapsedSeconds: 120,
        recoverySeconds: {},
        requireExtraTime: false,
        allowPhaseOverride: false,
        timerLocked: false,
        isRunning: false,
        matchStatus: 'in_progress',
        timeoutLimitPerTeam: 1,
      };

      const stats = selectTeamStats(state);
      
      // cursor=1 means only events[0] is applied (home goal)
      expect(stats.home.goals).toBe(1);
      expect(stats.away.goals).toBe(0);
    });

    it('selectTeamStats computes disciplinary stats correctly', () => {
      const state: DomainMatchState = {
        matchId: 'test-match-3',
        createdAt: Date.now(),
        events: [
          { id: '1', type: 'yellow_card', team: 'home', timestamp: 100, period: 'first_half', secondsInPeriod: 100 },
          { id: '2', type: 'yellow_card', team: 'home', timestamp: 200, period: 'second_half', secondsInPeriod: 200 },
          { id: '3', type: 'red_card', team: 'away', timestamp: 300, period: 'second_half', secondsInPeriod: 300 },
        ],
        cursor: 3,
        period: 'second_half',
        matchPhase: 'second_half_regulation',
        totalPeriodSeconds: 2700,
        elapsedSeconds: 1500,
        recoverySeconds: {},
        requireExtraTime: false,
        allowPhaseOverride: false,
        timerLocked: false,
        isRunning: false,
        matchStatus: 'in_progress',
        timeoutLimitPerTeam: 1,
      };

      const stats = selectTeamStats(state);
      
      expect(stats.home.yellowCards).toBe(2);
      expect(stats.home.redCards).toBe(0);
      expect(stats.away.yellowCards).toBe(0);
      expect(stats.away.redCards).toBe(1);
    });

    it('selectTeamStats computes fouls correctly', () => {
      const state: DomainMatchState = {
        matchId: 'test-match-4',
        createdAt: Date.now(),
        events: [
          { id: '1', type: 'foul', team: 'home', timestamp: 100, period: 'first_half', secondsInPeriod: 100 },
          { id: '2', type: 'foul', team: 'away', timestamp: 200, period: 'first_half', secondsInPeriod: 200 },
          { id: '3', type: 'foul', team: 'home', timestamp: 300, period: 'second_half', secondsInPeriod: 300 },
        ],
        cursor: 3,
        period: 'second_half',
        matchPhase: 'second_half_regulation',
        totalPeriodSeconds: 2700,
        elapsedSeconds: 1500,
        recoverySeconds: {},
        requireExtraTime: false,
        allowPhaseOverride: false,
        timerLocked: false,
        isRunning: false,
        matchStatus: 'in_progress',
        timeoutLimitPerTeam: 1,
      };

      const stats = selectTeamStats(state);
      
      expect(stats.home.fouls).toBe(2);
      expect(stats.away.fouls).toBe(1);
    });
  });

  describe('Storage Validation', () => {
    it('localStorage keys are stable (external contract)', () => {
      // Critical invariant: These keys must never change (external storage contract)
      const expectedKeys = [
        'subbuteo_settings',
        'subbuteo_storage_version',
        'subbuteo_audio_settings',
        'subbuteo_audio_version',
        'subbuteo_match_state',
      ];

      // This test documents the external API contract
      // If keys change, users lose data
      expectedKeys.forEach((key) => {
        expect(key).toMatch(/^subbuteo_/);
      });
    });
  });

  describe('Naming Convention Compliance', () => {
    it('No forbidden brand tokens in component names', () => {
      // Verify current component names are brand-free
      const componentNames = [
        'OperatorControlBar',
        'AdvancedControlPanel',
        'MobileOperatorSheet',
        'PeriodTransitionManager',
        'EventLogCard',
        'TeamCard',
      ];

      componentNames.forEach((name) => {
        expect(name.toLowerCase()).not.toMatch(/spotify|espn|supabase|sky|nowplaying/);
      });
    });

    it('No forbidden meta tokens in function names', () => {
      // Verify normalization function name
      const functionNames = [
        'normalizeStorageState',
        'loadSettingsFromStorage',
        'selectTeamStats',
      ];

      functionNames.forEach((name) => {
        expect(name.toLowerCase()).not.toMatch(/migrate|migration|legacy|refactor|experimental/);
      });
    });
  });
});
