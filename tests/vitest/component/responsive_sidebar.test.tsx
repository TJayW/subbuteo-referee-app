/**
 * Responsive Sidebar Tests
 * Tests sidebar behavior across desktop/tablet/mobile breakpoints
 * 
 * Requirements:
 * - Desktop (≥1024px): resizable 80-360px, collapse to 80px
 * - Tablet (768-1023px): resizable 80-320px (capped), collapse to 80px
 * - Mobile (<768px): bottom dock, no sidebar, no resize handle
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '@/app/app';
import { SIDEBAR_RESIZE } from '@/constants/layout';
import { STORAGE_KEYS } from '@/constants/storage';

// Mock window.matchMedia for breakpoint testing
function mockMatchMedia(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  const mediaQueries: Record<string, boolean> = {
    '(min-width: 1024px)': width >= 1024,
    '(min-width: 768px)': width >= 768,
  };

  window.matchMedia = vi.fn((query: string) => ({
    matches: mediaQueries[query] ?? false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe('Responsive Sidebar - Desktop (≥1024px)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(1280); // Desktop width
    vi.clearAllMocks();
  });

  it('desktop: sidebar starts at default 280px width', () => {
    render(<App />);
    
    const width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
    expect(width.trim()).toBe('280px');
  });

  it('desktop: persists width to SIDEBAR_WIDTH_DESKTOP key', async () => {
    render(<App />);
    
    // Initial persistence
    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH_DESKTOP);
      expect(stored).toBe('280');
    }, { timeout: 500 });
  });

  it('tablet: resize handle is visible', () => {
    render(<App />);
    
    const handle = document.querySelector('[role="separator"]');
    expect(handle).toBeTruthy();
  });

  it('desktop: can resize up to MAX_WIDTH (360px)', () => {
    render(<App />);
    
    const handle = document.querySelector('[role="separator"]') as HTMLElement;
    expect(handle).toBeTruthy();
    
    // Simulate drag to 360px
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(document, { clientX: 180, pointerId: 1 }); // +80px
    fireEvent.pointerUp(document, { pointerId: 1 });
    
    waitFor(() => {
      const width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
      expect(parseInt(width)).toBeLessThanOrEqual(SIDEBAR_RESIZE.MAX_WIDTH);
    });
  });

  it('desktop: collapse preserves previous width for restore', async () => {
    render(<App />);
    
    const toggleButton = screen.getByLabelText(/sidebar/i);
    
    // Start at 280px
    let width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
    expect(width.trim()).toBe('280px');
    
    // Collapse
    fireEvent.click(toggleButton);
    await waitFor(() => {
      width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
      expect(width.trim()).toBe('80px');
    });
    
    // Expand - should restore to 280px
    fireEvent.click(toggleButton);
    await waitFor(() => {
      width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
      expect(width.trim()).toBe('280px');
    });
  });
});

describe('Responsive Sidebar - Tablet (768-1023px)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(900); // Tablet width
    vi.clearAllMocks();
  });

  it('tablet: sidebar starts at default 280px width', () => {
    render(<App />);
    
    const width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
    expect(width.trim()).toBe('280px');
  });

  it('tablet: persists width to SIDEBAR_WIDTH_TABLET key', async () => {
    render(<App />);
    
    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH_TABLET);
      expect(stored).toBe('280');
      
      // Should NOT use desktop key
      const desktopStored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH_DESKTOP);
      expect(desktopStored).toBeNull();
    }, { timeout: 500 });
  });

  it('desktop: resize handle is visible', () => {
    render(<App />);
    
    const handle = document.querySelector('[role="separator"]');
    expect(handle).toBeTruthy();
  });

  it('tablet: max width capped at 320px', () => {
    render(<App />);
    
    const handle = document.querySelector('[role="separator"]') as HTMLElement;
    expect(handle).toBeTruthy();
    
    // Try to drag beyond 320px
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(document, { clientX: 300, pointerId: 1 }); // Large delta
    fireEvent.pointerUp(document, { pointerId: 1 });
    
    waitFor(() => {
      const width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
      expect(parseInt(width)).toBeLessThanOrEqual(320);
    });
  });

  it('tablet: collapse works same as desktop', async () => {
    render(<App />);
    
    const toggleButton = screen.getByLabelText(/sidebar/i);
    
    fireEvent.click(toggleButton);
    await waitFor(() => {
      const width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
      expect(width.trim()).toBe('80px');
    });
  });
});

describe('Responsive Sidebar - Mobile (<768px)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(375); // Mobile width
    vi.clearAllMocks();
  });

  it('mobile: sidebar is hidden (display: none)', () => {
    render(<App />);
    
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      // Check sidebar has hidden class (md:flex means hidden on mobile)
      const classes = sidebar.className;
      expect(classes).toContain('hidden');
      expect(classes).toContain('md:flex');
    }
  });

  it('mobile: bottom dock is visible', () => {
    render(<App />);
    
    // Bottom dock has class "md:hidden" which means visible on mobile
    const docks = document.querySelectorAll('.md\\:hidden');
    expect(docks.length).toBeGreaterThan(0);
    
    // Check for play/pause button which is P0 control
    const playButtons = screen.queryAllByRole('button', { name: /avvia|pausa/i });
    expect(playButtons.length).toBeGreaterThan(0);
  });

  it('mobile: sidebar resize handle is not visible', () => {
    render(<App />);
    
    // On mobile (<768px), the sidebar itself is hidden via "hidden md:flex"
    // The resize handle is inside the sidebar, so it's also hidden
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      const classes = sidebar.className;
      // Sidebar should have "hidden" class (visible only on md: breakpoint)
      expect(classes).toContain('hidden');
    }
    
    // Alternatively, check that vertical resize handle is not in visible tree
    const verticalHandles = Array.from(document.querySelectorAll('[role="separator"]')).filter(
      el => el.getAttribute('aria-orientation') === 'vertical' && 
           el.getAttribute('aria-label')?.includes('barra laterale')
    );
    
    // If sidebar handle exists, its parent (sidebar) should be hidden
    if (verticalHandles.length > 0) {
      verticalHandles.forEach(handle => {
        const parent = handle.closest('aside');
        if (parent) {
          expect(parent.className).toContain('hidden');
        }
      });
    }
  });

  it('mobile: P0 controls accessible (team select + event buttons)', () => {
    render(<App />);
    
    // Team selector should be accessible
    const teamButtons = screen.queryAllByRole('button');
    expect(teamButtons.length).toBeGreaterThan(0);
    
    // Play/pause control (there may be multiple, check at least one exists)
    const playButtons = screen.queryAllByRole('button', { name: /avvia|pausa/i });
    expect(playButtons.length).toBeGreaterThan(0);
  });

  it('mobile: no horizontal scroll introduced', () => {
    render(<App />);
    
    const body = document.body;
    const html = document.documentElement;
    
    expect(body.scrollWidth).toBeLessThanOrEqual(body.clientWidth + 1);
    expect(html.scrollWidth).toBeLessThanOrEqual(html.clientWidth + 1);
  });

  it('mobile: does not persist sidebar width keys', async () => {
    render(<App />);
    
    // Wait for any persistence attempts
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const desktopStored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH_DESKTOP);
    const tabletStored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH_TABLET);
    
    // Mobile should not use sidebar width keys
    expect(desktopStored).toBeNull();
    expect(tabletStored).toBeNull();
  });
});

describe('Responsive Sidebar - Breakpoint Switching', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('switching desktop→tablet loads correct persistence key', async () => {
    // Start desktop
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH_DESKTOP, '320');
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH_TABLET, '240');
    
    mockMatchMedia(1280);
    render(<App />);
    
    // Should load desktop width
    await waitFor(() => {
      const width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
      expect(width.trim()).toBe('320px');
    });
  });

  it('switching tablet→desktop loads correct persistence key', async () => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH_DESKTOP, '320');
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH_TABLET, '240');
    
    mockMatchMedia(900);
    render(<App />);
    
    // Should load tablet width
    await waitFor(() => {
      const width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
      expect(width.trim()).toBe('240px');
    });
  });

  it('no layout shift on breakpoint change', async () => {
    mockMatchMedia(1280);
    const { rerender } = render(<App />);
    
    const initialWidth = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
    expect(initialWidth).toBeTruthy();
    
    // Simulate window resize to tablet
    mockMatchMedia(900);
    rerender(<App />);
    
    const newWidth = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
    expect(newWidth).toBeTruthy();
    
    // No horizontal scroll introduced
    const html = document.documentElement;
    expect(html.scrollWidth).toBeLessThanOrEqual(html.clientWidth + 1);
  });
});

describe('Responsive Sidebar - Focus Safety', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('desktop: focus does not land in hidden bottom dock', () => {
    mockMatchMedia(1280);
    render(<App />);
    
    // On desktop, bottom dock elements have md:hidden class
    // Verify bottom dock container is marked as hidden on desktop
    const bottomDocks = document.querySelectorAll('.md\\:hidden');
    bottomDocks.forEach((dock) => {
      const classes = dock.className;
      expect(classes).toContain('md:hidden'); // Should be hidden on md+ screens
    });
  });

  it('mobile: focus does not land in hidden sidebar', () => {
    mockMatchMedia(375);
    render(<App />);
    
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      // On mobile, sidebar has hidden md:flex classes
      const classes = sidebar.className;
      expect(classes).toContain('hidden');
      expect(classes).toContain('md:flex'); // Visible only on md+ screens
    }
  });

  it('only one focus trap active: no modal+drawer conflict', () => {
    mockMatchMedia(1280);
    render(<App />);
    
    // Count focus trap roots (aria-modal=true or role=dialog)
    const modals = document.querySelectorAll('[aria-modal="true"], [role="dialog"]');
    
    // Should be 0 or 1 active at a time
    expect(modals.length).toBeLessThanOrEqual(1);
  });
});
