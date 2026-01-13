/**
 * useKeyboardShortcuts Hook
 * Centralizes all keyboard shortcut handlers
 * 
 * RESPONSIBILITY: Keyboard event handling and shortcut coordination
 * Separates concerns from AppShell (Single Responsibility Principle)
 */

import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  globalHistory: {
    canUndo: boolean;
    canRedo: boolean;
    isTimeTraveling: boolean;
    undo: () => void;
    redo: () => void;
  };
  eventHistory: {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
  };
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
}

export function useKeyboardShortcuts({
  globalHistory,
  eventHistory,
  onToggleSidebar,
  onOpenCommandPalette,
}: UseKeyboardShortcutsProps): void {
  // Keyboard shortcut: Ctrl+\ (Cmd+\ on Mac) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+\ or Cmd+\ to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        onToggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleSidebar]);

  // Main keyboard shortcuts (§D.3 P1.1, §H P2.3 Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;
      
      // Cmd+K / Ctrl+K: Open command palette
      if (mod && e.key === 'k') {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }
      
      // Cmd+Z / Ctrl+Z: Global undo
      if (mod && e.key === 'z' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        if (globalHistory.canUndo) {
          globalHistory.undo();
        }
        return;
      }
      
      // Cmd+Shift+Z / Ctrl+Shift+Z: Global redo
      if (mod && e.key === 'z' && e.shiftKey && !e.altKey) {
        e.preventDefault();
        if (globalHistory.canRedo) {
          globalHistory.redo();
        }
        return;
      }
      
      // Cmd+Alt+Z / Ctrl+Alt+Z: Event cursor undo (previous event)
      if (mod && e.key === 'z' && !e.shiftKey && e.altKey) {
        e.preventDefault();
        if (eventHistory.canUndo && !globalHistory.isTimeTraveling) {
          eventHistory.undo();
        }
        return;
      }
      
      // Cmd+Shift+Alt+Z / Ctrl+Shift+Alt+Z: Event cursor redo (next event)
      if (mod && e.key === 'z' && e.shiftKey && e.altKey) {
        e.preventDefault();
        if (eventHistory.canRedo && !globalHistory.isTimeTraveling) {
          eventHistory.redo();
        }
        return;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalHistory, eventHistory, onOpenCommandPalette]);
}
