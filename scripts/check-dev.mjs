import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { repoRoot } from './paths.mjs';
import { sections } from '../src/catalog/registry.js';
import { mysteryRoutes } from '../src/catalog/mysteries.js';

const server = await createServer({ configFile: resolve(repoRoot, 'vite.config.js'), server: { port: 0, host: '127.0.0.1' } });
let browser;
try {
  await server.listen();
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  for (const route of ['/', '/v2/', ...sections.map((section) => section.route), ...mysteryRoutes, '/tools/alphabet-lab/', '/lab/guzel-sozler/', '/laboratuvar/qr-kod-olusturucu.html', '/laboratuvar/dijital-kartvizit-olusturucu.html']) {
    const response = await fetch(base + route);
    if (response.status !== 200) throw new Error(`Dev ${route}: ${response.status}`);
    if (route === '/' && !(await response.text()).includes('data-daily-mount')) throw new Error('Dev root shell missing');
  }
  if ((await fetch(base + '/v2/missing/')).status !== 404) throw new Error('Dev unexpectedly used SPA fallback');
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'en-US' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/');
  await page.waitForSelector('html.js', { timeout: 10000 });
  await page.locator('[data-menu-toggle]').click();
  await page.getByRole('navigation').getByRole('link', { name: 'TOOLS', exact: true }).click();
  await page.waitForURL('**/tools/');
  if (errors.length) throw new Error(errors.join('\n'));
  await page.goto(base + '/tr/mysteries/');
  await page.locator('input[name=q]').fill('Voynich');
  await page.locator('[data-case-link]:visible').click();
  await page.waitForURL('**/tr/mysteries/voynich-manuscript/**');
  if (await page.locator('.mystery-content section').count() !== 11) throw new Error('Dev research sections missing');
  if (errors.length) throw new Error(errors.join('\n'));
  await page.goto(base + '/tools/alphabet-lab/');
  await page.waitForSelector('[data-tool][data-ready="true"]');
  await page.locator('[data-alpha-profile="greek-modern"]').click();
  if(await page.locator('[data-alpha-symbol]').count()!==24)throw new Error('Dev Alphabet grid mismatch');
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('Dev smoke passed: root shell, app and mystery routes, QR, true 404, source modules and mobile navigation.');
} finally {
  await browser?.close();
  await server.close();
}
