/**
 * ConsoleActionBar: Barra veloce condivisa per eventi rapidi
 * Stato intermedio tra minimized e full console
 * Funziona sia in orientamento verticale (desktop) che orizzontale (mobile)
 */

import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { DomainMatchState, TeamKey, EventType } from '@/domain/match/types';
import type { ConsoleOrientation } from '@/types/console';
import { FOCUS_RING } from '@/styles/focus-ring';
import { EVENT_BUTTONS } from '@/constants/console';

interface ConsoleActionBarProps {
  state: DomainMatchState;
  selectedTeam: TeamKey;
  onSelectTeam: (team: TeamKey) => void;
  onPlayPause: () => void;
  onAddEvent: (type: EventType, team: TeamKey) => void;
  homeTeamName: string;
  awayTeamName: string;
  orientation: ConsoleOrientation;
}

export const ConsoleActionBar: React.FC<ConsoleActionBarProps> = ({
  state,
  selectedTeam,
  onSelectTeam,
  onPlayPause,
  onAddEvent,
  homeTeamName,
  awayTeamName,
  orientation,
}) => {
  const isPlaying = state.isRunning && state.period !== 'pre_match';
  const homeInitial = homeTeamName.charAt(0).toUpperCase();
  const awayInitial = awayTeamName.charAt(0).toUpperCase();
  const isMatchActive = state.period !== 'pre_match' && state.period !== 'finished';
  
  // Layout classes basate sull'orientamento
  const containerClass = orientation === 'vertical'
    ? 'flex flex-col items-center gap-3 p-2 h-full overflow-y-auto' // Desktop: colonna verticale
    : 'flex flex-row items-center gap-3 p-2 w-full overflow-x-auto'; // Mobile: riga orizzontale
  
  const teamSelectorClass = orientation === 'vertical'
    ? 'flex flex-col gap-2' // Desktop: team stacked
    : 'flex flex-row gap-2'; // Mobile: team side-by-side
  
  const eventButtonsClass = orientation === 'vertical'
    ? 'flex flex-col gap-2 flex-1 overflow-y-auto' // Desktop: eventi verticali scrollabili
    : 'flex flex-row gap-2 flex-1 overflow-x-auto'; // Mobile: eventi orizzontali scrollabili
  
  const buttonSize = orientation === 'vertical' ? 'w-12 h-12' : 'w-14 h-14 flex-shrink-0'; // Mobile leggermente più grande

  return (
    <div className={containerClass} data-console-actionbar>
      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        disabled={!isMatchActive}
        className={`${buttonSize} rounded-lg transition-all flex items-center justify-center ${FOCUS_RING} ${
          isPlaying
            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label={isPlaying ? 'Pausa' : 'Avvia'}
        title={isPlaying ? 'Pausa (Space)' : 'Avvia (Space)'}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      {/* Team Selector */}
      <div className={teamSelectorClass}>
        <button
          onClick={() => onSelectTeam('home')}
          className={`${buttonSize} rounded-lg flex items-center justify-center font-bold text-sm transition-all ${FOCUS_RING} ${
            selectedTeam === 'home'
              ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          aria-label={`Seleziona ${homeTeamName}`}
          title={homeTeamName}
        >
          {homeInitial}
        </button>
        <button
          onClick={() => onSelectTeam('away')}
          className={`${buttonSize} rounded-lg flex items-center justify-center font-bold text-sm transition-all ${FOCUS_RING} ${
            selectedTeam === 'away'
              ? 'bg-sky-600 text-white shadow-lg ring-2 ring-sky-400'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          aria-label={`Seleziona ${awayTeamName}`}
          title={awayTeamName}
        >
          {awayInitial}
        </button>
      </div>

      {orientation === 'vertical' && <div className="w-full h-px bg-slate-200" />}
      {orientation === 'horizontal' && <div className="w-px h-full bg-slate-200" />}

      {/* Event Buttons */}
      <div className={eventButtonsClass}>
        {EVENT_BUTTONS.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.type}
              onClick={() => onAddEvent(btn.type, selectedTeam)}
              disabled={!isMatchActive}
              className={`${buttonSize} rounded-lg ${btn.bg} ${btn.color} ${btn.hoverBg} disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all ${FOCUS_RING} ${
                btn.type === 'red_card' ? 'ring-2 ring-red-200' : ''
              }`}
              aria-label={`Aggiungi ${btn.label}`}
              title={`${btn.label} (${btn.shortcut})`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
