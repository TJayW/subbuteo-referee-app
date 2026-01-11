import React from 'react';
import {
  Zap,
  Target,
  Flag,
  AlertCircle,
  Badge,
  Trophy,
} from 'lucide-react';
import type { TeamStats } from '@/domain/match/types';

interface StatsBarProps {
  home: TeamStats;
  away: TeamStats;
  isMatchStarted: boolean;
}

/**
 * Compact horizontal stats bar.
 * Shows before match start: placeholder
 * After match start: live stats grid (2 rows)
 */
export const StatsBar: React.FC<StatsBarProps> = ({
  home,
  away,
  isMatchStarted,
}) => {
  if (!isMatchStarted) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-600">
        <p>📊 Statistiche disponibili dopo l'inizio della partita</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        Statistiche
      </div>

      {/* Row 1: Goals, Shots, Shots on Target */}
      <div className="grid grid-cols-5 gap-3">
        {/* HOME - Goals */}
        <div className="text-center">
          <div className="text-xs text-slate-600 mb-1 flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Gol</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{home.goals}</div>
          <div className="text-xs text-slate-500 mt-0.5">—</div>
          <div className="text-lg font-bold text-slate-900">{away.goals}</div>
        </div>

        {/* HOME - Shots */}
        <div className="text-center border-l border-slate-200 pl-3">
          <div className="text-xs text-slate-600 mb-1 flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Tiri</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{home.shots}</div>
          <div className="text-xs text-slate-500 mt-0.5">—</div>
          <div className="text-lg font-bold text-slate-900">{away.shots}</div>
        </div>

        {/* HOME - Shots on Target */}
        <div className="text-center border-l border-slate-200 pl-3">
          <div className="text-xs text-slate-600 mb-1 flex items-center justify-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>In Porta</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{home.shotsOnTarget}</div>
          <div className="text-xs text-slate-500 mt-0.5">—</div>
          <div className="text-lg font-bold text-slate-900">{away.shotsOnTarget}</div>
        </div>

        {/* HOME - Corners */}
        <div className="text-center border-l border-slate-200 pl-3">
          <div className="text-xs text-slate-600 mb-1 flex items-center justify-center gap-1">
            <Flag className="w-3.5 h-3.5 text-violet-600" />
            <span>Angoli</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{home.corners}</div>
          <div className="text-xs text-slate-500 mt-0.5">—</div>
          <div className="text-lg font-bold text-slate-900">{away.corners}</div>
        </div>

        {/* HOME - Fouls */}
        <div className="text-center border-l border-slate-200 pl-3">
          <div className="text-xs text-slate-600 mb-1 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Falli</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{home.fouls}</div>
          <div className="text-xs text-slate-500 mt-0.5">—</div>
          <div className="text-lg font-bold text-slate-900">{away.fouls}</div>
        </div>
      </div>

      {/* Row 2: Cards */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
        {/* Yellow Cards */}
        <div className="text-center">
          <div className="text-xs text-slate-600 mb-1 flex items-center justify-center gap-1">
            <Badge className="w-3.5 h-3.5 text-yellow-500" />
            <span>Gialli</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{home.yellowCards}</div>
          <div className="text-xs text-slate-500 mt-0.5">—</div>
          <div className="text-lg font-bold text-slate-900">{away.yellowCards}</div>
        </div>

        {/* Red Cards */}
        <div className="text-center border-l border-slate-200 pl-3">
          <div className="text-xs text-slate-600 mb-1 flex items-center justify-center gap-1">
            <Badge className="w-3.5 h-3.5 text-red-600" />
            <span>Rossi</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{home.redCards}</div>
          <div className="text-xs text-slate-500 mt-0.5">—</div>
          <div className="text-lg font-bold text-slate-900">{away.redCards}</div>
        </div>

        {/* Timeouts */}
        <div className="text-center border-l border-slate-200 pl-3">
          <div className="text-xs text-slate-600 mb-1 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
            <span>Timeout</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{home.timeouts}</div>
          <div className="text-xs text-slate-500 mt-0.5">—</div>
          <div className="text-lg font-bold text-slate-900">{away.timeouts}</div>
        </div>
      </div>
    </div>
  );
};
