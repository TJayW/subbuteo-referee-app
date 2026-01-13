/**
 * Volume Helpers
 * Pure mathematical functions for volume dial calculations
 */

/**
 * Converti angolo (0-360°) in volume (0-100)
 * 0° = 0%, 180° = 50%, 360° = 100%
 */
export function angleToVolume(angle: number): number {
  const clamped = Math.max(0, Math.min(360, angle));
  return Math.round((clamped / 360) * 100);
}

/**
 * Converti volume (0-100) in angolo (0-360°)
 */
export function volumeToAngle(volume: number): number {
  return (Math.max(0, Math.min(100, volume)) / 100) * 360;
}

/**
 * Calcola angolo dal punto centrale
 * Restituisce angolo in gradi (0-360) con 0° in alto
 */
export function getAngleFromPoint(
  centerX: number,
  centerY: number,
  pointX: number,
  pointY: number
): number {
  const rad = Math.atan2(pointY - centerY, pointX - centerX);
  const deg = (rad * 180) / Math.PI + 90; // 0° = top
  return (deg + 360) % 360;
}
