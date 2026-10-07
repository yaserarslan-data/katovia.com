import { test, expect } from '@playwright/test';
import { sections } from '../../src/catalog/registry.js';

test('previous preview URLs reach canonical root routes, including query/hash and no-JS', async ({ page, browser }) => {
  for (const route of ['/', ...sections.map((section) => section.route)]) {
    await page.goto(`/v2${route}?from=old-share#keep`);
    await expect(page).toHaveURL(`http://127.0.0.1:4173${route}?from=old-share#keep`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://katovia.com${route}`);
    await expect(page.locator('[data-page]')).toHaveCount(1);
    const links = await page.locator('nav a').evaluateAll((nodes) => nodes.map((node) => new URL(node.href).pathname));
    expect(links).toEqual([...sections.map((section) => section.route), '/mysteries/']);
  }
  const context = await browser.newContext({ javaScriptEnabled: false }); const plain = await context.newPage();
  await plain.goto('http://127.0.0.1:4173/v2/today/'); await expect(plain).toHaveURL('http://127.0.0.1:4173/today/');
  await expect(plain.locator('h1')).toHaveCount(1); await context.close();
});

test('locale and daily ledger survive root migration; clipboard points to canonical TODAY', async ({ page }) => {
  await page.addInitScript(() => {
    // The previous preview used these same origin-scoped keys/schema.
    const date = new Date().toISOString().slice(0, 10);
    const result = { schemaVersion: 1, dayKey: date, gameId: 'stop-at-five', gameVersion: '1', actualMs: 5070, scoreMs: 70, completedAt: new Date().toISOString() };
    localStorage.setItem('katovia:v2:locale', JSON.stringify({ version: 1, value: 'tr' }));
    localStorage.setItem('katovia:v2:daily-ledger', JSON.stringify({ version: 1, value: { schemaVersion: 1, results: { [date]: result } } }));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (text) => { window.__share = text; } } });
  });
  await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.locator('[data-quality]')).toHaveText('HARİKA'); await expect(page.locator('[data-actual]')).toHaveText('5.07');
  await page.locator('[data-copy]').click(); expect(await page.evaluate(() => window.__share)).toContain('https://katovia.com/today/');
  expect(await page.evaluate(() => window.__share)).not.toContain('/v2/');
  await page.goto('/today/'); await expect(page.locator('[data-game-action]')).toBeHidden(); await expect(page.locator('[data-actual]')).toHaveText('5.07');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
});
