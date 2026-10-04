import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { experiences } from '../src/catalog/experiences.js';
import { tools } from '../src/catalog/tools.js';
import {encodeQuiz} from '../src/creator/model.js';
const base = 'https://katovia.com'; const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ locale: 'en-US', viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (text) => { window.__qaShare = text; } } }));
  const page = await context.newPage(); const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  if(process.argv[2]==='Final'){await page.goto(base);await page.waitForSelector('html.js');for(const id of ['home-daily','home-play','home-create','home-challenge','home-tools','home-lab'])assert.ok(await page.locator('#'+id).isVisible());const box=await page.locator('[data-game-action]').boundingBox();assert.ok(box.y+box.height<844);await page.goto(base+'/play/particle-universe/');await page.waitForSelector('[data-ready="true"]');await page.locator('[data-card-id="koi-pond"]').click();await page.waitForSelector('[data-experience="koi-pond"][data-ready="true"]');}
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
  if(process.argv[2]!=='A')for(const entry of experiences){const response=await page.goto(base+entry.route);assert.equal(response.status(),200);await page.waitForSelector('[data-experience][data-ready="true"]');await page.locator('canvas').click();await page.locator('[data-motion-toggle]').click();assert.equal(await page.locator('[data-motion-toggle]').getAttribute('aria-pressed'),'true');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  if(!['A','B'].includes(process.argv[2])){for(const entry of tools){const response=await page.goto(base+entry.route);assert.equal(response.status(),200);await page.waitForSelector('[data-tool][data-ready="true"]');if(entry.id==='json-formatter')await page.locator('[data-tool-input]').fill('{"live":true}');if(entry.id==='regex-tester')await page.locator('[data-tool-input]').fill('live 123');await page.locator('[data-tool-run]').click();await page.waitForFunction(()=>document.querySelector('[data-tool-output]').value.length>0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}for(const path of ['/sitemap.xml','/robots.txt'])assert.equal((await context.request.get(base+path)).status(),200);}
  if(['D','E','Final'].includes(process.argv[2])){const encoded=encodeQuiz({version:1,title:'Canlı QA',contentLocale:'tr',theme:'lime',questions:[{text:'A?',options:['A','B'],correct:0}]});const response=await page.goto(base+'/p/#'+encoded);assert.equal(response.status(),200);await page.waitForSelector('[data-answer]');await page.locator('[data-answer="0"]').click();assert.equal(await page.locator('[data-quiz-result]').textContent(),'1 / 1');await page.locator('[data-creator-player] a').click();await page.waitForSelector('[data-creator][data-ready="true"]');assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'index, follow');}
  if(['E','Final'].includes(process.argv[2])){const response=await page.goto(base+'/d/?id=v1.60000');assert.equal(response.status(),200);assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, follow');const action=page.locator('[data-duel-action]');await page.waitForSelector('[data-duel][data-ready="true"]');await action.click();await page.waitForFunction(()=>document.querySelector('[data-duel-action]').dataset.state==='signal');await action.click();assert.ok((await page.locator('[data-duel-result]').textContent()).includes('ms'));await page.locator('[data-duel-rematch]').click();assert.equal(await action.getAttribute('data-state'),'ready');}
  const manifest = JSON.parse(await readFile('scripts/legacy-manifest.json','utf8'));
  for (const item of manifest.files.filter((item) => item.category==='html' && item.path!=='index.html')) {
    const response=await page.goto(base+'/'+item.path); assert.equal(response.status(),200);
    if (item.path==='laboratuvar/qr-kod-olusturucu.html') { await page.locator('#link-url').fill(base); await page.getByRole('button',{name:/QR.*Oluştur/i}).click(); assert.ok(await page.locator('#download-button').isEnabled()); }
  }
  assert.deepEqual(errors,[]);console.log('Live release QA passed: root routes, Memory, Reaction, TR/EN, sharing/persistence and 18 legacy pages.');
} finally { await browser.close(); }
