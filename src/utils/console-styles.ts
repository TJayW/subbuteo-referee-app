/**
 * Console style helpers
 * Computed CSS classes for console components
 */

import type { ConsoleOrientation } from '@/types/console';

/**
 * Get container class based on orientation
 */
export function getConsoleContainerClass(orientation: ConsoleOrientation): string {
  return orientation === 'vertical'
    ? 'console-card flex flex-col items-center gap-2.5 p-2.5 h-full overflow-y-auto' // Desktop: vertical column
    : 'console-card flex flex-row items-center gap-2.5 p-2.5 w-full overflow-x-auto'; // Mobile: horizontal row
}

/**
 * Get team selector class based on orientation
 */
export function getTeamSelectorClass(orientation: ConsoleOrientation): string {
  return orientation === 'vertical'
    ? 'flex flex-col gap-2' // Desktop: stacked
    : 'flex flex-row gap-2'; // Mobile: side-by-side
}

/**
 * Get event buttons class based on orientation
 */
export function getEventButtonsClass(orientation: ConsoleOrientation): string {
  return orientation === 'vertical'
    ? 'flex flex-col gap-2 flex-1 overflow-y-auto' // Desktop: vertical scrollable
    : 'flex flex-row gap-2 flex-1 overflow-x-auto'; // Mobile: horizontal scrollable
}

/**
 * Get button size class based on orientation
 */
export function getButtonSizeClass(orientation: ConsoleOrientation): string {
  return orientation === 'vertical' 
    ? 'w-11 h-11' 
    : 'w-12 h-12 flex-shrink-0'; // Mobile slightly larger
}
