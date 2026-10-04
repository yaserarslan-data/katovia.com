import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const base = 'https://katovia.com'; const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ locale: 'en-US', viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (text) => { window.__qaShare = text; } } }));
  const page = await context.newPage(); const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  for (const route of ['/', '/today/', '/play/', '/challenge/', '/create/', '/tools/', '/lab/']) {
    const response = await page.goto(base+route); assert.equal(response.status(), 200); await page.waitForSelector('html.js');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  await page.goto(base+'/today/'); await page.waitForSelector('html.js');
  const memory = page.locator('[data-memory-mount]'); await memory.locator('[data-memory-start]').click();
  const answer = await memory.locator('[data-glow="true"]').evaluateAll((cells) => cells.map((cell) => cell.dataset.cell));
  assert.ok(answer.length); await memory.locator('[data-memory-submit]').waitFor({ state: 'visible' });
  for (const value of answer) await memory.locator(`[data-cell="${value}"]`).click();
  await memory.locator('[data-memory-submit]').click(); await page.waitForFunction(() => document.querySelector('[data-memory-result]').textContent.includes('100%'));
  await memory.locator('[data-session-copy]').click(); assert.ok((await page.evaluate(() => window.__qaShare)).includes('/today/#memory-grid'));
  const reaction = page.locator('[data-reaction-mount]'); const action = reaction.locator('[data-reaction-action]');
  await action.click();
  await page.waitForFunction(() => document.querySelector('[data-reaction-action]').dataset.state==='signal'); await action.click();
  await action.waitFor({ state:'hidden' }); await page.reload(); await page.waitForSelector('html.js');
  assert.ok(await memory.locator('[data-memory-start]').isHidden()); assert.ok(await action.isHidden());
  await page.locator('[data-locale="tr"]').click(); assert.equal(await page.locator('html').getAttribute('lang'), 'tr');
  const manifest = JSON.parse(await readFile('scripts/legacy-manifest.json','utf8'));
  for (const item of manifest.files.filter((item) => item.category==='html' && item.path!=='index.html')) {
    const response=await page.goto(base+'/'+item.path); assert.equal(response.status(),200);
    if (item.path==='laboratuvar/qr-kod-olusturucu.html') { await page.locator('#link-url').fill(base); await page.getByRole('button',{name:/QR.*Oluştur/i}).click(); assert.ok(await page.locator('#download-button').isEnabled()); }
  }
  assert.deepEqual(errors,[]);console.log('Live release QA passed: root routes, Memory, Reaction, TR/EN, sharing/persistence and 18 legacy pages.');
} finally { await browser.close(); }
