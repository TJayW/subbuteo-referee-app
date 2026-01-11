/**
 * MatchConfigDisplay - Display match configuration
 * Temporary stub - will be refactored during filesystem reorganization
 */
import React from 'react';
import type { SettingsState } from '@/domain/match/types';

interface MatchConfigDisplayProps {
  settings: SettingsState;
  compact?: boolean;
}

export const MatchConfigDisplay: React.FC<MatchConfigDisplayProps> = () => {
  return (
    <div className="p-4">
      <p className="text-sm text-slate-600">MatchConfigDisplay stub - implementation needed</p>
    </div>
  );
};
