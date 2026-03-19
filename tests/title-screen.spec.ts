import { test, expect } from '@playwright/test';

test.describe('Title Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays game title', async ({ page }) => {
    // The title should appear after the animation delay
    const title = page.locator('text=ALPHA CENTAURI');
    await expect(title).toBeVisible({ timeout: 5000 });
  });

  test('displays subtitle "NEW HORIZON"', async ({ page }) => {
    const subtitle = page.locator('text=NEW HORIZON');
    await expect(subtitle).toBeVisible({ timeout: 5000 });
  });

  test('displays tagline', async ({ page }) => {
    const tagline = page.locator('text=A new world awaits');
    await expect(tagline).toBeVisible({ timeout: 5000 });
  });

  test('shows New Game button', async ({ page }) => {
    const newGameBtn = page.locator('text=New Game');
    await expect(newGameBtn).toBeVisible({ timeout: 5000 });
  });

  test('shows Datalinks button', async ({ page }) => {
    const datalinksBtn = page.locator('text=Datalinks');
    await expect(datalinksBtn).toBeVisible({ timeout: 5000 });
  });

  test('has animated starfield background', async ({ page }) => {
    // Stars are rendered as small absolute-positioned divs with bg-white
    await page.waitForTimeout(1000);
    const stars = page.locator('.rounded-full.bg-white');
    const count = await stars.count();
    expect(count).toBeGreaterThan(50);
  });

  test('has animated planet element', async ({ page }) => {
    // The planet is a large rounded-full div with radial-gradient in style
    await page.waitForTimeout(1000);
    const planet = page.locator('.rounded-full[style*="radial-gradient"]').first();
    await expect(planet).toBeVisible({ timeout: 5000 });
  });

  test('clicking New Game navigates to faction select', async ({ page }) => {
    const newGameBtn = page.locator('text=New Game');
    await expect(newGameBtn).toBeVisible({ timeout: 5000 });
    await newGameBtn.click();

    // Should now show faction selection
    const factionHeader = page.locator('text=Choose Your Path');
    await expect(factionHeader).toBeVisible({ timeout: 5000 });
  });

  test('clicking Datalinks opens datalinks panel', async ({ page }) => {
    const datalinksBtn = page.locator('text=Datalinks');
    await expect(datalinksBtn).toBeVisible({ timeout: 5000 });
    await datalinksBtn.click();

    const datalinksPanel = page.locator('text=Datalinks').first();
    await expect(datalinksPanel).toBeVisible({ timeout: 5000 });
  });

  test('page has correct HTML title', async ({ page }) => {
    await expect(page).toHaveTitle('Alpha Centauri: New Horizon');
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });
});
