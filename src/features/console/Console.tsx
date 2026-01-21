/**
 * Console: Componente console unificato per desktop e mobile
 * - Desktop (vertical): Espande da sinistra verso destra
 * - Mobile (horizontal): Espande dal basso verso l'alto
 * 
 * 3 Stati Identici:
 * 1. Minimized (28px): Solo handle visibile
 * 2. ActionBar (80/120px): Barra veloce con bottoni eventi
 * 3. Full (280/360px): Console completa con tutte le card
 */

import React, { useRef, useState } from 'react';
import type { BaseConsoleProps, ConsoleOrientation } from '@/types/console';
import { useConsoleState } from '@/hooks';
import { PANEL_RESIZE } from '@/constants/layout';
import {
  applySnap,
  clampWidth,
  computeWidthFromDrag,
  nextSnap,
} from '@/utils/console-panel-resize';
import { TeamCard } from './cards/TeamCard';
import { TimeCard } from './cards/TimeCard';
import { EventLogCard } from './cards/EventLogCard';
import { MatchControlCard } from './cards/MatchControlCard';
import { ConsoleActionBar } from './components/ConsoleActionBar';
import { ConsoleHandle } from './components/ConsoleHandle';
import { MiniStreamPreview } from '@/features/streaming/MiniStreamPreview';
import { StreamingDashboard } from '@/features/streaming/StreamingDashboard';
import { StreamingControl } from '@/features/streaming/StreamingControl';
import { CONSOLE_RESIZE_CONFIG } from '@/constants/console';
import { 
  getAppliedEvents, 
  getLastEvent, 
  isMatchPlaying,
  getRecentEvents,
  isEventCursorActive,
  getNextPeriod,
  getPreviousPeriod
} from '@/utils/match-helpers';
import { 
  formatTime, 
  enrichEventsForDisplay,
  getInitial,
  getConsoleContainerClass,
  getTeamSelectorClass,
  getEventButtonsClass,
  getButtonSizeClass
} from '@/utils';
import { PERIOD_SEQUENCE } from '@/constants';
import { isMatchActive } from '@/utils/match-helpers';

interface ConsoleProps extends BaseConsoleProps {
  /** Orientamento: vertical (desktop) o horizontal (mobile) */
  orientation: ConsoleOrientation;
  /** Larghezza panel (solo desktop) */
  panelWidth?: number;
  /** Aggiorna la larghezza panel (solo desktop) */
  onResizePanel?: (width: number) => void;
}

export const Console: React.FC<ConsoleProps> = (props) => {
  const {
    orientation,
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
    onSetCursor,
    canNavigateEventCursor = true,
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
    panelWidth,
    onResizePanel,
  } = props;

  const [showStreamingDashboard, setShowStreamingDashboard] = useState(false);
  const [showMiniPreview, setShowMiniPreview] = useState(true);
  const dragStartPositionRef = useRef(0);
  const dragStartWidthRef = useRef(0);
  const usePanelResize = orientation === 'vertical' && typeof panelWidth === 'number' && !!onResizePanel;

  // Computed values using helpers
  const isPlaying = isMatchPlaying(state);
  const appliedEvents = getAppliedEvents(state.events, state.cursor);
  const lastEvent = getLastEvent(appliedEvents);
  const displayTime = formatTime(state.elapsedSeconds);
  const currentCursor = state.cursor ?? state.events.length;
  const isCursorActive = isEventCursorActive(currentCursor, state.events.length);
  const recentEvents = enrichEventsForDisplay(getRecentEvents(appliedEvents, 5));
  const canNav = canNavigateEventCursor;

  // Console state management
  const console = useConsoleState({
    orientation,
    initialState: 'full',
    persist: true,
  });

  const currentPanelWidth = usePanelResize ? panelWidth! : console.size;
  const handleSizeConfig = usePanelResize
    ? { minimized: PANEL_RESIZE.MIN_WIDTH, actionbar: PANEL_RESIZE.DEFAULT_WIDTH, full: PANEL_RESIZE.MAX_WIDTH }
    : console.sizeConfig;

  const handleKeyboardResize = (direction: 'increase' | 'decrease', large: boolean) => {
    if (!usePanelResize) {
      if (direction === 'increase') {
        console.keyboardHandlers.onArrowIncrease(large);
      } else {
        console.keyboardHandlers.onArrowDecrease(large);
      }
      return;
    }

    const step = large ? PANEL_RESIZE.KEYBOARD_STEP_LARGE : PANEL_RESIZE.KEYBOARD_STEP;
    const delta = direction === 'increase' ? step : -step;
    const nextWidth = clampWidth(
      currentPanelWidth + delta,
      PANEL_RESIZE.MIN_WIDTH,
      PANEL_RESIZE.MAX_WIDTH
    );
    onResizePanel?.(nextWidth);
  };

  const handleDragStart = (startPosition: number) => {
    if (!usePanelResize) {
      console.dragHandlers.onDragStart(startPosition);
      return;
    }
    dragStartPositionRef.current = startPosition;
    dragStartWidthRef.current = currentPanelWidth;
  };

  const handleDragMove = (currentPosition: number) => {
    if (!usePanelResize) {
      console.dragHandlers.onDragMove(currentPosition);
      return;
    }
    const delta = currentPosition - dragStartPositionRef.current;
    const nextWidth = computeWidthFromDrag(
      dragStartWidthRef.current,
      delta,
      PANEL_RESIZE.MIN_WIDTH,
      PANEL_RESIZE.MAX_WIDTH
    );
    onResizePanel?.(nextWidth);
  };

  const handleDragEnd = () => {
    if (!usePanelResize) {
      console.dragHandlers.onDragEnd();
      return;
    }
    const snapped = applySnap(
      currentPanelWidth,
      PANEL_RESIZE.SNAP_POINTS,
      PANEL_RESIZE.SNAP_THRESHOLD
    );
    onResizePanel?.(snapped);
  };

  const handleToggle = () => {
    if (!usePanelResize) {
      console.toggle();
      return;
    }
    const nextWidth = nextSnap(currentPanelWidth, PANEL_RESIZE.SNAP_POINTS);
    onResizePanel?.(nextWidth);
  };

  // Period navigation handlers
  const handlePreviousPeriod = () => {
    const previousPeriod = getPreviousPeriod(state.period, PERIOD_SEQUENCE);
    if (previousPeriod && onSetPeriod) {
      onSetPeriod(previousPeriod);
    }
  };

  const handleNextPeriod = () => {
    const nextPeriod = getNextPeriod(state.period, PERIOD_SEQUENCE);
    if (nextPeriod && onSetPeriod) {
      onSetPeriod(nextPeriod);
    }
  };

  // Event log handlers
  const handleUndoLastEvent = () => {
    if (appliedEvents.length > 0 && canNav && onSetCursor) {
      onSetCursor(appliedEvents.length - 1);
    }
  };

  // Card layout based on orientation
  const cardLayout = orientation === 'vertical' ? 'panel' : 'horizontal';

  // ActionBar computed props
  const isActive = isMatchActive(state.period);
  const homeInitial = getInitial(homeTeamName);
  const awayInitial = getInitial(awayTeamName);
  const containerClass = getConsoleContainerClass(orientation);
  const teamSelectorClass = getTeamSelectorClass(orientation);
  const eventButtonsClass = getEventButtonsClass(orientation);
  const buttonSize = getButtonSizeClass(orientation);

  // Render content based on console state
  const renderContent = () => {
    switch (console.state) {
      case 'minimized':
        // Solo handle visibile, nessun contenuto
        return null;

      case 'actionbar':
        // Barra veloce eventi
        return (
          <ConsoleActionBar
            isPlaying={isPlaying}
            isMatchActive={isActive}
            selectedTeam={selectedTeam}
            homeInitial={homeInitial}
            awayInitial={awayInitial}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            orientation={orientation}
            containerClass={containerClass}
            teamSelectorClass={teamSelectorClass}
            eventButtonsClass={eventButtonsClass}
            buttonSize={buttonSize}
            onSelectTeam={onSelectTeam}
            onPlayPause={onPlayPause}
            onAddEvent={onAddEvent}
          />
        );

      case 'full':
        // Console completa con tutte le card
        return (
          <>
            <div className="flex-1 flex flex-col gap-3 p-3 overflow-y-auto">
              {/* Desktop: EventLog first, Mobile: Team first */}
              {orientation === 'vertical' ? (
              <>
                {/* CARD 1: Event Log */}
                <div className="flex-none" style={{ minHeight: '300px' }}>
                  <EventLogCard
                    appliedEvents={enrichEventsForDisplay(appliedEvents)}
                    recentEvents={recentEvents}
                    isEventCursorActive={isCursorActive}
                    currentCursor={currentCursor}
                    totalEvents={state.events.length}
                    canNavigate={canNav}
                    homeTeamName={homeTeamName}
                    awayTeamName={awayTeamName}
                    onUndoLastEvent={handleUndoLastEvent}
                    layout={cardLayout}
                  />
                </div>

                {/* CARD 2: Team Control */}
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
                    layout={cardLayout}
                  />
                </div>
              </>
            ) : (
              <>
                {/* CARD 1: Team Control */}
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
                    layout={cardLayout}
                  />
                </div>
              </>
            )}

            {/* CARD 3: Time Control - stesso ordine per entrambi */}
            <div className="flex-none">
              <TimeCard
                state={state}
                displayTime={displayTime}
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
                timerLocked={timerLocked}
                defaultExtraTimeDurationMinutes={defaultExtraTimeDurationMinutes}
                lastEvent={lastEvent}
                layout={cardLayout}
              />
            </div>

            {/* Mobile: EventLog dopo Time */}
            {orientation === 'horizontal' && (
              <div className="flex-none" style={{ minHeight: '200px' }}>
                <EventLogCard
                  appliedEvents={enrichEventsForDisplay(appliedEvents)}
                  recentEvents={recentEvents}
                  isEventCursorActive={isCursorActive}
                  currentCursor={currentCursor}
                  totalEvents={state.events.length}
                  canNavigate={canNav}
                  homeTeamName={homeTeamName}
                  awayTeamName={awayTeamName}
                  onUndoLastEvent={handleUndoLastEvent}
                  layout={cardLayout}
                />
              </div>
            )}

            {/* CARD 4: Match Control - stesso ordine per entrambi */}
            <div className="flex-none">
              <MatchControlCard
                state={state}
                isPlaying={isPlaying}
                homeTeamGoals={teamStats.home.goals}
                awayTeamGoals={teamStats.away.goals}
                timerActions={{
                  onPlayPause,
                  onToggleTimerLock: onToggleTimerLock || (() => {}),
                  onAddTime,
                  onSetExactTime: onSetExactTime || (() => {}),
                  onSetTotalPeriodSeconds: onSetTotalPeriodSeconds || (() => {}),
                }}
                recoveryActions={{
                  onAddRecovery: onAddRecovery || (() => {}),
                  onSetRecovery: onSetRecovery || (() => {}),
                }}
                phaseActions={{
                  onEndPeriod: onEndPeriod || (() => {}),
                  onSkipHalftime: onSkipHalftime || (() => {}),
                  onSetMatchPhase: onSetMatchPhase || (() => {}),
                  onTerminateMatch: onTerminateMatch || (() => {}),
                }}
                configActions={{
                  onRequireExtraTime: onRequireExtraTime || (() => {}),
                  onAllowOverride: onAllowOverride || (() => {}),
                }}
                emergencyActions={{
                  onSuspend: (reason) => (onSuspend ? onSuspend(reason) : undefined),
                  onResume: onResume || (() => {}),
                  onReset: onReset || (() => {}),
                }}
                historyActions={{
                  onUndo: onUndoDomain,
                  onRedo: onRedoDomain,
                  undoDisabled: undoDomainAvailable === false,
                  redoDisabled: redoDomainAvailable === false,
                }}
              />
            </div>
          </div>

          {/* Streaming Control - STICKY BOTTOM (sempre visibile solo desktop) */}
          {orientation === 'vertical' && (
            <div className="flex-none border-t border-slate-200 bg-white/95 backdrop-blur-sm">
              <div className="p-3">
                <StreamingControl
                  matchState={state}
                  homeTeamName={homeTeamName}
                  awayTeamName={awayTeamName}
                  onExpandDashboard={() => setShowStreamingDashboard(true)}
                />
              </div>
            </div>
          )}
        </>
        );
    }
  };

  // Build transition style
  const transitionStyle: React.CSSProperties = orientation === 'vertical'
    ? {
        width: `${currentPanelWidth}px`,
        transition: `width ${CONSOLE_RESIZE_CONFIG.transitionDuration}ms ${CONSOLE_RESIZE_CONFIG.transitionEasing}`,
      }
    : {
        height: `${currentPanelWidth}px`,
        transition: `height ${CONSOLE_RESIZE_CONFIG.transitionDuration}ms ${CONSOLE_RESIZE_CONFIG.transitionEasing}`,
      };

  // Show streaming dashboard overlay if opened
  if (showStreamingDashboard) {
    return (
      <StreamingDashboard
        matchState={state}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onClose={() => setShowStreamingDashboard(false)}
      />
    );
  }

  // Render con layout specifico per orientamento
  if (orientation === 'vertical') {
    // Desktop: aside verticale a sinistra
    return (
      <>
        {/* Mini Stream Preview - floating overlay */}
        {showMiniPreview && (
          <MiniStreamPreview
            onExpand={() => setShowStreamingDashboard(true)}
            onClose={() => setShowMiniPreview(false)}
          />
        )}
        
        <aside
          className="hidden md:flex md:flex-col flex-none bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 overflow-hidden relative"
        style={transitionStyle}
        data-console-state={console.state}
      >
        {renderContent()}

        {/* Console Handle - destra del panel */}
        <ConsoleHandle
          orientation="vertical"
          state={console.state}
          size={currentPanelWidth}
          minSize={handleSizeConfig.minimized}
          maxSize={handleSizeConfig.full}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onKeyboardResize={(direction, large) => {
            handleKeyboardResize(direction, large);
          }}
          onToggle={handleToggle}
          showStateIndicator
        />
      </aside>
      </>
    );
  } else {
    // Mobile: div fixed bottom orizzontale
    return (
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white to-slate-50 border-t border-slate-200 overflow-hidden flex flex-col"
        style={transitionStyle}
        data-console-state={console.state}
      >
        {/* Console Handle - top del panel */}
        <ConsoleHandle
          orientation="horizontal"
          state={console.state}
          size={console.size}
          minSize={console.sizeConfig.minimized}
          maxSize={console.sizeConfig.full}
          onDragStart={console.dragHandlers.onDragStart}
          onDragMove={console.dragHandlers.onDragMove}
          onDragEnd={console.dragHandlers.onDragEnd}
          onKeyboardResize={(direction, large) => {
            if (direction === 'increase') {
              console.keyboardHandlers.onArrowIncrease(large);
            } else {
              console.keyboardHandlers.onArrowDecrease(large);
            }
          }}
          onToggle={console.toggle}
          showStateIndicator
        />

        {renderContent()}
      </div>
    );
  }
};
