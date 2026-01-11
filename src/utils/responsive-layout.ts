/**
 * Responsive layout controller
 * Manages breakpoint detection and layout mode computation
 */

import { BREAKPOINTS, SIDEBAR_RESIZE } from '@/constants/layout';

export type LayoutMode = 'desktop' | 'tablet' | 'mobile';

export interface LayoutConfig {
  mode: LayoutMode;
  maxSidebarWidth: number;
  minSidebarWidth: number;
  defaultSidebarWidth: number;
  resizeEnabled: boolean;
  showBottomDock: boolean;
  showSidebar: boolean;
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
        maxSidebarWidth: SIDEBAR_RESIZE.MAX_WIDTH,
        minSidebarWidth: SIDEBAR_RESIZE.MIN_WIDTH,
        defaultSidebarWidth: SIDEBAR_RESIZE.DEFAULT_WIDTH,
        resizeEnabled: true,
        showBottomDock: false,
        showSidebar: true,
      };
    
    case 'tablet':
      return {
        mode: 'tablet',
        maxSidebarWidth: 320, // Capped for tablet
        minSidebarWidth: SIDEBAR_RESIZE.MIN_WIDTH,
        defaultSidebarWidth: SIDEBAR_RESIZE.DEFAULT_WIDTH,
        resizeEnabled: true,
        showBottomDock: false,
        showSidebar: true,
      };
    
    case 'mobile':
      return {
        mode: 'mobile',
        maxSidebarWidth: 0,
        minSidebarWidth: 0,
        defaultSidebarWidth: 0,
        resizeEnabled: false,
        showBottomDock: true,
        showSidebar: false,
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
 * Clamp sidebar width to current breakpoint constraints
 */
export function clampWidthToBreakpoint(
  width: number,
  mode: LayoutMode
): number {
  const config = getLayoutConfig(mode);
  return Math.max(
    config.minSidebarWidth,
    Math.min(config.maxSidebarWidth, width)
  );
}

/**
 * Get storage key for current layout mode
 */
export function getStorageKeyForMode(mode: LayoutMode): string | null {
  if (mode === 'desktop') return 'subbuteo_sidebar_width_desktop';
  if (mode === 'tablet') return 'subbuteo_sidebar_width_tablet';
  return null; // Mobile doesn't persist sidebar width
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
