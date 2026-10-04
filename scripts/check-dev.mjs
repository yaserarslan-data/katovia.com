import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { repoRoot } from './paths.mjs';
import { sections } from '../src/catalog/registry.js';

const server = await createServer({ configFile: resolve(repoRoot, 'vite.config.js'), server: { port: 0, host: '127.0.0.1' } });
let browser;
try {
  await server.listen();
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  for (const route of ['/', '/v2/', ...sections.map((section) => section.route), '/laboratuvar/qr-kod-olusturucu.html']) {
    const response = await fetch(base + route);
    if (response.status !== 200) throw new Error(`Dev ${route}: ${response.status}`);
    if (route === '/' && !Buffer.from(await response.arrayBuffer()).equals(await readFile(resolve(repoRoot, 'index.html')))) throw new Error('Dev legacy root changed');
  }
  if ((await fetch(base + '/v2/missing/')).status !== 404) throw new Error('Dev unexpectedly used SPA fallback');
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'en-US' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/v2/');
  await page.waitForSelector('html.js', { timeout: 10000 });
  await page.locator('[data-menu-toggle]').click();
  await page.getByRole('navigation').getByRole('link', { name: 'TOOLS', exact: true }).click();
  await page.waitForURL('**/v2/tools/');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Dev smoke passed: byte-identical root, all entries, QR, true 404, source modules and mobile navigation.');
} finally {
  await browser?.close();
  await server.close();
}
