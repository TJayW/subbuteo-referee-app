/**
 * OperationalHealthCard: Data integrity and operational checks
 */

import React, { useMemo } from 'react';
import { DashboardCard } from './DashboardCard';
import type { DomainMatchState } from '@/domain/match/types';
import { selectOperationalHealth, type HealthCheck } from './dashboard-selectors';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface OperationalHealthCardProps {
  state: DomainMatchState;
}

export const OperationalHealthCard: React.FC<OperationalHealthCardProps> = ({ state }) => {
  const checks = useMemo(() => selectOperationalHealth(state), [state]);

  const severityConfig: Record<HealthCheck['severity'], { icon: React.ReactNode; color: string; bg: string }> = {
    info: {
      icon: <CheckCircle size={16} />,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    warning: {
      icon: <AlertCircle size={16} />,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
    },
    error: {
      icon: <AlertCircle size={16} />,
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
    },
  };

  const hasIssues = checks.some((c) => c.severity === 'warning' || c.severity === 'error');

  return (
    <DashboardCard
      title="Integrità Operativa"
      subtitle="Controlli automatici"
      icon={<Shield size={18} className={hasIssues ? 'text-amber-600' : 'text-emerald-600'} />}
      compact
    >
      <div className="space-y-2">
        {checks.map((check) => {
          const config = severityConfig[check.severity];
          return (
            <div
              key={check.id}
              className={`flex items-start gap-2 p-2 rounded border ${config.bg}`}
            >
              <div className={config.color}>{config.icon}</div>
              <div className="flex-1">
                <div className={`text-xs font-medium ${config.color}`}>
                  {check.message}
                </div>
                {check.count !== undefined && (
                  <div className="text-xs text-slate-600 mt-0.5">
                    Rilevati: {check.count}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};
