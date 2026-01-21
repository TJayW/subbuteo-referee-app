/**
 * Export Adapter
 * Gestisce side effects: DOM manipulation, file download
 * Separa I/O da business logic (Domain)
 */

import type { DomainMatchState, SettingsState } from '@/domain/match/types';
import { generateHTMLReport } from '@/domain/export/export-html-generator';

/**
 * Esporta HTML report e avvia download
 * ADAPTER LAYER - gestisce DOM + file I/O
 */
export function exportHTML(
  state: DomainMatchState,
  homeTeamName: string = 'Casa',
  awayTeamName: string = 'Ospite',
  settings?: SettingsState
): void {
  // Domain genera HTML puro (no side effects)
  const htmlContent = generateHTMLReport(state, homeTeamName, awayTeamName, settings);

  // Adapter gestisce DOM manipulation + download
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `match-${settings?.homeTeamConfig?.displayName || homeTeamName}-vs-${settings?.awayTeamConfig?.displayName || awayTeamName}-${new Date().toISOString().split('T')[0]}.html`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  URL.revokeObjectURL(url);
}
