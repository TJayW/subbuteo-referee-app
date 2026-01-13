/**
 * Match Statistics Selectors
 * Derived data computation for dashboard and analytics
 */

import type { DomainMatchState, MatchEvent, Period, TeamKey } from './types';
import { selectAppliedEvents } from './selectors';

export interface FilterState {
  team: 'all' | 'home' | 'away';
  period: 'all' | Period;
}

/**
 * Filter events by team and period
 */
export function selectFilteredEvents(
  state: DomainMatchState,
  filters: FilterState
): MatchEvent[] {
  let events = selectAppliedEvents(state);

  if (filters.team !== 'all') {
    events = events.filter((e) => e.team === filters.team);
  }

  if (filters.period !== 'all') {
    events = events.filter((e) => e.period === filters.period);
  }

  return events;
}

/**
 * Get timeline of last N events (for overview card)
 */
export function selectRecentTimeline(
  state: DomainMatchState,
  count: number = 8
): MatchEvent[] {
  const events = selectAppliedEvents(state);
  return events.slice(-count);
}

/**
 * Bucket events by time intervals (for momentum chart)
 */
export interface TimeBucket {
  startSeconds: number;
  endSeconds: number;
  homeCount: number;
  awayCount: number;
  label: string;
}

export function selectEventBuckets(
  state: DomainMatchState,
  bucketSizeMinutes: number = 5
): TimeBucket[] {
  const events = selectAppliedEvents(state);
  const bucketSizeSeconds = bucketSizeMinutes * 60;
  const maxSeconds = Math.max(
    state.elapsedSeconds,
    ...events.map((e) => e.secondsInPeriod)
  );
  const bucketCount = Math.ceil(maxSeconds / bucketSizeSeconds) || 1;

  const buckets: TimeBucket[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const startSeconds = i * bucketSizeSeconds;
    const endSeconds = (i + 1) * bucketSizeSeconds;
    const bucketEvents = events.filter(
      (e) => e.secondsInPeriod >= startSeconds && e.secondsInPeriod < endSeconds
    );

    buckets.push({
      startSeconds,
      endSeconds,
      homeCount: bucketEvents.filter((e) => e.team === 'home').length,
      awayCount: bucketEvents.filter((e) => e.team === 'away').length,
      label: `${Math.floor(startSeconds / 60)}-${Math.floor(endSeconds / 60)}m`,
    });
  }

  return buckets;
}

/**
 * Calculate per-period stats breakdown
 */
export interface PeriodStats {
  period: Period;
  homeGoals: number;
  awayGoals: number;
  homeFouls: number;
  awayFouls: number;
  homeShots: number;
  awayShots: number;
  homeCorners: number;
  awayCorners: number;
  homeThrowIns: number;
  awayThrowIns: number;
  duration: number; // seconds
}

export function selectPeriodBreakdown(state: DomainMatchState): PeriodStats[] {
  const events = selectAppliedEvents(state);
  const periods = Array.from(new Set(events.map((e) => e.period)));

  return periods.map((period) => {
    const periodEvents = events.filter((e) => e.period === period);
    
    const countByTeamAndType = (team: TeamKey, type: string) =>
      periodEvents.filter((e) => e.team === team && e.type === type).length;

    return {
      period,
      homeGoals: countByTeamAndType('home', 'goal'),
      awayGoals: countByTeamAndType('away', 'goal'),
      homeFouls: countByTeamAndType('home', 'foul'),
      awayFouls: countByTeamAndType('away', 'foul'),
      homeShots: countByTeamAndType('home', 'shot'),
      awayShots: countByTeamAndType('away', 'shot'),
      homeCorners: countByTeamAndType('home', 'corner'),
      awayCorners: countByTeamAndType('away', 'corner'),
      homeThrowIns: countByTeamAndType('home', 'throw_in'),
      awayThrowIns: countByTeamAndType('away', 'throw_in'),
      duration: Math.max(...periodEvents.map((e) => e.secondsInPeriod), 0),
    };
  });
}

/**
 * Calculate discipline rates (per 10 minutes)
 */
export interface DisciplineRates {
  homeFoulsPerTenMin: number;
  awayFoulsPerTenMin: number;
  homeYellowsPerTenMin: number;
  awayYellowsPerTenMin: number;
  totalFoulsPerTenMin: number;
}

export function selectDisciplineRates(state: DomainMatchState): DisciplineRates {
  const events = selectAppliedEvents(state);
  const totalMinutes = Math.max(state.elapsedSeconds / 60, 0.1); // Avoid division by zero

  const homeFouls = events.filter((e) => e.team === 'home' && e.type === 'foul').length;
  const awayFouls = events.filter((e) => e.team === 'away' && e.type === 'foul').length;
  const homeYellows = events.filter((e) => e.team === 'home' && e.type === 'yellow_card').length;
  const awayYellows = events.filter((e) => e.team === 'away' && e.type === 'yellow_card').length;

  return {
    homeFoulsPerTenMin: (homeFouls / totalMinutes) * 10,
    awayFoulsPerTenMin: (awayFouls / totalMinutes) * 10,
    homeYellowsPerTenMin: (homeYellows / totalMinutes) * 10,
    awayYellowsPerTenMin: (awayYellows / totalMinutes) * 10,
    totalFoulsPerTenMin: ((homeFouls + awayFouls) / totalMinutes) * 10,
  };
}

/**
 * Operational health checks (data integrity)
 */
export interface HealthCheck {
  id: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  count?: number;
}

export function selectOperationalHealth(state: DomainMatchState): HealthCheck[] {
  const events = selectAppliedEvents(state);
  const checks: HealthCheck[] = [];

  // Check: Timer running in pre-match
  if (state.period === 'pre_match' && state.isRunning) {
    checks.push({
      id: 'timer_prematch',
      severity: 'warning',
      message: 'Timer in esecuzione durante pre-partita',
    });
  }

  // Check: Events with negative time
  const negativeTimeEvents = events.filter((e) => e.secondsInPeriod < 0);
  if (negativeTimeEvents.length > 0) {
    checks.push({
      id: 'negative_time',
      severity: 'error',
      message: 'Eventi con tempo negativo rilevati',
      count: negativeTimeEvents.length,
    });
  }

  // Check: Events bunched in same second (suspicious spike)
  const eventsBySecond = events.reduce((acc, e) => {
    const key = `${e.period}-${e.secondsInPeriod}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const suspiciousSpikes = Object.entries(eventsBySecond).filter(([_second, count]) => count > 5);
  if (suspiciousSpikes.length > 0) {
    checks.push({
      id: 'event_spike',
      severity: 'warning',
      message: 'Picchi di eventi nello stesso secondo',
      count: suspiciousSpikes.length,
    });
  }

  // Check: Match duration anomaly (too long)
  if (state.elapsedSeconds > state.totalPeriodSeconds * 1.5 && state.period !== 'finished') {
    checks.push({
      id: 'duration_anomaly',
      severity: 'warning',
      message: 'Durata periodo anomala (troppo lunga)',
    });
  }

  // All good
  if (checks.length === 0) {
    checks.push({
      id: 'all_good',
      severity: 'info',
      message: 'Tutti i controlli superati',
    });
  }

  return checks;
}

/**
 * Get export preview metadata
 */
export interface ExportPreview {
  matchId: string;
  totalEvents: number;
  appliedEvents: number;
  homeScore: number;
  awayScore: number;
  currentPeriod: string;
  hasRefereeInfo: boolean;
  hasFormations: boolean;
  hasTeamColors: boolean;
}

export function selectExportPreview(
  state: DomainMatchState,
  homeGoals: number,
  awayGoals: number,
  settings: { 
    officiating?: { referee1?: string; referee2?: string };
    homeTeamConfig?: { formation?: { scheme?: string; players: any[] } };
    awayTeamConfig?: { formation?: { scheme?: string; players: any[] } };
  }
): ExportPreview {
  const hasFormations = Boolean(
    (settings.homeTeamConfig?.formation?.scheme && settings.homeTeamConfig.formation.players.length > 0) ||
    (settings.awayTeamConfig?.formation?.scheme && settings.awayTeamConfig.formation.players.length > 0)
  );

  return {
    matchId: state.matchId,
    totalEvents: state.events.length,
    appliedEvents: state.cursor,
    homeScore: homeGoals,
    awayScore: awayGoals,
    currentPeriod: state.period,
    hasRefereeInfo: !!(settings.officiating?.referee1 || settings.officiating?.referee2),
    hasFormations,
    hasTeamColors: true, // Assume always configured
  };
}
