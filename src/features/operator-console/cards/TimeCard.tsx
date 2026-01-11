/**
 * TimeCard - Timer control and period management
 * Temporary stub - will be refactored during filesystem reorganization
 */
import React from 'react';
import type { DomainMatchState, MatchEvent } from '@/domain/match/types';

interface TimeCardProps {
  state: DomainMatchState;
  isPlaying: boolean;
  onPlayPause: () => void;
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
  lastEvent?: MatchEvent | null;
  layout?: 'sidebar' | 'horizontal' | 'mobile';
  onSettingsClick?: () => void;
}

export const TimeCard: React.FC<TimeCardProps> = () => {
  return (
    <div className="p-4 border border-slate-200 rounded-lg">
      <p className="text-sm text-slate-600">TimeCard stub - implementation needed</p>
    </div>
  );
};
