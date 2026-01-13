/**
 * Responsive layout controller
 * Manages breakpoint detection and layout mode computation
 */

import { BREAKPOINTS, PANEL_RESIZE } from '@/constants/layout';

export type LayoutMode = 'desktop' | 'tablet' | 'mobile';

export interface LayoutConfig {
  mode: LayoutMode;
  maxPanelWidth: number;
  minPanelWidth: number;
  defaultPanelWidth: number;
  resizeEnabled: boolean;
  showActionBar: boolean;
  showPanel: boolean;
}

/**
 * Get current layout mode based on window width
 */
export function getLayoutMode(width: number = window.innerWidth): LayoutMode {
  if (width >= BREAKPOINTS.LG) return 'desktop';
  if (width >= BREAKPOINTS.MD) return 'tablet';
  return 'mobile';
}

/**
 * Get layout configuration for current mode
 */
export function getLayoutConfig(mode: LayoutMode): LayoutConfig {
  switch (mode) {
    case 'desktop':
      return {
        mode: 'desktop',
        maxPanelWidth: PANEL_RESIZE.MAX_WIDTH,
        minPanelWidth: PANEL_RESIZE.MIN_WIDTH,
        defaultPanelWidth: PANEL_RESIZE.DEFAULT_WIDTH,
        resizeEnabled: true,
        showActionBar: false,
        showPanel: true,
      };
    
    case 'tablet':
      return {
        mode: 'tablet',
        maxPanelWidth: 320, // Capped for tablet
        minPanelWidth: PANEL_RESIZE.MIN_WIDTH,
        defaultPanelWidth: PANEL_RESIZE.DEFAULT_WIDTH,
        resizeEnabled: true,
        showActionBar: false,
        showPanel: true,
      };
    
    case 'mobile':
      return {
        mode: 'mobile',
        maxPanelWidth: 0,
        minPanelWidth: 0,
        defaultPanelWidth: 0,
        resizeEnabled: false,
        showActionBar: true,
        showPanel: false,
      };
  }
}

/**
 * Check if current breakpoint is desktop
 */
export function isDesktopBreakpoint(width: number = window.innerWidth): boolean {
  return width >= BREAKPOINTS.LG;
}

/**
 * Check if current breakpoint is tablet
 */
export function isTabletBreakpoint(width: number = window.innerWidth): boolean {
  return width >= BREAKPOINTS.MD && width < BREAKPOINTS.LG;
}

/**
 * Check if current breakpoint is mobile
 */
export function isMobileBreakpoint(width: number = window.innerWidth): boolean {
  return width < BREAKPOINTS.MD;
}

/**
 * Clamp panel width to current breakpoint constraints
 */
export function clampWidthToBreakpoint(
  width: number,
  mode: LayoutMode
): number {
  const config = getLayoutConfig(mode);
  return Math.max(
    config.minPanelWidth,
    Math.min(config.maxPanelWidth, width)
  );
}

/**
 * Get storage key for current layout mode
 */
export function getStorageKeyForMode(mode: LayoutMode): string | null {
  if (mode === 'desktop') return 'subbuteo_panel_width_desktop';
  if (mode === 'tablet') return 'subbuteo_panel_width_tablet';
  return null; // Mobile doesn't persist panel width
}

/**
 * Create a reactive breakpoint detector
 * Returns cleanup function
 */
export function createBreakpointListener(
  callback: (mode: LayoutMode) => void
): () => void {
  const desktopQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.LG}px)`);
  const tabletQuery = window.matchMedia(
    `(min-width: ${BREAKPOINTS.MD}px) and (max-width: ${BREAKPOINTS.LG - 1}px)`
  );

  const handleChange = () => {
    callback(getLayoutMode());
  };

  desktopQuery.addEventListener('change', handleChange);
  tabletQuery.addEventListener('change', handleChange);

  return () => {
    desktopQuery.removeEventListener('change', handleChange);
    tabletQuery.removeEventListener('change', handleChange);
  };
}
