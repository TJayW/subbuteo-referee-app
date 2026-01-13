/**
 * use-console-state: Hook condiviso per gestione stati console
 * Gestisce i 3 stati (minimized/actionbar/full) con resize e persistenza
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ConsoleState, ConsoleOrientation, ConsoleSizeConfig } from '@/types/console';
import {
  DESKTOP_CONSOLE_SIZES,
  MOBILE_CONSOLE_SIZES,
  CONSOLE_RESIZE_CONFIG,
  CONSOLE_STORAGE_KEYS,
} from '@/constants/console';
import { getStateFromSize, getSizeFromState } from '@/utils/console-helpers';

interface UseConsoleStateOptions {
  /** Orientamento console (vertical=desktop, horizontal=mobile) */
  orientation: ConsoleOrientation;
  /** Stato iniziale (default: 'full') */
  initialState?: ConsoleState;
  /** Abilita persistenza localStorage */
  persist?: boolean;
}

interface UseConsoleStateReturn {
  /** Stato console corrente */
  state: ConsoleState;
  /** Dimensione corrente (px) */
  size: number;
  /** Configurazione dimensioni per orientamento */
  sizeConfig: ConsoleSizeConfig;
  /** Cambia stato console */
  setState: (newState: ConsoleState) => void;
  /** Cambia dimensione (con snap automatico a stati) */
  setSize: (newSize: number, snap?: boolean) => void;
  /** Toggle tra stati (minimized ↔ full) */
  toggle: () => void;
  /** Espandi a full */
  expand: () => void;
  /** Comprimi a minimized */
  collapse: () => void;
  /** Vai ad actionbar */
  toActionBar: () => void;
  /** Handlers per drag resize */
  dragHandlers: {
    onDragStart: (startPosition: number) => void;
    onDragMove: (currentPosition: number) => void;
    onDragEnd: () => void;
  };
  /** Handlers per keyboard resize */
  keyboardHandlers: {
    onArrowIncrease: (large?: boolean) => void;
    onArrowDecrease: (large?: boolean) => void;
    onEscape: () => void;
  };
}

export function useConsoleState(options: UseConsoleStateOptions): UseConsoleStateReturn {
  const { orientation, initialState = 'full', persist = true } = options;
  
  // Scegli configurazione dimensioni in base all'orientamento
  const sizeConfig = orientation === 'vertical' ? DESKTOP_CONSOLE_SIZES : MOBILE_CONSOLE_SIZES;
  
  // Storage keys
  const stateKey = orientation === 'vertical' ? CONSOLE_STORAGE_KEYS.desktopState : CONSOLE_STORAGE_KEYS.mobileState;
  const sizeKey = orientation === 'vertical' ? CONSOLE_STORAGE_KEYS.desktopSize : CONSOLE_STORAGE_KEYS.mobileSize;
  
  // Load persisted state
  const loadPersistedState = useCallback((): ConsoleState => {
    if (!persist) return initialState;
    try {
      const stored = localStorage.getItem(stateKey);
      if (stored && ['minimized', 'actionbar', 'full'].includes(stored)) {
        return stored as ConsoleState;
      }
    } catch {
      // Silent fail
    }
    return initialState;
  }, [persist, stateKey, initialState]);
  
  const loadPersistedSize = useCallback((state: ConsoleState): number => {
    if (!persist) return getSizeFromState(state, sizeConfig);
    try {
      const stored = localStorage.getItem(sizeKey);
      if (stored) {
        const size = parseInt(stored, 10);
        if (!isNaN(size) && size >= sizeConfig.minimized && size <= sizeConfig.full) {
          return size;
        }
      }
    } catch {
      // Silent fail
    }
    return getSizeFromState(state, sizeConfig);
  }, [persist, sizeKey, sizeConfig]);
  
  // State
  const [state, setStateInternal] = useState<ConsoleState>(loadPersistedState);
  const [size, setSizeInternal] = useState<number>(() => loadPersistedSize(state));
  
  // Drag refs
  const dragStartPosition = useRef<number>(0);
  const dragStartSize = useRef<number>(0);
  
  // Persist state
  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(stateKey, state);
    } catch {
      // Silent fail
    }
  }, [state, stateKey, persist]);
  
  // Persist size
  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(sizeKey, size.toString());
    } catch {
      // Silent fail
    }
  }, [size, sizeKey, persist]);
  
  // Set state with automatic size update
  const setState = useCallback((newState: ConsoleState) => {
    setStateInternal(newState);
    setSizeInternal(getSizeFromState(newState, sizeConfig));
  }, [sizeConfig]);
  
  // Set size with optional snap
  const setSize = useCallback((newSize: number, snap: boolean = true) => {
    // Clamp to valid range
    const clampedSize = Math.max(sizeConfig.minimized, Math.min(newSize, sizeConfig.full));
    setSizeInternal(clampedSize);
    
    // Update state if snapping enabled
    if (snap) {
      const newState = getStateFromSize(clampedSize, sizeConfig, CONSOLE_RESIZE_CONFIG.snapThreshold);
      setStateInternal(newState);
    }
  }, [sizeConfig]);
  
  // Toggle between minimized and full
  const toggle = useCallback(() => {
    setState(state === 'minimized' ? 'full' : 'minimized');
  }, [state, setState]);
  
  // Expand to full
  const expand = useCallback(() => {
    setState('full');
  }, [setState]);
  
  // Collapse to minimized
  const collapse = useCallback(() => {
    setState('minimized');
  }, [setState]);
  
  // Go to actionbar
  const toActionBar = useCallback(() => {
    setState('actionbar');
  }, [setState]);
  
  // Drag handlers
  const onDragStart = useCallback((startPosition: number) => {
    dragStartPosition.current = startPosition;
    dragStartSize.current = size;
  }, [size]);
  
  const onDragMove = useCallback((currentPosition: number) => {
    // Calcola delta in base all'orientamento
    // Vertical (desktop): drag right = increase
    // Horizontal (mobile): drag up = increase
    const delta = orientation === 'vertical' 
      ? currentPosition - dragStartPosition.current
      : dragStartPosition.current - currentPosition;
    
    const newSize = dragStartSize.current + delta;
    setSize(newSize, false); // No snap during drag
  }, [orientation, setSize]);
  
  const onDragEnd = useCallback(() => {
    // Snap to nearest state at end of drag
    const newState = getStateFromSize(size, sizeConfig, CONSOLE_RESIZE_CONFIG.snapThreshold);
    setState(newState);
  }, [size, sizeConfig, setState]);
  
  // Keyboard handlers
  const onArrowIncrease = useCallback((large: boolean = false) => {
    const step = large ? CONSOLE_RESIZE_CONFIG.keyboardStepLarge : CONSOLE_RESIZE_CONFIG.keyboardStepSmall;
    setSize(size + step, true);
  }, [size, setSize]);
  
  const onArrowDecrease = useCallback((large: boolean = false) => {
    const step = large ? CONSOLE_RESIZE_CONFIG.keyboardStepLarge : CONSOLE_RESIZE_CONFIG.keyboardStepSmall;
    setSize(size - step, true);
  }, [size, setSize]);
  
  const onEscape = useCallback(() => {
    collapse();
  }, [collapse]);
  
  return {
    state,
    size,
    sizeConfig,
    setState,
    setSize,
    toggle,
    expand,
    collapse,
    toActionBar,
    dragHandlers: {
      onDragStart,
      onDragMove,
      onDragEnd,
    },
    keyboardHandlers: {
      onArrowIncrease,
      onArrowDecrease,
      onEscape,
    },
  };
}
