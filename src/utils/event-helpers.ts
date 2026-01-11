/**
 * Event helpers: labels, icons, descriptions
 * RE-EXPORTS from canonical source
 */

import type { EventType } from '@/domain/match/types';
import { EVENT_METADATA, formatEventTime, type EventMetadata } from '@/constants/events';

// Re-export from canonical source for backward compatibility
export { EVENT_METADATA, formatEventTime, type EventMetadata };

/**
 * Get metadata for an event type
 */
export function getEventMetadata(type: EventType): EventMetadata {
  return EVENT_METADATA[type];
}

/**
 * Get label for an event type
 */
export function getEventLabel(type: EventType): string {
  return EVENT_METADATA[type]?.label || type;
}

/**
 * Get icon for an event type
 */
export function getEventIcon(type: EventType): string {
  return EVENT_METADATA[type]?.icon || '📌';
}

/**
 * Get variant for an event type
 */
export function getEventVariant(type: EventType): EventMetadata['variant'] {
  return EVENT_METADATA[type]?.variant || 'default';
}

/**
 * Format event for display in log
 */
export function formatEventForLog(
  type: EventType,
  teamName: string,
  secondsInPeriod: number,
  note?: string
): string {
  const meta = getEventMetadata(type);
  const time = formatEventTime(secondsInPeriod);
  const base = `${time} ${meta.icon} ${meta.label} (${teamName})`;
  return note ? `${base} - "${note}"` : base;
}
