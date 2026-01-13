/**
 * CSV Export Generator (Pure)
 * Generates CSV content WITHOUT side effects
 * 
 * RESPONSIBILITY: Pure CSV string generation
 * NO: document manipulation, Blob, download
 */

import type { DomainMatchState, SettingsState } from '@/domain/match/types';
import { selectAppliedEvents, selectTeamStats } from '@/domain/match/selectors';
import { getEventMetadata } from '@/utils/event-helpers';

/**
 * Generate CSV content (pure function - returns CSV string)
 */
export function generateCSVReport(
  state: DomainMatchState,
  homeTeamName: string,
  awayTeamName: string,
  settings?: SettingsState
): string {
  const stats = selectTeamStats(state);
  const homeDisplay = settings?.homeTeamConfig?.displayName || homeTeamName;
  const awayDisplay = settings?.awayTeamConfig?.displayName || awayTeamName;
  const events = selectAppliedEvents(state);

  let csv = '';

  // Header
  csv += `"LA FINALE - ${homeDisplay} vs ${awayDisplay}"\n`;
  csv += `"Data","${new Date().toLocaleDateString('it-IT')}"\n`;
  csv += `"Risultato finale","${stats.home.goals} - ${stats.away.goals}"\n\n`;

  // Score Summary
  csv += `"RIEPILOGO GARE"\n`;
  csv += `"Squadra","Gol","Angoli","Rimesse","Falli","Tiri","Gialli","Rossi"\n`;
  csv += `"${homeDisplay}","${stats.home.goals}","${stats.home.corners}","${stats.home.throwIns}","${stats.home.fouls}","${stats.home.shots}","${stats.home.yellowCards}","${stats.home.redCards}"\n`;
  csv += `"${awayDisplay}","${stats.away.goals}","${stats.away.corners}","${stats.away.throwIns}","${stats.away.fouls}","${stats.away.shots}","${stats.away.yellowCards}","${stats.away.redCards}"\n\n`;

  // Formations
  const homeFormation = settings?.homeTeamConfig?.formation.name || '4-3-3';
  const awayFormation = settings?.awayTeamConfig?.formation.name || '5-3-2';
  csv += `"FORMAZIONI"\n`;
  csv += `"${homeDisplay}","${homeFormation}"\n`;
  csv += `"${awayDisplay}","${awayFormation}"\n\n`;

  // Players
  csv += `"GIOCATORI ${homeDisplay.toUpperCase()}"\n`;
  csv += `"Nome","Numero","Posizione","Capitano"\n`;
  if (settings?.homeTeamConfig?.formation.players) {
    settings.homeTeamConfig.formation.players.forEach((p) => {
      const captain = p.isCaptain ? 'Sì' : 'No';
      csv += `"${p.name}","${p.number}","${p.position}","${captain}"\n`;
    });
  }
  csv += '\n';

  csv += `"GIOCATORI ${awayDisplay.toUpperCase()}"\n`;
  csv += `"Nome","Numero","Posizione","Capitano"\n`;
  if (settings?.awayTeamConfig?.formation.players) {
    settings.awayTeamConfig.formation.players.forEach((p) => {
      const captain = p.isCaptain ? 'Sì' : 'No';
      csv += `"${p.name}","${p.number}","${p.position}","${captain}"\n`;
    });
  }
  csv += '\n';

  // Event Log
  csv += `"EVENTO LOG"\n`;
  csv += `"Tempo","Periodo","Squadra","Evento","Giocatore","Note"\n`;
  events.forEach((event) => {
    const meta = getEventMetadata(event.type);
    const player = ((event as unknown as Record<string, unknown>).player as string) || '';
    const notes = ((event as unknown as Record<string, unknown>).notes as string) || '';
    csv += `"${event.secondsInPeriod}"","${event.period}","${event.team === 'home' ? homeDisplay : awayDisplay}","${meta.label}","${player}","${notes}"\n`;
  });

  return csv;
}

/**
 * Generate CSV filename
 */
export function generateCSVFilename(homeDisplay: string, awayDisplay: string): string {
  return `match-${homeDisplay}-vs-${awayDisplay}-${new Date().toISOString().split('T')[0]}.csv`;
}
