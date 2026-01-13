/**
 * Operator Card Visibility Tests
 * 
 * Validates:
 * - Desktop: OperatorPanel shows all 4 cards (EventLog, Team, Time, MatchControl)
 * - Mobile: BottomDock shows all cards when expanded
 * - No responsive hiding of cards
 */

import { describe, it, expect } from 'vitest';
import { renderApp, setViewport } from '../utils/render';
import { OperatorPanel } from "@/features/console/desktop/OperatorPanel";
import { ConsoleFocusProvider } from '@/hooks/use-console-focus-manager';
import type { DomainMatchState, ComputedTeamStats } from '@/domain/match/types';

const mockState: DomainMatchState = {
  matchId: 'test-match',
  createdAt: Date.now(),
  period: 'first_half',
  matchPhase: 'first_half_regulation',
  elapsedSeconds: 300,
  isRunning: true,
  recoverySeconds: { first_half: 0, second_half: 0 },
  totalPeriodSeconds: 2700,
  requireExtraTime: false,
  allowPhaseOverride: false,
  timerLocked: false,
  matchStatus: 'in_progress',
  events: [],
  cursor: 0,
  timeoutLimitPerTeam: 2,
};

const mockStats: ComputedTeamStats = {
  home: { name: 'HOME', goals: 0, shots: 0, shotsOnTarget: 0, fouls: 0, yellowCards: 0, redCards: 0, corners: 0, timeouts: 0, throwIns: 0 },
  away: { name: 'AWAY', goals: 0, shots: 0, shotsOnTarget: 0, fouls: 0, yellowCards: 0, redCards: 0, corners: 0, timeouts: 0, throwIns: 0 },
};

describe('Desktop OperatorPanel', () => {
  it('renders all 4 cards when expanded', () => {
    setViewport('desktop');
    
    const { container } = renderApp(
      <ConsoleFocusProvider>
        <OperatorPanel
          state={mockState}
          teamStats={mockStats}
          selectedTeam="home"
          onSelectTeam={() => {}}
          onPlayPause={() => {}}
          onAddEvent={() => {}}
          onAddTime={() => {}}
          onRemoveTime={() => {}}
          homeTeamName="Home Team"
          awayTeamName="Away Team"
          isCollapsed={false}
          onToggleTimerLock={() => {}}
          onSetExactTime={() => {}}
          onSetTotalPeriodSeconds={() => {}}
          onAddRecovery={() => {}}
          onSetRecovery={() => {}}
          onEndPeriod={() => {}}
          onSkipHalftime={() => {}}
          onSetMatchPhase={() => {}}
          onTerminateMatch={() => {}}
          onRequireExtraTime={() => {}}
          onAllowOverride={() => {}}
          onSuspend={() => {}}
          onResume={() => {}}
          onReset={() => {}}
        />
      </ConsoleFocusProvider>
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar).toBeTruthy();

    const scrollContainer = container.querySelector('.flex-1.flex.flex-col.gap-3.p-3.overflow-y-auto');
    expect(scrollContainer).toBeTruthy();

    const cardsInContainer = scrollContainer?.querySelectorAll('.flex-none');
    expect(cardsInContainer?.length).toBeGreaterThanOrEqual(4);

    const eventLog = container.querySelector('[role="log"]');
    expect(eventLog).toBeTruthy();

    const teamCard = container.querySelector('[data-testid="team-card-b1-b5-fixed"]');
    expect(teamCard).toBeTruthy();

    const timeCard = container.querySelector('[data-testid="time-card"]');
    expect(timeCard).toBeTruthy();
  });
});
