/**
 * Console Constants
 * Configurazioni dimensioni, resize e storage per il sistema console
 */

import { Goal, AlertCircle, Target, Zap, Clock } from 'lucide-react';
import type { ConsoleSizeConfig } from '@/types/console';
import type { EventType } from '@/domain/match/types';

/**
 * P0 Event Buttons Configuration
 * Eventi principali sempre disponibili nella ActionBar
 */
export const EVENT_BUTTONS = [
  { type: 'goal' as EventType, icon: Goal, color: 'text-emerald-600', bg: 'bg-emerald-50', hoverBg: 'hover:bg-emerald-100', label: 'Goal', shortcut: 'G' },
  { type: 'shot_on_target' as EventType, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', hoverBg: 'hover:bg-blue-100', label: 'Tiro Porta', shortcut: 'O' },
  { type: 'shot' as EventType, icon: AlertCircle, color: 'text-slate-600', bg: 'bg-slate-50', hoverBg: 'hover:bg-slate-100', label: 'Tiro', shortcut: 'S' },
  { type: 'corner' as EventType, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', hoverBg: 'hover:bg-orange-100', label: 'Angolo', shortcut: 'C' },
  { type: 'foul' as EventType, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', hoverBg: 'hover:bg-amber-100', label: 'Fallo', shortcut: 'F' },
  { type: 'yellow_card' as EventType, icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', hoverBg: 'hover:bg-yellow-100', label: 'Giallo', shortcut: 'Y' },
  { type: 'red_card' as EventType, icon: Zap, color: 'text-red-600', bg: 'bg-red-50', hoverBg: 'hover:bg-red-100', label: 'Rosso', shortcut: 'R' },
  { type: 'timeout' as EventType, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', hoverBg: 'hover:bg-purple-100', label: 'Timeout', shortcut: 'T' },
] as const;

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
