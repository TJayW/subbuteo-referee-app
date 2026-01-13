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
