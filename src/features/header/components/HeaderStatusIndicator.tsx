import React from 'react';
import { Clock } from 'lucide-react';
import type { Period } from '@/domain/match/types';
import { PERIOD_LABELS } from '@/constants/periods';
import { PERIOD_COLOR_CLASSES } from '@/constants/styles';

interface HeaderStatusIndicatorProps {
  period: Period;
}

/**
 * Live status badge: period indicator
 * Broadcast-grade: subtle color coding, readable icon
 * 
 * Performance: Memoized to prevent unnecessary re-renders (§G.4)
 */
const HeaderStatusIndicatorComponent: React.FC<HeaderStatusIndicatorProps> = ({ period }) => {
  return (
    <div
      className={`ui-badge whitespace-nowrap transition-colors duration-200 ${
        PERIOD_COLOR_CLASSES[period]
      }`}
    >
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{PERIOD_LABELS[period]}</span>
    </div>
  );
};

/**
 * Memoized export: Only re-renders when period changes
 */
export const HeaderStatusIndicator = React.memo(HeaderStatusIndicatorComponent);

HeaderStatusIndicator.displayName = 'HeaderStatusIndicator';
