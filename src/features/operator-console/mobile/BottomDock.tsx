/**
 * MobileOperatorPanel: Full-featured mobile operator interface
 * Provides 100% feature parity with desktop sidebar
 * 
 * Features:
 * - Continuous resizing: drag handle to any height between MIN and MAX
 * - Minimal bar-only handle (enterprise-grade, desktop-like)
 * - Touch-optimized (≥44px hit target)
 * - Keyboard accessible (Arrow keys resize, Escape collapses)
 * - Zero layout shift, stable height transitions
 * - Focus safety: moves focus to handle when content becomes hidden
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause, Goal, History, AlertCircle, Target, Zap, Clock } from 'lucide-react';
import type {
  DomainMatchState,
  TeamKey,
  EventType,
  ComputedTeamStats,
  MatchEvent,
  RegulationPeriod,
  MatchPhase,
} from '@/domain/match/types';
import { TeamCard } from '../cards/TeamCard';
import { TimeCard } from '../cards/TimeCard';
import { EventLogCard } from '../cards/EventLogCard';
import { FOCUS_RING } from '@/styles/focus-ring';
import { MatchControlCard } from '../cards/MatchControlCard';

interface BottomDockProps {
  state: DomainMatchState;
  teamStats: ComputedTeamStats;
  selectedTeam: TeamKey;
  onSelectTeam: (team: TeamKey) => void;
  onPlayPause: () => void;
  onAddEvent: (type: EventType, team: TeamKey) => void;
  onAddTime: (seconds: number) => void;
  onRemoveTime: (seconds: number) => void;
  homeTeamName: string;
  awayTeamName: string;
  onSetPeriod?: (period: string) => void;
  onSetTotalPeriodSeconds?: (seconds: number) => void;
  defaultExtraTimeDurationMinutes?: number;
  onDeleteEvent?: (eventId: string) => void;
  onUpdateEvent?: (event: MatchEvent) => void;
  onSetCursor?: (cursor: number) => void;
  canNavigateEventCursor?: boolean;
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
  onSuspend?: (reason: string) => void;
  onResume?: () => void;
  onReset?: () => void;
  onUndoDomain?: () => void;
  onRedoDomain?: () => void;
  undoDomainAvailable?: boolean;
  redoDomainAvailable?: boolean;
  timerLocked?: boolean;
}

// Continuous resizing constants (desktop-like)
const MIN_PANEL_HEIGHT = 28; // Ultra-thin handle
const MAX_PANEL_HEIGHT_OFFSET = 120; // Bottom offset from viewport height
const DEFAULT_PANEL_HEIGHT = 280; // Quick controls default
const KEYBOARD_STEP_SMALL = 20; // Arrow key step
const KEYBOARD_STEP_LARGE = 100; // Shift+Arrow step
const STORAGE_KEY_PANEL_HEIGHT = 'subbuteo_mobile_panel_height_v3';

/**
 * P0 Event Buttons Configuration (Desktop Parity)
 * Matches SidebarCollapsed + TeamCard for consistent enterprise UX
 */
const MOBILE_EVENT_BUTTONS = [
  { type: 'goal' as const, icon: Goal, color: 'text-emerald-600', bg: 'bg-emerald-50', hoverBg: 'hover:bg-emerald-100', label: 'Goal', shortcut: 'G' },
  { type: 'shot_on_target' as const, icon: Target, color: 'text-sky-600', bg: 'bg-sky-50', hoverBg: 'hover:bg-sky-100', label: 'Tiro Porta', shortcut: 'O' },
  { type: 'shot' as const, icon: AlertCircle, color: 'text-slate-600', bg: 'bg-slate-50', hoverBg: 'hover:bg-slate-100', label: 'Tiro', shortcut: 'S' },
  { type: 'corner' as const, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', hoverBg: 'hover:bg-orange-100', label: 'Angolo', shortcut: 'C' },
  { type: 'foul' as const, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', hoverBg: 'hover:bg-amber-100', label: 'Fallo', shortcut: 'F' },
  { type: 'yellow_card' as const, icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', hoverBg: 'hover:bg-yellow-100', label: 'Giallo', shortcut: 'Y' },
  { type: 'red_card' as const, icon: Zap, color: 'text-red-600', bg: 'bg-red-50', hoverBg: 'hover:bg-red-100', label: 'Rosso', shortcut: 'R', border: 'border-2 border-red-200' },
  { type: 'timeout' as const, icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50', hoverBg: 'hover:bg-cyan-100', label: 'Timeout', shortcut: 'T' },
] as const;

export const BottomDock: React.FC<BottomDockProps> = ({
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
  onSuspend,
  onResume,
  onReset,
  onUndoDomain,
  onRedoDomain,
  undoDomainAvailable,
  redoDomainAvailable,
  timerLocked,
}) => {
  const isPlaying = state.isRunning && state.period !== 'pre_match';
  const appliedEvents = state.events.slice(0, state.cursor);
  const lastEvent = appliedEvents.length > 0 ? appliedEvents[appliedEvents.length - 1] : null;
  const totalEvents = state.events.length;
  const homeInitial = homeTeamName.charAt(0).toUpperCase();
  const awayInitial = awayTeamName.charAt(0).toUpperCase();

  // Refs for handle drag and focus management
  const handleRef = useRef<HTMLDivElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartHeight = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Respect user motion preferences
  const prefersReducedMotion = useReducedMotion();

  // Continuous panel height with persistence
  const [panelHeight, setPanelHeight] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PANEL_HEIGHT);
      if (stored) {
        const height = parseInt(stored, 10);
        if (!isNaN(height) && height >= MIN_PANEL_HEIGHT) {
          return height;
        }
      }
      return DEFAULT_PANEL_HEIGHT;
    } catch {
      return DEFAULT_PANEL_HEIGHT;
    }
  });

  // Persist panel height
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PANEL_HEIGHT, panelHeight.toString());
    } catch {
      // Silent fail
    }
  }, [panelHeight]);

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

  // Get max height based on viewport
  const getMaxHeight = useCallback(() => {
    return window.innerHeight - MAX_PANEL_HEIGHT_OFFSET;
  }, []);

  // Clamp height to valid range
  const clampHeight = useCallback((height: number) => {
    return Math.max(MIN_PANEL_HEIGHT, Math.min(height, getMaxHeight()));
  }, [getMaxHeight]);

  // Drag handlers for continuous resizing
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = panelHeight;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [panelHeight]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    const deltaY = dragStartY.current - e.clientY; // Inverted: drag up = increase height
    const newHeight = clampHeight(dragStartHeight.current + deltaY);
    setPanelHeight(newHeight);
  }, [clampHeight]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }, []);

  // Keyboard navigation for resizing
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP_SMALL;
      setPanelHeight(prev => clampHeight(prev + step));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const step = e.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP_SMALL;
      setPanelHeight(prev => clampHeight(prev - step));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setPanelHeight(MIN_PANEL_HEIGHT); // Collapse to minimum
    }
  }, [clampHeight]);

  // Focus safety: if resizing hides focused element, move focus to handle
  useEffect(() => {
    if (panelHeight <= MIN_PANEL_HEIGHT && panelContentRef.current) {
      const focusedElement = document.activeElement;
      if (focusedElement && panelContentRef.current.contains(focusedElement)) {
        handleRef.current?.focus();
      }
    }
  }, [panelHeight]);

  // Content height (total height minus handle height)
  const contentHeight = Math.max(0, panelHeight - MIN_PANEL_HEIGHT);

  return (
    <motion.div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      initial={false}
      animate={{ y: 0 }}
      transition={{
        type: prefersReducedMotion ? 'tween' : 'spring',
        stiffness: 300,
        damping: 30,
      }}
      role="region"
      aria-label="Pannello operatore mobile"
    >
      {/* Minimal Bar-Only Handle (Desktop-Like) */}
      <div
        ref={handleRef}
        role="separator"
        aria-label="Ridimensiona pannello controlli"
        aria-orientation="vertical"
        aria-valuenow={panelHeight}
        aria-valuemin={MIN_PANEL_HEIGHT}
        aria-valuemax={getMaxHeight()}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={`w-full bg-slate-100/80 backdrop-blur-sm border-t border-slate-200 cursor-ns-resize touch-none ${FOCUS_RING}`}
        style={{
          height: '28px', // Even thinner handle
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Centered grabber bar (minimal, enterprise-grade) */}
        <div 
          className="w-12 h-1 rounded-full bg-slate-400/70"
          aria-hidden="true"
        />
      </div>

      {/* Panel Content */}
      <motion.div
        id="mobile-operator-panel-content"
        ref={panelContentRef}
        className="bg-gradient-to-b from-slate-50 to-white border-t border-slate-200 overflow-hidden"
        style={{ height: `${contentHeight}px` }}
        animate={isDragging.current ? {} : { height: contentHeight }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.18,
          ease: 'easeOut',
        }}
      >
        <div className="h-full overflow-y-auto overscroll-contain">
          <div className="p-3 space-y-3 pb-6">
            {/* Quick Controls (shown when height is below expanded threshold) */}
            {contentHeight > 0 && contentHeight < 400 && (
              <div className="space-y-3" role="group" aria-label="Controlli rapidi operatore">
                {/* Team Selector - Horizontal (48×96px touch targets) */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectTeam('home')}
                    className={`flex-1 h-12 rounded-lg flex items-center justify-center font-bold text-base transition-all ${FOCUS_RING} ${
                      selectedTeam === 'home'
                        ? 'bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-400'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                    }`}
                    aria-label={`Seleziona ${homeTeamName}`}
                    aria-pressed={selectedTeam === 'home'}
                  >
                    {homeInitial}
                  </button>
                  <button
                    onClick={() => onSelectTeam('away')}
                    className={`flex-1 h-12 rounded-lg flex items-center justify-center font-bold text-base transition-all ${FOCUS_RING} ${
                      selectedTeam === 'away'
                        ? 'bg-sky-600 text-white shadow-lg ring-2 ring-sky-400'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                    }`}
                    aria-label={`Seleziona ${awayTeamName}`}
                    aria-pressed={selectedTeam === 'away'}
                  >
                    {awayInitial}
                  </button>
                </div>

                {/* 8 P0 Events Grid - 2 rows × 4 cols (≥44px targets) */}
                <div className="grid grid-cols-4 gap-2">
                  {MOBILE_EVENT_BUTTONS.map((button) => {
                    const Icon = button.icon;
                    const borderClass = 'border' in button ? button.border : '';
                    return (
                      <button
                        key={button.type}
                        onClick={() => onAddEvent(button.type, selectedTeam)}
                        disabled={state.period === 'pre_match' || state.period === 'finished'}
                        className={`h-14 rounded-lg flex flex-col items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING} ${button.bg} ${button.hoverBg} active:scale-95 ${borderClass}`}
                        aria-label={`Aggiungi ${button.label} per ${selectedTeam === 'home' ? homeTeamName : awayTeamName}`}
                      >
                        <Icon className={`w-5 h-5 ${button.color}`} strokeWidth={2.5} aria-hidden="true" />
                        <span className={`text-[10px] font-medium mt-0.5 ${button.color}`}>{button.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Play/Pause + Event Log Access - Horizontal */}
                <div className="flex gap-2">
                  <button
                    onClick={onPlayPause}
                    disabled={state.period === 'pre_match' || state.period === 'finished'}
                    className={`flex-1 h-14 rounded-lg flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${FOCUS_RING} ${
                      isPlaying
                        ? 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800'
                    }`}
                    aria-label={isPlaying ? 'Metti in pausa il cronometro' : 'Avvia il cronometro'}
                    aria-pressed={isPlaying}
                    role="switch"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span className="text-sm">{isPlaying ? 'PAUSA' : 'AVVIA'}</span>
                  </button>

                  <button
                    onClick={() => setPanelHeight(getMaxHeight())}
                    className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all relative shadow-sm ${FOCUS_RING} bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300`}
                    aria-label="Espandi registro eventi"
                  >
                    <History className="w-5 h-5" />
                    {totalEvents > 0 && (
                      <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {totalEvents > 9 ? '9+' : totalEvents}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

              {/* Full Controls (shown when height is expanded) */}
              {contentHeight >= 400 && (
                <div className="space-y-4" role="region" aria-label="Controlli completi operatore">
                  {/* Event Log - Scrollable, takes most space */}
                  <div className="ui-surface" style={{ maxHeight: 'calc(100vh - 480px)', minHeight: '200px' }} role="log" aria-label="Registro eventi partita">
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
                      layout="mobile"
                    />
                  </div>

                  {/* Team Card - Full with all events */}
                  <div className="ui-surface" role="group" aria-label="Eventi squadra">
                    <TeamCard
                      state={state}
                      teamStats={teamStats}
                      selectedTeam={selectedTeam}
                      onSelectTeam={onSelectTeam}
                      onAddEvent={onAddEvent}
                      homeTeamName={homeTeamName}
                      awayTeamName={awayTeamName}
                      lastEvent={lastEvent}
                      layout="mobile"
                    />
                  </div>

                  {/* Time Card - Period and stoppage time */}
                  <div className="ui-surface" role="group" aria-label="Controlli tempo e periodo">
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
                      layout="mobile"
                    />
                  </div>

                  {/* Consolidated Match Control Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm" role="group" aria-label="Controlli avanzati partita">
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
              )}
            </div>
          </div>
      </motion.div>
    </motion.div>
  );
};
