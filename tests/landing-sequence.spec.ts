import { test, expect } from '@playwright/test';

async function navigateToLanding(page: any) {
  await page.goto('/');
  const newGameBtn = page.locator('text=New Game');
  await expect(newGameBtn).toBeVisible({ timeout: 5000 });
  await newGameBtn.click();
  await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 5000 });

  // Select a faction
  const factionCard = page.locator('button').filter({ hasText: 'Gaian Shepherds' });
  await factionCard.click();

  // Click Begin Journey
  const beginBtn = page.locator('text=Begin Journey');
  await expect(beginBtn).toBeVisible({ timeout: 3000 });
  await beginBtn.click();
}

test.describe('Landing Sequence', () => {
  test('shows narration text progressing', async ({ page }) => {
    await navigateToLanding(page);

    // First narration line should appear
    const firstLine = page.locator('text=/Unity.*arrived|Alpha Centauri system/i');
    await expect(firstLine.first()).toBeVisible({ timeout: 8000 });
  });

  test('displays planet visual during approach', async ({ page }) => {
    await navigateToLanding(page);

    // A large rounded element representing the planet should exist
    await page.waitForTimeout(2000);
    const planet = page.locator('.rounded-full').first();
    await expect(planet).toBeVisible();
  });

  test('has skip button', async ({ page }) => {
    await navigateToLanding(page);

    // There should be a skip button
    const skipBtn = page.locator('text=/skip|Skip/i');
    await expect(skipBtn).toBeVisible({ timeout: 5000 });
  });

  test('skip button advances to gameplay', async ({ page }) => {
    await navigateToLanding(page);

    // Click skip
    const skipBtn = page.locator('text=/skip|Skip/i');
    await expect(skipBtn).toBeVisible({ timeout: 5000 });
    await skipBtn.click();

    // Should reach the playing state - look for the TopBar turn indicator or End Turn
    const turnIndicator = page.locator('text=/Turn|M\\.Y\\.|End Turn/i');
    await expect(turnIndicator.first()).toBeVisible({ timeout: 10000 });
  });

  test('auto-advances to gameplay after sequence completes', async ({ page }) => {
    test.setTimeout(60000);
    await navigateToLanding(page);

    // Wait for the full sequence to play out - the landing has multiple phases
    // and eventually auto-advances to the playing state
    const turnIndicator = page.locator('text=/Turn|M\\.Y\\.|End Turn/i');
    await expect(turnIndicator.first()).toBeVisible({ timeout: 45000 });
  });
});
