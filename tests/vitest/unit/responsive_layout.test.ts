/**
 * Responsive Layout Controller Tests
 * Tests breakpoint detection and layout configuration logic
 */

import { describe, it, expect } from 'vitest';
import {
  getLayoutMode,
  getLayoutConfig,
  isDesktopBreakpoint,
  isTabletBreakpoint,
  isMobileBreakpoint,
  clampWidthToBreakpoint,
  getStorageKeyForMode,
} from '@/utils/responsive-layout';

describe('getLayoutMode', () => {
  it('returns desktop for width >= 1024px', () => {
    expect(getLayoutMode(1024)).toBe('desktop');
    expect(getLayoutMode(1280)).toBe('desktop');
    expect(getLayoutMode(1920)).toBe('desktop');
  });

  it('returns tablet for width 768-1023px', () => {
    expect(getLayoutMode(768)).toBe('tablet');
    expect(getLayoutMode(900)).toBe('tablet');
    expect(getLayoutMode(1023)).toBe('tablet');
  });

  it('returns mobile for width < 768px', () => {
    expect(getLayoutMode(0)).toBe('mobile');
    expect(getLayoutMode(375)).toBe('mobile');
    expect(getLayoutMode(767)).toBe('mobile');
  });
});

describe('getLayoutConfig', () => {
  it('desktop config has full resize range (80-360)', () => {
    const config = getLayoutConfig('desktop');
    expect(config.mode).toBe('desktop');
    expect(config.minSidebarWidth).toBe(80);
    expect(config.maxSidebarWidth).toBe(360);
    expect(config.defaultSidebarWidth).toBe(280);
    expect(config.resizeEnabled).toBe(true);
    expect(config.showSidebar).toBe(true);
    expect(config.showBottomDock).toBe(false);
  });

  it('tablet config caps max at 320px', () => {
    const config = getLayoutConfig('tablet');
    expect(config.mode).toBe('tablet');
    expect(config.minSidebarWidth).toBe(80);
    expect(config.maxSidebarWidth).toBe(320); // Capped for tablet
    expect(config.defaultSidebarWidth).toBe(280);
    expect(config.resizeEnabled).toBe(true);
    expect(config.showSidebar).toBe(true);
    expect(config.showBottomDock).toBe(false);
  });

  it('mobile config disables sidebar and resize', () => {
    const config = getLayoutConfig('mobile');
    expect(config.mode).toBe('mobile');
    expect(config.minSidebarWidth).toBe(0);
    expect(config.maxSidebarWidth).toBe(0);
    expect(config.defaultSidebarWidth).toBe(0);
    expect(config.resizeEnabled).toBe(false);
    expect(config.showSidebar).toBe(false);
    expect(config.showBottomDock).toBe(true);
  });
});

describe('Breakpoint detection helpers', () => {
  it('isDesktopBreakpoint detects >=1024px', () => {
    expect(isDesktopBreakpoint(1023)).toBe(false);
    expect(isDesktopBreakpoint(1024)).toBe(true);
    expect(isDesktopBreakpoint(1280)).toBe(true);
  });

  it('isTabletBreakpoint detects 768-1023px', () => {
    expect(isTabletBreakpoint(767)).toBe(false);
    expect(isTabletBreakpoint(768)).toBe(true);
    expect(isTabletBreakpoint(900)).toBe(true);
    expect(isTabletBreakpoint(1023)).toBe(true);
    expect(isTabletBreakpoint(1024)).toBe(false);
  });

  it('isMobileBreakpoint detects <768px', () => {
    expect(isMobileBreakpoint(767)).toBe(true);
    expect(isMobileBreakpoint(375)).toBe(true);
    expect(isMobileBreakpoint(768)).toBe(false);
  });
});

describe('clampWidthToBreakpoint', () => {
  it('desktop: clamps to 80-360', () => {
    expect(clampWidthToBreakpoint(50, 'desktop')).toBe(80);
    expect(clampWidthToBreakpoint(280, 'desktop')).toBe(280);
    expect(clampWidthToBreakpoint(400, 'desktop')).toBe(360);
  });

  it('tablet: clamps to 80-320', () => {
    expect(clampWidthToBreakpoint(50, 'tablet')).toBe(80);
    expect(clampWidthToBreakpoint(280, 'tablet')).toBe(280);
    expect(clampWidthToBreakpoint(350, 'tablet')).toBe(320); // Capped at 320
    expect(clampWidthToBreakpoint(400, 'tablet')).toBe(320);
  });

  it('mobile: clamps to 0', () => {
    expect(clampWidthToBreakpoint(50, 'mobile')).toBe(0);
    expect(clampWidthToBreakpoint(280, 'mobile')).toBe(0);
    expect(clampWidthToBreakpoint(400, 'mobile')).toBe(0);
  });
});

describe('getStorageKeyForMode', () => {
  it('returns desktop key for desktop mode', () => {
    expect(getStorageKeyForMode('desktop')).toBe('subbuteo_sidebar_width_desktop');
  });

  it('returns tablet key for tablet mode', () => {
    expect(getStorageKeyForMode('tablet')).toBe('subbuteo_sidebar_width_tablet');
  });

  it('returns null for mobile (no persistence)', () => {
    expect(getStorageKeyForMode('mobile')).toBeNull();
  });
});

describe('Width transitions between breakpoints', () => {
  it('desktop width 320px remains valid on tablet', () => {
    const desktopWidth = 320;
    expect(clampWidthToBreakpoint(desktopWidth, 'desktop')).toBe(320);
    expect(clampWidthToBreakpoint(desktopWidth, 'tablet')).toBe(320);
  });

  it('desktop width 360px gets capped to 320px on tablet', () => {
    const desktopWidth = 360;
    expect(clampWidthToBreakpoint(desktopWidth, 'desktop')).toBe(360);
    expect(clampWidthToBreakpoint(desktopWidth, 'tablet')).toBe(320); // Capped
  });

  it('tablet width 280px remains valid on desktop', () => {
    const tabletWidth = 280;
    expect(clampWidthToBreakpoint(tabletWidth, 'tablet')).toBe(280);
    expect(clampWidthToBreakpoint(tabletWidth, 'desktop')).toBe(280);
  });
});
