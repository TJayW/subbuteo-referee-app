/**
 * Event presentation helpers
 * Add computed display properties to events
 */

import type { MatchEvent } from '@/domain/match/types';
import { formatTimestampMinutes } from './formatting';

/**
 * Enrich event with display properties
 */
export interface DisplayMatchEvent extends MatchEvent {
  minutes: number;
}

/**
 * Add display properties to events
 */
export function enrichEventsForDisplay(events: MatchEvent[]): DisplayMatchEvent[] {
  return events.map((event) => ({
    ...event,
    minutes: formatTimestampMinutes(event.timestamp),
  }));
}
