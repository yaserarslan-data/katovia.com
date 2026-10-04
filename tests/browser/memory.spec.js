import { test, expect } from '@playwright/test';
test('memory reveal, keyboard selection, first result, reload and locale', async ({ page }) => {
  await page.goto('/today/'); const root = page.locator('[data-memory-mount]'); await root.locator('[data-memory-start]').click();
  const answer = await root.locator('[data-glow="true"]').evaluateAll((nodes) => nodes.map((node) => Number(node.dataset.cell)));
  expect(answer.length).toBeGreaterThan(0); await expect(root.locator('[data-memory-submit]')).toBeVisible({ timeout: 4000 });
  await expect(root.locator('[data-glow="true"]')).toHaveCount(0);
  for (const cell of answer) { await root.locator(`[data-cell="${cell}"]`).focus(); await page.keyboard.press('Space'); }
  await root.locator('[data-memory-submit]').click(); await expect(root.locator('[data-memory-result]')).toContainText('100%');
  await page.reload(); await expect(root.locator('[data-memory-start]')).toBeHidden(); await expect(root.locator('[data-memory-result]')).toContainText('100%');
  await page.locator('[data-locale="tr"]').click(); await expect(root.locator('h2')).toHaveText('HAFIZA IZGARASI');
});
test('memory interruption consumes no attempt and responsive grid has no overflow', async ({ page }) => {
  await page.goto('/today/'); const root = page.locator('[data-memory-mount]'); await root.locator('[data-memory-start]').click();
  await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await expect(root.locator('[data-memory-start]')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('katovia:v2:daily-ledger:memory-grid'))).toBeNull();
  for (const width of [360,390,430,768,1024,1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
});
