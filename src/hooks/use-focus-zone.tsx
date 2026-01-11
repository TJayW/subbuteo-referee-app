/**
 * Focus Zone Hook
 * 
 * Individual zones use this hook to:
 * - Register with the global focus manager
 * - Get notified when zone becomes active
 * - Manage internal roving tabindex
 * - Remember last focused element
 */

import { useEffect, useRef, useCallback } from 'react';
import { useConsoleFocus, type ZoneId, type ZoneConfig } from './use-console-focus-manager';

interface UseFocusZoneOptions {
  id: ZoneId;
  primarySelector: string;
  label: string;
  onEnter?: () => void;
  onExit?: () => void;
}

export const useFocusZone = (options: UseFocusZoneOptions) => {
  const zoneRef = useRef<HTMLElement>(null);
  const { registerZone, unregisterZone, activeZone, setActiveZone, rememberFocus } = useConsoleFocus();

  const isActive = activeZone === options.id;

  // Register zone on mount
  useEffect(() => {
    const config: ZoneConfig = {
      id: options.id,
      ref: zoneRef as React.RefObject<HTMLElement>,
      primarySelector: options.primarySelector,
      label: options.label,
      onEnter: options.onEnter,
      onExit: options.onExit
    };

    registerZone(config);

    return () => {
      unregisterZone(options.id);
    };
  }, [options.id, options.primarySelector, options.label, options.onEnter, options.onExit, registerZone, unregisterZone]);

  // Handler to remember focus within this zone
  const handleFocusWithin = useCallback((e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target && zoneRef.current?.contains(target)) {
      rememberFocus(options.id, target);
      // If this zone wasn't active, make it active
      if (!isActive) {
        setActiveZone(options.id);
      }
    }
  }, [options.id, rememberFocus, isActive, setActiveZone]);

  return {
    zoneRef,
    isActive,
    handleFocusWithin,
    setActiveZone: () => setActiveZone(options.id)
  };
};
