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
    <div className="ui-surface-muted p-4">
      <p className="text-sm text-slate-700 font-medium mb-1">Sezione arbitri</p>
      <p className="text-xs text-slate-500">
        Configurazione avanzata in arrivo. Usa le impostazioni per inserire i nomi.
      </p>
    </div>
  );
};
