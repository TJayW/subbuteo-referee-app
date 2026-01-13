/**
 * MatchDashboard: Enterprise console main area
 * Dense dashboard with filters + multiple card views
 * Successor to CompactScoreboard with enhanced analytics
 */

import React, { useMemo } from 'react';
import type { DomainMatchState, ComputedTeamStats, SettingsState, Period } from '@/domain/match/types';
import { ConsoleFilterBar } from './components/ConsoleFilterBar';
import { MatchOverviewCard } from './cards/MatchOverviewCard';
import { StatsMatrixCard } from './cards/StatsMatrixCard';
import { MomentumCard } from './cards/MomentumCard';
import { DisciplineCard } from './cards/DisciplineCard';
import { OperationalHealthCard } from './cards/OperationalHealthCard';
import { ExportPreviewCard } from './cards/ExportPreviewCard';
import { selectAppliedEvents, selectIsTimeTraveling } from '@/domain/match/selectors';
import { DashboardFiltersProvider, useDashboardFilters } from '@/hooks/use-dashboard-filters';
import { LAYOUT_MAX_WIDTHS } from '@/constants/layout';

interface MatchDashboardProps {
  state: DomainMatchState;
  teamStats: ComputedTeamStats;
  settings: SettingsState;
}

/**
 * Inner dashboard component (consumes filter context)
 */
const MatchDashboardInner: React.FC<MatchDashboardProps> = ({
  state,
  teamStats,
  settings,
}) => {
  // Access shared filters from context
  const { filters, setFilters } = useDashboardFilters();

  // Derive available periods from events
  const availablePeriods = useMemo(() => {
    const events = selectAppliedEvents(state);
    const periods = Array.from(new Set(events.map((e) => e.period)));
    return periods as Period[];
  }, [state]);

  const isTimeTraveling = useMemo(() => selectIsTimeTraveling(state), [state]);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4">
      <div className="mx-auto space-y-4" style={{ maxWidth: `${LAYOUT_MAX_WIDTHS.DASHBOARD}px` }}>
        {/* Filter Bar */}
        <ConsoleFilterBar
          filters={filters}
          onChange={setFilters}
          isTimeTraveling={isTimeTraveling}
          availablePeriods={availablePeriods}
        />

        {/* Hero: Match Overview */}
        <MatchOverviewCard state={state} teamStats={teamStats} settings={settings} />

        {/* Grid: Cards - Responsive (1 col mobile, 2 col tablet, 3 col desktop) §H */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Stats Matrix */}
          <StatsMatrixCard state={state} teamStats={teamStats} settings={settings} />

          {/* Momentum Chart */}
          <MomentumCard state={state} settings={settings} />

          {/* Discipline */}
          <DisciplineCard state={state} teamStats={teamStats} settings={settings} />

          {/* Operational Health */}
          <OperationalHealthCard state={state} />

          {/* Export Preview */}
          <ExportPreviewCard
            state={state}
            homeGoals={teamStats.home.goals}
            awayGoals={teamStats.away.goals}
            settings={settings}
          />
        </div>

        {/* Empty State (if pre-match) */}
        {state.period === 'pre_match' && state.events.length === 0 && (
          <div className="mt-8 text-center p-12 bg-white border border-slate-200 rounded-lg">
            <div className="text-4xl mb-4">⚽</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Pronto per iniziare
            </h3>
            <p className="text-sm text-slate-600">
              Usa i controlli nella barra laterale per iniziare la partita
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Outer dashboard component (provides filter context)
 */
export const MatchDashboard: React.FC<MatchDashboardProps> = (props) => {
  return (
    <DashboardFiltersProvider>
      <MatchDashboardInner {...props} />
    </DashboardFiltersProvider>
  );
};
