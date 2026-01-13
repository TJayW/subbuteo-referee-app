/**
 * Unit tests for storage validation with Zod schemas
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadMatchStateFromStorage, saveMatchStateToStorage } from '@/adapters/storage/storage-persistence';
import { STORAGE_KEYS } from '@/constants/storage';
import logger from '@/utils/logger';
import type { DomainMatchState } from '@/domain/match/types';

describe('Storage Validation', () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(() => null),
    } as any;

    // Mock console methods (logger delegates to console in dev mode)
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadMatchStateFromStorage', () => {
    it('should load valid persisted match state', () => {
      const validState: DomainMatchState = {
        matchId: 'match-001',
        createdAt: 1736935200000,
        events: [
          {
            id: 'evt-001',
            type: 'match_start',
            team: 'system',
            timestamp: 1736935200000,
            period: 'first_half',
            secondsInPeriod: 0,
          },
        ],
        cursor: 1,
        isRunning: false,
        elapsedSeconds: 0,
        period: 'first_half',
        matchPhase: 'first_half_regulation',
        totalPeriodSeconds: 1200,
        recoverySeconds: {},
        requireExtraTime: false,
        allowPhaseOverride: false,
        timerLocked: false,
        matchStatus: 'not_started',
        timeoutLimitPerTeam: 1,
      };

      localStorageMock[STORAGE_KEYS.MATCH] = JSON.stringify(validState);

      const result = loadMatchStateFromStorage();

      expect(result).not.toBeNull();
      expect(result?.matchId).toBe('match-001');
      expect(result?.events).toHaveLength(1);
      expect(result?.cursor).toBe(1);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should return null for empty localStorage', () => {
      const result = loadMatchStateFromStorage();

      expect(result).toBeNull();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should fall back to null for invalid match state and log warning', () => {
      const invalidState = {
        matchId: 'match-001',
        // Missing required fields: createdAt, events, cursor, etc.
        isRunning: true,
      };

      localStorageMock[STORAGE_KEYS.MATCH] = JSON.stringify(invalidState);

      const result = loadMatchStateFromStorage();

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
      
      // Verify warning message contains key phrase
      const warnCalls = (console.warn as any).mock.calls;
      const relevantCall = warnCalls.find((call: any[]) => 
        call.some(arg => typeof arg === 'string' && arg.includes('Invalid match state'))
      );
      expect(relevantCall).toBeDefined();
    });

    it('should handle corrupted JSON and log error', () => {
      localStorageMock[STORAGE_KEYS.MATCH] = '{invalid-json}';

      const result = loadMatchStateFromStorage();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      
      const errorCall = (console.error as any).mock.calls[0];
      expect(errorCall[0]).toBe('[ERROR]');
      expect(errorCall[1]).toBe('Failed to load match state from storage:');
    });

    it('should validate event structure in persisted state', () => {
      const stateWithInvalidEvent = {
        matchId: 'match-001',
        createdAt: 1736935200000,
        events: [
          {
            id: 'evt-001',
            // Missing required fields: type, team, timestamp, etc.
          },
        ],
        cursor: 1,
        isRunning: false,
        elapsedSeconds: 0,
        period: 'first_half',
        matchPhase: 'first_half_regulation',
        totalPeriodSeconds: 1200,
        requireExtraTime: false,
        allowPhaseOverride: false,
        timerLocked: false,
        matchStatus: 'not_started',
        timeoutLimitPerTeam: 1,
      };

      localStorageMock[STORAGE_KEYS.MATCH] = JSON.stringify(stateWithInvalidEvent);

      const result = loadMatchStateFromStorage();

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should accept optional fields with missing values', () => {
      const stateWithMissingOptionals: DomainMatchState = {
        matchId: 'match-001',
        createdAt: 1736935200000,
        events: [],
        cursor: 0,
        isRunning: false,
        elapsedSeconds: 0,
        period: 'pre_match',
        matchPhase: 'prematch_ready',
        totalPeriodSeconds: 1200,
        // recoverySeconds omitted (optional)
        requireExtraTime: false,
        allowPhaseOverride: false,
        timerLocked: false,
        matchStatus: 'not_started',
        // suspensionReason omitted (optional)
        timeoutLimitPerTeam: 1,
      };

      localStorageMock[STORAGE_KEYS.MATCH] = JSON.stringify(stateWithMissingOptionals);

      const result = loadMatchStateFromStorage();

      expect(result).not.toBeNull();
      expect(result?.matchId).toBe('match-001');
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('saveMatchStateToStorage', () => {
    it('should save match state to localStorage', () => {
      const state: DomainMatchState = {
        matchId: 'match-002',
        createdAt: 1736935200000,
        events: [],
        cursor: 0,
        isRunning: false,
        elapsedSeconds: 0,
        period: 'pre_match',
        matchPhase: 'prematch_ready',
        totalPeriodSeconds: 1200,
        recoverySeconds: {},
        requireExtraTime: false,
        allowPhaseOverride: false,
        timerLocked: false,
        matchStatus: 'not_started',
        timeoutLimitPerTeam: 1,
      };

      saveMatchStateToStorage(state);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MATCH,
        JSON.stringify(state)
      );
    });
  });
});
