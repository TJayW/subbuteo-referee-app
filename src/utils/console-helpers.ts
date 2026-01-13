/**
 * Console Helpers
 * Pure utility functions for console size/state calculations
 */

import type { ConsoleSizeConfig } from '@/types/console';
import { CONSOLE_RESIZE_CONFIG } from '@/constants/console';

/**
 * Determina stato console da dimensione pixel
 * Usa snap threshold per aggancio automatico
 */
export function getStateFromSize(
  size: number,
  config: ConsoleSizeConfig,
  threshold: number = CONSOLE_RESIZE_CONFIG.snapThreshold
): 'minimized' | 'actionbar' | 'full' {
  // Se vicino a minimized
  if (Math.abs(size - config.minimized) < threshold) {
    return 'minimized';
  }
  // Se vicino ad actionbar
  if (Math.abs(size - config.actionbar) < threshold) {
    return 'actionbar';
  }
  // Se tra minimized e actionbar, considera più vicino
  if (size < (config.minimized + config.actionbar) / 2) {
    return 'minimized';
  }
  // Se tra actionbar e full, considera più vicino
  if (size < (config.actionbar + config.full) / 2) {
    return 'actionbar';
  }
  return 'full';
}

/**
 * Ottieni dimensione pixel da stato console
 */
export function getSizeFromState(
  state: 'minimized' | 'actionbar' | 'full',
  config: ConsoleSizeConfig
): number {
  return config[state];
}
