import { useState } from 'react';
import { useMatch } from '@/hooks/use-match-logic';
import { useMatchAudio } from '@/hooks/use-match-audio';
import { useGlobalHistory } from '@/hooks/use-global-history';
import { useEventHistory } from '@/hooks/use-event-history';
import { useAppSettings, getDefaultSettings } from '@/hooks/use-app-settings';
import { usePanelResize } from '@/hooks/use-panel-resize';
import { useActionGating } from '@/hooks/use-action-gating';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { ACTION_GATES } from '@/domain/match/action-gating';
import { AppHeader } from '@/features/header/AppHeader';
import { MatchDashboard } from '@/features/dashboard/MatchDashboard';
import { Console } from '@/features/console';
import { SettingsSheet } from '@/features/settings/sheets/SettingsSheet';
import { MatchInfoSheet } from '@/features/settings/sheets/MatchInfoSheet';
import { ExportPopover, type ExportOption } from '@/features/dashboard';
import { CommandPalette } from '@/ui/components/CommandPalette';
import type { TeamKey, EventType, SettingsState, RegulationPeriod, MatchPhase } from '@/domain/match/types';
import { exportJSON } from '@/utils/export-utils';
import { exportHTML, exportPNG, exportCSV } from '@/adapters/export';
import { FileJson, FileText, Image, Code } from 'lucide-react';

type GlobalAppState = {
  ui: {
    selectedTeam: TeamKey;
  };
  settings: SettingsState;
};

export default function AppShell() {
  const match = useMatch();

  // Panel resize management (sidebar width, collapse state, responsive breakpoints)
  const { layoutMode, isPanelCollapsed, togglePanelCollapse } = usePanelResize();

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
  const selectedTeam = globalHistory.state.ui.selectedTeam;

  // Helper to update selected team
  const setSelectedTeam = (team: TeamKey) => {
    globalHistory.setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, selectedTeam: team },
    }));
  };

  // Settings management (persistence, validation, defaults)
  const { settings, setSettings } = useAppSettings({ globalHistory });

  // Event-level history (cursor navigation in event log)
  const eventHistory = useEventHistory({
    cursor: match.state.cursor,
    eventsLength: match.state.events.length,
    onSetCursor: (cursor: number) => match.dispatch({ type: 'SET_CURSOR', payload: cursor }),
  });

  // Action gating with time-travel conflict resolution
  const { handleAddEvent, handlePlayPause, getGatingContext } = useActionGating({
    matchState: match.state,
    globalHistory,
    eventHistory,
    onAddEvent: (type: EventType, team: TeamKey) => {
      match.addEvent(type, team);
    },
    onPlayPause: () => {
      if (match.state.period === 'pre_match') {
        match.executeCommand('jumpToPhase', 'first_half_regulation');
      }
      if (match.state.isRunning) {
        match.executeCommand('pauseTimer');
      } else {
        match.executeCommand('startTimer');
      }
    },
  });

  // Keyboard shortcuts (Cmd+K, Cmd+Z, Cmd+\, etc.)
  useKeyboardShortcuts({
    globalHistory,
    eventHistory,
    onToggleSidebar: togglePanelCollapse,
    onOpenCommandPalette: () => setShowCommandPalette(true),
  });

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

  // Global undo/redo (settings + selected team only)
  const handleGlobalUndo = () => {
    globalHistory.undo();
  };

  const handleGlobalRedo = () => {
    globalHistory.redo();
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
        {/* CONSOLE (Responsive) */}
        {layoutMode === 'mobile' ? (
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
        ) : (
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
        )}

        <main className="flex-1 overflow-hidden pb-16 md:pb-0">
          <MatchDashboard
            state={match.state}
            teamStats={match.teamStats}
            settings={settings}
          />
        </main>

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
