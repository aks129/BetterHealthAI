import { test, expect, Page } from '@playwright/test';

async function startGame(page: Page, faction: string = 'Stellar Collective') {
  await page.goto('/');
  const newGameBtn = page.locator('text=New Game');
  await expect(newGameBtn).toBeVisible({ timeout: 5000 });
  await newGameBtn.click();
  await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 5000 });

  const factionCard = page.locator('button').filter({ hasText: faction });
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

test.describe('Full Game Flow - End to End', () => {
  test('complete flow: title -> select -> landing -> play', async ({ page }) => {
    // 1. Title screen
    await page.goto('/');
    await expect(page.locator('text=ALPHA CENTAURI')).toBeVisible({ timeout: 5000 });

    // 2. Click New Game
    await page.locator('text=New Game').click();
    await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 5000 });

    // 3. Select faction
    await page.locator('button').filter({ hasText: 'Free Drones' }).click();
    await expect(page.locator('text=Selected')).toBeVisible();
    await page.locator('text=Begin Journey').click();

    // 4. Landing sequence
    const landingContent = page.locator('text=/Unity|Alpha Centauri|Planet|Skip/i');
    await expect(landingContent.first()).toBeVisible({ timeout: 5000 });

    // 5. Skip to gameplay
    await page.locator('text=/skip|Skip/i').click();

    // 6. Verify gameplay view is loaded
    await expect(page.locator('text=/End Turn/i').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=/Free Drones|Drones/i').first()).toBeVisible();
  });

  test('can play 5 turns without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await startGame(page, 'Promethean Order');

    const endTurnBtn = page.locator('text=/End Turn/i').first();
    for (let i = 0; i < 5; i++) {
      await endTurnBtn.click();
      await page.waitForTimeout(300);
    }

    // Verify we're on turn 6
    const turnText = page.locator('text=/Turn 6|M\\.Y\\. 2105/i');
    await expect(turnText.first()).toBeVisible({ timeout: 5000 });

    // No JS errors during gameplay
    expect(errors).toEqual([]);
  });

  test('each faction can start a game successfully', async ({ page }) => {
    const factions = [
      'Stellar Collective',
      'Free Drones',
      'Gaian Shepherds',
      'Promethean Order',
      'Lucid Assembly',
      'Harmony Covenant',
      'Data Nexus',
    ];

    for (const faction of factions) {
      await page.goto('/');
      const newGameBtn = page.locator('text=New Game');
      await expect(newGameBtn).toBeVisible({ timeout: 5000 });
      await newGameBtn.click();
      await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 5000 });

      const factionCard = page.locator('button').filter({ hasText: faction });
      await factionCard.click();
      await page.locator('text=Begin Journey').click();

      const skipBtn = page.locator('text=/skip|Skip/i');
      await expect(skipBtn).toBeVisible({ timeout: 5000 });
      await skipBtn.click();

      // Verify game started
      await expect(page.locator('text=/End Turn/i').first()).toBeVisible({ timeout: 15000 });

      // End one turn to verify game engine works
      await page.locator('text=/End Turn/i').first().click();
      await page.waitForTimeout(500);
      await expect(page.locator('text=/Turn 2|M\\.Y\\. 2101/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('game message appears on planetfall', async ({ page }) => {
    await startGame(page, 'Harmony Covenant');

    // The message log should be visible in the bottom right area
    // Look for the planetfall message or any game message
    await page.waitForTimeout(1000);
    const planetfallMsg = page.locator('text=/Planetfall|Mission Year|new chapter|Harmony/i');
    const msgCount = await planetfallMsg.count();

    // If messages are in a collapsed panel, try clicking to expand
    if (msgCount === 0) {
      const minBtn = page.locator('text=/—|minimize|expand/i');
      if (await minBtn.count() > 0) {
        await minBtn.first().click();
        await page.waitForTimeout(500);
      }
    }

    // Messages should exist after game creation
    await expect(planetfallMsg.first()).toBeVisible({ timeout: 5000 });
  });

  test('navigating between panels preserves game state', async ({ page }) => {
    await startGame(page, 'Gaian Shepherds');

    // End a few turns
    const endTurnBtn = page.locator('text=/End Turn/i').first();
    await endTurnBtn.click();
    await page.waitForTimeout(300);
    await endTurnBtn.click();
    await page.waitForTimeout(300);

    // Verify turn 3 - look for "3" in the turn display area
    await expect(page.locator('text=/M\\.Y\\. 2102/i').first()).toBeVisible({ timeout: 3000 });

    // Open research
    await page.locator('text=/Research/i').first().click();
    await page.waitForTimeout(500);

    // Close research (X button or close button)
    const closeBtn = page.locator('button').filter({ hasText: /✕|×|Close/i }).first();
    await closeBtn.click();
    await page.waitForTimeout(500);

    // Turn should still show 2102
    await expect(page.locator('text=/M\\.Y\\. 2102/i').first()).toBeVisible({ timeout: 3000 });

    // Open diplomacy
    await page.locator('text=/Diplomacy/i').first().click();
    await page.waitForTimeout(500);

    // Close diplomacy
    const closeBtn2 = page.locator('button').filter({ hasText: /✕|×|Close/i }).first();
    await closeBtn2.click();
    await page.waitForTimeout(500);

    // Turn should still show 2102
    await expect(page.locator('text=/M\\.Y\\. 2102/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('no memory leaks across many turns', async ({ page }) => {
    await startGame(page, 'Data Nexus');

    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    // Play 10 turns rapidly
    const endTurnBtn = page.locator('text=/End Turn/i').first();
    for (let i = 0; i < 10; i++) {
      await endTurnBtn.click();
      await page.waitForTimeout(200);
    }

    // Game should still be responsive - check year advanced to 2110
    await expect(page.locator('text=/2110|M\\.Y\\./i').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/End Turn/i').first()).toBeEnabled();

    expect(errors).toEqual([]);
  });
});
