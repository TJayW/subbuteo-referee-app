/**
 * Console Focus Manager
 * 
 * Global keyboard navigation system for the operator console.
 * Manages focus zones, inter-zone navigation, and ensures exactly ONE focus trap at a time.
 * 
 * Architecture:
 * - ConsoleFocusProvider wraps entire app
 * - Zones register themselves on mount
 * - Ctrl+Arrow keys navigate between zones
 * - Each zone manages its own internal roving focus
 * - Modal override: only one trap active
 */

import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import logger from '@/utils/logger';

// Zone identifiers (order matters for navigation)
export type ZoneId = 'topbar' | 'eventlog' | 'teamcard' | 'timer';

export const ZONE_ORDER: ZoneId[] = ['topbar', 'eventlog', 'teamcard', 'timer'];

export interface ZoneConfig {
  id: ZoneId;
  ref: React.RefObject<HTMLElement>;
  primarySelector: string; // CSS selector for primary control
  label: string; // For screen readers
  onEnter?: () => void;
  onExit?: () => void;
}

interface FocusHistory {
  element: HTMLElement | null;
  timestamp: number;
}

interface ConsoleFocusContextValue {
  // Zone registration
  registerZone: (config: ZoneConfig) => void;
  unregisterZone: (id: ZoneId) => void;
  
  // Active zone management
  activeZone: ZoneId | null;
  setActiveZone: (id: ZoneId) => void;
  
  // Focus history (per zone)
  rememberFocus: (zoneId: ZoneId, element: HTMLElement) => void;
  restoreFocus: (zoneId: ZoneId) => boolean;
  
  // Modal override
  modalOpen: boolean;
  setModalOpen: (open: boolean, opener?: HTMLElement) => void;
}

const ConsoleFocusContext = createContext<ConsoleFocusContextValue | null>(null);

export const useConsoleFocus = () => {
  const context = useContext(ConsoleFocusContext);
  if (!context) {
    throw new Error('useConsoleFocus must be used within ConsoleFocusProvider');
  }
  return context;
};

export const ConsoleFocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zones] = useState<Map<ZoneId, ZoneConfig>>(new Map());
  const [activeZone, setActiveZoneState] = useState<ZoneId | null>(null);
  const [modalOpen, setModalOpenState] = useState(false);
  const focusHistory = useRef<Map<ZoneId, FocusHistory>>(new Map());
  const modalOpener = useRef<HTMLElement | null>(null);

  const registerZone = useCallback((config: ZoneConfig) => {
    zones.set(config.id, config);
  }, [zones]);

  const unregisterZone = useCallback((id: ZoneId) => {
    zones.delete(id);
    focusHistory.current.delete(id);
  }, [zones]);

  const setActiveZone = useCallback((id: ZoneId) => {
    const config = zones.get(id);
    if (!config) return;

    // Exit current zone
    if (activeZone && activeZone !== id) {
      const prevConfig = zones.get(activeZone);
      prevConfig?.onExit?.();
    }

    setActiveZoneState(id);
    config.onEnter?.();

    // Try to restore previous focus, otherwise use primary
    if (!restoreFocus(id)) {
      focusPrimary(id);
    }
  }, [activeZone, zones]);

  const rememberFocus = useCallback((zoneId: ZoneId, element: HTMLElement) => {
    focusHistory.current.set(zoneId, {
      element,
      timestamp: Date.now()
    });
  }, []);

  const restoreFocus = useCallback((zoneId: ZoneId): boolean => {
    const history = focusHistory.current.get(zoneId);
    if (history?.element && document.contains(history.element)) {
      history.element.focus();
      return true;
    }
    return false;
  }, []);

  const focusPrimary = useCallback((zoneId: ZoneId) => {
    const config = zones.get(zoneId);
    if (!config?.ref.current) {
      logger.warn(`[FocusManager] Cannot focus primary for zone "${zoneId}": zone ref not available`);
      return;
    }

    const primary = config.ref.current.querySelector(config.primarySelector) as HTMLElement;
    if (primary) {
      primary.focus();
      rememberFocus(zoneId, primary);
    } else {
      logger.warn(`[FocusManager] Primary control not found for zone "${zoneId}" with selector "${config.primarySelector}"`);
      
      // Fallback: focus first focusable element in zone
      const firstFocusable = config.ref.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (firstFocusable) {
        console.info(`[FocusManager] Falling back to first focusable element in zone "${zoneId}"`);
        firstFocusable.focus();
        rememberFocus(zoneId, firstFocusable);
      }
    }
  }, [zones, rememberFocus]);

  const setModalOpen = useCallback((open: boolean, opener?: HTMLElement) => {
    setModalOpenState(open);
    if (open && opener) {
      modalOpener.current = opener;
    } else if (!open && modalOpener.current) {
      // Restore focus to opener
      modalOpener.current.focus();
      modalOpener.current = null;
    }
  }, []);

  // Global keyboard handler for zone navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if modal is open
      if (modalOpen) return;

      // Ctrl+ArrowDown: Next zone
      if (e.ctrlKey && e.key === 'ArrowDown') {
        e.preventDefault();
        if (!activeZone) {
          setActiveZone(ZONE_ORDER[0]);
          return;
        }
        const currentIndex = ZONE_ORDER.indexOf(activeZone);
        const nextIndex = (currentIndex + 1) % ZONE_ORDER.length;
        setActiveZone(ZONE_ORDER[nextIndex]);
      }

      // Ctrl+ArrowUp: Previous zone
      if (e.ctrlKey && e.key === 'ArrowUp') {
        e.preventDefault();
        if (!activeZone) {
          setActiveZone(ZONE_ORDER[ZONE_ORDER.length - 1]);
          return;
        }
        const currentIndex = ZONE_ORDER.indexOf(activeZone);
        const prevIndex = (currentIndex - 1 + ZONE_ORDER.length) % ZONE_ORDER.length;
        setActiveZone(ZONE_ORDER[prevIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeZone, modalOpen, setActiveZone]);

  const value: ConsoleFocusContextValue = {
    registerZone,
    unregisterZone,
    activeZone,
    setActiveZone,
    rememberFocus,
    restoreFocus,
    modalOpen,
    setModalOpen
  };

  return (
    <ConsoleFocusContext.Provider value={value}>
      {children}
    </ConsoleFocusContext.Provider>
  );
};
