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
    <div className="flex items-baseline gap-3 min-w-0">
      {/* Home Team */}
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-sm font-semibold text-slate-900 truncate">
          {homeTeamName}
        </span>
        <span className="text-lg font-bold text-slate-900 tabular-nums">
          {teamStats.home.goals}
        </span>
      </div>

      {/* Separator */}
      <span className="text-slate-300 text-lg">–</span>

      {/* Away Team */}
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-lg font-bold text-slate-900 tabular-nums">
          {teamStats.away.goals}
        </span>
        <span className="text-sm font-semibold text-slate-900 truncate">
          {awayTeamName}
        </span>
      </div>
    </div>
  );
};
