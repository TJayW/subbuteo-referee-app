import { useState, useEffect, useRef } from 'react';
import { useMatch } from '@/hooks/use-match-logic';
import { useMatchAudio } from '@/hooks/use-match-audio';
import { useGlobalHistory } from '@/hooks/use-global-history';
import { useEventHistory } from '@/hooks/use-event-history';
import { ACTION_GATES, GATE_ERROR_MESSAGES } from '@/domain/match/action-gating';
import type { ActionGatingContext } from '@/domain/match/action-gating';
import { AppHeader } from '@/features/header/AppHeader';
import { MatchDashboard } from '@/features/dashboard/MatchDashboard';
import { Console } from '@/features/console';
import { SettingsSheet } from '@/features/settings/sheets/SettingsSheet';
import { MatchInfoSheet } from '@/features/settings/sheets/MatchInfoSheet';
import { ExportPopover, type ExportOption } from '@/features/dashboard';
import { CommandPalette } from '@/ui/components/CommandPalette';
import type { TeamKey, EventType, SettingsState, RegulationPeriod, MatchPhase } from '@/domain/match/types';
import { exportJSON } from '@/utils/export-utils';
import { exportPNG, exportCSV } from '@/domain/export/export-advanced';
import { exportHTML } from '@/domain/export/export-html';
import { FileJson, FileText, Image, Code } from 'lucide-react';
import { createDefaultTeamConfig } from '@/domain/settings/defaults';
import { loadSettingsFromStorage, saveSettingsToStorage } from '@/adapters/storage/storage-persistence';
import { loadAudioSettingsFromStorage } from '@/adapters/audio/audio-persistence';
import { ANIMATION_TIMINGS, PANEL_RESIZE } from '@/constants/layout';
import { STORAGE_KEYS } from '@/constants/storage';
import { isCollapsed as isWidthCollapsed } from '@/utils/console-panel-resize';
import logger from '@/utils/logger';
import {
  getLayoutMode,
  clampWidthToBreakpoint,
  getStorageKeyForMode,
  createBreakpointListener,
  type LayoutMode,
} from '@/utils/responsive-layout';

type GlobalAppState = {
  ui: {
    selectedTeam: TeamKey;
  };
  settings: SettingsState;
};

export default function AppShell() {
  const match = useMatch();

  // Detect layout mode (desktop/tablet/mobile)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => getLayoutMode());

  useEffect(() => {
    const cleanup = createBreakpointListener((mode) => {
      setLayoutMode(mode);
    });
    return cleanup;
  }, []);

  // Sidebar width state with persistence (per breakpoint)
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    try {
      const mode = getLayoutMode();
      const storageKey = getStorageKeyForMode(mode);
      
      if (!storageKey) {
        // Mobile: no sidebar width
        return 0;
      }
      
      const stored = localStorage.getItem(storageKey);
      const parsedWidth = stored ? parseInt(stored, 10) : PANEL_RESIZE.DEFAULT_WIDTH;
      
      // Clamp to breakpoint-specific range
      return clampWidthToBreakpoint(parsedWidth, mode);
    } catch {
      return PANEL_RESIZE.DEFAULT_WIDTH;
    }
  });

  // Derived: is sidebar collapsed?
  const isPanelCollapsed = isWidthCollapsed(panelWidth, PANEL_RESIZE.COLLAPSE_THRESHOLD);

  // Track previous expanded width in memory (for immediate toggle without waiting for storage)
  const prevExpandedWidthRef = useRef<number>(
    panelWidth > PANEL_RESIZE.COLLAPSE_THRESHOLD ? panelWidth : PANEL_RESIZE.DEFAULT_WIDTH
  );

  // Update prevExpandedWidth when width changes (if not collapsed)
  useEffect(() => {
    if (panelWidth > PANEL_RESIZE.COLLAPSE_THRESHOLD) {
      prevExpandedWidthRef.current = panelWidth;
    }
  }, [panelWidth]);

  // Persist sidebar width (debounced, per breakpoint)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const storageKey = getStorageKeyForMode(layoutMode);
        
        if (storageKey) {
          // Only persist for desktop/tablet, not mobile
          localStorage.setItem(storageKey, String(panelWidth));
        }
        
        // Sync legacy boolean key for compatibility
        localStorage.setItem(STORAGE_KEYS.UI_SIDEBAR_COLLAPSED, String(isPanelCollapsed));
      } catch {
        // Silently fail on localStorage error
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [panelWidth, layoutMode, isPanelCollapsed]);

  // Add CSS variables for operator rail width and transition
  useEffect(() => {
    document.documentElement.style.setProperty('--operator-rail-width', `${panelWidth}px`);
    document.documentElement.style.setProperty('--operator-rail-transition', `${ANIMATION_TIMINGS.SIDEBAR_TRANSITION_MS}ms ${ANIMATION_TIMINGS.SIDEBAR_TRANSITION_EASING}`);
  }, [panelWidth]);

  // Load settings from localStorage with schema versioning
  const getDefaultSettings = (): SettingsState => {
    const stored = loadSettingsFromStorage();
    if (stored) return stored;
    return {
      // Match timing
      periodDurationMinutes: 45,
      halftimeDurationMinutes: 15,
      extratimeDurationMinutes: 15,
      extratimeIntervalMinutes: 5,
      timeoutsPerTeam: 1,
      timeoutDurationSeconds: 60,
      // Audio/UI
      vibrationEnabled: true,
      audioEnabled: true,
      audioVolume: 0.6,
      categoryGains: {
        referee: 1.0,
        crowd: 0.8,
        ui: 0.9,
        matchControl: 1.0,
      },
      // Team info
      homeTeamName: 'Casa',
      awayTeamName: 'Ospite',
      homeTeamConfig: createDefaultTeamConfig('emerald', 'Casa'),
      awayTeamConfig: createDefaultTeamConfig('blue', 'Ospite'),
      // Officiating
      officiating: {
        referee1: '',
        referee2: '',
      },
    };
  };

  // UI State (non-global)
  const [showSettings, setShowSettings] = useState(false);
  const [showMatchInfo, setShowMatchInfo] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Global history (settings + selected team) - MUST NOT touch event cursor/events (P0 invariant)
  const globalHistory = useGlobalHistory<GlobalAppState>({
    ui: {
      selectedTeam: 'home',
    },
    settings: getDefaultSettings(),
  });

  // Extract current state from global history
  const settings = globalHistory.state.settings;
  const selectedTeam = globalHistory.state.ui.selectedTeam;

  // Helper to update global state
  const setSettings = (updater: SettingsState | ((prev: SettingsState) => SettingsState)) => {
    globalHistory.setState((prev) => ({
      ...prev,
      settings: typeof updater === 'function' ? updater(prev.settings) : updater,
    }));
  };

  const setSelectedTeam = (team: TeamKey) => {
    globalHistory.setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, selectedTeam: team },
    }));
  };

  // Toggle sidebar collapse/expand
  const togglePanelCollapse = () => {
    if (isPanelCollapsed) {
      // Expand: restore from memory first (immediate), then storage (fallback)
      const memoryWidth = prevExpandedWidthRef.current;
      if (memoryWidth > PANEL_RESIZE.COLLAPSE_THRESHOLD) {
        setPanelWidth(memoryWidth);
      } else {
        // Fallback to storage
        try {
          const storageKey = getStorageKeyForMode(layoutMode);
          const stored = storageKey ? localStorage.getItem(storageKey) : null;
          const restoredWidth = stored ? parseInt(stored, 10) : PANEL_RESIZE.DEFAULT_WIDTH;
          
          if (restoredWidth > PANEL_RESIZE.COLLAPSE_THRESHOLD) {
            setPanelWidth(restoredWidth);
            prevExpandedWidthRef.current = restoredWidth;
          } else {
            setPanelWidth(PANEL_RESIZE.DEFAULT_WIDTH);
            prevExpandedWidthRef.current = PANEL_RESIZE.DEFAULT_WIDTH;
          }
        } catch {
          setPanelWidth(PANEL_RESIZE.DEFAULT_WIDTH);
          prevExpandedWidthRef.current = PANEL_RESIZE.DEFAULT_WIDTH;
        }
      }
    } else {
      // Collapse to min width
      setPanelWidth(PANEL_RESIZE.MIN_WIDTH);
    }
  };

  // Keyboard shortcut: Ctrl+\ (Cmd+\ on Mac) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+\ or Cmd+\ to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        togglePanelCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePanelCollapse]);

  // Load audio settings on mount and clamp values
  useEffect(() => {
    loadAudioSettingsFromStorage();
    // Ensure volume is clamped
    const clampedVolume = Math.max(0, Math.min(1, settings.audioVolume));
    if (clampedVolume !== settings.audioVolume) {
      setSettings((prev: SettingsState) => ({
        ...prev,
        audioVolume: clampedVolume,
      }));
    }
  }, []);

  // Persist settings to localStorage on change
  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  // Setup audio system with match events
  useMatchAudio({
    matchState: match.state,
    audioEnabled: settings.audioEnabled,
    masterVolume: settings.audioVolume,
    categoryGains: settings.categoryGains ?? {
      referee: 1.0,
      crowd: 0.8,
      ui: 0.9,
      matchControl: 1.0,
    },
  });

  // Event-level history (cursor navigation in event log)
  const eventHistory = useEventHistory({
    cursor: match.state.cursor,
    eventsLength: match.state.events.length,
    onSetCursor: (cursor: number) => match.dispatch({ type: 'SET_CURSOR', payload: cursor }),
  });

  // Action gating context
  const getGatingContext = (): ActionGatingContext => ({
    globalHistoryAtHead: !globalHistory.isTimeTraveling,
    eventCursorAtHead: !eventHistory.isTimeTraveling,
    period: match.state.period,
    isTimerRunning: match.state.isRunning,
  });

  const pendingEventRef = useRef<{ type: EventType; team: TeamKey } | null>(null);
  const pendingToggleTimerRef = useRef(false);

  // Execute pending actions once global history returns to head (auto-jump must not require double-click)
  useEffect(() => {
    if (globalHistory.isTimeTraveling) return;
    if (pendingEventRef.current) {
      const pending = pendingEventRef.current;
      pendingEventRef.current = null;
      handleAddEvent(pending.type, pending.team);
    }
    if (pendingToggleTimerRef.current) {
      pendingToggleTimerRef.current = false;
      handlePlayPause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalHistory.isTimeTraveling]);

  // Event handlers with conflict resolution (§D.2 RULE 3)
  const handleAddEvent = (type: EventType, team: TeamKey) => {
    const ctx = getGatingContext();

    // RULE 3: Auto-jump to present in BOTH systems before recording
    if (!ctx.globalHistoryAtHead) {
      pendingEventRef.current = { type, team };
      globalHistory.jumpToPresent();
      return;
    }
    const willForceEventCursorToHead = !ctx.eventCursorAtHead;
    if (willForceEventCursorToHead) {
      // Jump cursor to head; reducer will handle correct sequencing.
      eventHistory.jumpToPresent();
    }

    const gateCtx: ActionGatingContext = {
      ...ctx,
      globalHistoryAtHead: true,
      eventCursorAtHead: true,
    };

    if (!ACTION_GATES.RECORD_EVENT(gateCtx)) {
      logger.warn(GATE_ERROR_MESSAGES.RECORD_EVENT_PERIOD);
      return;
    }

    match.addEvent(type, team);
  };

  // Global undo/redo (settings + selected team only)
  const handleGlobalUndo = () => {
    globalHistory.undo();
  };

  const handleGlobalRedo = () => {
    globalHistory.redo();
  };

  // Period navigation (simplified for now; in full app would emit period_end/period_start events)
  const handlePlayPause = () => {
    const ctx = getGatingContext();
    if (!ACTION_GATES.TOGGLE_TIMER(ctx)) {
      if (!ctx.globalHistoryAtHead) {
        pendingToggleTimerRef.current = true;
        globalHistory.jumpToPresent();
        return;
      }
      logger.warn(GATE_ERROR_MESSAGES.TOGGLE_TIMER_TIME_TRAVEL);
      return;
    }
    if (match.state.period === 'pre_match') {
      match.executeCommand('jumpToPhase', 'first_half_regulation');
    }
    if (match.state.isRunning) {
      match.executeCommand('pauseTimer');
    } else {
      match.executeCommand('startTimer');
    }
  };

  const handleSetPeriod = (period: string) => {
    match.executeCommand('jumpToPhase', period as any);
  };

  const handleSetTotalPeriodSeconds = (seconds: number) => {
    match.executeCommand('setPeriodDurationPreset', { seconds });
  };

  const handleAddTime = (seconds: number) => {
    match.executeCommand('adjustTimeBy', seconds);
  };

  const handleRemoveTime = (seconds: number) => {
    match.executeCommand('adjustTimeBy', -seconds);
  };

  const handleToggleTimerLock = () => {
    match.executeCommand('toggleTimerLock');
  };

  const handleSetExactTime = (seconds: number) => {
    match.executeCommand('setExactTime', { seconds });
  };

  const handleAddRecovery = (period: RegulationPeriod, seconds: number) => {
    match.executeCommand('addRecovery', { period, seconds });
  };

  const handleSetRecovery = (period: RegulationPeriod, seconds: number) => {
    match.executeCommand('setRecovery', { period, seconds });
  };

  const handleRequireExtraTime = (enabled: boolean) => {
    match.executeCommand('setTieBreakRule', enabled ? 'extra_time_then_pens' : 'pens_only');
  };

  const handleAllowOverride = (enabled: boolean) => {
    match.executeCommand('setOverrideJumps', enabled);
  };

  const handleEndPeriod = () => {
    match.executeCommand('endSegment');
  };

  const handleSkipHalftime = () => {
    match.executeCommand('skipHalftime');
  };

  const handleTerminate = () => {
    match.executeCommand('terminate');
  };

  const handleSetMatchPhase = (phase: MatchPhase) => {
    match.executeCommand('jumpToPhase', phase);
  };

  // Keyboard shortcuts (§D.3 P1.1, §H P2.3 Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;
      
      // Cmd+K / Ctrl+K: Open command palette
      if (mod && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }
      
      // Cmd+Z / Ctrl+Z: Global undo
      if (mod && e.key === 'z' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        if (globalHistory.canUndo) {
          handleGlobalUndo();
        }
        return;
      }
      
      // Cmd+Shift+Z / Ctrl+Shift+Z: Global redo
      if (mod && e.key === 'z' && e.shiftKey && !e.altKey) {
        e.preventDefault();
        if (globalHistory.canRedo) {
          handleGlobalRedo();
        }
        return;
      }
      
      // Cmd+Alt+Z / Ctrl+Alt+Z: Event cursor undo (previous event)
      if (mod && e.key === 'z' && !e.shiftKey && e.altKey) {
        e.preventDefault();
        if (eventHistory.canUndo && !globalHistory.isTimeTraveling) {
          eventHistory.undo();
        }
        return;
      }
      
      // Cmd+Shift+Alt+Z / Ctrl+Shift+Alt+Z: Event cursor redo (next event)
      if (mod && e.key === 'z' && e.shiftKey && e.altKey) {
        e.preventDefault();
        if (eventHistory.canRedo && !globalHistory.isTimeTraveling) {
          eventHistory.redo();
        }
        return;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalHistory, eventHistory]);

  const exportOptions: ExportOption[] = [
    {
      id: 'json',
      icon: <FileJson className="w-5 h-5" />,
      label: 'JSON',
      description: 'Backup completo per re-importare',
      action: async () => {
        exportJSON(match.state, settings.homeTeamName, settings.awayTeamName, settings);
      },
      color: 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300',
    },
    {
      id: 'csv',
      icon: <FileText className="w-5 h-5" />,
      label: 'CSV',
      description: 'Report strutturato per Excel/Sheets',
      action: async () => {
        exportCSV(match.state, settings.homeTeamName, settings.awayTeamName, settings);
      },
      color: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300',
    },
    {
      id: 'png',
      icon: <Image className="w-5 h-5" />,
      label: 'PNG',
      description: 'Screenshot della partita',
      action: async () => {
        exportPNG(match.state, settings.homeTeamName, settings.awayTeamName);
      },
      color: 'border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300',
    },
    {
      id: 'html',
      icon: <Code className="w-5 h-5" />,
      label: 'HTML',
      description: 'Report pubblicabile sul web',
      action: async () => {
        exportHTML(match.state, settings.homeTeamName, settings.awayTeamName, settings);
      },
      color: 'border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300',
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* TOP BAR: Context + Secondary Actions */}
      <AppHeader
        state={match.state}
        teamStats={match.teamStats}
        canUndo={globalHistory.canUndo}
        canRedo={globalHistory.canRedo}
        audioVolume={Math.round(settings.audioVolume * 100)}
        audioEnabled={settings.audioEnabled}
        onUndo={handleGlobalUndo}
        onRedo={handleGlobalRedo}
        onSettings={() => setShowSettings(true)}
        onToggleAudio={(enabled: boolean) => setSettings((prev: SettingsState) => ({ ...prev, audioEnabled: enabled }))}
        onVolumeChange={(vol: number) => setSettings((prev: SettingsState) => ({ ...prev, audioVolume: vol / 100 }))}
        homeTeamName={settings.homeTeamName}
        awayTeamName={settings.awayTeamName}
        onAdvancedControls={() => {}}
        exportPopover={<ExportPopover options={exportOptions} />}
        globalTimeTravel={{
          isTimeTraveling: globalHistory.isTimeTraveling,
          position: globalHistory.getHistoryPosition(),
          onJumpToPresent: globalHistory.jumpToPresent,
        }}
        isPanelCollapsed={isPanelCollapsed}
        onTogglePanel={togglePanelCollapse}
      />

      {/* LAYOUT: Console Panel + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP CONSOLE (Vertical) */}
        <Console
          orientation="vertical"
          state={match.state}
          teamStats={match.teamStats}
          selectedTeam={selectedTeam}
          onSelectTeam={setSelectedTeam}
          onPlayPause={handlePlayPause}
          onAddEvent={handleAddEvent}
          onAddTime={handleAddTime}
          onRemoveTime={handleRemoveTime}
          homeTeamName={settings.homeTeamName}
          awayTeamName={settings.awayTeamName}
          onSetPeriod={handleSetPeriod}
          onSetTotalPeriodSeconds={handleSetTotalPeriodSeconds}
          defaultExtraTimeDurationMinutes={settings.extratimeDurationMinutes}
          onDeleteEvent={(eventId: string) => match.dispatch({ type: 'DELETE_EVENT', payload: eventId })}
          onUpdateEvent={(event: any) => match.dispatch({ type: 'UPDATE_EVENT', payload: event })}
          onSetCursor={(cursor: number) => match.dispatch({ type: 'SET_CURSOR', payload: cursor })}
          canNavigateEventCursor={ACTION_GATES.NAVIGATE_EVENT_CURSOR(getGatingContext())}
          onToggleCollapse={togglePanelCollapse}
          onToggleTimerLock={handleToggleTimerLock}
          onSetExactTime={handleSetExactTime}
          onAddRecovery={handleAddRecovery}
          onSetRecovery={handleSetRecovery}
          onRequireExtraTime={handleRequireExtraTime}
          onAllowOverride={handleAllowOverride}
          onEndPeriod={handleEndPeriod}
          onSkipHalftime={handleSkipHalftime}
          onTerminateMatch={handleTerminate}
          onSetMatchPhase={handleSetMatchPhase}
          onUndoDomain={() => match.undoCommand()}
          onRedoDomain={() => match.redoCommand()}
          undoDomainAvailable={match.canUndo}
          redoDomainAvailable={match.canRedo}
          timerLocked={match.state.timerLocked}
        />

        <main className="flex-1 overflow-hidden pb-16 md:pb-0">
          <MatchDashboard
            state={match.state}
            teamStats={match.teamStats}
            settings={settings}
          />
        </main>

        {/* MOBILE CONSOLE (Horizontal) */}
        <Console
          orientation="horizontal"
          state={match.state}
          teamStats={match.teamStats}
          selectedTeam={selectedTeam}
          onSelectTeam={setSelectedTeam}
          onPlayPause={handlePlayPause}
          onAddEvent={handleAddEvent}
          onAddTime={handleAddTime}
          onRemoveTime={handleRemoveTime}
          homeTeamName={settings.homeTeamName}
          awayTeamName={settings.awayTeamName}
          onSetPeriod={handleSetPeriod}
          onSetTotalPeriodSeconds={handleSetTotalPeriodSeconds}
          defaultExtraTimeDurationMinutes={settings.extratimeDurationMinutes}
          onDeleteEvent={(eventId: string) => match.dispatch({ type: 'DELETE_EVENT', payload: eventId })}
          onUpdateEvent={(event: any) => match.dispatch({ type: 'UPDATE_EVENT', payload: event })}
          onSetCursor={(cursor: number) => match.dispatch({ type: 'SET_CURSOR', payload: cursor })}
          canNavigateEventCursor={ACTION_GATES.NAVIGATE_EVENT_CURSOR(getGatingContext())}
          onToggleTimerLock={handleToggleTimerLock}
          onSetExactTime={handleSetExactTime}
          onAddRecovery={handleAddRecovery}
          onSetRecovery={handleSetRecovery}
          onRequireExtraTime={handleRequireExtraTime}
          onAllowOverride={handleAllowOverride}
          onEndPeriod={handleEndPeriod}
          onSkipHalftime={handleSkipHalftime}
          onTerminateMatch={handleTerminate}
          onSetMatchPhase={handleSetMatchPhase}
          onUndoDomain={() => match.undoCommand()}
          onRedoDomain={() => match.redoCommand()}
          undoDomainAvailable={match.canUndo}
          redoDomainAvailable={match.canRedo}
          timerLocked={match.state.timerLocked}
        />
      </div>

      {/* OVERLAYS & MODALS */}

      {/* Command Palette (Cmd+K) - §H P2.3 */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        events={match.state.events}
        onJumpToEvent={(eventId) => {
          // Find event index and set cursor
          const index = match.state.events.findIndex(e => e.id === eventId);
          if (index !== -1) {
            match.dispatch({ type: 'SET_CURSOR', payload: index + 1 });
          }
        }}
        onChangePeriod={(period) => handleSetPeriod(period)}
        homeTeamName={settings.homeTeamName}
        awayTeamName={settings.awayTeamName}
      />

      {/* Settings Sheet */}
      <SettingsSheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onChange={(newSettings) => setSettings(newSettings)}
      />

      {/* Match Info Sheet */}
      <MatchInfoSheet
        isOpen={showMatchInfo}
        onClose={() => setShowMatchInfo(false)}
        settings={settings}
        onChange={(newSettings) => setSettings(newSettings)}
      />

    </div>
  );
}

