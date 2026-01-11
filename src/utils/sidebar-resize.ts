/**
 * Pure resize math functions for testable sidebar behavior
 * All functions are pure (no side effects) and can be unit tested
 */

export interface ResizeConfig {
  MIN_WIDTH: number;
  MAX_WIDTH: number;
  SNAP_POINTS: readonly number[];
  SNAP_THRESHOLD: number;
  COLLAPSE_THRESHOLD: number;
}

/**
 * Clamp width to min/max bounds
 */
export function clampWidth(width: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, width));
}

/**
 * Find nearest snap point within threshold
 * @returns snapped width if within threshold, null otherwise
 */
export function nearestSnap(
  width: number,
  snapPoints: readonly number[],
  threshold: number
): number | null {
  for (const snap of snapPoints) {
    if (Math.abs(width - snap) <= threshold) {
      return snap;
    }
  }
  return null;
}

/**
 * Get next snap point in cycle
 * Used for Enter key cycling: 80 → 280 → 320 → 80
 */
export function nextSnap(currentWidth: number, snapPoints: readonly number[]): number {
  // Find current snap index (with 5px tolerance for floating point)
  const currentIndex = snapPoints.findIndex(snap => Math.abs(snap - currentWidth) < 5);
  
  if (currentIndex === -1) {
    // Not on a snap point, go to first snap
    return snapPoints[0];
  }
  
  // Cycle to next snap
  const nextIndex = (currentIndex + 1) % snapPoints.length;
  return snapPoints[nextIndex];
}

/**
 * Compute new width from drag delta
 */
export function computeWidthFromDrag(
  startWidth: number,
  deltaX: number,
  min: number,
  max: number
): number {
  return clampWidth(startWidth + deltaX, min, max);
}

/**
 * Check if width is considered "collapsed"
 */
export function isCollapsed(width: number, threshold: number): boolean {
  return width <= threshold;
}

/**
 * Apply snap if within threshold, otherwise return width
 */
export function applySnap(
  width: number,
  snapPoints: readonly number[],
  threshold: number
): number {
  const snap = nearestSnap(width, snapPoints, threshold);
  return snap !== null ? snap : width;
}
