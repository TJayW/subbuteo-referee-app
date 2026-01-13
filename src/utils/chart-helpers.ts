/**
 * Chart calculation helpers
 */

/**
 * Calculate max value from buckets
 */
export function getMaxBucketValue(
  buckets: Array<{ homeCount: number; awayCount: number }>
): number {
  return Math.max(...buckets.map((b) => b.homeCount + b.awayCount), 1);
}

/**
 * Calculate bar width for responsive charts
 */
export function calculateBarWidth(bucketCount: number, minWidth = 8): number {
  return Math.max(100 / bucketCount - 2, minWidth);
}

/**
 * Filter buckets for x-axis labels (show every Nth)
 */
export function getAxisLabelBuckets<T>(buckets: T[], maxLabels = 5): T[] {
  const interval = Math.ceil(buckets.length / maxLabels);
  return buckets.filter((_, i) => i % interval === 0);
}
