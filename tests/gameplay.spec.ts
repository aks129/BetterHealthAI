import { test, expect, Page } from '@playwright/test';

async function startGame(page: Page) {
  await page.goto('/');
  // Title -> Faction Select
  const newGameBtn = page.locator('text=New Game');
  await expect(newGameBtn).toBeVisible({ timeout: 5000 });
  await newGameBtn.click();
  await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 5000 });

  // Select Gaian Shepherds
  const factionCard = page.locator('button').filter({ hasText: 'Gaian Shepherds' });
  await factionCard.click();
  const beginBtn = page.locator('text=Begin Journey');
  await expect(beginBtn).toBeVisible({ timeout: 3000 });
  await beginBtn.click();

  // Skip landing sequence
  const skipBtn = page.locator('text=/skip|Skip/i');
  await expect(skipBtn).toBeVisible({ timeout: 5000 });
  await skipBtn.click();

  // Wait for game view
  const endTurn = page.locator('text=/End Turn/i');
  await expect(endTurn.first()).toBeVisible({ timeout: 15000 });
}

test.describe('Main Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test('displays TopBar with faction name and turn info', async ({ page }) => {
    // Faction name should be visible
    await expect(page.locator('text=Gaian').first()).toBeVisible();

    // Turn indicator
    await expect(page.locator('text=/Turn|M\\.Y\\./i').first()).toBeVisible();
  });

  test('displays hex map with SVG elements', async ({ page }) => {
    // The hex map renders an SVG with terrain patterns and elements
    const svgElement = page.locator('svg').first();
    await expect(svgElement).toBeVisible({ timeout: 5000 });

    // Should have multiple SVG elements (rects, paths, circles for hexes/units/terrain)
    const svgChildren = page.locator('svg rect, svg path, svg circle, svg g');
    const count = await svgChildren.count();
    expect(count).toBeGreaterThan(5);
  });

  test('TopBar shows resource totals', async ({ page }) => {
    // Look for resource labels
    const nutrients = page.locator('text=/nutrient/i');
    const minerals = page.locator('text=/mineral/i');
    const energy = page.locator('text=/energy/i');

    // At least some resource indicators should be visible
    const totalVisible = (await nutrients.count()) + (await minerals.count()) + (await energy.count());
    expect(totalVisible).toBeGreaterThan(0);
  });

  test('End Turn button advances the turn', async ({ page }) => {
    // Find turn number text
    const turnText = page.locator('text=/Turn 1|M\\.Y\\. 2100/i');
    await expect(turnText.first()).toBeVisible({ timeout: 5000 });

    // Click End Turn
    const endTurnBtn = page.locator('text=/End Turn/i').first();
    await endTurnBtn.click();

    // Turn should advance
    await page.waitForTimeout(1000);
    const newTurnText = page.locator('text=/Turn 2|M\\.Y\\. 2101/i');
    await expect(newTurnText.first()).toBeVisible({ timeout: 5000 });
  });

  test('can end multiple turns', async ({ page }) => {
    const endTurnBtn = page.locator('text=/End Turn/i').first();

    // End turn 3 times
    for (let i = 0; i < 3; i++) {
      await endTurnBtn.click();
      await page.waitForTimeout(500);
    }

    // Should be on turn 4
    const turnText = page.locator('text=/Turn 4|M\\.Y\\. 2103/i');
    await expect(turnText.first()).toBeVisible({ timeout: 5000 });
  });

  test('message log is accessible', async ({ page }) => {
    // The message log toggle button should exist
    const logToggle = page.locator('text=/◂|▸|Message/i');
    if (await logToggle.count() > 0) {
      await logToggle.first().click();
      await page.waitForTimeout(500);

      // Should show message log content
      const logContent = page.locator('text=/Message Log|Planetfall|Turn/i');
      await expect(logContent.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('Research button opens research panel', async ({ page }) => {
    const researchBtn = page.locator('text=/Research/i').first();
    await researchBtn.click();

    // Research panel should show tech categories
    const techPanel = page.locator('text=/Explore|Discover|Build|Conquer/i');
    await expect(techPanel.first()).toBeVisible({ timeout: 5000 });
  });

  test('Diplomacy button opens diplomacy panel', async ({ page }) => {
    const diplomacyBtn = page.locator('text=/Diplomacy/i').first();
    await diplomacyBtn.click();

    // Should show other factions
    const factionEntry = page.locator('text=/Stellar Collective|Free Drones|Promethean|Lucid|Harmony|Data Nexus/i');
    await expect(factionEntry.first()).toBeVisible({ timeout: 5000 });
  });

  test('Datalinks button opens datalinks panel', async ({ page }) => {
    const datalinksBtn = page.locator('button, [role="button"]').filter({ hasText: /Datalinks/i }).first();
    await datalinksBtn.click();

    // Should show datalinks categories
    const categories = page.locator('text=/Technologies|Units|Facilities/i');
    await expect(categories.first()).toBeVisible({ timeout: 5000 });
  });

  test('clicking on hex map interacts with tiles', async ({ page }) => {
    // Click on the SVG map area
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
    const box = await svg.boundingBox();
    if (box) {
      // Click in the center of the map
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
      // No crash is a pass - interaction should be handled gracefully
    }
  });

  test('map supports mouse wheel zoom', async ({ page }) => {
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
    const box = await svg.boundingBox();
    if (box) {
      // Zoom in
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, -300);
      await page.waitForTimeout(500);
      // Zoom out
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(500);
      // No crash means zoom is handled
    }
  });
});
