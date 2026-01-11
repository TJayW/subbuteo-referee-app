/**
 * Export configuration
 * Canvas dimensions, templates, and export settings
 */

/**
 * Export canvas dimensions (pixels)
 * CANONICAL SOURCE for all export image generation
 */
export const EXPORT_DIMENSIONS = {
  /** Standard export width */
  STANDARD_WIDTH: 1200,
  
  /** Premium export width */
  PREMIUM_WIDTH: 1280,
  
  /** Maximum dashboard width */
  MAX_DASHBOARD_WIDTH: 1600,
  
  /** Canvas padding */
  CANVAS_PADDING: 80,
  
  /** Minimum canvas height */
  MIN_CANVAS_HEIGHT: 1200,
  
  /** Score box dimensions */
  SCORE_BOX_SIZE: 120,
  
  /** Team logo size */
  TEAM_LOGO_SIZE: 48,
} as const;

/**
 * Export template themes
 */
export const EXPORT_THEMES = {
  DARK: {
    background: 'linear-gradient(135deg, #0d1b2a 0%, #1a1f3a 50%, #0f1419 100%)',
    headerBg: 'linear-gradient(90deg, #1a1a2e 0%, #0d1620 100%)',
    cardBg: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)',
    accentColor: '#ffb81c',
    textPrimary: '#ffffff',
    textSecondary: '#cbd5e1',
    textTertiary: '#64748b',
  },
  CLASSIC: {
    background: 'linear-gradient(135deg, #001f3f 0%, #003d7a 100%)',
    headerBg: 'linear-gradient(180deg, #1a1a2e 0%, #0f1923 100%)',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    accentColor: '#4CAF50',
    textPrimary: '#ffffff',
    textSecondary: '#e0e0e0',
    textTertiary: '#999999',
  },
} as const;

/**
 * Export format options
 */
export const EXPORT_FORMATS = ['png', 'html', 'csv', 'json'] as const;
export type ExportFormat = typeof EXPORT_FORMATS[number];

/**
 * Default export settings
 */
export const defaultExportSettings = {
  format: 'png' as ExportFormat,
  theme: 'DARK',
  includeStatistics: true,
  includeTimeline: true,
  quality: 1.0,
} as const;
