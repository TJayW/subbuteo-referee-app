/**
 * OperatorRailCollapsed: Compact icon-based sidebar for quick access
 * Displays essential controls in icon-only mode with tooltips
 */

import React, { useRef, useEffect } from 'react';
import { Play, Pause, Goal, History, AlertCircle, Target, Zap, Clock } from 'lucide-react';
import type { DomainMatchState, TeamKey, EventType } from '@/domain/match/types';

interface SidebarCollapsedProps {
  state: DomainMatchState;
  selectedTeam: TeamKey;
  onSelectTeam: (team: TeamKey) => void;
  onPlayPause: () => void;
  onAddEvent: (type: EventType, team: TeamKey) => void;
  onToggleExpand: () => void;
  homeTeamName: string;
  awayTeamName: string;
}

export const SidebarCollapsed: React.FC<SidebarCollapsedProps> = ({
  state,
  selectedTeam,
  onSelectTeam,
  onPlayPause,
  onAddEvent,
  onToggleExpand,
  homeTeamName,
  awayTeamName,
}) => {
  const isPlaying = state.isRunning && state.period !== 'pre_match';
  const homeInitial = homeTeamName.charAt(0).toUpperCase();
  const awayInitial = awayTeamName.charAt(0).toUpperCase();
  const containerRef = useRef<HTMLDivElement>(null);
  const totalEvents = state.events.length;

  // Focus management: ensure focusable elements remain accessible
  useEffect(() => {
    // Check if any focused element is within this container
    if (containerRef.current && document.activeElement) {
      const isFocusWithin = containerRef.current.contains(document.activeElement);
      if (!isFocusWithin) {
        // If focus is lost, move to first focusable element (team selector)
        const firstButton = containerRef.current.querySelector<HTMLButtonElement>('button');
        firstButton?.focus();
      }
    }
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 p-2 h-full" data-zone="sidebar-collapsed">{/* Team Selector - Compact */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onSelectTeam('home')}
          className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
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
          className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
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

      <div className="w-full h-px bg-slate-200" />

      {/* Core Event Actions - All 8 P0 Events */}
      <div className="flex flex-col gap-2 overflow-y-auto">
        {/* Goal */}
        <button
          onClick={() => onAddEvent('goal', selectedTeam)}
          disabled={state.period === 'pre_match' || state.period === 'finished'}
          className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          aria-label="Aggiungi Goal"
          title="Goal (G)"
        >
          <Goal className="w-5 h-5" />
        </button>
        
        {/* Shot On Target */}
        <button
          onClick={() => onAddEvent('shot_on_target', selectedTeam)}
          disabled={state.period === 'pre_match' || state.period === 'finished'}
          className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          aria-label="Aggiungi Tiro in porta"
          title="Tiro in Porta (O)"
        >
          <Target className="w-5 h-5" />
        </button>
        
        {/* Shot */}
        <button
          onClick={() => onAddEvent('shot', selectedTeam)}
          disabled={state.period === 'pre_match' || state.period === 'finished'}
          className="w-12 h-12 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          aria-label="Aggiungi Tiro"
          title="Tiro (S)"
        >
          <AlertCircle className="w-5 h-5" />
        </button>
        
        {/* Corner */}
        <button
          onClick={() => onAddEvent('corner', selectedTeam)}
          disabled={state.period === 'pre_match' || state.period === 'finished'}
          className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          aria-label="Aggiungi angolo"
          title="Angolo (C)"
        >
          <Zap className="w-5 h-5" />
        </button>
        
        {/* Foul */}
        <button
          onClick={() => onAddEvent('foul', selectedTeam)}
          disabled={state.period === 'pre_match' || state.period === 'finished'}
          className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          aria-label="Aggiungi Fallo"
          title="Fallo (F)"
        >
          <AlertCircle className="w-5 h-5" />
        </button>
        
        {/* Yellow Card */}
        <button
          onClick={() => onAddEvent('yellow_card', selectedTeam)}
          disabled={state.period === 'pre_match' || state.period === 'finished'}
          className="w-12 h-12 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          aria-label="Aggiungi Cartellino Giallo"
          title="Cartellino Giallo (Y)"
        >
          <AlertCircle className="w-5 h-5" />
        </button>
        
        {/* Red Card - Distinct styling */}
        <button
          onClick={() => onAddEvent('red_card', selectedTeam)}
          disabled={state.period === 'pre_match' || state.period === 'finished'}
          className="w-12 h-12 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all border-2 border-red-200"
          aria-label="Aggiungi Cartellino Rosso"
          title="Cartellino Rosso (R)"
        >
          <Zap className="w-5 h-5" />
        </button>
        
        {/* Timeout */}
        <button
          onClick={() => onAddEvent('timeout', selectedTeam)}
          disabled={state.period === 'pre_match' || state.period === 'finished'}
          className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          aria-label="Aggiungi Timeout"
          title="Timeout (T)"
        >
          <Clock className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* Play/Pause Timer */}
      <button
        onClick={onPlayPause}
        disabled={state.period === 'pre_match' || state.period === 'finished'}
        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          isPlaying
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-emerald-500 text-white hover:bg-emerald-600'
        }`}
        aria-label={isPlaying ? 'Pausa' : 'Avvia'}
        title={isPlaying ? 'Pausa (Spazio)' : 'Avvia (Spazio)'}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Event Log Access - Expands sidebar with event count badge */}
      <button
        onClick={onToggleExpand}
        className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-all relative"
        aria-label="Espandi registro eventi"
        title="Registro Eventi (Ctrl+\)"
      >
        <History className="w-5 h-5" />
        {totalEvents > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalEvents}
          </span>
        )}
      </button>
    </div>
  );
};
