/**
 * DisciplineCard: Fouls, cards, set pieces with rate indicators
 */

import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import type { ComputedTeamStats, SettingsState } from '@/domain/match/types';
import type { DisciplineRates } from '@/domain/match/stats-selectors';
import { AlertTriangle } from 'lucide-react';

interface DisciplineCardProps {
  teamStats: ComputedTeamStats;
  settings: SettingsState;
  rates: DisciplineRates;
}

export const DisciplineCard: React.FC<DisciplineCardProps> = ({
  teamStats,
  settings,
  rates,
}) => {
  
  const home = teamStats.home;
  const away = teamStats.away;
  const homeDisplayName = settings.homeTeamConfig.displayName;
  const awayDisplayName = settings.awayTeamConfig.displayName;

  const isHighFoulRate = rates.totalFoulsPerTenMin > 8;

  return (
    <DashboardCard
      title="Disciplina & Set Pieces"
      icon={<AlertTriangle size={18} className={isHighFoulRate ? 'text-amber-600' : ''} />}
      compact
    >
      <div className="space-y-4">
        {/* Fouls */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Falli</span>
            {isHighFoulRate && (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                Tasso elevato
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600 mb-1">{homeDisplayName}</div>
              <div className="font-semibold text-slate-900">{home.fouls} totali</div>
              <div className="text-slate-500 text-xs">
                {rates.homeFoulsPerTenMin.toFixed(1)}/10min
              </div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600 mb-1">{awayDisplayName}</div>
              <div className="font-semibold text-slate-900">{away.fouls} totali</div>
              <div className="text-slate-500 text-xs">
                {rates.awayFoulsPerTenMin.toFixed(1)}/10min
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div>
          <div className="text-xs font-semibold text-slate-700 mb-2">Cartellini</div>
          <div className="grid grid-cols-2 gap-2">
            {/* Home Cards */}
            <div className="space-y-1">
              <div className="flex items-center justify-between bg-yellow-50 rounded px-2 py-1.5">
                <span className="text-xs text-yellow-700">🟡 Gialli</span>
                <span className="text-sm font-bold text-yellow-900">{home.yellowCards}</span>
              </div>
              <div className="flex items-center justify-between bg-red-50 rounded px-2 py-1.5">
                <span className="text-xs text-red-700">🔴 Rossi</span>
                <span className="text-sm font-bold text-red-900">{home.redCards}</span>
              </div>
            </div>
            {/* Away Cards */}
            <div className="space-y-1">
              <div className="flex items-center justify-between bg-yellow-50 rounded px-2 py-1.5">
                <span className="text-xs text-yellow-700">🟡 Gialli</span>
                <span className="text-sm font-bold text-yellow-900">{away.yellowCards}</span>
              </div>
              <div className="flex items-center justify-between bg-red-50 rounded px-2 py-1.5">
                <span className="text-xs text-red-700">🔴 Rossi</span>
                <span className="text-sm font-bold text-red-900">{away.redCards}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Set Pieces */}
        <div>
          <div className="text-xs font-semibold text-slate-700 mb-2">Set Pieces</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded p-2 text-center">
              <div className="text-slate-600 mb-1">Angoli</div>
              <div className="font-semibold text-slate-900">
                {home.corners} - {away.corners}
              </div>
            </div>
            <div className="bg-slate-50 rounded p-2 text-center">
              <div className="text-slate-600 mb-1">Rimesse</div>
              <div className="font-semibold text-slate-900">
                {home.throwIns} - {away.throwIns}
              </div>
            </div>
            <div className="bg-slate-50 rounded p-2 text-center">
              <div className="text-slate-600 mb-1">Timeout</div>
              <div className="font-semibold text-slate-900">
                {home.timeouts} - {away.timeouts}
              </div>
            </div>
            <div className="bg-slate-50 rounded p-2 text-center">
              <div className="text-slate-600 mb-1">Totale Falli</div>
              <div className="font-semibold text-slate-900">
                {home.fouls + away.fouls}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
