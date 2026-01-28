import React from 'react';
import type { ComputedTeamStats } from '@/domain/match/types';

interface HeaderMatchInfoProps {
  homeTeamName: string;
  awayTeamName: string;
  teamStats: ComputedTeamStats;
}

/**
 * Match context header: team names + live score
 * Broadcast-grade: clean, readable, calm
 */
export const HeaderMatchInfo: React.FC<HeaderMatchInfoProps> = ({
  homeTeamName,
  awayTeamName,
  teamStats,
}) => {
  return (
    <div className="flex flex-col min-w-0">
      <span className="ui-kicker">Partita</span>
      <div className="flex items-center gap-3 min-w-0">
        {/* Home Team */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-700 truncate">
            {homeTeamName}
          </span>
          <span className="text-xl font-semibold text-slate-900 tabular-nums font-display">
            {teamStats.home.goals}
          </span>
        </div>

        {/* Separator */}
        <span className="text-slate-300 text-lg">–</span>

        {/* Away Team */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl font-semibold text-slate-900 tabular-nums font-display">
            {teamStats.away.goals}
          </span>
          <span className="text-sm font-semibold text-slate-700 truncate">
            {awayTeamName}
          </span>
        </div>
      </div>
    </div>
  );
};
