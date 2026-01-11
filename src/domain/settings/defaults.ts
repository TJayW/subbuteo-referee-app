import type { TeamConfig, TeamColor } from '@/domain/match/types';

/**
 * Default team colors (predefined palette)
 */
export const TEAM_COLOR_PALETTE: Record<string, TeamColor> = {
  emerald: {
    primary: '#10b981',
    secondary: '#059669',
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
  },
  red: {
    primary: '#ef4444',
    secondary: '#dc2626',
  },
  orange: {
    primary: '#f97316',
    secondary: '#ea580c',
  },
  purple: {
    primary: '#a855f7',
    secondary: '#9333ea',
  },
  slate: {
    primary: '#64748b',
    secondary: '#475569',
  },
  yellow: {
    primary: '#eab308',
    secondary: '#ca8a04',
  },
  pink: {
    primary: '#ec4899',
    secondary: '#be185d',
  },
};

/**
 * Create default team config with empty formation and displayName
 */
export function createDefaultTeamConfig(colorKey: keyof typeof TEAM_COLOR_PALETTE = 'slate', displayName: string = 'Squadra'): TeamConfig {
  return {
    color: TEAM_COLOR_PALETTE[colorKey],
    formation: {
      name: '4-4-2',
      players: [],
    },
    displayName,
    coach: '',
  };
}

/**
 * Get contrasting text color (black or white) for background
 */
export function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Validate hex color format
 */
export function isValidHexColor(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}
