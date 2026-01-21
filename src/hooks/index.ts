/**
 * Hooks Barrel Export
 * All React hooks centralized in one location
 */

// Domain hooks
export { useGlobalHistory } from './use-global-history';
export { useEventHistory } from './use-event-history';
export { domainReducer, createInitialDomainMatchState } from './use-match-reducer';

// Audio hooks
export { useAudio } from './use-audio';
export { useMatchAudio } from './use-match-audio';

// UI/Feature hooks
export { useMatch } from './use-match-logic';
export { ConsoleFocusProvider, useConsoleFocus } from './use-console-focus-manager';
export { useFocusZone } from './use-focus-zone';
export { useDashboardFilters } from './use-dashboard-filters';
export { useConsoleState } from './use-console-state';

// Settings & Configuration hooks
export { useAppSettings, getDefaultSettings } from './use-app-settings';
export { usePanelResize } from './use-panel-resize';
export { useActionGating } from './use-action-gating';
export { useKeyboardShortcuts } from './use-keyboard-shortcuts';
export { useTeamConfig } from './use-team-config';

// Streaming hooks
export { useStreaming } from './use-streaming';
