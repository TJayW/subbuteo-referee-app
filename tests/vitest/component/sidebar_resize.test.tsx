/**
 * Sidebar Resize - Keyboard & Accessibility Tests (Unit)
 * 
 * COVERAGE STRATEGY:
 * - Unit tests (this file): keyboard resizing, ARIA, focus, localStorage API
 * - E2E tests (Playwright): pointer drag behavior (requires real browser)
 * 
 * This ensures NO "JSDOM limitations" excuses: drag is tested in real browser.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import App from '@/app/app';

describe('Sidebar Resize - Keyboard & Accessibility (Unit)', () => {
  beforeEach(() => {
    // Don't clear localStorage here - tests that need it will do so explicitly before render
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // Unmount all components
    localStorage.clear();
  });

  it('renders resize handle with proper accessibility attributes', () => {
    localStorage.clear();
    render(<App />);
    
    const handle = screen.getAllByRole('separator', { name: /ridimensiona barra laterale/i }).find(el => el.getAttribute('aria-orientation') === 'vertical')!;
    expect(handle).toBeDefined();
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
    expect(handle.getAttribute('aria-valuemin')).toBe('80');
    expect(handle.getAttribute('aria-valuemax')).toBe('360');
    expect(handle.getAttribute('aria-valuenow')).toBe('280'); // default
  });

  it('resize handle is keyboard focusable', () => {
    localStorage.clear();
    render(<App />);
    
    const handle = screen.getAllByRole('separator', { name: /ridimensiona barra laterale/i }).find(el => el.getAttribute('aria-orientation') === 'vertical')!;
    handle.focus();
    
    expect(document.activeElement).toBe(handle);
  });

  it('keyboard ArrowRight increases width by 8px', async () => {
    localStorage.clear();
    render(<App />);
    
    const handle = screen.getAllByRole('separator', { name: /ridimensiona barra laterale/i }).find(el => el.getAttribute('aria-orientation') === 'vertical')!;
    handle.focus();
    
    const initialWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width'));
    expect(initialWidth).toBe(280); // default
    
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    
    await waitFor(() => {
      const newWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width'));
      expect(newWidth).toBe(288); // 280 + 8
    });
  });

  it('keyboard ArrowLeft decreases width by 8px', async () => {
    localStorage.clear();
    render(<App />);
    
    const handle = screen.getAllByRole('separator', { name: /ridimensiona barra laterale/i }).find(el => el.getAttribute('aria-orientation') === 'vertical')!;
    handle.focus();
    
    const initialWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width'));
    expect(initialWidth).toBe(280);
    
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    
    await waitFor(() => {
      const newWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width'));
      expect(newWidth).toBe(272); // 280 - 8
    });
  });

  it('keyboard Shift+ArrowRight increases width by 24px', async () => {
    localStorage.clear();
    render(<App />);
    
    const handle = screen.getAllByRole('separator', { name: /ridimensiona barra laterale/i }).find(el => el.getAttribute('aria-orientation') === 'vertical')!;
    handle.focus();
    
    const initialWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width'));
    expect(initialWidth).toBe(280);
    
    fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true });
    
    await waitFor(() => {
      const newWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width'));
      expect(newWidth).toBe(304); // 280 + 24
    });
  });

  it('keyboard Enter cycles through snap points (80→280→320→80)', async () => {
    localStorage.clear();
    render(<App />);
    
    const handle = screen.getAllByRole('separator', { name: /ridimensiona barra laterale/i }).find(el => el.getAttribute('aria-orientation') === 'vertical')!;
    handle.focus();
    
    // Start at 280 (default)
    expect(getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width').trim()).toBe('280px');
    
    // Press Enter → cycle to 320
    fireEvent.keyDown(handle, { key: 'Enter' });
    await waitFor(() => {
      expect(getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width').trim()).toBe('320px');
    });
    
    // Press Enter → cycle to 80
    fireEvent.keyDown(handle, { key: 'Enter' });
    await waitFor(() => {
      expect(getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width').trim()).toBe('80px');
    });
    
    // Press Enter → cycle back to 280
    fireEvent.keyDown(handle, { key: 'Enter' });
    await waitFor(() => {
      expect(getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width').trim()).toBe('280px');
    });
  });

  it('persists width to localStorage with debounced write (desktop)', async () => {
    localStorage.clear();
    render(<App />);
    
    const handle = screen.getAllByRole('separator', { name: /ridimensiona barra laterale/i }).find(el => el.getAttribute('aria-orientation') === 'vertical')!;
    handle.focus();
    
    // Change width via keyboard
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    
    // Wait for debounce (300ms) + assertion
    await waitFor(() => {
      const saved = localStorage.getItem('subbuteo_panel_width_desktop');
      expect(saved).toBe('288'); // 280 + 8
    }, { timeout: 500 });
  });

  // Note: localStorage restore tests are covered in E2E tests where
  // full page reloads can be simulated properly.

  it('updates aria-valuenow when width changes via keyboard', async () => {
    localStorage.clear();
    render(<App />);
    
    const handle = screen.getAllByRole('separator', { name: /ridimensiona barra laterale/i }).find(el => el.getAttribute('aria-orientation') === 'vertical')!;
    handle.focus();
    
    expect(handle.getAttribute('aria-valuenow')).toBe('280');
    
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    
    await waitFor(() => {
      expect(handle.getAttribute('aria-valuenow')).toBe('288');
    });
  });

  it('collapse toggle button still works alongside resize handle', async () => {
    localStorage.clear();
    render(<App />);
    
    const toggleButton = screen.getByLabelText(/sidebar/i);
    
    // Toggle to collapsed
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      const width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
      expect(width.trim()).toBe('80px');
    });
    
    // Toggle back to expanded (should restore previous width)
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      const width = getComputedStyle(document.documentElement).getPropertyValue('--operator-rail-width');
      expect(width.trim()).toBe('280px');
    });
  });
});
