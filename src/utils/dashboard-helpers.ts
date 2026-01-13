/**
 * Dashboard computation helpers
 */

/**
 * Calculate percentage for stat comparison bar
 */
export function calculateStatPercentage(homeValue: number, awayValue: number): number {
  const total = homeValue + awayValue;
  return total > 0 ? (homeValue / total) * 100 : 50;
}

/**
 * Check if event is from home team
 */
export function isHomeTeam(team: 'home' | 'away'): boolean {
  return team === 'home';
}

/**
 * Calculate chart height for bucket
 */
export function calculateBucketHeight(value: number, maxValue: number, chartHeight: number): number {
  return (value / maxValue) * chartHeight;
}

/**
 * Calculate x position for chart bar
 */
export function calculateBarXPosition(index: number, barWidth: number, gap: number = 2): number {
  return index * (barWidth + gap);
}

/**
 * Check if foul rate is high
 */
export function isHighFoulRate(foulsPerTenMin: number, threshold: number = 8): boolean {
  return foulsPerTenMin > threshold;
}
