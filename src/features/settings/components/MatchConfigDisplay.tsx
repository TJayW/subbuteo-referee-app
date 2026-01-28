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
    <div className="ui-surface-muted p-4">
      <p className="text-sm text-slate-700 font-medium mb-1">Configurazione match</p>
      <p className="text-xs text-slate-500">
        Dettagli avanzati verranno mostrati qui. Per ora, modifica tempi e regole nelle impostazioni.
      </p>
    </div>
  );
};
