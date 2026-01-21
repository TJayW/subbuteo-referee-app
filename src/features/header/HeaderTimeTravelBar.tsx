/**
 * TimeTravelStatusBar: Unified enterprise-grade status bar for time-travel states
 * 
 * Supports both GLOBAL (app-wide) and EVENTS (card-scoped) navigation.
 * Design: Single-row, no wrapping, responsive degradation via truncation.
 * 
 * Layout hierarchy (left to right):
 * 1. Scope badge (Globale / Eventi)
 * 2. State label ("Stato passato")
 * 3. Position metrics (e.g., "23/24 (-1)")
 * 4. Primary CTA ("Torna al presente")
 */

import React from 'react';
import { AlertCircle, Clock, RotateCcw, Dot } from 'lucide-react';
import type { TimeTravelScope } from '@/types/ui';

// Re-export for backward compatibility
export type { TimeTravelScope };

interface HeaderTimeTravelBarProps {
  scope: TimeTravelScope;
  isVisible: boolean;
  position: { current: number; total: number };
  onJumpToPresent: () => void;
}

export const HeaderTimeTravelBar: React.FC<HeaderTimeTravelBarProps> = ({
  scope,
  isVisible,
  position,
  onJumpToPresent,
}) => {
  const isActive = isVisible;
  const itemsBack = Math.max(0, position.total - position.current);
  const isGlobal = scope === 'global';

  // Scope-specific styling tokens (compact, subtle, enterprise)
  const theme = isGlobal
    ? {
        badgeBg: isActive ? 'bg-amber-100/70' : 'bg-slate-100',
        badgeText: isActive ? 'text-amber-900' : 'text-slate-700',
        metricBg: isActive ? 'bg-white/60' : 'bg-white/60',
        metricText: isActive ? 'text-amber-800' : 'text-slate-600',
        secondaryText: isActive ? 'text-amber-700' : 'text-slate-500',
        buttonBg: 'bg-amber-600 hover:bg-amber-700',
        icon: AlertCircle,
        iconColor: isActive ? 'text-amber-600' : 'text-slate-400',
        scopeLabel: 'GLOBALE',
        liveLabel: 'LIVE',
        itemLabel: itemsBack === 1 ? 'azione' : 'azioni',
      }
    : {
        badgeBg: isActive ? 'bg-blue-100/70' : 'bg-slate-100',
        badgeText: isActive ? 'text-blue-900' : 'text-slate-700',
        metricBg: isActive ? 'bg-white/60' : 'bg-white/60',
        metricText: isActive ? 'text-blue-800' : 'text-slate-600',
        secondaryText: isActive ? 'text-blue-700' : 'text-slate-500',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        icon: Clock,
        iconColor: isActive ? 'text-blue-600' : 'text-slate-400',
        scopeLabel: 'EVENTI',
        liveLabel: 'LIVE',
        itemLabel: itemsBack === 1 ? 'evento' : 'eventi',
      };

  const Icon = theme.icon;
  const fontSize = isGlobal ? 'text-[11px]' : 'text-[10px]';
  const iconSize = isGlobal ? 'w-3.5 h-3.5' : 'w-3 h-3';
  const buttonSize = isGlobal ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px]';
  const buttonIconSize = isGlobal ? 'w-3 h-3' : 'w-3 h-3';

  const surfaceTestId = isGlobal ? 'global-status-surface' : 'event-status-surface';

  return (
    <div
      className="h-full flex items-center"
      data-testid={surfaceTestId}
      data-scope={scope}
      data-active={isActive ? 'true' : 'false'}
    >
      <div className="flex items-center justify-between gap-2 min-w-0 w-full">
        {/* Left cluster */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
          <Icon className={`${iconSize} ${theme.iconColor} flex-shrink-0`} />

          <span className={`font-semibold ${theme.badgeText} ${theme.badgeBg} px-1 py-0.5 rounded ${fontSize} flex-shrink-0 whitespace-nowrap`}>
            {theme.scopeLabel}
          </span>

          {isActive ? (
            <>
              <span className={`${theme.metricText} font-mono ${fontSize} ${theme.metricBg} px-1 py-0.5 rounded flex-shrink-0 whitespace-nowrap`}>
                {position.current}/{position.total}
              </span>
              {itemsBack > 0 && (
                <span className={`${theme.secondaryText} ${fontSize} truncate hidden sm:inline`}>
                  −{itemsBack} {theme.itemLabel}
                </span>
              )}
            </>
          ) : (
            <span className={`${theme.secondaryText} ${fontSize} flex items-center gap-0.5 min-w-0 truncate`}>
              <Dot className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="truncate">{theme.liveLabel}</span>
            </span>
          )}
        </div>

        {/* Right CTA: only when active; never truncates */}
        {isActive && (
          <button
            onClick={onJumpToPresent}
            className={`status-bar-cta flex items-center gap-1 ${theme.buttonBg} text-white font-semibold rounded transition-colors ${buttonSize} whitespace-nowrap flex-shrink-0`}
            aria-label="Torna al presente"
            data-testid={isGlobal ? 'global-status-cta' : 'event-status-cta'}
          >
            <RotateCcw className={buttonIconSize} />
            <span className="hidden sm:inline">Torna al presente</span>
            <span className="inline sm:hidden">Presente</span>
          </button>
        )}
      </div>
    </div>
  );
};
