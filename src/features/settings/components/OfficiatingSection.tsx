/**
 * OfficiatingSection - Officials configuration
 * Temporary stub - will be refactored during filesystem reorganization
 */
import React from 'react';
import type { SettingsState } from '@/domain/match/types';

interface OfficiatingSectionProps {
  officiating: SettingsState['officiating'];
  onChange: (officiating: SettingsState['officiating']) => void;
}

export const OfficiatingSection: React.FC<OfficiatingSectionProps> = () => {
  return (
    <div className="p-4">
      <p className="text-sm text-slate-600">OfficiatingSection stub - implementation needed</p>
    </div>
  );
};
