/**
 * Time Helper Utilities
 * Pure functions for time formatting and conversions
 */

/**
 * Format event time display (MM:SS)
 */
export function formatEventTime(secondsInPeriod: number): string {
  const mins = Math.floor(secondsInPeriod / 60);
  const secs = secondsInPeriod % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Convert minutes to seconds
 */
export function minutesToSeconds(minutes: number): number {
  return Math.round(minutes * 60);
}

/**
 * Convert seconds to minutes
 */
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}
