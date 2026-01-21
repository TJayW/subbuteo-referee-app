/**
 * OperatorControls: Reusable match control module
 * Extracted from BottomDock to support both sidebar and mobile layouts
 * 100% feature parity with original implementation
 */

import React, { useState } from 'react';
import type { DomainMatchState, TeamKey, EventType, ComputedTeamStats, MatchEvent } from '@/domain/match/types';
import { TeamCard } from '../cards/TeamCard';
import { TimeCard } from '../cards/TimeCard';
import { EventLogCard } from '../cards/EventLogCard';
import { MatchSettingsModal } from '../cards/MatchSettingsModal';

interface SidebarControlsProps {
  state: DomainMatchState;
  teamStats: ComputedTeamStats;
  selectedTeam: TeamKey;
  onSelectTeam: (team: TeamKey) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onAddEvent: (type: EventType, team: TeamKey) => void;
  homeTeamName: string;
  awayTeamName: string;
  onAddTime: (seconds: number) => void;
  onRemoveTime: (seconds: number) => void;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onSetPeriod?: (period: string) => void;
  onSetTotalPeriodSeconds?: (seconds: number) => void;
  onSetExactTime?: (seconds: number) => void;
  onToggleTimerLock?: () => void;
  timerLocked?: boolean;
  defaultExtraTimeDurationMinutes?: number;
  lastEvent: MatchEvent | null;
  layout?: 'sidebar' | 'horizontal' | 'sidebar-time-only' | 'sidebar-event-log';
  onDeleteEvent?: (eventId: string) => void;
  onUpdateEvent?: (event: MatchEvent) => void;
  onSetCursor?: (cursor: number) => void;
  canNavigateEventCursor?: boolean;
}

/**
 * Core operator controls - single source of truth
 * Supports both sidebar (stacked) and horizontal (bottom dock) layouts
 */
export const SidebarControls: React.FC<SidebarControlsProps> = ({
  state,
  teamStats,
  selectedTeam,
  onSelectTeam,
  isPlaying,
  onPlayPause,
  onAddEvent,
  homeTeamName,
  awayTeamName,
  onAddTime,
  onRemoveTime,
  onPreviousPeriod,
  onNextPeriod,
  onSetPeriod,
  onSetTotalPeriodSeconds,
  onSetExactTime,
  onToggleTimerLock,
  timerLocked,
  defaultExtraTimeDurationMinutes = 15,
  lastEvent,
  layout = 'horizontal',
  onDeleteEvent,
  onUpdateEvent,
  onSetCursor,
  canNavigateEventCursor = true,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  // Layout-specific rendering
  if (layout === 'sidebar-time-only') {
    // Card 3: Time control only
    return (
      <TimeCard
        state={state}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onAddTime={onAddTime}
        onRemoveTime={onRemoveTime}
        onPreviousPeriod={onPreviousPeriod}
        onNextPeriod={onNextPeriod}
        onSettingsClick={handleSettingsClick}
        onSetExactTime={onSetExactTime}
        onToggleTimerLock={onToggleTimerLock}
        timerLocked={timerLocked}
      />
    );
  }

  if (layout === 'sidebar-event-log') {
    // Card 2: Event log only
    return (
      <EventLogCard
        state={state}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onDeleteEvent={onDeleteEvent || (() => {})}
        onUpdateEvent={onUpdateEvent || (() => {})}
        onSetCursor={onSetCursor || (() => {})}
        canNavigate={canNavigateEventCursor}
      />
    );
  }

  const containerClass = layout === 'sidebar' 
    ? 'flex flex-col gap-0' // Sidebar: only team card in middle section
    : 'grid grid-cols-1 md:grid-cols-2 gap-3';

  return (
    <>
      <div className={containerClass}>
        {layout === 'sidebar' ? (
          // Sidebar layout: Only team card (time card is in bottom pinned section)
          <TeamCard
            selectedTeam={selectedTeam}
            onSelectTeam={onSelectTeam}
            onAddEvent={onAddEvent}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            lastEvent={lastEvent}
          />
        ) : (
          // Horizontal layout: Both cards side-by-side
          <>
            <TeamCard
              selectedTeam={selectedTeam}
              onSelectTeam={onSelectTeam}
              onAddEvent={onAddEvent}
              homeTeamName={homeTeamName}
              awayTeamName={awayTeamName}
              lastEvent={lastEvent}
            />
            <TimeCard
              state={state}
              isPlaying={isPlaying}
              onPlayPause={onPlayPause}
              onAddTime={onAddTime}
              onRemoveTime={onRemoveTime}
              onPreviousPeriod={onPreviousPeriod}
              onNextPeriod={onNextPeriod}
              onSettingsClick={() => setShowSettings(true)}
              onSetExactTime={onSetExactTime}
              onToggleTimerLock={onToggleTimerLock}
              timerLocked={timerLocked}
            />
          </>
        )}
      </div>

      {/* SETTINGS MODAL - Rendered for sidebar and horizontal layouts */}
      {showSettings && (
        <MatchSettingsModal
          state={state}
          teamStats={teamStats}
          onSetPeriod={onSetPeriod}
          onSetTotalPeriodSeconds={onSetTotalPeriodSeconds}
          defaultExtraTimeDurationMinutes={defaultExtraTimeDurationMinutes}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};
