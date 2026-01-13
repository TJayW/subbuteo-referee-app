/**
 * Storage constants
 * CANONICAL SOURCE for localStorage keys and patterns
 * 
 * All localStorage keys use 'subbuteo_' prefix for namespace isolation
 */

/**
 * localStorage key constants
 * IMPORTANT: Changing these keys will invalidate existing stored data
 */
export const STORAGE_KEYS = {
  /** Match state (domain + UI + settings) */
  MATCH: 'subbuteo_match',
  
  /** Settings only */
  SETTINGS: 'subbuteo_settings',
  
  /** Audio settings */
  AUDIO_SETTINGS: 'subbuteo_audio_settings',
  
  /** Storage version (for settings) */
  SETTINGS_VERSION: 'subbuteo_storage_version',
  
  /** Audio storage version */
  AUDIO_VERSION: 'subbuteo_audio_version',
  
  /** UI state: console panel collapsed/expanded */
  UI_PANEL_COLLAPSED: 'subbuteo_ui_panel_collapsed',
  
  /** UI state: console panel width (desktop, px) */
  PANEL_WIDTH_DESKTOP: 'subbuteo_panel_width_desktop',
  
  /** UI state: console panel width (tablet, px) */
  PANEL_WIDTH_TABLET: 'subbuteo_panel_width_tablet',
  
  /** UI state: mobile action bar collapsed (boolean) */
  MOBILE_ACTIONBAR_COLLAPSED: 'subbuteo_mobile_actionbar_collapsed',
  
  // Legacy aliases for backward compatibility
  UI_SIDEBAR_COLLAPSED: 'subbuteo_ui_panel_collapsed',
  SIDEBAR_WIDTH_DESKTOP: 'subbuteo_panel_width_desktop',
  SIDEBAR_WIDTH_TABLET: 'subbuteo_panel_width_tablet',
  MOBILE_DOCK_COLLAPSED: 'subbuteo_mobile_actionbar_collapsed',
} as const;

/**
 * Storage key prefix
 * Use for dynamic key generation if needed
 */
export const STORAGE_PREFIX = 'subbuteo_';

/**
 * Storage size limits (approximate, browser-dependent)
 */
export const STORAGE_LIMITS = {
  /** Typical localStorage limit (bytes) */
  LOCAL_STORAGE_LIMIT: 5 * 1024 * 1024, // 5MB
  
  /** Warning threshold (80% of limit) */
  WARNING_THRESHOLD: 4 * 1024 * 1024, // 4MB
} as const;
