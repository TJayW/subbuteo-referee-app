/**
 * Event-related constants
 * Canonical source for event metadata and definitions
 */

import type { EventType } from '@/domain/match/types';

export interface EventMetadata {
  type: EventType;
  label: string;
  icon: string;
  description: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

/**
 * Event metadata map (labels, icons, descriptions)
 * CANONICAL SOURCE - do not duplicate
 */
export const EVENT_METADATA: Record<EventType, EventMetadata> = {
  goal: {
    type: 'goal',
    label: 'Gol',
    icon: '⚽',
    description: 'Goal scored',
    variant: 'success',
  },
  foul: {
    type: 'foul',
    label: 'Fallo',
    icon: '👎',
    description: 'Foul committed',
    variant: 'warning',
  },
  yellow_card: {
    type: 'yellow_card',
    label: 'Giallo',
    icon: '🟡',
    description: 'Yellow card shown',
    variant: 'warning',
  },
  red_card: {
    type: 'red_card',
    label: 'Rosso',
    icon: '🔴',
    description: 'Red card shown',
    variant: 'danger',
  },
  timeout: {
    type: 'timeout',
    label: 'Timeout',
    icon: '⏱️',
    description: 'Team timeout',
    variant: 'info',
  },
  shot: {
    type: 'shot',
    label: 'Tiro',
    icon: '📸',
    description: 'Shot taken',
    variant: 'default',
  },
  shot_on_target: {
    type: 'shot_on_target',
    label: 'Tiro in Porta',
    icon: '🎯',
    description: 'Shot on target',
    variant: 'info',
  },
  corner: {
    type: 'corner',
    label: 'Angolo',
    icon: '🔄',
    description: 'Corner kick',
    variant: 'info',
  },
  throw_in: {
    type: 'throw_in',
    label: 'Rimessa',
    icon: '🤾',
    description: 'Throw-in',
    variant: 'info',
  },
  period_start: {
    type: 'period_start',
    label: 'Inizio',
    icon: '▶️',
    description: 'Period started',
    variant: 'info',
  },
  period_end: {
    type: 'period_end',
    label: 'Fine',
    icon: '⏹️',
    description: 'Period ended',
    variant: 'info',
  },
  match_start: {
    type: 'match_start',
    label: 'Inizio Partita',
    icon: '🏁',
    description: 'Match started',
    variant: 'info',
  },
  match_end: {
    type: 'match_end',
    label: 'Fine Partita',
    icon: '🏁',
    description: 'Match ended',
    variant: 'info',
  },
  note: {
    type: 'note',
    label: 'Nota',
    icon: '📝',
    description: 'Nota generale',
    variant: 'default',
  },
  phase_transition: {
    type: 'phase_transition',
    label: 'Cambio Fase',
    icon: '🔄',
    description: 'Transizione di fase',
    variant: 'default',
  },
  stoppage_added: {
    type: 'stoppage_added',
    label: 'Recupero',
    icon: '⏱️',
    description: 'Tempo di recupero aggiunto',
    variant: 'warning',
  },
  clock_started: {
    type: 'clock_started',
    label: 'Timer Avviato',
    icon: '▶️',
    description: 'Timer avviato',
    variant: 'success',
  },
  clock_paused: {
    type: 'clock_paused',
    label: 'Timer Pausato',
    icon: '⏸️',
    description: 'Timer messo in pausa',
    variant: 'warning',
  },
  clock_set: {
    type: 'clock_set',
    label: 'Tempo Impostato',
    icon: '🕐',
    description: 'Tempo impostato manualmente',
    variant: 'warning',
  },
  clock_adjusted: {
    type: 'clock_adjusted',
    label: 'Tempo Regolato',
    icon: '⏲️',
    description: 'Tempo regolato',
    variant: 'warning',
  },
  match_suspended: {
    type: 'match_suspended',
    label: 'Partita Sospesa',
    icon: '⏸️',
    description: 'Partita sospesa',
    variant: 'danger',
  },
  match_resumed: {
    type: 'match_resumed',
    label: 'Partita Ripresa',
    icon: '▶️',
    description: 'Partita ripresa',
    variant: 'success',
  },
};
