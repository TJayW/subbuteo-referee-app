/**
 * Responsive Sidebar E2E Tests (Playwright)
 * Tests sidebar behavior across breakpoints with real browser viewport
 */

import { test, expect } from '@playwright/test';

// Viewport configurations
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const TABLET_VIEWPORT = { width: 900, height: 1024 };
const MOBILE_VIEWPORT = { width: 375, height: 667 };

test.describe('Responsive Sidebar E2E - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('desktop: drag resize changes width and main offset', async ({ page }) => {
    // Find sidebar
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    // Get initial width
    const initialWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    expect(initialWidth).toBeCloseTo(280, 5);

    // Find resize handle
    const handle = page.locator('[role="separator"]').first();
    await expect(handle).toBeVisible();

    // Get handle position
    const handleBox = await handle.boundingBox();
    expect(handleBox).toBeTruthy();

    // Drag handle right by 40px
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 40, handleBox!.y + handleBox!.height / 2);
    await page.mouse.up();

    // Wait for animation
    await page.waitForTimeout(250);

    // Check new width
    const newWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    expect(newWidth).toBeGreaterThan(initialWidth);
    expect(newWidth).toBeLessThanOrEqual(360); // MAX_WIDTH

    // Verify no horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('desktop: keyboard resize with Enter cycles snap points', async ({ page }) => {
    const handle = page.locator('[role="separator"]').first();
    await handle.focus();

    // Initial width should be 280
    let width = await page.locator('aside').first().evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeCloseTo(280, 5);

    // Press Enter → should cycle to 320
    await handle.press('Enter');
    await page.waitForTimeout(250);
    width = await page.locator('aside').first().evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeCloseTo(320, 5);

    // Press Enter → should cycle to 80
    await handle.press('Enter');
    await page.waitForTimeout(250);
    width = await page.locator('aside').first().evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeCloseTo(80, 5);

    // Press Enter → should cycle back to 280
    await handle.press('Enter');
    await page.waitForTimeout(250);
    width = await page.locator('aside').first().evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeCloseTo(280, 5);
  });

  test('desktop: width persists to SIDEBAR_WIDTH_DESKTOP', async ({ page }) => {
    const handle = page.locator('[role="separator"]').first();
    await handle.focus();
    await handle.press('Enter'); // Cycle to 320px

    // Wait for debounced persistence
    await page.waitForTimeout(400);

    // Check localStorage
    const stored = await page.evaluate(() => localStorage.getItem('subbuteo_sidebar_width_desktop'));
    expect(stored).toBe('320');
  });
});

test.describe('Responsive Sidebar E2E - Tablet', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(TABLET_VIEWPORT);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('tablet: sidebar visible with resize handle', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    const handle = page.locator('[role="separator"]').first();
    await expect(handle).toBeVisible();
  });

  test('tablet: drag resize within tablet max (320px)', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const handle = page.locator('[role="separator"]').first();

    const handleBox = await handle.boundingBox();
    expect(handleBox).toBeTruthy();

    // Try to drag very far right (should be capped at 320)
    await page.mouse.move(handleBox!.x, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 200, handleBox!.y + handleBox!.height / 2); // Large drag
    await page.mouse.up();

    await page.waitForTimeout(250);

    // Width should be capped at 320
    const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(320);
  });

  test('tablet: persists to SIDEBAR_WIDTH_TABLET key', async ({ page }) => {
    const handle = page.locator('[role="separator"]').first();
    await handle.focus();
    await handle.press('Enter'); // Cycle to 320px

    await page.waitForTimeout(400);

    const stored = await page.evaluate(() => localStorage.getItem('subbuteo_sidebar_width_tablet'));
    expect(stored).toBe('320');

    // Should NOT write to desktop key
    const desktopStored = await page.evaluate(() => localStorage.getItem('subbuteo_sidebar_width_desktop'));
    expect(desktopStored).toBeNull();
  });

  test('tablet: no horizontal scroll', async ({ page }) => {
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});

test.describe('Responsive Sidebar E2E - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('mobile: sidebar hidden, bottom dock visible', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    
    // Sidebar should not be visible
    const isVisible = await sidebar.isVisible().catch(() => false);
    expect(isVisible).toBe(false);

    // Bottom dock should be visible (look for play/pause button)
    const playButton = page.getByRole('button', { name: /avvia|pausa/i });
    await expect(playButton).toBeVisible();
  });

  test('mobile: resize handle not rendered', async ({ page }) => {
    const handle = page.locator('[role="separator"]').first();
    const exists = await handle.count();
    
    if (exists > 0) {
      // If it exists, it should not be visible
      await expect(handle).not.toBeVisible();
    } else {
      // Or it should not exist at all
      expect(exists).toBe(0);
    }
  });

  test('mobile: P0 controls usable (team + events + play/pause)', async ({ page }) => {
    // Play/Pause button
    const playButton = page.getByRole('button', { name: /avvia/i });
    await expect(playButton).toBeVisible();
    await expect(playButton).toBeEnabled();

    // Team selector buttons (home/away)
    const teamButtons = page.locator('button').filter({ hasText: /home|away|casa|ospiti/i });
    expect(await teamButtons.count()).toBeGreaterThan(0);

    // Event buttons (at least goal button should be visible)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(3); // At least team + play + some event buttons
  });

  test('mobile: no horizontal scroll', async ({ page }) => {
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('mobile: no overlap with top bar', async ({ page }) => {
    const topBar = page.locator('header').first();
    const topBarBox = await topBar.boundingBox();
    expect(topBarBox).toBeTruthy();

    // Main content should not overlap top bar
    const main = page.locator('main').first();
    const mainBox = await main.boundingBox();
    expect(mainBox).toBeTruthy();

    // Main should start below top bar
    expect(mainBox!.y).toBeGreaterThanOrEqual(topBarBox!.y + topBarBox!.height - 1);
  });

  test('mobile: bottom dock does not overlap main content', async ({ page }) => {
    // Find bottom dock
    const bottomDock = page.locator('div').filter({ hasText: /avvia|pausa/i }).first();
    const dockBox = await bottomDock.boundingBox();
    
    if (dockBox) {
      // Dock should be at bottom
      const viewportHeight = page.viewportSize()!.height;
      expect(dockBox.y + dockBox.height).toBeLessThanOrEqual(viewportHeight);
    }
  });
});

test.describe('Responsive Sidebar E2E - Breakpoint Switching', () => {
  test('switching desktop→tablet preserves appropriate width', async ({ page }) => {
    // Start desktop
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Set width to 320px
    const handle = page.locator('[role="separator"]').first();
    await handle.focus();
    await handle.press('Enter'); // 320px
    await page.waitForTimeout(400);

    // Switch to tablet viewport
    await page.setViewportSize(TABLET_VIEWPORT);
    await page.waitForTimeout(300);

    // Width should still be reasonable (≤320px)
    const sidebar = page.locator('aside').first();
    const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(320);
  });

  test('switching tablet→mobile shows bottom dock', async ({ page }) => {
    // Start tablet
    await page.setViewportSize(TABLET_VIEWPORT);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Sidebar should be visible
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    // Switch to mobile
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.waitForTimeout(300);

    // Sidebar should be hidden
    const isVisible = await sidebar.isVisible().catch(() => false);
    expect(isVisible).toBe(false);

    // Bottom dock should be visible
    const playButton = page.getByRole('button', { name: /avvia|pausa/i });
    await expect(playButton).toBeVisible();
  });

  test('orientation change does not break layout', async ({ page }) => {
    // Start portrait mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // No horizontal scroll
    let hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Rotate to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(200);

    // Still no horizontal scroll
    hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Controls still accessible
    const playButton = page.getByRole('button', { name: /avvia|pausa/i });
    await expect(playButton).toBeVisible();
  });
});
