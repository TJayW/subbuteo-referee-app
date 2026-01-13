/**
 * Shared Console Constants
 * Definizioni delle dimensioni per i 3 stati console
 */

import type { ConsoleSizeConfig } from '@/types/console';

/**
 * Desktop/Tablet Console Sizes (Vertical Orientation)
 * Larghezza panel laterale da sinistra
 */
export const DESKTOP_CONSOLE_SIZES: ConsoleSizeConfig = {
  /** Handle only - ultra-sottile */
  minimized: 28,
  /** ActionBar - barra veloce con bottoni eventi */
  actionbar: 80,
  /** Full Console - tutte le card visibili */
  full: 280,
};

/**
 * Mobile Console Sizes (Horizontal Orientation)
 * Altezza panel dal basso
 */
export const MOBILE_CONSOLE_SIZES: ConsoleSizeConfig = {
  /** Handle only - ultra-sottile */
  minimized: 28,
  /** ActionBar - barra veloce con bottoni eventi */
  actionbar: 120,
  /** Full Console - tutte le card visibili */
  full: 360,
};

/**
 * Console Resize Configuration
 */
export const CONSOLE_RESIZE_CONFIG = {
  /** Snap threshold per aggancio automatico (px) */
  snapThreshold: 20,
  /** Keyboard step piccolo (Arrow keys) */
  keyboardStepSmall: 20,
  /** Keyboard step grande (Shift+Arrow) */
  keyboardStepLarge: 50,
  /** Transition duration (ms) */
  transitionDuration: 200,
  /** Transition easing */
  transitionEasing: 'ease-out' as const,
} as const;

/**
 * Storage Keys per persistenza stati console
 */
export const CONSOLE_STORAGE_KEYS = {
  desktopState: 'subbuteo_console_desktop_state',
  desktopSize: 'subbuteo_console_desktop_size',
  mobileState: 'subbuteo_console_mobile_state',
  mobileSize: 'subbuteo_console_mobile_size',
} as const;

/**
 * Helper: Determina stato da dimensione
 */
export function getStateFromSize(size: number, config: ConsoleSizeConfig, threshold: number = CONSOLE_RESIZE_CONFIG.snapThreshold): 'minimized' | 'actionbar' | 'full' {
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
 * Helper: Ottieni dimensione da stato
 */
export function getSizeFromState(state: 'minimized' | 'actionbar' | 'full', config: ConsoleSizeConfig): number {
  return config[state];
}
