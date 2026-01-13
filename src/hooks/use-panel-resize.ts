/**
 * usePanelResize Hook
 * Manages sidebar panel width with responsive breakpoints and persistence
 * 
 * RESPONSIBILITY: Panel resize logic, localStorage persistence, breakpoint handling
 * Separates concerns from AppShell (Single Responsibility Principle)
 */

import { useState, useEffect, useRef } from 'react';
import { ANIMATION_TIMINGS, PANEL_RESIZE } from '@/constants/layout';
import { STORAGE_KEYS } from '@/constants/storage';
import { isCollapsed as isWidthCollapsed } from '@/utils/console-panel-resize';
import {
  getLayoutMode,
  clampWidthToBreakpoint,
  getStorageKeyForMode,
  createBreakpointListener,
  type LayoutMode,
} from '@/utils/responsive-layout';

export interface UsePanelResizeReturn {
  layoutMode: LayoutMode;
  panelWidth: number;
  isPanelCollapsed: boolean;
  setPanelWidth: (width: number) => void;
  togglePanelCollapse: () => void;
}

export function usePanelResize(): UsePanelResizeReturn {
  // Detect layout mode (desktop/tablet/mobile)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => getLayoutMode());

  useEffect(() => {
    const cleanup = createBreakpointListener((mode) => {
      setLayoutMode(mode);
    });
    return cleanup;
  }, []);

  // Sidebar width state with persistence (per breakpoint)
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    try {
      const mode = getLayoutMode();
      const storageKey = getStorageKeyForMode(mode);
      
      if (!storageKey) {
        // Mobile: no sidebar width
        return 0;
      }
      
      const stored = localStorage.getItem(storageKey);
      const parsedWidth = stored ? parseInt(stored, 10) : PANEL_RESIZE.DEFAULT_WIDTH;
      
      // Clamp to breakpoint-specific range
      return clampWidthToBreakpoint(parsedWidth, mode);
    } catch {
      return PANEL_RESIZE.DEFAULT_WIDTH;
    }
  });

  // Derived: is sidebar collapsed?
  const isPanelCollapsed = isWidthCollapsed(panelWidth, PANEL_RESIZE.COLLAPSE_THRESHOLD);

  // Track previous expanded width in memory (for immediate toggle without waiting for storage)
  const prevExpandedWidthRef = useRef<number>(
    panelWidth > PANEL_RESIZE.COLLAPSE_THRESHOLD ? panelWidth : PANEL_RESIZE.DEFAULT_WIDTH
  );

  // Update prevExpandedWidth when width changes (if not collapsed)
  useEffect(() => {
    if (panelWidth > PANEL_RESIZE.COLLAPSE_THRESHOLD) {
      prevExpandedWidthRef.current = panelWidth;
    }
  }, [panelWidth]);

  // Persist sidebar width (debounced, per breakpoint)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const storageKey = getStorageKeyForMode(layoutMode);
        
        if (storageKey) {
          // Only persist for desktop/tablet, not mobile
          localStorage.setItem(storageKey, String(panelWidth));
        }
        
        // Sync legacy boolean key for compatibility
        localStorage.setItem(STORAGE_KEYS.UI_SIDEBAR_COLLAPSED, String(isPanelCollapsed));
      } catch {
        // Silently fail on localStorage error
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [panelWidth, layoutMode, isPanelCollapsed]);

  // Add CSS variables for operator rail width and transition
  useEffect(() => {
    document.documentElement.style.setProperty('--operator-rail-width', `${panelWidth}px`);
    document.documentElement.style.setProperty(
      '--operator-rail-transition',
      `${ANIMATION_TIMINGS.SIDEBAR_TRANSITION_MS}ms ${ANIMATION_TIMINGS.SIDEBAR_TRANSITION_EASING}`
    );
  }, [panelWidth]);

  // Toggle sidebar collapse/expand
  const togglePanelCollapse = () => {
    if (isPanelCollapsed) {
      // Expand: restore from memory first (immediate), then storage (fallback)
      const memoryWidth = prevExpandedWidthRef.current;
      if (memoryWidth > PANEL_RESIZE.COLLAPSE_THRESHOLD) {
        setPanelWidth(memoryWidth);
      } else {
        // Fallback to storage
        try {
          const storageKey = getStorageKeyForMode(layoutMode);
          const stored = storageKey ? localStorage.getItem(storageKey) : null;
          const restoredWidth = stored ? parseInt(stored, 10) : PANEL_RESIZE.DEFAULT_WIDTH;
          
          if (restoredWidth > PANEL_RESIZE.COLLAPSE_THRESHOLD) {
            setPanelWidth(restoredWidth);
            prevExpandedWidthRef.current = restoredWidth;
          } else {
            setPanelWidth(PANEL_RESIZE.DEFAULT_WIDTH);
            prevExpandedWidthRef.current = PANEL_RESIZE.DEFAULT_WIDTH;
          }
        } catch {
          setPanelWidth(PANEL_RESIZE.DEFAULT_WIDTH);
          prevExpandedWidthRef.current = PANEL_RESIZE.DEFAULT_WIDTH;
        }
      }
    } else {
      // Collapse to min width
      setPanelWidth(PANEL_RESIZE.MIN_WIDTH);
    }
  };

  return {
    layoutMode,
    panelWidth,
    isPanelCollapsed,
    setPanelWidth,
    togglePanelCollapse,
  };
}
