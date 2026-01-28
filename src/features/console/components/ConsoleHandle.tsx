/**
 * ConsoleHandle: Handle resize universale per console
 * Supporta orientamento verticale (desktop) e orizzontale (mobile)
 * Gestisce drag, keyboard, e accessibility
 */

import React, { useCallback, useRef, useState } from 'react';
import { GripVertical, GripHorizontal, ChevronRight, ChevronLeft, ChevronUp, ChevronDown } from 'lucide-react';
import type { ConsoleOrientation, ConsoleState } from '@/types/console';
import { FOCUS_RING } from '@/styles/focus-ring';

interface ConsoleHandleProps {
  /** Orientamento console */
  orientation: ConsoleOrientation;
  /** Stato console corrente */
  state: ConsoleState;
  /** Dimensione corrente (px) */
  size: number;
  /** Dimensione minima */
  minSize: number;
  /** Dimensione massima */
  maxSize: number;
  /** Callback drag start */
  onDragStart: (position: number) => void;
  /** Callback drag move */
  onDragMove: (position: number) => void;
  /** Callback drag end */
  onDragEnd: () => void;
  /** Callback keyboard resize */
  onKeyboardResize: (direction: 'increase' | 'decrease', large: boolean) => void;
  /** Callback toggle expand/collapse */
  onToggle: () => void;
  /** Mostra indicatore stato */
  showStateIndicator?: boolean;
}

export const ConsoleHandle: React.FC<ConsoleHandleProps> = ({
  orientation,
  state,
  size,
  minSize,
  maxSize,
  onDragStart,
  onDragMove,
  onDragEnd,
  onKeyboardResize,
  onToggle,
  showStateIndicator = true,
}) => {
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Icone in base all'orientamento
  const GripIcon = orientation === 'vertical' ? GripVertical : GripHorizontal;
  const ExpandIcon = orientation === 'vertical' ? ChevronRight : ChevronUp;
  const CollapseIcon = orientation === 'vertical' ? ChevronLeft : ChevronDown;
  
  // Classes in base all'orientamento
  const handleClass = orientation === 'vertical'
    ? 'w-2 h-full cursor-col-resize hover:bg-sky-100 active:bg-sky-200' // Desktop: verticale
    : 'h-2 w-full cursor-row-resize hover:bg-sky-100 active:bg-sky-200'; // Mobile: orizzontale
  
  const containerClass = orientation === 'vertical'
    ? 'absolute top-0 right-0 h-full flex items-center justify-center' // Desktop: a destra del panel
    : 'absolute top-0 left-0 w-full flex items-center justify-center'; // Mobile: in alto del panel
  
  const gripIconClass = orientation === 'vertical'
    ? 'w-3 h-6' // Desktop
    : 'w-6 h-3'; // Mobile
  
  // Pointer handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    const position = orientation === 'vertical' ? e.clientX : e.clientY;
    onDragStart(position);
    const target = e.target as HTMLElement;
    if (target.setPointerCapture) {
      target.setPointerCapture(e.pointerId);
    }
    e.preventDefault();
  }, [orientation, onDragStart]);
  
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const position = orientation === 'vertical' ? e.clientX : e.clientY;
    onDragMove(position);
  }, [isDragging, orientation, onDragMove]);
  
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      const target = e.target as HTMLElement;
      if (target.releasePointerCapture) {
        target.releasePointerCapture(e.pointerId);
      }
      onDragEnd();
    }
  }, [isDragging, onDragEnd]);
  
  // Keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const large = e.shiftKey;
    
    if (orientation === 'vertical') {
      // Desktop: ArrowRight aumenta, ArrowLeft diminuisce
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onKeyboardResize('increase', large);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onKeyboardResize('decrease', large);
      }
    } else {
      // Mobile: ArrowUp aumenta, ArrowDown diminuisce
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onKeyboardResize('increase', large);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onKeyboardResize('decrease', large);
      }
    }
    
    // Enter/Space = toggle
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
    
    // Escape = collapse
    if (e.key === 'Escape') {
      e.preventDefault();
      onKeyboardResize('decrease', true); // Vai a minimized
    }
  }, [orientation, onKeyboardResize, onToggle]);
  
  // State indicator color
  const getStateColor = () => {
    switch (state) {
      case 'minimized': return 'bg-slate-400';
      case 'actionbar': return 'bg-sky-400';
      case 'full': return 'bg-emerald-400';
    }
  };
  
  // Aria label
  const ariaLabel = orientation === 'vertical'
    ? `Ridimensiona barra laterale. Usa Arrow Left/Right per ridimensionare, Enter per espandere/comprimere. Larghezza corrente: ${size}px.`
    : `Ridimensiona console. Usa Arrow Up/Down per ridimensionare, Enter per espandere/comprimere. Altezza corrente: ${size}px.`;

  return (
    <div className={containerClass}>
      <div
        ref={handleRef}
        className={`${handleClass} bg-slate-200 transition-colors relative group ${FOCUS_RING}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="separator"
        aria-label={ariaLabel}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        aria-valuenow={size}
        aria-orientation={orientation}
      >
        {/* Grip Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <GripIcon className={`${gripIconClass} text-slate-400 group-hover:text-sky-500 transition-colors`} />
        </div>
        
        {/* Toggle Button - visibile on hover/focus */}
        <button
          onClick={onToggle}
          className={`absolute ${orientation === 'vertical' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'} opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-white rounded-full shadow-md p-1 ${FOCUS_RING}`}
          aria-label={state === 'minimized' ? 'Espandi console' : 'Comprimi console'}
          tabIndex={-1}
        >
          {state === 'minimized' ? (
            <ExpandIcon className="w-3 h-3 text-slate-600" />
          ) : (
            <CollapseIcon className="w-3 h-3 text-slate-600" />
          )}
        </button>
        
        {/* State Indicator */}
        {showStateIndicator && (
          <div
            className={`absolute ${orientation === 'vertical' ? 'left-0 top-1/2 -translate-y-1/2 w-1 h-8' : 'top-0 left-1/2 -translate-x-1/2 h-1 w-8'} ${getStateColor()} rounded-full transition-colors`}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};
