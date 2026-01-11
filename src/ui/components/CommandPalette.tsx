/**
 * CommandPalette: Cmd+K quick access modal
 * Provides fuzzy search for events, actions, and navigation
 * 
 * Spec Reference: §H Mobile, §I Phase 3
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Target, AlertCircle, X } from 'lucide-react';
import type { MatchEvent } from '@/domain/match/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  events: MatchEvent[];
  onJumpToEvent?: (eventId: string) => void;
  onChangePeriod?: (period: string) => void;
  homeTeamName: string;
  awayTeamName: string;
}

interface CommandItem {
  id: string;
  type: 'event' | 'action' | 'navigation';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  action: () => void;
}

/**
 * Simple fuzzy search: checks if all query characters appear in order
 */
function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qIndex = 0;
  
  for (let i = 0; i < t.length && qIndex < q.length; i++) {
    if (t[i] === q[qIndex]) qIndex++;
  }
  
  return qIndex === q.length;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  events,
  onJumpToEvent,
  onChangePeriod,
  homeTeamName,
  awayTeamName,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build command list from events and actions
  const commands: CommandItem[] = [
    // Navigation actions
    ...(onChangePeriod ? [
      {
        id: 'period-first',
        type: 'action' as const,
        title: 'Vai al primo tempo',
        icon: Clock,
        action: () => { onChangePeriod('first_half'); onClose(); },
      },
      {
        id: 'period-second',
        type: 'action' as const,
        title: 'Vai al secondo tempo',
        icon: Clock,
        action: () => { onChangePeriod('second_half'); onClose(); },
      },
      {
        id: 'period-extra',
        type: 'action' as const,
        title: 'Vai ai tempi supplementari',
        icon: Clock,
        action: () => { onChangePeriod('extra_time'); onClose(); },
      },
    ] : []),
    
    // Event navigation
    ...events.map((event) => {
      const teamName = event.team === 'home' ? homeTeamName : awayTeamName;
      const eventTypeLabel = event.type === 'goal' ? 'Goal' : 
                             event.type === 'yellow_card' ? 'Cartellino giallo' :
                             event.type === 'red_card' ? 'Cartellino rosso' :
                             event.type === 'corner' ? 'Corner' :
                             event.type === 'foul' ? 'Fallo' :
                             event.type === 'shot' ? 'Tiro' :
                             event.type === 'shot_on_target' ? 'Tiro in porta' : event.type;
      
      const eventIcon = event.type === 'goal' ? Target :
                        (event.type === 'yellow_card' || event.type === 'red_card') ? AlertCircle : Clock;
      
      const minutes = Math.floor(event.timestamp / 60);
      
      return {
        id: `event-${event.id}`,
        type: 'event' as const,
        title: `${eventTypeLabel} - ${teamName}`,
        subtitle: `${minutes}'`,
        icon: eventIcon,
        action: () => { 
          if (onJumpToEvent) {
            // Find event index and set cursor
            onJumpToEvent(event.id);
          }
          onClose(); 
        },
      };
    }),
  ];

  // Filter commands by query
  const filteredCommands = query.trim() === '' 
    ? commands 
    : commands.filter(cmd => fuzzyMatch(query, cmd.title) || (cmd.subtitle && fuzzyMatch(query, cmd.subtitle)));

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca eventi, azioni, navigazione..."
            className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-400"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              Nessun risultato trovato
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              const isSelected = index === selectedIndex;
              
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-slate-50'
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                      {cmd.title}
                    </div>
                    {cmd.subtitle && (
                      <div className="text-sm text-slate-500 truncate">
                        {cmd.subtitle}
                      </div>
                    )}
                  </div>
                  {cmd.type === 'event' && (
                    <div className="text-xs text-slate-400 uppercase tracking-wide">
                      Evento
                    </div>
                  )}
                  {cmd.type === 'action' && (
                    <div className="text-xs text-slate-400 uppercase tracking-wide">
                      Azione
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">↑↓</kbd>
            <span>Naviga</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">⏎</kbd>
            <span>Seleziona</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">Esc</kbd>
            <span>Chiudi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
