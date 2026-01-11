/**
 * P0 Regression Guardrails (R1-R4)
 * 
 * Critical invariants:
 * - R1: Event buttons dispatch and update event log
 * - R2: Global undo/redo never shows event status bar (scope separation)
 * - R3/R4: Layout structure avoids fixed overlay + offset hacks
 * - P0: Event cursor undo shows ONLY in-card event status
 * - P0: Status clusters display position without delta count
 * - P0: Undo/Redo buttons maintain fixed right position
 */

import { describe, it, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderApp } from '../utils/render';
import App from '@/app/app';

describe('P0 Regression Guardrails', () => {
  it('R1: event buttons dispatch and update event log', () => {
    renderApp(<App />);

    const goalButtons = screen.getAllByLabelText(/Aggiungi Goal/i);
    fireEvent.click(goalButtons[0]);

    expect(screen.queryByText(/Nessun evento registrato/i)).toBeNull();
  });

  it('R2: global undo/redo never shows event status bar', async () => {
    renderApp(<App />);

    expect(screen.getAllByTestId('global-status-surface')).toHaveLength(1);
    expect(screen.getAllByTestId('event-status-surface')).toHaveLength(1);

    const awayTeamToggle = screen.getAllByLabelText(/Seleziona Ospite/i)[0];
    fireEvent.click(awayTeamToggle);

    const undoButtons = screen.getAllByTitle(/Annulla Globale/i);
    fireEvent.click(undoButtons[0]);

    await waitFor(() => {
      const globalStatus = screen.getByTestId('global-status-surface');
      expect(globalStatus.getAttribute('data-active')).toBe('true');
      expect(globalStatus.textContent).toMatch(/\d+\/\d+/);
    });

    expect(screen.getByTestId('event-status-surface').getAttribute('data-active')).toBe('false');

    const globalStatus = screen.getByTestId('global-status-surface');
    expect(globalStatus.querySelector('button')).toBeTruthy();

    expect(screen.getByTestId('event-status-surface').closest('[data-testid="event-log-card"]')).toBeTruthy();

    const redoButtons = screen.getAllByTitle(/Ripeti Globale/i);
    fireEvent.click(redoButtons[0]);

    await waitFor(() => {
      const globalStatus = screen.getByTestId('global-status-surface');
      expect(globalStatus.getAttribute('data-active')).toBe('false');
      expect(globalStatus.textContent).toMatch(/LIVE/);
    });

    expect(screen.getByTestId('event-status-surface').getAttribute('data-active')).toBe('false');
  });

  it('R3/R4: layout structure avoids fixed overlay + offset hacks', () => {
    renderApp(<App />);

    const sidebar = document.querySelector('aside');
    expect(sidebar).toBeTruthy();
    expect(sidebar?.className).not.toMatch(/\bfixed\b/);

    const main = document.querySelector('main');
    expect(main).toBeTruthy();
    expect(main?.className).not.toMatch(/operator-rail-offset/);

    expect(screen.getAllByTestId('global-status-surface')).toHaveLength(1);
  });

  it('P0: event cursor undo shows ONLY in-card event status', () => {
    renderApp(<App />);

    const goalButtons = screen.getAllByLabelText(/Aggiungi Goal/i);
    fireEvent.click(goalButtons[0]);
    fireEvent.click(goalButtons[0]);

    const eventUndoButtons = screen.getAllByLabelText(/Annulla ultimo evento/i);
    fireEvent.click(eventUndoButtons[0]);

    expect(screen.getByTestId('event-status-surface').getAttribute('data-active')).toBe('true');
    expect(screen.getByTestId('global-status-surface').getAttribute('data-active')).toBe('false');
    expect(screen.getByTestId('event-status-surface').closest('[data-testid="event-log-card"]')).toBeTruthy();
  });

  it('P0: status clusters display position without delta count', async () => {
    renderApp(<App />);

    const awayTeamToggle = screen.getAllByLabelText(/Seleziona Ospite/i)[0];
    fireEvent.click(awayTeamToggle);

    const globalUndoButtons = screen.getAllByTitle(/Annulla Globale/i);
    fireEvent.click(globalUndoButtons[0]);

    await waitFor(() => {
      const globalStatus = screen.getByTestId('global-status-surface');
      expect(globalStatus.textContent).toMatch(/\d+\/\d+/);
      expect(globalStatus.textContent).not.toMatch(/\(−\d+/);
      expect(globalStatus.textContent).not.toMatch(/azioni?\)/);
    });

    const goalButtons = screen.getAllByLabelText(/Aggiungi Goal/i);
    fireEvent.click(goalButtons[0]);
    fireEvent.click(goalButtons[0]);

    const eventUndoButtons = screen.getAllByLabelText(/Annulla ultimo evento/i);
    fireEvent.click(eventUndoButtons[0]);

    await waitFor(() => {
      const eventStatus = screen.getByTestId('event-status-surface');
      expect(eventStatus.textContent).toMatch(/\d+\/\d+/);
      expect(eventStatus.textContent).not.toMatch(/\(−\d+/);
      expect(eventStatus.textContent).not.toMatch(/azioni?\)/);
    });
  });
});
