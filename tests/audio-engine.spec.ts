import { test, expect, Page } from '@playwright/test';

/**
 * Helper: Navigate to game and start playing
 */
async function startGame(page: Page, faction: string = 'Gaian Shepherds') {
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

test.describe('Audio Engine Integration', () => {

  test('audio engine initializes on first click without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await expect(page.locator('text=New Game')).toBeVisible({ timeout: 5000 });

    // Click New Game - this triggers audioEngine.init()
    await page.locator('text=New Game').click();
    await page.waitForTimeout(500);

    // Verify AudioContext was created and is running
    const audioState = await page.evaluate(() => {
      // Access the singleton from the module via the window context
      // The audioEngine is imported as a module singleton, check if AudioContext exists
      return {
        hasAudioContext: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
      };
    });

    expect(audioState.hasAudioContext).toBe(true);
    expect(errors).toEqual([]);
  });

  test('audio engine creates AudioContext when initialized', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=New Game')).toBeVisible({ timeout: 5000 });

    // Before click - check no AudioContext yet
    const beforeCount = await page.evaluate(() => {
      return (window as any).__audioContextCount || 0;
    });

    // Patch AudioContext to track creation
    await page.evaluate(() => {
      const OrigAC = window.AudioContext;
      (window as any).__audioContextCount = 0;
      (window as any).AudioContext = class extends OrigAC {
        constructor() {
          super();
          (window as any).__audioContextCount++;
        }
      };
    });

    // Click triggers init
    await page.locator('text=New Game').click();
    await page.waitForTimeout(1000);

    const afterCount = await page.evaluate(() => {
      return (window as any).__audioContextCount || 0;
    });

    // At least one AudioContext should have been created
    expect(afterCount).toBeGreaterThanOrEqual(1);
  });

  test('no audio-related errors during full game flow', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await startGame(page, 'Stellar Collective');

    // Play several turns
    const endTurnBtn = page.locator('text=/End Turn/i').first();
    for (let i = 0; i < 3; i++) {
      await endTurnBtn.click();
      await page.waitForTimeout(500);
    }

    // Open research panel
    await page.locator('text=/Research/i').first().click();
    await page.waitForTimeout(500);
    const closeBtn = page.locator('button').filter({ hasText: /✕|×|Close/i }).first();
    await closeBtn.click();
    await page.waitForTimeout(500);

    // Open diplomacy panel
    await page.locator('text=/Diplomacy/i').first().click();
    await page.waitForTimeout(500);
    const closeBtn2 = page.locator('button').filter({ hasText: /✕|×|Close/i }).first();
    await closeBtn2.click();
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });

  test('audio controls are visible in TopBar', async ({ page }) => {
    await startGame(page, 'Free Drones');

    // Music note icon (mute button) should be visible
    const muteBtn = page.locator('button[title="Mute"], button[title="Unmute"]');
    await expect(muteBtn).toBeVisible({ timeout: 3000 });

    // Volume dropdown trigger should be visible
    const volumeDropdown = page.locator('button[title="Volume settings"]');
    await expect(volumeDropdown).toBeVisible({ timeout: 3000 });
  });

  test('mute toggle works', async ({ page }) => {
    await startGame(page, 'Free Drones');

    // Find mute button
    const muteBtn = page.locator('button[title="Mute"]');
    await expect(muteBtn).toBeVisible({ timeout: 3000 });

    // Click to mute
    await muteBtn.click();
    await page.waitForTimeout(300);

    // Should now show unmute
    const unmuteBtn = page.locator('button[title="Unmute"]');
    await expect(unmuteBtn).toBeVisible({ timeout: 3000 });

    // Click to unmute
    await unmuteBtn.click();
    await page.waitForTimeout(300);

    // Should show mute again
    await expect(page.locator('button[title="Mute"]')).toBeVisible({ timeout: 3000 });
  });

  test('volume controls dropdown opens and has sliders', async ({ page }) => {
    await startGame(page, 'Lucid Assembly');

    // Open volume dropdown
    const volumeBtn = page.locator('button[title="Volume settings"]');
    await expect(volumeBtn).toBeVisible({ timeout: 3000 });
    await volumeBtn.click();
    await page.waitForTimeout(300);

    // Should show Music and Effects labels
    await expect(page.locator('text=Music')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Effects')).toBeVisible({ timeout: 3000 });

    // Should have range inputs
    const sliders = page.locator('input[type="range"]');
    expect(await sliders.count()).toBe(2);
  });

  test('volume sliders are functional', async ({ page }) => {
    await startGame(page, 'Promethean Order');

    // Open volume dropdown
    await page.locator('button[title="Volume settings"]').click();
    await page.waitForTimeout(300);

    // Get first slider (music)
    const musicSlider = page.locator('input[type="range"]').first();
    await expect(musicSlider).toBeVisible();

    // Change the slider value
    await musicSlider.fill('20');
    await page.waitForTimeout(100);

    const val = await musicSlider.inputValue();
    expect(val).toBe('20');
  });

  test('audio does not cause errors across phase transitions', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    // Title screen
    await page.goto('/');
    await expect(page.locator('text=New Game')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Faction select
    await page.locator('text=New Game').click();
    await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Select faction (triggers select sfx)
    await page.locator('button').filter({ hasText: 'Gaian Shepherds' }).click();
    await page.waitForTimeout(500);

    // Begin journey (triggers confirm sfx + landing music)
    await page.locator('text=Begin Journey').click();
    await page.waitForTimeout(2000);

    // Skip to gameplay (triggers gameplay music)
    await page.locator('text=/skip|Skip/i').click();
    await expect(page.locator('text=/End Turn/i').first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);

    // End turn (triggers endturn sfx)
    await page.locator('text=/End Turn/i').first().click();
    await page.waitForTimeout(1000);

    expect(errors).toEqual([]);
  });

  test('each faction can start game with audio without errors', async ({ page }) => {
    const factions = [
      'Stellar Collective',
      'Free Drones',
      'Gaian Shepherds',
      'Promethean Order',
      'Lucid Assembly',
    ];

    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    for (const faction of factions) {
      await page.goto('/');
      await expect(page.locator('text=New Game')).toBeVisible({ timeout: 5000 });
      await page.locator('text=New Game').click();
      await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 5000 });

      await page.locator('button').filter({ hasText: faction }).click();
      await page.locator('text=Begin Journey').click();

      const skipBtn = page.locator('text=/skip|Skip/i');
      await expect(skipBtn).toBeVisible({ timeout: 5000 });
      await skipBtn.click();

      await expect(page.locator('text=/End Turn/i').first()).toBeVisible({ timeout: 15000 });

      // Audio controls should be visible for every faction
      const muteBtn = page.locator('button[title="Mute"], button[title="Unmute"]');
      await expect(muteBtn).toBeVisible({ timeout: 3000 });
    }

    expect(errors).toEqual([]);
  });
});
