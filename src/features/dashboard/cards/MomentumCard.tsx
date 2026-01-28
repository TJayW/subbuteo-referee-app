/**
 * MomentumCard: Event flow chart showing match momentum
 * Custom SVG chart (no external deps)
 */

import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import type { SettingsState } from '@/domain/match/types';
import type { TimeBucket } from '@/domain/match/stats-selectors';
import { TrendingUp } from 'lucide-react';

interface MomentumCardProps {
  settings: SettingsState;
  buckets: TimeBucket[];
}

export const MomentumCard: React.FC<MomentumCardProps> = ({ settings, buckets }) => {
  
  const maxCount = Math.max(...buckets.map((b) => b.homeCount + b.awayCount), 1);
  const chartHeight = 120;
  const barWidth = Math.max(100 / buckets.length - 2, 8);

  const homeDisplayName = settings.homeTeamConfig.displayName;
  const awayDisplayName = settings.awayTeamConfig.displayName;
  const homeColor = settings.homeTeamConfig.color.primary;
  const awayColor = settings.awayTeamConfig.color.primary;

  return (
    <DashboardCard
      title="Flusso Eventi"
      subtitle="Eventi per intervallo di 5 minuti"
      icon={<TrendingUp size={18} />}
      compact
    >
      <div className="space-y-3">
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: homeColor }}
            />
            <span className="font-medium text-slate-700">{homeDisplayName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: awayColor }}
            />
            <span className="font-medium text-slate-700">{awayDisplayName}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
          <svg
            width="100%"
            height={chartHeight}
            className="overflow-visible"
            preserveAspectRatio="none"
            viewBox={`0 0 ${buckets.length * (barWidth + 2)} ${chartHeight}`}
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                x2={buckets.length * (barWidth + 2)}
                y1={chartHeight - ratio * chartHeight}
                y2={chartHeight - ratio * chartHeight}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}

            {/* Bars */}
            {buckets.map((bucket, i) => {
              const homeHeight = (bucket.homeCount / maxCount) * chartHeight;
              const awayHeight = (bucket.awayCount / maxCount) * chartHeight;
              const x = i * (barWidth + 2);

              return (
                <g key={i}>
                  {/* Home bar */}
                  <rect
                    x={x}
                    y={chartHeight - homeHeight}
                    width={barWidth / 2 - 1}
                    height={homeHeight}
                    fill={homeColor}
                    opacity="0.82"
                    rx="2"
                  />
                  {/* Away bar */}
                  <rect
                    x={x + barWidth / 2}
                    y={chartHeight - awayHeight}
                    width={barWidth / 2 - 1}
                    height={awayHeight}
                    fill={awayColor}
                    opacity="0.82"
                    rx="2"
                  />
                  {/* Hover target */}
                  <title>
                    {bucket.label}: {homeDisplayName} {bucket.homeCount}, {awayDisplayName} {bucket.awayCount}
                  </title>
                </g>
              );
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          {buckets.filter((_, i) => i % Math.ceil(buckets.length / 5) === 0).map((bucket) => (
            <span key={bucket.label}>{bucket.label}</span>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
};
