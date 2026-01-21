/**
 * ResizeHandle: Draggable vertical separator for resizing OperatorRail
 * Supports mouse/touch drag and keyboard control (ArrowLeft/Right, Enter)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SIDEBAR_RESIZE } from '@/constants/layout';
import { clampWidth, nextSnap, computeWidthFromDrag } from '@/utils/sidebar-resize';

interface ResizeHandleProps {
  /** Current sidebar width (px) */
  width: number;
  
  /** Callback when width changes (live during drag, or on keyboard adjust) */
  onWidthChange: (newWidth: number) => void;
  
  /** Callback when drag ends (for snapping logic) */
  onDragEnd?: (finalWidth: number) => void;
  
  /** Minimum width */
  minWidth?: number;
  
  /** Maximum width */
  maxWidth?: number;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  width,
  onWidthChange,
  onDragEnd,
  minWidth = SIDEBAR_RESIZE.MIN_WIDTH,
  maxWidth = SIDEBAR_RESIZE.MAX_WIDTH,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const dragStartWidth = useRef<number>(0);
  const handleRef = useRef<HTMLDivElement>(null);

  // Pointer drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartWidth.current = width;
    
    // Capture pointer (if supported - JSDOM doesn't have this)
    if (handleRef.current && handleRef.current.setPointerCapture) {
      handleRef.current.setPointerCapture(e.pointerId);
    }
  }, [width]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const deltaX = e.clientX - dragStartX.current;
    const newWidth = computeWidthFromDrag(dragStartWidth.current, deltaX, minWidth, maxWidth);
    
    onWidthChange(newWidth);
  }, [isDragging, minWidth, maxWidth, onWidthChange]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    setIsDragging(false);
    
    // Release capture (if supported - JSDOM doesn't have this)
    if (handleRef.current && handleRef.current.releasePointerCapture && e.pointerId !== undefined) {
      handleRef.current.releasePointerCapture(e.pointerId);
    }
    
    // Notify drag end (for snapping)
    const deltaX = e.clientX - dragStartX.current;
    const finalWidth = computeWidthFromDrag(dragStartWidth.current, deltaX, minWidth, maxWidth);
    onDragEnd?.(finalWidth);
  }, [isDragging, minWidth, maxWidth, onDragEnd]);

  // Keyboard handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const { key, shiftKey } = e;
    let handled = false;
    let newWidth = width;

    switch (key) {
      case 'ArrowRight':
        e.preventDefault();
        newWidth = clampWidth(
          width + (shiftKey ? SIDEBAR_RESIZE.KEYBOARD_STEP_LARGE : SIDEBAR_RESIZE.KEYBOARD_STEP),
          minWidth,
          maxWidth
        );
        handled = true;
        break;
      
      case 'ArrowLeft':
        e.preventDefault();
        newWidth = clampWidth(
          width - (shiftKey ? SIDEBAR_RESIZE.KEYBOARD_STEP_LARGE : SIDEBAR_RESIZE.KEYBOARD_STEP),
          minWidth,
          maxWidth
        );
        handled = true;
        break;
      
      case 'Enter':
        e.preventDefault();
        // Cycle through snap points
        newWidth = nextSnap(width, SIDEBAR_RESIZE.SNAP_POINTS);
        handled = true;
        break;
      
      case 'Escape':
        e.preventDefault();
        if (isDragging) {
          // Cancel drag
          setIsDragging(false);
          onWidthChange(dragStartWidth.current);
        }
        handled = true;
        break;
    }

    if (handled && newWidth !== width) {
      onWidthChange(newWidth);
      // For keyboard, no need to call onDragEnd (snap) - width is already set precisely
    }
  }, [width, minWidth, maxWidth, onWidthChange, isDragging]);

  // Global pointer event listeners during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: PointerEvent) => handlePointerMove(e);
    const handleUp = (e: PointerEvent) => handlePointerUp(e);

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    document.addEventListener('pointercancel', handleUp);

    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointercancel', handleUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={handleRef}
      role="separator"
      aria-orientation="vertical"
      aria-label="Ridimensiona barra laterale"
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      aria-valuenow={Math.round(width)}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className={`
        absolute top-0 right-0 bottom-0 w-3
        cursor-col-resize
        flex items-center justify-center
        hover:bg-slate-200/50
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
        transition-colors duration-150
        ${isDragging ? 'bg-blue-300/70' : 'bg-transparent'}
        group
      `}
      data-dragging={isDragging}
    >
      {/* Visual grabber line */}
      <div className={`
        w-1 h-12 rounded-full
        bg-slate-300
        group-hover:bg-slate-400
        group-focus:bg-blue-500
        ${isDragging ? 'bg-blue-500' : ''}
        transition-colors duration-150
      `} />
    </div>
  );
};
