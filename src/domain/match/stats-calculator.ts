import type { MatchEvent, TeamStats } from '@/domain/match/types';

/**
 * Calculate team statistics from a list of applied events.
 * Pure function — safe to memoize.
 */
export function calculateTeamStats(
  events: MatchEvent[],
  teamKey: 'home' | 'away',
  teamName: string
): TeamStats {
  const teamEvents = events.filter((e) => e.team === teamKey);

  const goals = teamEvents.reduce((sum, e) => {
    if (e.type === 'goal') {
      return sum + (e.delta ?? 1);
    }
    return sum;
  }, 0);

  const shots = teamEvents.filter((e) => e.type === 'shot').length;
  const shotsOnTarget = teamEvents.filter((e) => e.type === 'shot_on_target').length;
  const corners = teamEvents.filter((e) => e.type === 'corner').length;
  const throwIns = teamEvents.filter((e) => e.type === 'throw_in').length;
  const fouls = teamEvents.filter((e) => e.type === 'foul').length;
  const yellowCards = teamEvents.filter((e) => e.type === 'yellow_card').length;
  const redCards = teamEvents.filter((e) => e.type === 'red_card').length;
  const timeouts = teamEvents.filter((e) => e.type === 'timeout').length;

  return {
    name: teamName,
    goals,
    fouls,
    yellowCards,
    redCards,
    timeouts,
    shots,
    shotsOnTarget,
    corners,
    throwIns,
  };
}

/**
 * Calculate stats for both teams.
 * Intended for use with useMemo([events, eventIndex]) in components.
 */
export function deriveStats(
  events: MatchEvent[],
  homeTeamName: string,
  awayTeamName: string
): { home: TeamStats; away: TeamStats } {
  return {
    home: calculateTeamStats(events, 'home', homeTeamName),
    away: calculateTeamStats(events, 'away', awayTeamName),
  };
}
