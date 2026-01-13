/**
 * ConsoleActionBar: Barra veloce condivisa per eventi rapidi
 * Pure UI component - all logic extracted
 */

import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { TeamKey, EventType } from '@/domain/match/types';
import type { ConsoleOrientation } from '@/types/console';
import { FOCUS_RING } from '@/styles/focus-ring';
import { EVENT_BUTTONS } from '@/constants/console';

interface ConsoleActionBarProps {
  isPlaying: boolean;
  isMatchActive: boolean;
  selectedTeam: TeamKey;
  homeInitial: string;
  awayInitial: string;
  homeTeamName: string;
  awayTeamName: string;
  orientation: ConsoleOrientation;
  containerClass: string;
  teamSelectorClass: string;
  eventButtonsClass: string;
  buttonSize: string;
  onSelectTeam: (team: TeamKey) => void;
  onPlayPause: () => void;
  onAddEvent: (type: EventType, team: TeamKey) => void;
}

export const ConsoleActionBar: React.FC<ConsoleActionBarProps> = ({
  isPlaying,
  isMatchActive,
  selectedTeam,
  homeInitial,
  awayInitial,
  homeTeamName,
  awayTeamName,
  orientation,
  containerClass,
  teamSelectorClass,
  eventButtonsClass,
  buttonSize,
  onSelectTeam,
  onPlayPause,
  onAddEvent,
}) => {

  return (
    <div className={containerClass} data-console-actionbar>
      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        disabled={!isMatchActive}
        className={`${buttonSize} rounded-lg transition-all flex items-center justify-center ${FOCUS_RING} ${
          isPlaying
            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg'
            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg'
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
              ? 'bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-400'
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
              ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-400'
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
