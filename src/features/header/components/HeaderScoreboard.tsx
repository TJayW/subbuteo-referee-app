import React from 'react';
import type { ComputedTeamStats, SettingsState, Period } from '@/domain/match/types';
import { getContrastTextColor } from '@/domain/settings/defaults';
import { StatsBar } from '@/ui/primitives';

interface HeaderScoreboardProps {
  teamStats: ComputedTeamStats;
  settings: SettingsState;
  currentPeriod: Period;
  onClickTeamName?: (team: 'home' | 'away') => void;
}

export const HeaderScoreboard: React.FC<HeaderScoreboardProps> = ({
  teamStats,
  settings,
  currentPeriod,
  onClickTeamName,
}) => {
  const home = teamStats.home;
  const away = teamStats.away;
  const homeColor = settings.homeTeamConfig.color.primary;
  const awayColor = settings.awayTeamConfig.color.primary;
  const homeDisplayName = settings.homeTeamConfig.displayName;
  const awayDisplayName = settings.awayTeamConfig.displayName;
  const homeCoach = settings.homeTeamConfig.coach;
  const awayCoach = settings.awayTeamConfig.coach;
  const isMatchStarted = currentPeriod !== 'pre_match';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* HOME TEAM */}
        <div className="text-center">
          <button
            onClick={() => onClickTeamName?.('home')}
            className="w-full text-center group"
          >
            <div className="flex flex-col items-center gap-1 mb-2">
              <div className="text-xs font-bold text-slate-500">CASA</div>
              <div
                className="text-sm font-semibold px-2 py-1 rounded-md group-hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: homeColor,
                  color: getContrastTextColor(homeColor),
                }}
              >
                {homeDisplayName}
              </div>
              {homeCoach && (
                <div className="text-xs text-slate-600 italic mt-1">
                  {homeCoach}
                </div>
              )}
            </div>
          </button>
          <div className="text-5xl font-black text-slate-900 mb-4 leading-none">
            {home.goals}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Tiri</div>
              <div className="font-semibold text-slate-900">{home.shots}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">In Porta</div>
              <div className="font-semibold text-blue-600">{home.shotsOnTarget}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Angoli</div>
              <div className="font-semibold text-slate-900">{home.corners}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Rimesse</div>
              <div className="font-semibold text-slate-900">{home.throwIns}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Falli</div>
              <div className="font-semibold text-slate-900">{home.fouls}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Gialli</div>
              <div className="font-semibold text-yellow-600">{home.yellowCards}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Rossi</div>
              <div className="font-semibold text-red-600">{home.redCards}</div>
            </div>
          </div>
        </div>

        {/* AWAY TEAM */}
        <div className="text-center">
          <button
            onClick={() => onClickTeamName?.('away')}
            className="w-full text-center group"
          >
            <div className="flex flex-col items-center gap-1 mb-2">
              <div className="text-xs font-bold text-slate-500">OSPITE</div>
              <div
                className="text-sm font-semibold px-2 py-1 rounded-md group-hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: awayColor,
                  color: getContrastTextColor(awayColor),
                }}
              >
                {awayDisplayName}
              </div>
              {awayCoach && (
                <div className="text-xs text-slate-600 italic mt-1">
                  {awayCoach}
                </div>
              )}
            </div>
          </button>
          <div className="text-5xl font-black text-slate-900 mb-4 leading-none">
            {away.goals}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Tiri</div>
              <div className="font-semibold text-slate-900">{away.shots}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">In Porta</div>
              <div className="font-semibold text-blue-600">{away.shotsOnTarget}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Angoli</div>
              <div className="font-semibold text-slate-900">{away.corners}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Rimesse</div>
              <div className="font-semibold text-slate-900">{away.throwIns}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Falli</div>
              <div className="font-semibold text-slate-900">{away.fouls}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Gialli</div>
              <div className="font-semibold text-yellow-600">{away.yellowCards}</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-slate-600">Rossi</div>
              <div className="font-semibold text-red-600">{away.redCards}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar - Directly Below Scoreboard */}
      <div className="mt-4">
        <StatsBar
          home={home}
          away={away}
          isMatchStarted={isMatchStarted}
        />
      </div>
    </div>
  );
};
