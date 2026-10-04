import { test, expect } from '@playwright/test';

async function fakeTime(page, { deniedStorage = false, manualShare = false, nativeShare = false } = {}) {
  await page.addInitScript(({ deniedStorage, manualShare, nativeShare }) => {
    window.__gameClock = 1000;
    window.__day = '2026-10-04T12:00:00.000Z';
    Object.defineProperty(performance, 'now', { value: () => window.__gameClock });
    const OriginalDate = Date;
    window.Date = class extends OriginalDate {
      constructor(...args) { super(...(args.length ? args : [window.__day])); }
      static now() { return new OriginalDate(window.__day).getTime(); }
    };
    if (deniedStorage) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage denied'); } });
    Object.defineProperty(navigator, 'share', { configurable: true, value: nativeShare ? async (payload) => { window.__shared = payload; } : undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text) => { if (manualShare) throw new Error('Clipboard denied'); window.__copied = text; } } });
  }, { deniedStorage, manualShare, nativeShare });
}
const tick = (page, ms) => page.evaluate((value) => { window.__gameClock = value; }, ms);
async function finish(page, actualMs = 5070) {
  await page.locator('[data-game-action]').click();
  await expect(page.locator('[data-daily-mount]')).toHaveAttribute('data-state', 'running');
  await tick(page, 1000 + actualMs);
  await page.locator('[data-game-action]').click();
  await expect(page.locator('[data-daily-mount]')).toHaveAttribute('data-state', 'completed');
}

test('home mouse play, hidden timer, saved result on refresh and dedicated TODAY', async ({ page }) => {
  await fakeTime(page); await page.goto('/v2/');
  await page.locator('[data-game-action]').click();
  await expect(page.locator('[data-game-action]')).toHaveText('STOP');
  await expect(page.locator('[data-target-number]')).toHaveText('STOP AT 5.00');
  await tick(page, 6070);
  await page.locator('[data-game-action]').click();
  await expect(page.locator('[data-actual]')).toHaveText('5.07');
  await expect(page.locator('[data-quality]')).toHaveText('GREAT');
  await expect(page.locator('[data-difference]')).toHaveText('+0.07s');
  await page.reload();
  await expect(page.locator('[data-actual]')).toHaveText('5.07');
  await expect(page.locator('[data-game-action]')).toBeHidden();
  await page.goto('/v2/today/');
  await expect(page.locator('[data-actual]')).toHaveText('5.07');
  await expect(page.locator('[data-streak]')).toContainText('1 DAY');
});
test('keyboard exact score and native share; opt out of raw score', async ({ page }, testInfo) => {
  await fakeTime(page, { nativeShare: true }); await page.goto('/v2/today/');
  await page.locator('[data-game-action]').focus(); await page.keyboard.press('Space');
  await tick(page, 6000); await page.keyboard.press('Enter');
  await expect(page.locator('[data-quality]')).toHaveText('PERFECT 5.00');
  await expect(page.locator('[data-daily-mount]')).toHaveAttribute('data-exact', 'true');
  await page.locator('[data-share]').click();
  await expect(page.locator('[data-share-feedback]')).toHaveText('Your result was handed to the share menu.');
  expect(await page.evaluate(() => window.__shared.text)).toContain('⏱️ 5.00 SEC');
  await page.locator('[data-include-score]').uncheck(); await page.locator('[data-copy]').click();
  expect(await page.evaluate(() => window.__copied)).not.toContain('⏱️');
  await page.screenshot({ path: testInfo.outputPath('daily-result-desktop.png'), fullPage: true });
});

test.describe('touch', () => {
  test.use({ hasTouch: true });
  for (const width of [360, 390, 430]) test(`touch, CTA visibility, result and landscape at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 }); await fakeTime(page); await page.goto('/v2/');
    const button = page.locator('[data-game-action]'); const box = await button.boundingBox();
    expect(box.y + box.height).toBeLessThan(844); expect(box.height).toBeGreaterThanOrEqual(72);
    await button.tap(); await tick(page, 5980); await button.tap();
    await expect(page.locator('[data-actual]')).toHaveText('4.98');
    await expect(page.locator('[data-difference]')).toHaveText('-0.02s');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath('daily-result-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 844, height: width });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('[data-share]')).toBeVisible();
  });
});
test('blur/visibility interruptions preserve daily attempt; UTC rollover is safe', async ({ page }) => {
  await fakeTime(page); await page.goto('/v2/today/');
  await page.locator('[data-game-action]').click();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('[data-daily-mount]')).toHaveAttribute('data-state', 'interrupted');
  await expect(page.locator('[data-feedback]')).toContainText('your daily attempt is still available');
  await tick(page, 2000); await page.locator('[data-game-action]').click();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.locator('[data-daily-mount]')).toHaveAttribute('data-state', 'interrupted');
  expect(await page.evaluate(() => localStorage.getItem('katovia:v2:daily-ledger'))).toBeNull();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await tick(page, 3000); await page.locator('[data-game-action]').click();
  await page.evaluate(() => { window.__day = '2026-10-05T00:00:00.000Z'; });
  await tick(page, 8000); await page.locator('[data-game-action]').click();
  await expect(page.locator('[data-daily-mount]')).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('[data-game-day]')).toContainText('2026-10-05');
  expect(await page.evaluate(() => localStorage.getItem('katovia:v2:daily-ledger'))).toBeNull();
});
test('unavailable storage still plays/shares; selectable text fallback and reduced motion', async ({ page }) => {
  await fakeTime(page, { deniedStorage: true, manualShare: true });
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/v2/today/');
  await finish(page);
  await expect(page.locator('[data-feedback]')).toContainText('Browser storage failed');
  expect(await page.locator('[data-result]').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await page.locator('[data-share]').click();
  await expect(page.locator('[data-manual]')).toBeVisible();
  expect(await page.locator('[data-share-text]').inputValue()).toContain('5.07 SEC');
  await page.reload(); await expect(page.locator('[data-game-action]')).toBeVisible();
});
test('native unavailable uses clipboard; cancellation does not claim completion', async ({ page }) => {
  await fakeTime(page); await page.goto('/v2/today/'); await finish(page);
  await page.locator('[data-share]').click();
  await expect(page.locator('[data-share-feedback]')).toHaveText('Result copied.');
  expect(await page.evaluate(() => window.__copied)).toContain('KATOVIA DAILY #001');
  await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { throw new DOMException('Cancelled', 'AbortError'); } }));
  await page.locator('[data-share]').click();
  await expect(page.locator('[data-share-feedback]')).toHaveText('Sharing cancelled.');
});

