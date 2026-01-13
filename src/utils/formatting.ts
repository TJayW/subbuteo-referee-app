/**
 * Formatting utilities for time, numbers, and display values
 */

/**
 * Format seconds to MM:SS display
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to minutes only
 */
export function formatMinutes(seconds: number): number {
  return Math.floor(seconds / 60);
}

/**
 * Format timestamp to minutes (floor)
 */
export function formatTimestampMinutes(timestamp: number): number {
  return Math.floor(timestamp / 60);
}

/**
 * Format seconds to rounded minutes
 */
export function formatRoundedMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

/**
 * Format volume (0-1) to percentage display
 */
export function formatVolumePercent(volume: number): number {
  return Math.round(volume * 100);
}

/**
 * Get first character uppercase (for team initials)
 */
export function getInitial(text: string): string {
  return text.charAt(0).toUpperCase();
}

/**
 * Truncate string with ellipsis
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}
