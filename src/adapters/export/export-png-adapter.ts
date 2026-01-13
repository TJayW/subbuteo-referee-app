/**
 * PNG Export Adapter (Side Effects)
 * Handles I/O operations for PNG export
 * 
 * RESPONSIBILITY: Browser APIs, html2canvas, file download
 * PURE LOGIC IN: domain/export/export-png-generator.ts
 */

import html2canvas from 'html2canvas';
import logger from '@/utils/logger';
import type { DomainMatchState, SettingsState } from '@/domain/match/types';
import { generatePNGReportData, generatePNGReportHTML, generatePNGFilename } from '@/domain/export/export-png-generator';

/**
 * Export match report as PNG (ADAPTER - contains side effects)
 */
export async function exportPNG(
  state: DomainMatchState,
  homeTeamName: string,
  awayTeamName: string,
  settings?: SettingsState
): Promise<void> {
  try {
    // PURE: Generate data
    const data = generatePNGReportData(state, homeTeamName, awayTeamName, settings);
    const htmlContent = generatePNGReportHTML(data);
    const filename = generatePNGFilename(data.homeDisplay, data.awayDisplay);

    // SIDE EFFECT: Create temporary DOM element
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    // SIDE EFFECT: Render to canvas with html2canvas
    const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
      backgroundColor: '#0d1b2a',
      scale: 2,
      logging: false,
      width: 1280,
      height: 1400,
      windowWidth: 1280,
      windowHeight: 1400,
    });

    // SIDE EFFECT: Cleanup DOM
    document.body.removeChild(container);

    // SIDE EFFECT: Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        logger.error('Failed to generate PNG blob');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();

      // SIDE EFFECT: Cleanup URL
      URL.revokeObjectURL(url);
      
      logger.info(`PNG exported: ${filename}`);
    }, 'image/png');

  } catch (error) {
    logger.error('PNG export failed:', error);
    throw error;
  }
}
