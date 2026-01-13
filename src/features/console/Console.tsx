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

import React, { useEffect } from 'react';
import type { DomainMatchState } from '@/domain/match/types';
import type { BaseConsoleProps, ConsoleOrientation } from '@/types/console';
import { useConsoleState } from '@/hooks';
import { TeamCard } from './cards/TeamCard';
import { TimeCard } from './cards/TimeCard';
import { EventLogCard } from './cards/EventLogCard';
import { MatchControlCard } from './cards/MatchControlCard';
import { ConsoleActionBar } from './components/ConsoleActionBar';
import { ConsoleHandle } from './components/ConsoleHandle';
import { CONSOLE_RESIZE_CONFIG } from '@/constants/console';

interface ConsoleProps extends BaseConsoleProps {
  /** Orientamento: vertical (desktop) o horizontal (mobile) */
  orientation: ConsoleOrientation;
  /** Callback legacy per toggle (opzionale) */
  onToggleCollapse?: () => void;
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
    onDeleteEvent,
    onUpdateEvent,
    onSetCursor,
    canNavigateEventCursor = true,
    onToggleCollapse,
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
  } = props;

  const isPlaying = state.isRunning && state.period !== 'pre_match';
  const appliedEvents = state.events.slice(0, state.cursor);
  const lastEvent = appliedEvents.length > 0 ? appliedEvents[appliedEvents.length - 1] : null;

  // Console state management
  const console = useConsoleState({
    orientation,
    initialState: 'full',
    persist: true,
  });

  // Sync legacy onToggleCollapse callback
  useEffect(() => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  }, [console.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Period navigation handlers
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

  // Layout prop per card
  const cardLayout = orientation === 'vertical' ? 'panel' : 'horizontal';

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
            state={state}
            selectedTeam={selectedTeam}
            onSelectTeam={onSelectTeam}
            onPlayPause={onPlayPause}
            onAddEvent={onAddEvent}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            orientation={orientation}
          />
        );

      case 'full':
        // Console completa con tutte le card
        return (
          <div className="flex-1 flex flex-col gap-3 p-3 overflow-y-auto">
            {/* Desktop: EventLog first, Mobile: Team first */}
            {orientation === 'vertical' ? (
              <>
                {/* CARD 1: Event Log */}
                <div className="flex-none" style={{ minHeight: '300px' }}>
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
                  state={state}
                  teamStats={teamStats}
                  selectedTeam={selectedTeam}
                  homeTeamName={homeTeamName}
                  awayTeamName={awayTeamName}
                  onDeleteEvent={onDeleteEvent || (() => {})}
                  onUpdateEvent={onUpdateEvent || (() => {})}
                  onSetCursor={onSetCursor || (() => {})}
                  canNavigateEventCursor={canNavigateEventCursor}
                  layout={cardLayout}
                />
              </div>
            )}

            {/* CARD 4: Match Control - stesso ordine per entrambi */}
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
        );
    }
  };

  // Build transition style
  const transitionStyle: React.CSSProperties = orientation === 'vertical'
    ? {
        width: `${console.size}px`,
        transition: `width ${CONSOLE_RESIZE_CONFIG.transitionDuration}ms ${CONSOLE_RESIZE_CONFIG.transitionEasing}`,
      }
    : {
        height: `${console.size}px`,
        transition: `height ${CONSOLE_RESIZE_CONFIG.transitionDuration}ms ${CONSOLE_RESIZE_CONFIG.transitionEasing}`,
      };

  // Render con layout specifico per orientamento
  if (orientation === 'vertical') {
    // Desktop: aside verticale a sinistra
    return (
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
      </aside>
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
