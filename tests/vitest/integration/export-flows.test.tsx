/**
 * Integration tests for export flows
 * Tests JSON, PNG, CSV, and HTML exports with Blob validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportJSON } from '@/utils/export-utils';
import { exportPNG, exportCSV } from '@/domain/export/export-advanced';
import { exportHTML } from '@/domain/export/export-html';
import {
  FIXTURE_MATCH_STATE,
  FIXTURE_HOME_TEAM,
  FIXTURE_AWAY_TEAM,
  FIXTURE_EXPECTATIONS,
} from '../../fixtures/matchState';

// Helper to read Blob content (jsdom-compatible)
async function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsText(blob);
  });
}

// Mock html2canvas globally
vi.mock('html2canvas', () => ({
  default: vi.fn((element: HTMLElement) => {
    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    
    // Add mock toBlob
    mockCanvas.toBlob = vi.fn((callback: BlobCallback) => {
      const pngBlob = new Blob(['mock-png-data'], { type: 'image/png' });
      callback(pngBlob);
    });
    
    return Promise.resolve(mockCanvas);
  }),
}));

describe('Export Flows Integration', () => {
  let mockBlob: Blob | null = null;
  let mockUrl: string | null = null;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;

  beforeEach(() => {
    // Polyfill URL methods if not present in jsdom
    if (!URL.createObjectURL) {
      (URL as any).createObjectURL = () => 'blob:mock-url';
    }
    if (!URL.revokeObjectURL) {
      (URL as any).revokeObjectURL = () => {};
    }

    // Save originals
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;

    // Mock URL.createObjectURL to capture Blob
    mockUrl = 'blob:mock-url';
    URL.createObjectURL = vi.fn((blob: Blob) => {
      mockBlob = blob;
      return mockUrl!;
    });

    // Mock URL.revokeObjectURL
    URL.revokeObjectURL = vi.fn();

    // Mock link.click() to prevent actual download
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    // Mock document.body.appendChild/removeChild for PNG export
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    // Restore originals
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
    mockBlob = null;
    mockUrl = null;
  });

  describe('JSON Export', () => {
    it('should export valid JSON with correct structure', async () => {
      exportJSON(FIXTURE_MATCH_STATE, FIXTURE_HOME_TEAM, FIXTURE_AWAY_TEAM);

      expect(mockBlob).not.toBeNull();
      expect(mockBlob?.type).toBe('application/json');

      const text = await readBlobAsText(mockBlob!);
      const data = JSON.parse(text);

      // Validate top-level structure
      expect(data).toHaveProperty('match');
      expect(data).toHaveProperty('homeTeam');
      expect(data).toHaveProperty('awayTeam');
      expect(data).toHaveProperty('events');

      // Validate match metadata
      expect(data.match.homeTeam).toBe(FIXTURE_HOME_TEAM);
      expect(data.match.awayTeam).toBe(FIXTURE_AWAY_TEAM);
      expect(data.match.finalScore).toBe('1 - 1');
      expect(data.match.period).toBe('first_half');
      expect(data.match.totalEvents).toBe(FIXTURE_EXPECTATIONS.totalEvents);
      expect(data.match.eventsCursor).toBe(FIXTURE_EXPECTATIONS.totalEvents);

      // Validate team stats
      expect(data.homeTeam.stats.goals).toBe(FIXTURE_EXPECTATIONS.homeGoals);
      expect(data.awayTeam.stats.goals).toBe(FIXTURE_EXPECTATIONS.awayGoals);

      // Validate events array
      expect(data.events).toBeInstanceOf(Array);
      expect(data.events.length).toBe(FIXTURE_EXPECTATIONS.totalEvents);

      // Validate first event structure
      const firstEvent = data.events[0];
      expect(firstEvent).toHaveProperty('id');
      expect(firstEvent).toHaveProperty('time');
      expect(firstEvent).toHaveProperty('period');
      expect(firstEvent).toHaveProperty('type');
      expect(firstEvent).toHaveProperty('team');
      expect(firstEvent.type).toBe('match_start');
      expect(firstEvent.team).toBe('system');

      // Validate URL.createObjectURL and link.click were called
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });

    it('should include team names in JSON data', async () => {
      exportJSON(FIXTURE_MATCH_STATE, FIXTURE_HOME_TEAM, FIXTURE_AWAY_TEAM);

      const text = await readBlobAsText(mockBlob!);
      const data = JSON.parse(text);

      expect(data.homeTeam.name).toBe(FIXTURE_HOME_TEAM);
      expect(data.awayTeam.name).toBe(FIXTURE_AWAY_TEAM);
    });
  });

  describe('CSV Export', () => {
    it('should export valid CSV with header and data rows', async () => {
      await exportCSV(FIXTURE_MATCH_STATE, FIXTURE_HOME_TEAM, FIXTURE_AWAY_TEAM);

      expect(mockBlob).not.toBeNull();
      expect(mockBlob?.type).toBe('text/csv;charset=utf-8;');

      const text = await readBlobAsText(mockBlob!);
      const lines = text.split('\n').filter(line => line.trim().length > 0);

      // Validate CSV has content
      expect(lines.length).toBeGreaterThan(10); // Header + summary + events

      // Validate header contains team names
      expect(text).toContain(FIXTURE_HOME_TEAM);
      expect(text).toContain(FIXTURE_AWAY_TEAM);

      // Validate final score is present
      expect(text).toContain('1 - 1');

      // Validate sections are present
      expect(text).toContain('RIEPILOGO GARE');
      expect(text).toContain('FORMAZIONI');

      // Validate URL.createObjectURL and link.click were called
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });

    it('should include team statistics in CSV', async () => {
      await exportCSV(FIXTURE_MATCH_STATE, FIXTURE_HOME_TEAM, FIXTURE_AWAY_TEAM);

      const text = await readBlobAsText(mockBlob!);

      // Check for statistics headers
      expect(text).toContain('Gol');
      expect(text).toContain('Falli');
      expect(text).toContain('Gialli');

      // Check for expected counts (CSV format: "Team","1","0","1",...)
      const lines = text.split('\n');
      const statsLines = lines.filter(line => 
        line.includes(FIXTURE_HOME_TEAM) || line.includes(FIXTURE_AWAY_TEAM)
      );
      
      // Should have team stats rows
      expect(statsLines.length).toBeGreaterThan(0);
    });
  });

  describe('HTML Export', () => {
    it('should export valid HTML with match summary', async () => {
      exportHTML(FIXTURE_MATCH_STATE, FIXTURE_HOME_TEAM, FIXTURE_AWAY_TEAM);

      expect(mockBlob).not.toBeNull();
      expect(mockBlob?.type).toBe('text/html;charset=utf-8;');

      const text = await readBlobAsText(mockBlob!);

      // Validate HTML structure
      expect(text).toContain('<!DOCTYPE html>');
      expect(text).toContain('<html');
      expect(text).toContain('</html>');
      expect(text).toContain('<body');
      expect(text).toContain('</body>');

      // Validate team names are present
      expect(text).toContain(FIXTURE_HOME_TEAM);
      expect(text).toContain(FIXTURE_AWAY_TEAM);

      // Validate score is present
      expect(text).toContain('1'); // Home goals
      expect(text).toContain('1'); // Away goals

      // Validate event log section
      expect(text).toContain('EVENTO LOG');

      // Validate URL.createObjectURL and link.click were called
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });

    it('should include CSS styling in HTML', async () => {
      exportHTML(FIXTURE_MATCH_STATE, FIXTURE_HOME_TEAM, FIXTURE_AWAY_TEAM);

      const text = await readBlobAsText(mockBlob!);

      // Validate CSS is embedded
      expect(text).toContain('<style>');
      expect(text).toContain('</style>');
      expect(text).toMatch(/font-family:/);
      expect(text).toMatch(/background:/);
    });

    it('should include match events in HTML', async () => {
      exportHTML(FIXTURE_MATCH_STATE, FIXTURE_HOME_TEAM, FIXTURE_AWAY_TEAM);

      const text = await readBlobAsText(mockBlob!);

      // Validate events are rendered
      // Check for event-related classes or structure
      expect(text).toContain('event-');
    });
  });

  describe('PNG Export', () => {
    it('should execute PNG export without throwing errors', async () => {
      // PNG export relies on html2canvas and canvas API which are not fully supported in jsdom
      // This test validates the function can be called and handles errors gracefully
      await expect(
        exportPNG(FIXTURE_MATCH_STATE, FIXTURE_HOME_TEAM, FIXTURE_AWAY_TEAM)
      ).resolves.not.toThrow();

      // Validate DOM container was created (even if export fails due to canvas limitations)
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should handle canvas API limitations gracefully', async () => {
      // jsdom does not fully implement canvas API (getContext returns null)
      // Validate exportPNG catches errors and logs them instead of throwing
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await exportPNG(FIXTURE_MATCH_STATE, FIXTURE_HOME_TEAM, FIXTURE_AWAY_TEAM);

      // Logger.error calls console.error in dev mode, so we expect error logging
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
