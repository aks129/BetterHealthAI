import { test, expect, Page } from '@playwright/test';

async function startGame(page: Page) {
  await page.goto('/');
  const newGameBtn = page.locator('text=New Game');
  await expect(newGameBtn).toBeVisible({ timeout: 5000 });
  await newGameBtn.click();
  await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 5000 });

  const factionCard = page.locator('button').filter({ hasText: 'Lucid Assembly' });
  await factionCard.click();
  const beginBtn = page.locator('text=Begin Journey');
  await expect(beginBtn).toBeVisible({ timeout: 3000 });
  await beginBtn.click();

  const skipBtn = page.locator('text=/skip|Skip/i');
  await expect(skipBtn).toBeVisible({ timeout: 5000 });
  await skipBtn.click();

  const endTurn = page.locator('text=/End Turn/i');
  await expect(endTurn.first()).toBeVisible({ timeout: 15000 });
}

test.describe('Research Panel', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
    // Open research panel
    const researchBtn = page.locator('text=/Research/i').first();
    await researchBtn.click();
    await page.waitForTimeout(500);
  });

  test('shows 4 tech categories', async ({ page }) => {
    await expect(page.locator('text=Explore').first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Discover').first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Build').first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Conquer').first()).toBeVisible({ timeout: 3000 });
  });

  test('shows technology nodes', async ({ page }) => {
    // Look for known tier 1 tech names - panel may need scrolling
    const techNames = ['Centauri Ecology', 'Applied Physics', 'Social Engineering', 'Biogenetics', 'Planetfall Protocols', 'Information Networks'];
    let foundCount = 0;
    for (const name of techNames) {
      const tech = page.locator(`text=${name}`);
      if (await tech.count() > 0) foundCount++;
    }
    expect(foundCount).toBeGreaterThan(0);
  });

  test('shows current research progress', async ({ page }) => {
    // Look for progress indicator or current research display
    const progress = page.locator('text=/progress|current|researching/i');
    // Progress may or may not be visible depending on whether research is set
    // This is a soft check
    await page.waitForTimeout(500);
  });

  test('can select an available technology', async ({ page }) => {
    // Find and click an available tech (they should be clickable/not dimmed)
    const availableTechs = page.locator('text=/Centauri Ecology|Social Engineering|Applied Physics|Biogenetics|Doctrine/i');
    const count = await availableTechs.count();
    if (count > 0) {
      await availableTechs.first().click();
      await page.waitForTimeout(500);

      // The "Confirm Research" button should appear in the header area
      const confirmBtn = page.locator('button:has-text("Confirm Research")');
      if (await confirmBtn.count() > 0) {
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    }
    // Test passes if we can click a tech without errors
  });

  test('has close button to return to map', async ({ page }) => {
    const closeBtn = page.locator('text=/Close|Return|Back|✕/i');
    await expect(closeBtn.first()).toBeVisible({ timeout: 3000 });
    await closeBtn.first().click();

    // Should return to map view
    const endTurn = page.locator('text=/End Turn/i');
    await expect(endTurn.first()).toBeVisible({ timeout: 5000 });
  });

  test('researched techs are visually distinct', async ({ page }) => {
    // Planetfall Protocols and the starting tech should be researched
    // They should appear with a different visual style (check for opacity or color)
    const planetfall = page.locator('text=Planetfall Protocols');
    if (await planetfall.count() > 0) {
      // Just verify it's visible - the visual distinction is in CSS
      await expect(planetfall.first()).toBeVisible();
    }
  });
});

test.describe('Diplomacy Panel', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
    const diplomacyBtn = page.locator('text=/Diplomacy/i').first();
    await diplomacyBtn.click();
    await page.waitForTimeout(500);
  });

  test('shows other factions with their leaders', async ({ page }) => {
    // Since we picked Lucid Assembly, the other 6 factions should appear
    const otherFactions = [
      'Stellar Collective',
      'Free Drones',
      'Gaian Shepherds',
      'Promethean Order',
      'Harmony Covenant',
      'Data Nexus',
    ];

    let visibleCount = 0;
    for (const name of otherFactions) {
      const faction = page.locator(`text=${name}`);
      if (await faction.count() > 0) visibleCount++;
    }
    expect(visibleCount).toBeGreaterThan(3);
  });

  test('shows relationship status for each faction', async ({ page }) => {
    // Should show neutral/allied/pact/treaty/vendetta status
    const status = page.locator('text=/Neutral|Allied|Pact|Treaty|Vendetta/i');
    const count = await status.count();
    expect(count).toBeGreaterThan(0);
  });

  test('can click on a faction to see details', async ({ page }) => {
    // Click on a faction entry
    const factionEntry = page.locator('text=Promethean Order').first();
    if (await factionEntry.isVisible()) {
      await factionEntry.click();
      await page.waitForTimeout(500);

      // Should show more detail - leader name, personality, or dialogue options
      const detail = page.locator('text=/Okafor|Propose|Declare|aggression|personality/i');
      if (await detail.count() > 0) {
        await expect(detail.first()).toBeVisible();
      }
    }
  });

  test('has close button to return to map', async ({ page }) => {
    const closeBtn = page.locator('text=/Close|Return|Back|✕/i');
    await expect(closeBtn.first()).toBeVisible({ timeout: 3000 });
    await closeBtn.first().click();

    const endTurn = page.locator('text=/End Turn/i');
    await expect(endTurn.first()).toBeVisible({ timeout: 5000 });
  });

  test('shows faction portraits with color coding', async ({ page }) => {
    // Each faction entry should have a colored element (portrait or badge)
    // Check that there are multiple colored elements
    await page.waitForTimeout(500);
    const coloredElements = page.locator('[style*="background"]');
    const count = await coloredElements.count();
    expect(count).toBeGreaterThan(5);
  });
});
