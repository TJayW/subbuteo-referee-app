/**
 * CSV Export Adapter (Side Effects)
 * Handles I/O operations for CSV export
 * 
 * RESPONSIBILITY: Blob creation, file download
 * PURE LOGIC IN: domain/export/export-csv-generator.ts
 */

import logger from '@/utils/logger';
import type { DomainMatchState, SettingsState } from '@/domain/match/types';
import { generateCSVReport, generateCSVFilename } from '@/domain/export/export-csv-generator';

/**
 * Export match report as CSV (ADAPTER - contains side effects)
 */
export function exportCSV(
  state: DomainMatchState,
  homeTeamName: string,
  awayTeamName: string,
  settings?: SettingsState
): void {
  try {
    // PURE: Generate CSV content
    const csvContent = generateCSVReport(state, homeTeamName, awayTeamName, settings);
    const homeDisplay = settings?.homeTeamConfig?.displayName || homeTeamName;
    const awayDisplay = settings?.awayTeamConfig?.displayName || awayTeamName;
    const filename = generateCSVFilename(homeDisplay, awayDisplay);

    // SIDE EFFECT: Create Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // SIDE EFFECT: Create download link and trigger
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // SIDE EFFECT: Cleanup URL
    URL.revokeObjectURL(url);
    
    logger.info(`CSV exported: ${filename}`);

  } catch (error) {
    logger.error('CSV export failed:', error);
    throw error;
  }
}
