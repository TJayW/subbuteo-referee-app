/**
 * ExportPreviewCard: Show what will be exported (read-only preview)
 */

import React, { useMemo } from 'react';
import { DashboardCard } from './DashboardCard';
import type { DomainMatchState, SettingsState } from '@/domain/match/types';
import { selectExportPreview } from './dashboard-selectors';
import { FileText, Check, X } from 'lucide-react';

interface ExportPreviewCardProps {
  state: DomainMatchState;
  homeGoals: number;
  awayGoals: number;
  settings: SettingsState;
}

export const ExportPreviewCard: React.FC<ExportPreviewCardProps> = ({
  state,
  homeGoals,
  awayGoals,
  settings,
}) => {
  const preview = useMemo(
    () => selectExportPreview(state, homeGoals, awayGoals, settings),
    [state, homeGoals, awayGoals, settings]
  );

  const CheckItem: React.FC<{ label: string; checked: boolean }> = ({ label, checked }) => (
    <div className="flex items-center justify-between text-xs py-1">
      <span className="text-slate-700">{label}</span>
      {checked ? (
        <Check size={14} className="text-emerald-600" />
      ) : (
        <X size={14} className="text-slate-300" />
      )}
    </div>
  );

  return (
    <DashboardCard
      title="Anteprima Export"
      icon={<FileText size={18} />}
      compact
    >
      <div className="space-y-3">
        {/* Match Summary */}
        <div className="bg-slate-50 rounded p-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-slate-600">ID Match</div>
              <div className="font-mono font-semibold text-slate-900 truncate">
                {preview.matchId.slice(0, 8)}...
              </div>
            </div>
            <div>
              <div className="text-slate-600">Risultato</div>
              <div className="font-bold text-lg text-slate-900">
                {preview.homeScore} - {preview.awayScore}
              </div>
            </div>
            <div>
              <div className="text-slate-600">Eventi</div>
              <div className="font-semibold text-slate-900">
                {preview.appliedEvents} / {preview.totalEvents}
              </div>
            </div>
            <div>
              <div className="text-slate-600">Fase</div>
              <div className="font-semibold text-slate-900 capitalize">
                {preview.currentPeriod.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Data Completeness */}
        <div>
          <div className="text-xs font-semibold text-slate-700 mb-2">
            Completezza Dati
          </div>
          <div className="space-y-1">
            <CheckItem label="Informazioni arbitro" checked={preview.hasRefereeInfo} />
            <CheckItem label="Colori squadre" checked={preview.hasTeamColors} />
            <CheckItem label="Formazioni" checked={preview.hasFormations} />
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-xs text-slate-500 italic">
          Usa il pulsante Export in alto per esportare in vari formati
        </div>
      </div>
    </DashboardCard>
  );
};
