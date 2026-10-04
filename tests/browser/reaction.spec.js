import { test, expect } from '@playwright/test';
test('reaction early retry, real signal, keyboard completion and reload', async ({ page }) => {
  await page.goto('/today/'); const root = page.locator('[data-reaction-mount]'); const button = root.locator('button[data-reaction-action]');
  await button.click(); await button.click(); await expect(button).toHaveAttribute('data-state', 'early');
  expect(await page.evaluate(() => localStorage.getItem('katovia:v2:daily-ledger:reaction'))).toBeNull();
  await button.focus(); await page.keyboard.press('Enter'); await expect(button).toHaveAttribute('data-state', 'signal', { timeout: 6000 });
  await page.keyboard.press('Space'); await expect(button).toBeHidden(); await expect(root.locator('[data-reaction-result]')).toContainText('ms');
  await page.reload(); await expect(button).toBeHidden();
  for (const width of [360,390,430,768,1024,1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
});
