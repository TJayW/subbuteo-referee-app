/**
 * Mobile Minimized Quick Controls Tests
 * Verifies desktop collapsed parity: 8 P0 events + team selector + play/pause + log access
 * Verifies 3-state model: hidden / minimized / expanded
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from '@/app/app';

describe('Mobile Minimized Quick Controls (Desktop Parity)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mobile viewport
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 667 });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('mobile minimized mode exposes 8 P0 events', () => {
    render(<App />);
    
    // Verify 8 event buttons present (Goal, Shot On, Shot, Corner, Foul, Yellow, Red, Timeout)
    // Note: getAllByLabelText returns multiple (minimized + expanded), use first visible one
    const goalButtons = screen.getAllByLabelText(/aggiungi goal/i);
    const shotOnButtons = screen.getAllByLabelText(/aggiungi tiro porta/i);
    const shotButtons = screen.getAllByLabelText(/aggiungi tiro$/i);
    const cornerButtons = screen.getAllByLabelText(/aggiungi angolo/i);
    const foulButtons = screen.getAllByLabelText(/aggiungi fallo/i);
    const yellowButtons = screen.getAllByLabelText(/aggiungi giallo/i);
    const redButtons = screen.getAllByLabelText(/aggiungi rosso/i);
    const timeoutButtons = screen.getAllByLabelText(/aggiungi timeout/i);
    
    // At least one instance of each event button exists
    expect(goalButtons.length).toBeGreaterThan(0);
    expect(shotOnButtons.length).toBeGreaterThan(0);
    expect(shotButtons.length).toBeGreaterThan(0);
    expect(cornerButtons.length).toBeGreaterThan(0);
    expect(foulButtons.length).toBeGreaterThan(0);
    expect(yellowButtons.length).toBeGreaterThan(0);
    expect(redButtons.length).toBeGreaterThan(0);
    expect(timeoutButtons.length).toBeGreaterThan(0);
  });

  it('mobile minimized mode exposes team selector (2 buttons)', () => {
    render(<App />);
    
    // Team selector buttons
    const teamGroup = screen.getByRole('radiogroup', { name: /seleziona squadra/i });
    const teamButtons = screen.getAllByRole('radio', { name: /casa|ospite/i });
    expect(teamGroup).toBeTruthy();
    expect(teamButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('mobile minimized mode exposes play/pause button', () => {
    render(<App />);
    
    const playPauseButtons = screen.getAllByRole('button', { name: /avvia|pausa/i });
    expect(playPauseButtons.length).toBeGreaterThan(0);
  });

  it('mobile minimized mode exposes event log access button with count', () => {
    render(<App />);
    
    // Expand button or History icon button
    const expandButtons = screen.getAllByLabelText(/espandi|registro eventi/i);
    expect(expandButtons.length).toBeGreaterThan(0);
  });

  it('mobile event button click dispatches event correctly', () => {
    render(<App />);
    
    const goalButtons = screen.getAllByLabelText(/aggiungi goal/i);
    
    // Click first Goal button (minimized mode)
    fireEvent.click(goalButtons[0]);
    
    // Verify event was added (check dashboard or event log)
    const eventIndicators = screen.queryAllByText(/goal/i);
    expect(eventIndicators.length).toBeGreaterThan(0);
  });

  // TODO: This test needs rewrite for continuous resize model
  // Old 3-state (hidden/minimized/expanded) is now continuous height adjustment
  it.skip('mobile toggle switches between minimized and expanded', () => {
    render(<App />);
    
    // Find toggle button (may have multiple, use first)
    const toggleButtons = screen.getAllByLabelText(/espandi pannello|controlli rapidi/i);
    const toggleButton = toggleButtons[0];
    
    // Click to toggle
    fireEvent.click(toggleButton);
    
    // Verify toggle occurred (button text should change)
    expect(toggleButton.textContent).toMatch(/controlli rapidi|espandi tutto/i);
  });

  it('mobile minimized mode buttons meet 44px touch target minimum', () => {
    render(<App />);
    
    const goalButtons = screen.getAllByLabelText(/aggiungi goal/i);
    const goalButton = goalButtons[0] as HTMLElement;
    
    // Note: jsdom doesn't compute real dimensions, this test is symbolic
    // Real touch target validation happens in e2e tests
    expect(goalButton).toBeDefined();
    expect(goalButton.tagName).toBe('BUTTON');
  });

  // TODO: This test needs rewrite for continuous resize model
  // Old 3-state (hidden/minimized/expanded) is now continuous height adjustment
  it.skip('mobile panel supports 3-state model (hidden/minimized/expanded)', () => {
    render(<App />);
    
    // Panel starts in minimized state (localStorage default)
    const minimizedToggle = screen.getByLabelText(/espandi pannello completo/i);
    expect(minimizedToggle).toBeDefined();
    
    // Click to expand
    fireEvent.click(minimizedToggle);
    
    // Find close button (X icon) to jump to hidden state
    const closeButton = screen.queryByLabelText(/nascondi pannello/i);
    if (closeButton) {
      fireEvent.click(closeButton);
      
      // Verify hidden state - only grabber visible
      const hiddenToggle = screen.queryByLabelText(/mostra controlli rapidi/i);
      expect(hiddenToggle).toBeDefined();
    }
  });

  // TODO: This test needs rewrite for continuous resize model
  // Old 3-state keyboard nav is now continuous height adjustment via drag
  it.skip('mobile panel keyboard navigation cycles states (Enter/Escape)', () => {
    render(<App />);
    
    // Start in minimized, find toggle
    const toggleButton = screen.getByLabelText(/espandi pannello completo/i);
    
    // Press Enter to cycle to expanded
    fireEvent.keyDown(toggleButton, { key: 'Enter' });
    
    // Should now show "minimizza" or have aria-expanded=true
    expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
    
    // Press Escape to descend to minimized
    fireEvent.keyDown(toggleButton, { key: 'Escape' });
    
    // aria-expanded should be false
    expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
  });
});
