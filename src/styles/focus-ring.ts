/**
 * Unified Focus Ring System
 * 
 * Enterprise-grade focus indicators for keyboard navigation.
 * All interactive elements use these consistent classes.
 * 
 * Usage:
 *   import { FOCUS_RING, FOCUS_RING_WITHIN } from '@/styles/focus-ring';
 *   className={`${FOCUS_RING} other-classes`}
 */

// Standard focus ring for most interactive elements
export const FOCUS_RING = 'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0';

// Focus ring with offset (for buttons with borders)
export const FOCUS_RING_OFFSET = 'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2';

// Focus-within variant (for containers)
export const FOCUS_RING_WITHIN = 'focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-0';

// Active zone indicator (controlled by state, not CSS focus)
export const ZONE_ACTIVE_RING = 'ring-2 ring-sky-500';

// Focus ring with inset (for filled buttons)
export const FOCUS_RING_INSET = 'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white';

/**
 * Helper to conditionally apply zone-active ring
 */
export const zoneRing = (isActive: boolean, isFocused: boolean) => 
  isActive && isFocused ? ZONE_ACTIVE_RING : '';
