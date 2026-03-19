import { test, expect } from '@playwright/test';

test.describe('Faction Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to faction select
    const newGameBtn = page.locator('text=New Game');
    await expect(newGameBtn).toBeVisible({ timeout: 5000 });
    await newGameBtn.click();
    await expect(page.locator('text=Choose Your Path')).toBeVisible({ timeout: 5000 });
  });

  test('displays all 7 factions', async ({ page }) => {
    // Check for each faction name
    const factionNames = [
      'Stellar Collective',
      'Free Drones',
      'Gaian Shepherds',
      'Promethean Order',
      'Lucid Assembly',
      'Harmony Covenant',
      'Data Nexus',
    ];

    for (const name of factionNames) {
      await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('displays faction leaders', async ({ page }) => {
    const leaders = [
      'Chairman Vasily Morozov',
      'CEO Morgan Vale',
      'Dr. Sylvia Thornewood',
      'Colonel Zara Okafor',
      'Academician Wei Chen',
      'Prophet Amare Desta',
      'Director ARIA-7',
    ];

    for (const leader of leaders) {
      await expect(page.locator(`text=${leader}`).first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('clicking a faction selects it with visual highlight', async ({ page }) => {
    // Click the Gaian Shepherds faction
    const gaianCard = page.locator('button').filter({ hasText: 'Gaian Shepherds' });
    await gaianCard.click();

    // The "Selected" indicator should appear
    await expect(page.locator('text=Selected')).toBeVisible({ timeout: 3000 });
  });

  test('shows faction bonuses and penalties', async ({ page }) => {
    // Check that bonus/penalty indicators exist (+ and - symbols)
    const bonuses = page.locator('text=/\\+.*nutrients|\\+.*morale|\\+.*research|\\+.*energy|\\+.*attack|\\+.*production|Free/i');
    const count = await bonuses.count();
    expect(count).toBeGreaterThan(0);
  });

  test('shows Begin Journey button after selecting a faction', async ({ page }) => {
    // Select a faction first
    const factionCard = page.locator('button').filter({ hasText: 'Lucid Assembly' });
    await factionCard.click();

    // Begin Journey button should appear
    const beginBtn = page.locator('text=Begin Journey');
    await expect(beginBtn).toBeVisible({ timeout: 3000 });
  });

  test('shows faction backstory when selected', async ({ page }) => {
    const factionCard = page.locator('button').filter({ hasText: 'Promethean Order' });
    await factionCard.click();

    // Backstory text should appear in the detail area
    const backstory = page.locator('text=/Colonel Zara Okafor served/i');
    await expect(backstory).toBeVisible({ timeout: 3000 });
  });

  test('Begin Journey navigates to landing sequence', async ({ page }) => {
    // Select a faction
    const factionCard = page.locator('button').filter({ hasText: 'Data Nexus' });
    await factionCard.click();

    // Click Begin Journey
    const beginBtn = page.locator('text=Begin Journey');
    await expect(beginBtn).toBeVisible({ timeout: 3000 });
    await beginBtn.click();

    // Should show the landing sequence (narration text)
    const landingText = page.locator('text=/Unity|Alpha Centauri|Planet|atmosphere/i');
    await expect(landingText.first()).toBeVisible({ timeout: 5000 });
  });

  test('can switch between factions', async ({ page }) => {
    // Select first faction
    const gaian = page.locator('button').filter({ hasText: 'Gaian Shepherds' });
    await gaian.click();
    await expect(page.locator('text=Selected')).toBeVisible();

    // Select a different faction
    const nexus = page.locator('button').filter({ hasText: 'Data Nexus' });
    await nexus.click();

    // Only one "Selected" badge should show
    const selectedBadges = page.locator('text=Selected');
    await expect(selectedBadges).toHaveCount(1);
  });

  test('has starfield animated background', async ({ page }) => {
    const stars = page.locator('.rounded-full.bg-white');
    const count = await stars.count();
    expect(count).toBeGreaterThan(30);
  });
});
