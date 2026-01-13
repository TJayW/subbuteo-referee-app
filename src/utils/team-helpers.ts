/**
 * Team data extraction helpers
 */

import type { SettingsState, ComputedTeamStats } from '@/domain/match/types';

/**
 * Extract home team display properties
 */
export function getHomeTeamDisplay(settings: SettingsState) {
  return {
    displayName: settings.homeTeamConfig.displayName,
    color: settings.homeTeamConfig.color.primary,
    coach: settings.homeTeamConfig.coach,
  };
}

/**
 * Extract away team display properties
 */
export function getAwayTeamDisplay(settings: SettingsState) {
  return {
    displayName: settings.awayTeamConfig.displayName,
    color: settings.awayTeamConfig.color.primary,
    coach: settings.awayTeamConfig.coach,
  };
}

/**
 * Extract both teams display properties
 */
export function getTeamsDisplay(settings: SettingsState) {
  return {
    home: getHomeTeamDisplay(settings),
    away: getAwayTeamDisplay(settings),
  };
}

/**
 * Extract team stats
 */
export function getTeamStats(teamStats: ComputedTeamStats) {
  return {
    home: teamStats.home,
    away: teamStats.away,
  };
}
