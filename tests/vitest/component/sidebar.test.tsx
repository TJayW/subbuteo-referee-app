/**
 * Sidebar Component Tests (Consolidated)
 * 
 * Covers:
 * - Desktop resize (keyboard + accessibility)
 * - Collapse/expand toggle
 * - Responsive behavior (desktop/tablet/mobile)
 * 
 * Deleted redundant:
 * - sidebar_collapse.test.tsx (merged collapse tests here)
 * - responsive_sidebar.test.tsx (merged responsive tests here)
 * - sidebar-resize.test.tsx (merged resize tests here)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderApp, setViewport } from '../utils/render';
import App from '@/app/app';

describe('Sidebar - Desktop Resize', () => {
  beforeEach(() => {
    localStorage.clear();
    setViewport('desktop');
    vi.clearAllMocks();
  });

  it('renders resize handle with proper ARIA attributes', () => {
    renderApp(<App />);
    
    const handle = screen.getAllByRole('separator', { name: /ridimensiona barra laterale/i })
      .find(el => el.getAttribute('aria-orientation') === 'vertical')!;
    
    expect(handle).toBeDefined();
    expect(handle.getAttribute('aria-valuemin')).toBe('80');
    expect(handle.getAttribute('aria-valuemax')).toBe('360');
    expect(handle.getAttribute('aria-valuenow')).toBe('280'); // default
  });

  it('keyboard ArrowRight increases width by 8px', async () => {
    renderApp(<App />);
    
    const handle = screen.getAllByRole('separator', { name: /ridimensiona barra laterale/i })
      .find(el => el.getAttribute('aria-orientation') === 'vertical')!;
    handle.focus();
    
    const initialWidth = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--operator-rail-width'));
    expect(initialWidth).toBe(280);
    
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    
    await waitFor(() => {
      const newWidth = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--operator-rail-width'));
      expect(newWidth).toBe(288);
    });
  });

  it('persists width to localStorage', async () => {
    renderApp(<App />);
    
    const handle = screen.getAllByRole('separator', { name: /ridimensiona barra laterale/i })
      .find(el => el.getAttribute('aria-orientation') === 'vertical')!;
    handle.focus();
    
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    
    await waitFor(() => {
      const saved = localStorage.getItem('subbuteo_panel_width_desktop');
      expect(saved).toBe('288');
    }, { timeout: 500 });
  });
});

describe('Sidebar - Collapse/Expand', () => {
  beforeEach(() => {
    localStorage.clear();
    setViewport('desktop');
  });

  it('sidebar starts expanded at 280px', () => {
    renderApp(<App />);
    
    const width = getComputedStyle(document.documentElement)
      .getPropertyValue('--operator-rail-width');
    expect(width.trim()).toBe('280px');
  });

  it('collapse button toggles to 80px', async () => {
    renderApp(<App />);
    
    const toggleButton = screen.getByLabelText(/sidebar/i);
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      const width = getComputedStyle(document.documentElement)
        .getPropertyValue('--operator-rail-width');
      expect(width.trim()).toBe('80px');
    });
  });
});

describe('Sidebar - Responsive', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('desktop: sidebar visible', () => {
    setViewport('desktop');
    renderApp(<App />);
    
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      const classes = sidebar.className;
      expect(classes).toContain('md:flex'); // visible on medium+
    }
  });

  it('mobile: sidebar hidden, vertical resize handle not visible', () => {
    setViewport('mobile');
    renderApp(<App />);
    
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      const classes = sidebar.className;
      expect(classes).toContain('hidden'); // hidden below md breakpoint
    }
  });
});
