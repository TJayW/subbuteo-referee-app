/**
 * Vitest Setup - Single source of test environment configuration
 * 
 * Responsibilities:
 * - Configure jsdom environment
 * - Mock browser APIs (ResizeObserver, matchMedia)
 * - Register cleanup hooks
 * - Import jest-dom matchers
 */

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver (not available in jsdom)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia (default: desktop viewport)
// Use setViewport() helper in tests to override
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('min-width: 1024px'), // Default: desktop
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
});
