/**
 * Dashboard Filters Context
 * 
 * GOVERNANCE:
 * - Shared filters (team, period) managed here
 * - NOT persisted to localStorage (session-only)
 * - Cards can read filters via useDashboardFilters()
 * - Card-local filters (view mode, grouping) stay in card state
 * 
 * DESIGN DECISION (P1.5):
 * Filter state is ephemeral - resets on page reload.
 * Rationale: Filters are exploratory tools, not workflow state.
 */

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Period } from '@/domain/match/types';

/**
 * Shared dashboard filter model
 */
export interface DashboardFilters {
  team: 'all' | 'home' | 'away';
  period: Period | 'all';
}

/**
 * Default filter values
 */
const DEFAULT_FILTERS: DashboardFilters = {
  team: 'all',
  period: 'all',
};

interface DashboardFiltersContextValue {
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
  resetFilters: () => void;
}

const DashboardFiltersContext = createContext<DashboardFiltersContextValue | undefined>(undefined);

/**
 * Provider: Wrap MatchDashboard with this
 */
export const DashboardFiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <DashboardFiltersContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </DashboardFiltersContext.Provider>
  );
};

/**
 * Hook: Access shared dashboard filters
 * 
 * Usage in cards:
 * ```tsx
 * const { filters } = useDashboardFilters();
 * const filteredEvents = events.filter(e => 
 *   (filters.team === 'all' || e.team === filters.team) &&
 *   (filters.period === 'all' || e.period === filters.period)
 * );
 * ```
 */
export function useDashboardFilters(): DashboardFiltersContextValue {
  const context = useContext(DashboardFiltersContext);
  if (!context) {
    throw new Error('useDashboardFilters must be used within DashboardFiltersProvider');
  }
  return context;
}
