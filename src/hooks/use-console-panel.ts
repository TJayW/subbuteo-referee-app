/**
 * useConsolePanel hook
 * Manages operator console panel state, width persistence, and responsive behavior
 */

import { useState, useEffect, useRef } from 'react';
import { ANIMATION_TIMINGS, PANEL_RESIZE } from '@/constants/layout';
import { STORAGE_KEYS } from '@/constants/storage';
import { applySnap, isCollapsed as isWidthCollapsed } from '@/utils/console-panel-resize';
import {
  getLayoutMode,
  clampWidthToBreakpoint,
  getStorageKeyForMode,
  createBreakpointListener,
  type LayoutMode,
} from '@/utils/responsive-layout';

export interface UseConsolePanelReturn {
  layoutMode: LayoutMode;
  panelWidth: number;
  isPanelCollapsed: boolean;
  togglePanelCollapse: () => void;
  handleWidthChange: (newWidth: number) => void;
  handleResizeDragEnd: (finalWidth: number) => void;
}

export function useConsolePanel(): UseConsolePanelReturn {
  // Detect layout mode (desktop/tablet/mobile)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => getLayoutMode());

  useEffect(() => {
    const cleanup = createBreakpointListener((mode) => {
      setLayoutMode(mode);
    });
    return cleanup;
  }, []);

  // Panel width state with persistence (per breakpoint)
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    try {
      const mode = getLayoutMode();
      const storageKey = getStorageKeyForMode(mode);
      
      if (!storageKey) {
        // Mobile: no panel width
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

  // Derived: is panel collapsed?
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

  // Persist panel width (debounced, per breakpoint)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const storageKey = getStorageKeyForMode(layoutMode);
        
        if (storageKey) {
          // Only persist for desktop/tablet, not mobile
          localStorage.setItem(storageKey, String(panelWidth));
        }
        
        // Sync legacy boolean key for compatibility
        localStorage.setItem(STORAGE_KEYS.UI_PANEL_COLLAPSED, String(isPanelCollapsed));
      } catch {
        // Silently fail on localStorage error
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [panelWidth, layoutMode, isPanelCollapsed]);

  // Add CSS variables for operator rail width and transition
  useEffect(() => {
    document.documentElement.style.setProperty('--operator-rail-width', `${panelWidth}px`);
    document.documentElement.style.setProperty('--operator-rail-transition', `${ANIMATION_TIMINGS.PANEL_TRANSITION_MS}ms ${ANIMATION_TIMINGS.PANEL_TRANSITION_EASING}`);
  }, [panelWidth]);

  // Toggle panel collapse/expand
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

  // Handle width change from resize handle
  const handleWidthChange = (newWidth: number) => {
    // Clamp to current breakpoint constraints
    const clampedWidth = clampWidthToBreakpoint(newWidth, layoutMode);
    setPanelWidth(clampedWidth);
  };

  // Handle drag end (apply snapping)
  const handleResizeDragEnd = (finalWidth: number) => {
    const snappedWidth = applySnap(finalWidth, PANEL_RESIZE.SNAP_POINTS, PANEL_RESIZE.SNAP_THRESHOLD);
    setPanelWidth(snappedWidth);
  };

  // Keyboard shortcut: Ctrl+\ (Cmd+\ on Mac) to toggle panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+\ or Cmd+\ to toggle panel
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        togglePanelCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePanelCollapse]);

  return {
    layoutMode,
    panelWidth,
    isPanelCollapsed,
    togglePanelCollapse,
    handleWidthChange,
    handleResizeDragEnd,
  };
}
