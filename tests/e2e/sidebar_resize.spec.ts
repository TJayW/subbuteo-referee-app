/**
 * E2E tests for sidebar resize drag behavior
 * Tests pointer interactions that cannot be properly simulated in JSDOM
 */

import { test, expect } from '@playwright/test';

test.describe('Sidebar Resize - Drag Behavior (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Wait for app to load
    await page.waitForSelector('aside');
  });

  test('sidebar starts at default width (280px)', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const box = await sidebar.boundingBox();
    expect(box?.width).toBeCloseTo(280, 5);
  });

  test('resize handle is visible and accessible', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    await expect(handle).toBeVisible();
    
    // Check ARIA attributes
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    await expect(handle).toHaveAttribute('aria-valuemin', '80');
    await expect(handle).toHaveAttribute('aria-valuemax', '360');
    await expect(handle).toHaveAttribute('aria-valuenow', '280');
  });

  test('dragging handle right increases sidebar width', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    const sidebar = page.locator('aside').first();
    
    // Get initial width
    const initialBox = await sidebar.boundingBox();
    const initialWidth = initialBox?.width || 0;
    
    // Drag handle 40px to the right
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(initialWidth + 40, 100);
    await page.mouse.up();
    
    // Wait for width to update
    await page.waitForTimeout(100);
    
    // Check new width
    const newBox = await sidebar.boundingBox();
    const newWidth = newBox?.width || 0;
    
    expect(newWidth).toBeGreaterThan(initialWidth);
    expect(newWidth).toBeCloseTo(320, 10); // Should snap to 320
  });

  test('dragging handle left decreases sidebar width', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    const sidebar = page.locator('aside').first();
    
    // Get initial width (280px)
    const initialBox = await sidebar.boundingBox();
    const initialWidth = initialBox?.width || 0;
    
    // Drag handle 100px to the left
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(initialWidth - 100, 100);
    await page.mouse.up();
    
    // Wait for width to update
    await page.waitForTimeout(100);
    
    // Check new width
    const newBox = await sidebar.boundingBox();
    const newWidth = newBox?.width || 0;
    
    expect(newWidth).toBeLessThan(initialWidth);
  });

  test('sidebar width clamps to MIN (80px)', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    const sidebar = page.locator('aside').first();
    
    // Try to drag far left (below minimum)
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(10, 100); // Very small x position
    await page.mouse.up();
    
    // Wait for width to update
    await page.waitForTimeout(100);
    
    // Check width is clamped to 80px
    const box = await sidebar.boundingBox();
    expect(box?.width).toBeCloseTo(80, 5);
  });

  test('sidebar width clamps to MAX (360px)', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    const sidebar = page.locator('aside').first();
    
    // Try to drag far right (above maximum)
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(500, 100); // Very large x position
    await page.mouse.up();
    
    // Wait for width to update
    await page.waitForTimeout(100);
    
    // Check width is clamped to 360px
    const box = await sidebar.boundingBox();
    expect(box?.width).toBeCloseTo(360, 5);
  });

  test('snaps to 280 when dragged within threshold', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    const sidebar = page.locator('aside').first();
    
    // Drag to ~275px (within 12px of 280 snap)
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(275, 100);
    await page.mouse.up();
    
    // Wait for snap
    await page.waitForTimeout(100);
    
    // Should snap to 280
    const box = await sidebar.boundingBox();
    expect(box?.width).toBeCloseTo(280, 5);
  });

  test('snaps to 320 when dragged within threshold', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    const sidebar = page.locator('aside').first();
    
    // Drag to ~315px (within 12px of 320 snap)
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(315, 100);
    await page.mouse.up();
    
    // Wait for snap
    await page.waitForTimeout(100);
    
    // Should snap to 320
    const box = await sidebar.boundingBox();
    expect(box?.width).toBeCloseTo(320, 5);
  });

  test('keeps custom width when outside snap threshold', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    const sidebar = page.locator('aside').first();
    
    // Drag to 200px (not within threshold of any snap)
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(200, 100);
    await page.mouse.up();
    
    // Wait for width to update
    await page.waitForTimeout(100);
    
    // Should stay at ~200
    const box = await sidebar.boundingBox();
    expect(box?.width).toBeCloseTo(200, 15);
  });

  test('main content respects sidebar width (never overlaps)', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    const sidebar = page.locator('aside').first();
    const main = page.locator('main').first();
    
    // Drag to 320px
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(320, 100);
    await page.mouse.up();
    
    // Wait for layout update
    await page.waitForTimeout(100);
    
    // Get positions
    const sidebarBox = await sidebar.boundingBox();
    const mainBox = await main.boundingBox();
    
    // Main should start after sidebar (no overlap)
    expect(mainBox?.x).toBeGreaterThanOrEqual((sidebarBox?.x || 0) + (sidebarBox?.width || 0));
  });

  test('keyboard ArrowRight increases width', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    const sidebar = page.locator('aside').first();
    
    // Focus handle
    await handle.focus();
    
    // Get initial width
    const initialBox = await sidebar.boundingBox();
    const initialWidth = initialBox?.width || 0;
    
    // Press ArrowRight 3 times (3 * 8px = 24px)
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    
    // Wait for width to update
    await page.waitForTimeout(100);
    
    // Check width increased by ~24px
    const newBox = await sidebar.boundingBox();
    const newWidth = newBox?.width || 0;
    
    expect(newWidth).toBeCloseTo(initialWidth + 24, 5);
  });

  test('keyboard ArrowLeft decreases width', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    const sidebar = page.locator('aside').first();
    
    // Focus handle
    await handle.focus();
    
    // Get initial width
    const initialBox = await sidebar.boundingBox();
    const initialWidth = initialBox?.width || 0;
    
    // Press ArrowLeft 3 times (3 * 8px = 24px)
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    
    // Wait for width to update
    await page.waitForTimeout(100);
    
    // Check width decreased by ~24px
    const newBox = await sidebar.boundingBox();
    const newWidth = newBox?.width || 0;
    
    expect(newWidth).toBeCloseTo(initialWidth - 24, 5);
  });

  test('keyboard Enter cycles through snap points', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    const sidebar = page.locator('aside').first();
    
    // Focus handle
    await handle.focus();
    
    // Start at 280, press Enter → 320
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    let box = await sidebar.boundingBox();
    expect(box?.width).toBeCloseTo(320, 5);
    
    // Press Enter → 80
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    box = await sidebar.boundingBox();
    expect(box?.width).toBeCloseTo(80, 5);
    
    // Press Enter → 280 (cycle complete)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    box = await sidebar.boundingBox();
    expect(box?.width).toBeCloseTo(280, 5);
  });

  test('sidebar width persists after page reload', async ({ page }) => {
    const handle = page.getByRole('separator', { name: /ridimensiona barra laterale/i });
    
    // Drag to custom width (250px)
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(250, 100);
    await page.mouse.up();
    
    // Wait for debounced save (300ms + buffer)
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    await page.waitForSelector('aside');
    
    // Check width is restored
    const sidebar = page.locator('aside').first();
    const box = await sidebar.boundingBox();
    expect(box?.width).toBeCloseTo(250, 15);
  });
});
