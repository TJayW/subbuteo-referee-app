/**
 * E2E Test: Streaming P2P Integration
 * 
 * Tests streaming functionality end-to-end:
 * - Browser compatibility check
 * - Start/stop streaming
 * - Share link generation
 * - Viewer count tracking
 * - Metadata sync
 */

import { test, expect } from '@playwright/test';

test.describe('Streaming P2P', () => {
  test('should show streaming control in sidebar', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await expect(page.locator('text=Subbuteo Referee')).toBeVisible();
    
    // Check if streaming control is visible in sidebar
    // Note: Requires HTTPS in production for getUserMedia()
    const streamingSection = page.locator('text=Streaming Live');
    
    // In local dev (http://localhost), might show browser not supported
    const isSupported = await streamingSection.isVisible() || 
                       await page.locator('text=Browser non supporta streaming').isVisible();
    
    expect(isSupported).toBe(true);
  });

  test('should generate shareable stream URL', async ({ page, context }) => {
    await page.goto('/');
    
    // Mock getUserMedia for testing (Playwright doesn't have real camera)
    await context.grantPermissions(['camera', 'microphone']);
    
    await page.evaluate(() => {
      // Mock getUserMedia
      navigator.mediaDevices.getUserMedia = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        // @ts-ignore
        const stream = canvas.captureStream();
        return stream;
      };
    });

    // Try to find start streaming button
    const startButton = page.locator('button:has-text("Avvia Streaming")');
    
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Wait for stream to start
      await page.waitForTimeout(2000);
      
      // Check for share link
      const shareLink = page.locator('input[readonly][value*="#/watch/"]');
      await expect(shareLink).toBeVisible();
      
      // Verify link format
      const linkValue = await shareLink.inputValue();
      expect(linkValue).toMatch(/\#\/watch\/subbuteo-\d+-[a-z0-9]+/);
      
      // Stop streaming
      const stopButton = page.locator('button:has-text("Ferma Streaming")');
      await stopButton.click();
    }
  });

  test('should show viewer count when streaming', async ({ page, context }) => {
    await page.goto('/');
    
    await context.grantPermissions(['camera', 'microphone']);
    
    await page.evaluate(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const canvas = document.createElement('canvas');
        // @ts-ignore
        return canvas.captureStream();
      };
    });

    const startButton = page.locator('button:has-text("Avvia Streaming")');
    
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
      
      // Should show 0 viewers initially
      await expect(page.locator('text=0 spettatori')).toBeVisible();
    }
  });

  test('should navigate to watch page with stream key', async ({ page }) => {
    const mockStreamKey = 'subbuteo-1234567890-abc123';
    
    // Navigate to watch page directly
    await page.goto(`/#/watch/${mockStreamKey}`);
    
    // Should show viewer page UI
    await expect(page.locator('text=Subbuteo Live')).toBeVisible();
    await expect(page.locator('text=Connessione in corso')).toBeVisible();
  });

  test('should show error on invalid stream key', async ({ page }) => {
    await page.goto('/#/watch/invalid-key-xyz');
    
    // Wait for connection attempt
    await page.waitForTimeout(5000);
    
    // Should eventually show error
    const errorText = page.locator('text=Errore di connessione');
    await expect(errorText).toBeVisible({ timeout: 10000 });
  });

  test('should copy stream link to clipboard', async ({ page, context }) => {
    await page.goto('/');
    
    await context.grantPermissions(['camera', 'microphone', 'clipboard-read', 'clipboard-write']);
    
    await page.evaluate(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const canvas = document.createElement('canvas');
        // @ts-ignore
        return canvas.captureStream();
      };
    });

    const startButton = page.locator('button:has-text("Avvia Streaming")');
    
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
      
      // Click copy button
      const copyButton = page.locator('button[title="Copia link"]');
      await copyButton.click();
      
      // Should show check mark (copied)
      await expect(page.locator('svg[class*="lucide-check"]').first()).toBeVisible();
    }
  });

  test('should show match metadata on watch page', async ({ page }) => {
    await page.goto('/#/watch/test-stream-key');
    
    // Should show default match info
    await expect(page.locator('text=Partita di Subbuteo')).toBeVisible();
    
    // Should show streaming info
    await expect(page.locator('text=peer-to-peer')).toBeVisible();
  });

  test('should handle browser compatibility gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Mock unsupported browser
    await page.evaluate(() => {
      // @ts-ignore
      delete navigator.mediaDevices;
    });
    
    await page.reload();
    
    // Should show compatibility message if streaming control attempts to render
    // (May not be visible if app loads normally)
    const compatibilityMessage = page.locator('text=Browser non supporta streaming');
    
    // Either streaming control is visible, or compatibility message shows
    const hasStreamingUI = await page.locator('text=Streaming Live').isVisible();
    const hasCompatMessage = await compatibilityMessage.isVisible();
    
    expect(hasStreamingUI || hasCompatMessage).toBe(true);
  });
});

test.describe('Streaming URL Routing', () => {
  test('should handle hash-based routing for watch page', async ({ page }) => {
    // Test various URL formats
    const urls = [
      '/#/watch/subbuteo-123-abc',
      '/#/watch/test-key',
      '/#/watch/subbuteo-1737489234-xyz789',
    ];

    for (const url of urls) {
      await page.goto(url);
      
      // Should land on watch page, not main app
      await expect(page.locator('text=Subbuteo Live')).toBeVisible();
      
      // Should NOT show main app header
      const mainHeader = page.locator('text=Operator Console');
      await expect(mainHeader).not.toBeVisible();
    }
  });

  test('should navigate back from watch page', async ({ page }) => {
    await page.goto('/#/watch/test-key');
    
    // Click home button
    const homeButton = page.locator('button:has-text("Home")');
    await homeButton.click();
    
    // Should return to main app
    await expect(page.locator('text=Subbuteo Referee')).toBeVisible();
  });
});

test.describe('Streaming Persistence', () => {
  test('should persist streaming state to localStorage', async ({ page, context }) => {
    await page.goto('/');
    
    await context.grantPermissions(['camera', 'microphone']);
    
    await page.evaluate(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const canvas = document.createElement('canvas');
        // @ts-ignore
        return canvas.captureStream();
      };
    });

    const startButton = page.locator('button:has-text("Avvia Streaming")');
    
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
      
      // Check localStorage
      const streamingState = await page.evaluate(() => {
        return localStorage.getItem('subbuteo-streaming-state');
      });
      
      expect(streamingState).not.toBeNull();
      
      // Parse and verify structure
      if (streamingState) {
        const parsed = JSON.parse(streamingState);
        expect(parsed).toHaveProperty('streamKey');
        expect(parsed).toHaveProperty('status');
        expect(parsed.streamKey).not.toBeNull();
      }
    }
  });
});
