import { test, expect } from '@playwright/test';
import { sections } from '../../src/catalog/registry.js';

for (const width of [360, 390, 430, 768, 1024, 1440]) {
  test(`home layout, focus and touch targets at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = []; const external = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:4173')) external.push(request.url()); });
    await page.goto('/v2/');
    await expect(page.locator('h1')).toHaveText('PLAYSOMETHING.');
    await expect(page.locator('[data-daily-mount]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    const toggle = page.locator('[data-menu-toggle]');
    if (width < 768) {
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('navigation')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle).toBeFocused();
      await expect(page.getByRole('navigation')).toBeHidden();
    } else await expect(page.getByRole('navigation')).toBeVisible();
    for (const link of await page.locator('.button:visible, .wordmark, .footer-link').all()) {
      const box = await link.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(errors).toEqual([]); expect(external).toEqual([]);
    if (width === 390 || width === 1440) {
      await page.locator('h1').click();
      await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
    }
  });
}

for (const section of sections) {
  test(`${section.title}: direct load, refresh and registry navigation`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const response = await page.goto(section.route);
    expect(response.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    for (const width of [360, 390, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.setViewportSize({ width: 360, height: 800 });
    await page.reload();
    await page.locator('[data-menu-toggle]').click();
    await expect(page.locator('[aria-current="page"]')).toHaveText(section.title);
    const target = section.id === 'today' ? 'PLAY' : 'TODAY';
    await page.getByRole('navigation').getByRole('link', { name: target, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/v2/${target.toLowerCase()}/$`));
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(section.route));
  });
}

test('mobile menu supports keyboard, outside click and viewport changes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/v2/');
  const toggle = page.locator('[data-menu-toggle]');
  await toggle.focus(); await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('navigation').getByRole('link').first()).toBeFocused();
  const style = await page.getByRole('navigation').getByRole('link').first().evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(style).toBe('solid');
  await page.locator('h1').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('navigation')).toBeHidden();
});

test('reduced motion disables transitions; navigation works without JS', async ({ page, browser }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/v2/');
  expect(await page.locator('.section-card').first().evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plain = await context.newPage();
  await plain.goto('http://127.0.0.1:4173/v2/');
  await expect(plain.getByRole('navigation')).toBeVisible();
  await plain.getByRole('navigation').getByRole('link', { name: 'TOOLS', exact: true }).click();
  await expect(plain.getByRole('heading', { level: 1 })).toHaveText('Small tasks. Clean solutions.');
  await context.close();
});

test('legacy hashes and QR generator remain functional', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const hash of ['ana-sayfa', 'uygulamalar', 'laboratuvar', 'oyunlar', 'kodlar', 'gizlilik', 'iletisim']) {
    await page.goto(`/index.html#${hash}`);
    // Legacy validRoutes never included iletisim: preserve the existing fallback.
    await expect(page).toHaveURL(new RegExp(`#${hash === 'iletisim' ? 'ana-sayfa' : hash}$`));
    expect(await page.evaluate(() => document.body.innerText.includes('Katovia'))).toBe(true);
  }
  await page.goto('/laboratuvar/qr-kod-olusturucu.html');
  await page.locator('#link-url').fill('https://katovia.com/');
  await page.getByRole('button', { name: /QR.*Oluştur/i }).click();
  await expect(page.locator('#download-button')).toBeEnabled();
});

test('unknown artifact route is a real 404', async ({ page }) => {
  const response = await page.goto('/v2/not-a-page/');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bu köşe henüz yok.');
});

test('body, muted labels and accent buttons meet normal-text contrast', async ({ page }) => {
  await page.goto('/v2/');
  const colors = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(['bg', 'surface', 'text', 'muted', 'accent', 'accent-ink'].map((key) => [key, style.getPropertyValue(`--${key}`).trim()]));
  });
  const luminance = (hex) => {
    const rgb = hex.slice(1).match(/../g).map((value) => parseInt(value, 16) / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  };
  for (const [foreground, background] of [['text', 'bg'], ['muted', 'bg'], ['muted', 'surface'], ['accent-ink', 'accent']]) {
    const values = [luminance(colors[foreground]), luminance(colors[background])].sort((a, b) => b - a);
    expect((values[0] + .05) / (values[1] + .05)).toBeGreaterThanOrEqual(4.5);
  }
});
