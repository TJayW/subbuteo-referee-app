/**
 * OperatorRail: Left sidebar for match operations
 * Desktop/Tablet: Full sidebar (280px wide, sticky) with collapse/expand support
 * Mobile: Compact bottom dock (original behavior preserved)
 * 
 * Zero regressions - 100% feature parity with BottomDock
 */

import React, { useState, useEffect } from 'react';
import type {
  DomainMatchState,
  TeamKey,
  EventType,
  ComputedTeamStats,
  RegulationPeriod,
  MatchPhase,
} from '@/domain/match/types';
import { SidebarCollapsed } from './SidebarCollapsed';
import { ResizeHandle } from './ResizeHandle';
import { BottomDock } from '../mobile/BottomDock';
import { TeamCard } from '../cards/TeamCard';
import { TimeCard } from '../cards/TimeCard';
import { EventLogCard } from '../cards/EventLogCard';
import { MatchControlCard } from '../cards/MatchControlCard';
import { LAYOUT_WIDTHS, ANIMATION_TIMINGS } from '@/constants/layout';
import { getLayoutMode, getLayoutConfig, type LayoutMode } from '@/utils/responsive-layout';
import { StreamingControl } from '@/features/streaming/StreamingControl';
import { ConsoleStatusStrip } from '@/features/console/components/ConsoleStatusStrip';

interface SidebarProps {
  state: DomainMatchState;
  teamStats: ComputedTeamStats;
  selectedTeam: TeamKey;
  onSelectTeam: (team: TeamKey) => void;
  onPlayPause: () => void;
  onAddEvent: (type: EventType, team: TeamKey) => void;
  onAddTime: (seconds: number) => void;
  onRemoveTime: (seconds: number) => void;
  onSetPeriod?: (period: string) => void;
  onSetTotalPeriodSeconds?: (seconds: number) => void;
  defaultExtraTimeDurationMinutes?: number;
  onDeleteEvent?: (eventId: string) => void;
  onUpdateEvent?: (event: any) => void;
  onSetCursor?: (cursor: number) => void;
  eventHistory?: any; // Reserved for P1 event navigation integration
  canNavigateEventCursor?: boolean; // Reserved for P1 event navigation integration
  isCollapsed?: boolean; // Collapse state for desktop/tablet
  onToggleCollapse?: () => void; // Toggle handler
  width?: number; // Sidebar width (px) for resize support
  onWidthChange?: (newWidth: number) => void; // Width change handler
  onResizeDragEnd?: (finalWidth: number) => void; // Drag end handler (for snapping)
  onSuspend?: (reason: string) => void;
  onResume?: () => void;
  onReset?: () => void;
  onToggleTimerLock?: () => void;
  onSetExactTime?: (seconds: number) => void;
  onAddRecovery?: (period: RegulationPeriod, seconds: number) => void;
  onSetRecovery?: (period: RegulationPeriod, seconds: number) => void;
  onRequireExtraTime?: (enabled: boolean) => void;
  onAllowOverride?: (enabled: boolean) => void;
  onEndPeriod?: () => void;
  onSkipHalftime?: () => void;
  onTerminateMatch?: () => void;
  onSetMatchPhase?: (phase: MatchPhase) => void;
  onUndoDomain?: () => void;
  onRedoDomain?: () => void;
  undoDomainAvailable?: boolean;
  redoDomainAvailable?: boolean;
  timerLocked?: boolean;
  homeTeamName: string;
  awayTeamName: string;
}

/**
 * Adaptive layout:
 * - Desktop/Tablet (md+): Left sidebar with stacked controls (expandable/collapsible)
 * - Mobile: Bottom dock with horizontal controls (original UX)
 */
export const Sidebar: React.FC<SidebarProps> = ({
  state,
  teamStats,
  selectedTeam,
  onSelectTeam,
  onPlayPause,
  onAddEvent,
  onAddTime,
  onRemoveTime,
  homeTeamName,
  awayTeamName,
  onSetPeriod,
  onSetTotalPeriodSeconds,
  defaultExtraTimeDurationMinutes = 15,
  onDeleteEvent,
  onUpdateEvent,
  onSetCursor,
  // eventHistory and canNavigateEventCursor reserved for P1 implementation
  canNavigateEventCursor = true,
  isCollapsed = false,
  onToggleCollapse,
  width,
  onWidthChange,
  onResizeDragEnd,
  onSuspend,
  onResume,
  onReset,
  onToggleTimerLock,
  onSetExactTime,
  onAddRecovery,
  onSetRecovery,
  onRequireExtraTime,
  onAllowOverride,
  onEndPeriod,
  onSkipHalftime,
  onTerminateMatch,
  onSetMatchPhase,
  onUndoDomain,
  onRedoDomain,
  undoDomainAvailable,
  redoDomainAvailable,
  timerLocked,
}) => {
  const isPlaying = state.isRunning && state.period !== 'pre_match';
  const appliedEvents = state.events.slice(0, state.cursor);
  const lastEvent = appliedEvents.length > 0 ? appliedEvents[appliedEvents.length - 1] : null;
  const currentCursor = state.cursor ?? state.events.length;
  const isEventCursorActive = currentCursor < state.events.length;

  // Detect layout mode for responsive constraints
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => getLayoutMode());
  const layoutConfig = getLayoutConfig(layoutMode);

  useEffect(() => {
    const handleResize = () => setLayoutMode(getLayoutMode());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic width based on collapse state or explicit width
  const sidebarWidth = width ?? (isCollapsed ? LAYOUT_WIDTHS.OPERATOR_RAIL_COLLAPSED : LAYOUT_WIDTHS.OPERATOR_RAIL);
  
  // Build transition style (respects prefers-reduced-motion)
  const transitionStyle: React.CSSProperties = {
    width: `${sidebarWidth}px`,
    transition: `width ${ANIMATION_TIMINGS.SIDEBAR_TRANSITION_MS}ms ${ANIMATION_TIMINGS.SIDEBAR_TRANSITION_EASING}`,
  };

  // Period navigation
  const handlePreviousPeriod = () => {
    const periodSequence: DomainMatchState['period'][] = [
      'pre_match',
      'first_half',
      'first_half_recovery',
      'half_time',
      'second_half',
      'second_half_recovery',
      'extra_time_interval',
      'extra_time_1',
      'extra_time_1_recovery',
      'extra_time_2',
      'extra_time_2_recovery',
      'shootout',
      'penalties',
      'finished',
    ];
    const currentIndex = periodSequence.indexOf(state.period);
    if (currentIndex > 0) {
      onSetPeriod?.(periodSequence[currentIndex - 1]);
    }
  };

  const handleNextPeriod = () => {
    const periodSequence: DomainMatchState['period'][] = [
      'pre_match',
      'first_half',
      'first_half_recovery',
      'half_time',
      'second_half',
      'second_half_recovery',
      'extra_time_interval',
      'extra_time_1',
      'extra_time_1_recovery',
      'extra_time_2',
      'extra_time_2_recovery',
      'shootout',
      'penalties',
      'finished',
    ];
    const currentIndex = periodSequence.indexOf(state.period);
    if (currentIndex < periodSequence.length - 1) {
      onSetPeriod?.(periodSequence[currentIndex + 1]);
    }
  };

  return (
    <>
      {/* DESKTOP/TABLET: Left Sidebar - Full-height layout with collapse support */}
      {/* In-flow sidebar: no scroll; only event list scrolls (§P0) */}
      {/* Dynamic width based on collapse state with smooth transition */}
      <aside 
        className="hidden md:flex md:flex-col flex-none bg-white/85 backdrop-blur-xl border-r border-slate-200/80 overflow-hidden relative"
        style={transitionStyle}
      >        {isCollapsed ? (
          /* COLLAPSED MODE: Icon-only compact rail */
          <SidebarCollapsed
            state={state}
            selectedTeam={selectedTeam}
            onSelectTeam={onSelectTeam}
            onPlayPause={onPlayPause}
            onAddEvent={onAddEvent}
            onToggleExpand={onToggleCollapse || (() => {})}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
          />
        ) : (
          /* EXPANDED MODE: 5-card layout with scroll */
          <>
            {/* Card container: scrollable area with all 5 cards always visible */}
            <div className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto relative">
              <ConsoleStatusStrip
                state={state}
                isEventCursorActive={isEventCursorActive}
                currentCursor={currentCursor}
                totalEvents={state.events.length}
              />
              {/* CARD 1: Event Log - Flexible height */}
              <div className="flex-1 min-h-[240px]">
                <EventLogCard
                  state={state}
                  teamStats={teamStats}
                  selectedTeam={selectedTeam}
                  homeTeamName={homeTeamName}
                  awayTeamName={awayTeamName}
                  onDeleteEvent={onDeleteEvent || (() => {})}
                  onUpdateEvent={onUpdateEvent || (() => {})}
                  onSetCursor={onSetCursor || (() => {})}
                  canNavigateEventCursor={canNavigateEventCursor}
                  onUndoDomain={onUndoDomain}
                  onRedoDomain={onRedoDomain}
                  undoDisabled={undoDomainAvailable === false}
                  redoDisabled={redoDomainAvailable === false}
                  layout="sidebar"
                />
              </div>

              {/* CARD 2: Team Control - Fixed height */}
              <div className="flex-none">
                <TeamCard
                  state={state}
                  teamStats={teamStats}
                  selectedTeam={selectedTeam}
                  onSelectTeam={onSelectTeam}
                  onAddEvent={onAddEvent}
                  homeTeamName={homeTeamName}
                  awayTeamName={awayTeamName}
                  lastEvent={lastEvent}
                  layout="sidebar"
                />
              </div>

              {/* CARD 3: Time Control - Fixed height */}
              <div className="flex-none">
                <TimeCard
                  state={state}
                  isPlaying={isPlaying}
                  onPlayPause={onPlayPause}
                  onAddTime={onAddTime}
                  onRemoveTime={onRemoveTime}
                  onPreviousPeriod={handlePreviousPeriod}
                  onNextPeriod={handleNextPeriod}
                  onSetPeriod={onSetPeriod}
                  onSetTotalPeriodSeconds={onSetTotalPeriodSeconds}
                  onSetExactTime={onSetExactTime}
                  onToggleTimerLock={onToggleTimerLock}
                  onEndPeriod={onEndPeriod}
                  timerLocked={timerLocked}
                  defaultExtraTimeDurationMinutes={defaultExtraTimeDurationMinutes}
                  lastEvent={lastEvent}
                  onAddRecovery={onAddRecovery}
                  onSetRecovery={onSetRecovery}
                  layout="sidebar"
                />
              </div>

              {/* CARD 4: Match Control - Fixed height */}
              <div className="flex-none">
                <MatchControlCard
                  state={state}
                  isPlaying={isPlaying}
                  onPlayPause={onPlayPause}
                  onToggleTimerLock={onToggleTimerLock || (() => {})}
                  onAddTime={onAddTime}
                  onSetExactTime={onSetExactTime || (() => {})}
                  onSetTotalPeriodSeconds={onSetTotalPeriodSeconds || (() => {})}
                  onAddRecovery={onAddRecovery || (() => {})}
                  onSetRecovery={onSetRecovery || (() => {})}
                  onEndPeriod={onEndPeriod || (() => {})}
                  onSkipHalftime={onSkipHalftime || (() => {})}
                  onSetMatchPhase={onSetMatchPhase || (() => {})}
                  onTerminateMatch={onTerminateMatch || (() => {})}
                  onRequireExtraTime={onRequireExtraTime || (() => {})}
                  onAllowOverride={onAllowOverride || (() => {})}
                  onSuspend={(reason) => (onSuspend ? onSuspend(reason) : undefined)}
                  onResume={onResume || (() => {})}
                  onReset={onReset || (() => {})}
                  onUndo={onUndoDomain}
                  onRedo={onRedoDomain}
                  undoDisabled={undoDomainAvailable === false}
                  redoDisabled={redoDomainAvailable === false}
                  homeTeamGoals={teamStats.home.goals}
                  awayTeamGoals={teamStats.away.goals}
                />
              </div>
            </div>

            {/* CARD 5: Streaming Control - STICKY BOTTOM (sempre visibile) */}
            <div className="flex-none border-t border-slate-200 bg-white/90 backdrop-blur-sm">
              <div className="p-3">
                <StreamingControl
                  matchState={state}
                  homeTeamName={homeTeamName}
                  awayTeamName={awayTeamName}
                />
              </div>
            </div>
          </>
        )}
        
        {/* Resize Handle - Desktop/Tablet only, respects breakpoint constraints */}
        {onWidthChange && onResizeDragEnd && layoutConfig.resizeEnabled && (
          <ResizeHandle
            width={sidebarWidth}
            onWidthChange={onWidthChange}
            onDragEnd={onResizeDragEnd}
            minWidth={layoutConfig.minPanelWidth}
            maxWidth={layoutConfig.maxPanelWidth}
          />
        )}
      </aside>

      {/* MOBILE: Full-Featured Operator Panel */}
      {/* 100% feature parity with desktop: Event Log, Team Controls, Time Management */}
      <BottomDock
        state={state}
        teamStats={teamStats}
        selectedTeam={selectedTeam}
        onSelectTeam={onSelectTeam}
        onPlayPause={onPlayPause}
        onAddEvent={onAddEvent}
        onAddTime={onAddTime}
        onRemoveTime={onRemoveTime}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onSetPeriod={onSetPeriod}
        onSetTotalPeriodSeconds={onSetTotalPeriodSeconds}
        defaultExtraTimeDurationMinutes={defaultExtraTimeDurationMinutes}
        onDeleteEvent={onDeleteEvent}
        onUpdateEvent={onUpdateEvent}
        onSetCursor={onSetCursor}
        canNavigateEventCursor={canNavigateEventCursor}
        onToggleTimerLock={onToggleTimerLock}
        onSetExactTime={onSetExactTime}
        timerLocked={timerLocked}
        onAddRecovery={onAddRecovery}
        onSetRecovery={onSetRecovery}
        onRequireExtraTime={onRequireExtraTime}
        onAllowOverride={onAllowOverride}
        onEndPeriod={onEndPeriod}
        onSkipHalftime={onSkipHalftime}
        onTerminateMatch={onTerminateMatch}
        onSetMatchPhase={onSetMatchPhase}
        onSuspend={onSuspend}
        onResume={onResume}
        onReset={onReset}
        onUndoDomain={onUndoDomain}
        onRedoDomain={onRedoDomain}
        undoDomainAvailable={undoDomainAvailable}
        redoDomainAvailable={redoDomainAvailable}
      />
    </>
  );
};
