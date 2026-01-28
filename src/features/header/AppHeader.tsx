import React, { useRef, useEffect, useState } from 'react';
import type { DomainMatchState, ComputedTeamStats } from '@/domain/match/types';
import { HeaderMatchInfo } from './components/HeaderMatchInfo';
import { HeaderStatusIndicator } from './components/HeaderStatusIndicator';
import { HeaderToolbar } from './components/HeaderToolbar';
import { StreamingIndicator } from '@/features/streaming/StreamingIndicator';
import { StreamingDashboard } from '@/features/streaming/StreamingDashboard';
import { LAYOUT_HEIGHTS } from '@/constants/layout';

interface AppHeaderProps {
  state: DomainMatchState;
  teamStats: ComputedTeamStats;
  canUndo: boolean;
  canRedo: boolean;
  audioVolume: number;
  audioEnabled: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSettings: () => void;
  onToggleAudio: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onAdvancedControls: () => void;
  homeTeamName: string;
  awayTeamName: string;
  exportPopover?: React.ReactNode;
  globalTimeTravel: {
    isTimeTraveling: boolean;
    position: { current: number; total: number };
    onJumpToPresent: () => void;
  };
  isPanelCollapsed?: boolean;
  onTogglePanel?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  state,
  teamStats,
  canUndo,
  canRedo,
  audioVolume,
  audioEnabled,
  onUndo,
  onRedo,
  onSettings,
  onToggleAudio,
  onVolumeChange,
  onAdvancedControls,
  homeTeamName,
  awayTeamName,
  exportPopover,
  globalTimeTravel,
  isPanelCollapsed,
  onTogglePanel,
}) => {
  const headerRef = useRef<HTMLElement>(null);
  const [showStreamingDashboard, setShowStreamingDashboard] = useState(false);

  useEffect(() => {
    if (headerRef.current) {
      const updateHeight = () => {
        const height = headerRef.current?.offsetHeight || 56;
        document.documentElement.style.setProperty('--topbar-height', `${height}px`);
      };
      updateHeight();
      const observer = new ResizeObserver(updateHeight);
      observer.observe(headerRef.current);
      return () => observer.disconnect();
    }
  }, []);

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

  return (
    <header
      ref={headerRef}
      className="bg-white/85 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/80 shadow-sm"
    >
      <div className="px-5 py-3 flex items-center justify-between gap-4" style={{ minHeight: `${LAYOUT_HEIGHTS.TOP_BAR}px` }}>
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <HeaderMatchInfo
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            teamStats={teamStats}
          />
          <div className="hidden sm:block w-px h-6 bg-slate-200 flex-shrink-0" />
          <div className="hidden sm:block flex-shrink-0">
            <HeaderStatusIndicator period={state.period} />
          </div>
          
          {/* Streaming Indicator - shows when streaming is active */}
          <StreamingIndicator onExpand={() => setShowStreamingDashboard(true)} />
        </div>
        <HeaderToolbar
          canUndo={canUndo}
          canRedo={canRedo}
          audioVolume={audioVolume}
          audioEnabled={audioEnabled}
          onUndo={onUndo}
          onRedo={onRedo}
          onSettings={onSettings}
          onToggleAudio={onToggleAudio}
          onVolumeChange={onVolumeChange}
          onAdvancedControls={onAdvancedControls}
          exportPopover={exportPopover}
          globalTimeTravel={globalTimeTravel}
          isPanelCollapsed={isPanelCollapsed}
          onTogglePanel={onTogglePanel}
        />
      </div>
      <div className="sm:hidden px-4 py-2 border-t border-slate-100/80 flex items-center justify-center">
        <HeaderStatusIndicator period={state.period} />
      </div>
    </header>
  );
};
