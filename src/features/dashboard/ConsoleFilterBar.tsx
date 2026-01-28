/**
 * ConsoleFilterBar: Compact filter controls for dashboard
 * Team filter + Period filter + Time-travel indicator
 */

import React from 'react';
import type { Period } from '@/domain/match/types';
import { Clock, AlertCircle } from 'lucide-react';
import type { DashboardFilters } from '@/hooks/use-dashboard-filters';

interface ConsoleFilterBarProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  isTimeTraveling: boolean;
  availablePeriods: Period[];
}

export const ConsoleFilterBar: React.FC<ConsoleFilterBarProps> = ({
  filters,
  onChange,
  isTimeTraveling,
  availablePeriods,
}) => {
  const teamOptions: Array<{ value: 'all' | 'home' | 'away'; label: string }> = [
    { value: 'all', label: 'Tutti' },
    { value: 'home', label: 'Casa' },
    { value: 'away', label: 'Ospite' },
  ];

  const periodLabels: Partial<Record<Period | 'all', string>> = {
    all: 'Tutti',
    pre_match: 'Pre',
    first_half: '1° Tempo',
    half_time: 'Intervallo',
    second_half: '2° Tempo',
    extra_time_1: 'Suppl. 1',
    extra_time_2: 'Suppl. 2',
    shootout: 'Rigori',
    finished: 'Fine',
    suspended: 'Sospesa',
  };

  const periodOptions: Array<{ value: Period | 'all'; label: string }> = [
    { value: 'all', label: 'Tutti' },
    ...availablePeriods.map((p) => ({ value: p, label: periodLabels[p] ?? p })),
  ];

  return (
    <div className="ui-surface-muted p-3 mb-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Filters */}
        <div className="flex items-center gap-3">
          {/* Team Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Squadra:</span>
            <div className="flex bg-white border border-slate-200 rounded-md overflow-hidden">
              {teamOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onChange({ ...filters, team: option.value })}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    filters.team === option.value
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Periodo:</span>
            <select
              value={filters.period}
              onChange={(e) =>
                onChange({ ...filters, period: e.target.value as Period | 'all' })
              }
              className="px-2 py-1 text-xs font-medium bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Time-travel indicator */}
        {isTimeTraveling && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-md">
            <Clock size={14} className="text-amber-600" />
            <span className="text-xs font-medium text-amber-900">
              Stato passato (Eventi)
            </span>
            <AlertCircle size={14} className="text-amber-600" />
          </div>
        )}
      </div>
    </div>
  );
};
