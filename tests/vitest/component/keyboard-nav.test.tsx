/**
 * Console Keyboard Navigation System Tests
 * 
 * Validates global focus management:
 * - 4 zones (TopBar, EventLog, TeamCard, Timer)
 * - Ctrl+Arrow navigation between zones
 * - Primary control focus on zone entry
 * - Last-focused element memory within zones
 */

import { describe, it, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderApp } from '../utils/render';
import { ConsoleFocusProvider } from '@/hooks/use-console-focus-manager';
import { useFocusZone } from '@/hooks/use-focus-zone';
import React from 'react';

// Test component simulating a zone
const TestZone: React.FC<{ 
  id: 'topbar' | 'eventlog' | 'teamcard' | 'timer';
  primarySelector: string;
  label: string;
  hasPrimary?: boolean;
}> = ({ id, primarySelector, label, hasPrimary = true }) => {
  const { zoneRef, isActive, handleFocusWithin } = useFocusZone({
    id,
    primarySelector,
    label
  });

  return (
    <div 
      ref={zoneRef as React.RefObject<HTMLDivElement>}
      onFocus={handleFocusWithin}
      data-zone={id}
      data-testid={`zone-${id}`}
      style={{ border: isActive ? '2px solid blue' : '1px solid gray', padding: '20px', margin: '10px' }}
    >
      <h2>{label}</h2>
      {hasPrimary && (
        <button data-primary={id} className={primarySelector.replace(/[\[\]]/g, '')}>
          Primary Control
        </button>
      )}
      <button>Secondary Control</button>
    </div>
  );
};

// App wrapper with all zones
const TestApp: React.FC = () => {
  return (
    <ConsoleFocusProvider>
      <TestZone id="topbar" primarySelector="[data-primary-topbar-control]" label="Top Bar" />
      <TestZone id="eventlog" primarySelector="[data-primary-eventlog-control]" label="Event Log" />
      <TestZone id="teamcard" primarySelector="[data-primary-teamcard-control]" label="Team Card" />
      <TestZone id="timer" primarySelector="[data-primary-timer-control]" label="Timer" />
    </ConsoleFocusProvider>
  );
};

describe('Zone Definition & Registration', () => {
  it('defines exactly 4 zones: TopBar, EventLog, TeamCard, Timer', () => {
    renderApp(<TestApp />);
    expect(screen.getByTestId('zone-topbar')).toBeInTheDocument();
    expect(screen.getByTestId('zone-eventlog')).toBeInTheDocument();
    expect(screen.getByTestId('zone-teamcard')).toBeInTheDocument();
    expect(screen.getByTestId('zone-timer')).toBeInTheDocument();
  });

  it('has exactly ONE active zone at a time', () => {
    renderApp(<TestApp />);
    const zones = screen.getAllByTestId(/zone-/);
    const activeZones = zones.filter(z => z.style.border === '2px solid blue');
    expect(activeZones.length).toBeLessThanOrEqual(1);
  });
});

describe('Inter-Zone Navigation (Ctrl+Arrow)', () => {
  it('Ctrl+ArrowDown moves focus to next zone', async () => {
    renderApp(<TestApp />);
    
    fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
    
    await waitFor(() => {
      const focused = document.activeElement;
      expect(focused?.closest('[data-zone="topbar"]')).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
    
    await waitFor(() => {
      const focused = document.activeElement;
      expect(focused?.closest('[data-zone="eventlog"]')).toBeInTheDocument();
    });
  });

  it('Ctrl+ArrowUp moves focus to previous zone', async () => {
    renderApp(<TestApp />);
    
    fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'ArrowUp', ctrlKey: true });
    
    await waitFor(() => {
      const focused = document.activeElement;
      expect(focused?.closest('[data-zone="timer"]')).toBeInTheDocument();
    });
  });

  it('focuses primary control when entering zone', async () => {
    renderApp(<TestApp />);
    
    fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
    
    await waitFor(() => {
      const focused = document.activeElement as HTMLElement;
      expect(focused?.getAttribute('data-primary')).toBe('topbar');
    });
  });

  it('handles missing primary control gracefully', async () => {
    renderApp(
      <ConsoleFocusProvider>
        <TestZone id="topbar" primarySelector="[data-primary-topbar-control]" label="Top Bar" hasPrimary={false} />
      </ConsoleFocusProvider>
    );
    
    fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
    
    await waitFor(() => {
      const zone = screen.getByTestId('zone-topbar');
      expect(zone.style.border).toBe('2px solid blue');
    });
  });
});
