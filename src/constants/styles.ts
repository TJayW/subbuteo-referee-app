/**
 * Shared style constants
 * Reusable Tailwind class combinations for consistent styling
 */

import type { Period } from '@/domain/match/types';

/**
 * Period color classes (Tailwind)
 * Used for status indicators, cards, badges
 * CANONICAL SOURCE - extracted from status_indicator.tsx
 */
export const PERIOD_COLOR_CLASSES: Partial<Record<Period, string>> = {
  pre_match: 'bg-slate-100 text-slate-700 border border-slate-200',
  first_half: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  half_time: 'bg-amber-50 text-amber-700 border border-amber-200',
  second_half: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  extra_time_1: 'bg-sky-50 text-sky-700 border border-sky-200',
  extra_time_2: 'bg-sky-50 text-sky-700 border border-sky-200',
  shootout: 'bg-rose-50 text-rose-700 border border-rose-200',
  finished: 'bg-slate-200 text-slate-700 border border-slate-300',
  suspended: 'bg-red-100 text-red-700 border border-red-300',
} as const;
