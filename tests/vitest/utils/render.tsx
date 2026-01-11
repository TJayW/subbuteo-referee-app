/**
 * Test Render Utilities
 * 
 * Provides consistent render helpers with required providers.
 * All component tests should use renderApp() instead of bare render().
 */

import { render, type RenderOptions } from '@testing-library/react';
import { ConsoleFocusProvider } from '@/hooks/use-console-focus-manager';
import type { ReactElement } from 'react';

/**
 * Render app with all required providers
 * 
 * Usage:
 * ```tsx
 * import { renderApp } from '../utils/render';
 * 
 * test('my test', () => {
 *   renderApp(<MyComponent />);
 *   // assertions...
 * });
 * ```
 */
export function renderApp(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ConsoleFocusProvider>
        {children}
      </ConsoleFocusProvider>
    ),
    ...options,
  });
}

/**
 * Set viewport mode for responsive testing
 * 
 * Must be called BEFORE render to affect matchMedia.
 * 
 * Usage:
 * ```tsx
 * setViewport('mobile');
 * renderApp(<App />);
 * ```
 */
export function setViewport(mode: 'desktop' | 'tablet' | 'mobile'): void {
  const widths = {
    desktop: 1280,
    tablet: 800,
    mobile: 375,
  };

  const width = widths[mode];

  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 800,
  });

  const mediaQueries: Record<string, boolean> = {
    '(min-width: 1024px)': width >= 1024,
    '(min-width: 768px)': width >= 768,
  };

  window.matchMedia = ((query: string) => ({
    matches: mediaQueries[query] ?? false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  })) as typeof window.matchMedia;
}
