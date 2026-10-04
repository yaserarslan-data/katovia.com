import { test, expect } from '@playwright/test';

test('browser detection, instant switch, metadata, persistence and keyboard', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'language', { value: 'tr-TR' }));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.locator('h1')).toHaveText('BİR ŞEYOYNA.');
  await expect(page.locator('[data-locale="tr"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-game-action]')).toHaveText('BAŞLA');
  await expect(page.locator('#game-title')).toHaveText('5.00’DA DUR');
  await page.locator('[data-locale="en"]').focus(); await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText('PLAYSOMETHING.');
  await expect(page).toHaveTitle('Katovia — Play something');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /play, create, challenge/);
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto('/create/'); await expect(page.locator('h1')).toHaveText('Turn an idea into a game.');
  await page.locator('[data-locale="tr"]').click();
  await expect(page.locator('h1')).toHaveText('Bir fikri oyuna dönüştür.');
  await expect(page.locator('nav [data-i18n="nav.challenge"]')).toHaveText('MEYDAN OKU');
  await page.goto('/tools/'); await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.locator('h1')).toHaveText('Küçük işler. Temiz çözümler.');
  for (const width of [768, 1024, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
});

for (const width of [360, 390, 430]) test(`TR/EN mobile menu and overflow ${width}`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 844 }); await page.goto('/');
  for (const locale of ['tr', 'en']) {
    await page.locator(`[data-locale="${locale}"]`).click();
    await page.locator('[data-menu-toggle]').click();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('[data-menu-toggle]')).toHaveAttribute('aria-label', locale === 'tr' ? 'Menüyü kapat' : 'Close menu');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.locator('[data-locale]').all()) { const box = await button.boundingBox(); expect(box.height).toBeGreaterThanOrEqual(44); expect(box.width).toBeGreaterThanOrEqual(44); }
    if (width === 390) await page.screenshot({ path: testInfo.outputPath(`i18n-${locale}.png`), fullPage: true });
    await page.keyboard.press('Escape');
  }
});

test('storage denied; switching a running and completed game preserves timing/result and share language', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw Error('denied'); } });
    Object.defineProperty(navigator, 'language', { value: 'de-DE' });
    window.__clock = 1000; Object.defineProperty(performance, 'now', { value: () => window.__clock });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (value) => { window.__copied = value; } } });
  });
  await page.goto('/today/'); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.locator('[data-game-action]').click(); await page.locator('[data-locale="tr"]').click();
  await expect(page.locator('[data-daily-mount]')).toHaveAttribute('data-state', 'running');
  await expect(page.locator('[data-game-action]')).toHaveText('DUR');
  await page.evaluate(() => { window.__clock = 6070; }); await page.locator('[data-game-action]').click();
  await expect(page.locator('[data-quality]')).toHaveText('HARİKA');
  await page.locator('[data-copy]').click(); expect(await page.evaluate(() => window.__copied)).toContain('KATOVIA GÜNLÜK');
  await page.locator('[data-locale="en"]').click(); await expect(page.locator('[data-quality]')).toHaveText('GREAT');
  await expect(page.locator('[data-actual]')).toHaveText('5.07'); await page.locator('[data-copy]').click();
  expect(await page.evaluate(() => window.__copied)).toContain('KATOVIA DAILY');
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
