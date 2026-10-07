import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {mysteries} from '../../src/catalog/mysteries.js';
import {qaMysteries} from '../../scripts/qa-mysteries.mjs';
const sectionCounts=Object.fromEntries(await Promise.all(mysteries.map(async entry=>[entry.id,JSON.parse(await readFile(`src/content/mysteries/${entry.id}/tr.json`,'utf8')).sections.length])));

test('pilot index searches aliases, sorts status, keeps filters and links full Turkish articles',async({page})=>{
  await page.goto('/tr/mysteries/');
  await expect(page.locator('[data-case]:visible')).toHaveCount(14);
  await page.locator('select[name=sort]').selectOption('status-asc');
  await expect(page.locator('[data-case]').first()).toHaveAttribute('data-status','explained');
  await page.locator('input[name=q]').fill('Sacsayhuaman');
  await expect(page.locator('[data-case]:visible')).toHaveCount(1);
  await page.locator('[data-case-link]:visible').click();
  await expect(page.locator('h1')).toHaveText('Saksaywaman / Puma Punku');
  await page.reload();
  await page.locator('[data-mystery-back]').click();
  await expect(page.locator('input[name=q]')).toHaveValue('Sacsayhuaman');
  await page.getByRole('button',{name:'Filtreleri temizle'}).click();
  await expect(page.locator('[data-case]:visible')).toHaveCount(14);
  await page.locator('input[name=q]').fill('no-such-case');
  await expect(page.locator('[data-mystery-empty]')).toBeVisible();
  await page.goto('/mysteries/?status=open');
  await expect(page.locator('[data-case]:visible')).toHaveCount(5);
  await expect(page.locator('[data-case-link]:visible').first()).toHaveAttribute('href',/\/mysteries\/voynich-manuscript\//);
  await page.locator('[data-mystery-language=tr]').click();
  await expect(page).toHaveURL(/\/tr\/mysteries\/\?status=open/);
});

test('complete fourteen-case migration and live-smoke contract',async({page})=>{
  test.setTimeout(240000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await qaMysteries(page,'http://127.0.0.1:4173');
  expect(errors).toEqual([]);
});
for(const width of [360,768,1440])test(`pilot reading and index at ${width}px without overflow or external requests`,async({page},info)=>{
  await page.setViewportSize({width,height:900});const errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:4173'))external.push(request.url());});
  for(const route of ['/tr/mysteries/',...mysteries.map(entry=>`/tr/mysteries/${entry.id}/`)]){
    expect((await page.goto(route)).status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(route.includes('voynich-manuscript')){
      await page.locator('.mystery-toc summary').click();
      await page.locator('.mystery-toc a').first().click();
      await expect(page.locator('#ozet')).toBeVisible();
      const detail=page.locator('.mystery-content details').first();await detail.locator('summary').click();await expect(detail).toHaveAttribute('open','');
      await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
      await expect(page.locator('.mystery-content details:not([open])')).toHaveCount(0);
      await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
      expect(await page.locator('.mystery-content details:not([open])').count()).toBeGreaterThan(0);
      if(width===360||width===1440){await page.screenshot({path:info.outputPath(`reader-${width}.png`),fullPage:true});await page.goto(route);await page.screenshot({path:info.outputPath(`reader-top-${width}.png`)});}
    }
  }
  expect(errors).toEqual([]);expect(external).toEqual([]);
});
test('static index and all research sections work with JavaScript disabled',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/tr/mysteries/');await expect(page.locator('[data-case-link]')).toHaveCount(14);
  await page.locator('[data-case-link]').first().click();await expect(page.locator('#kaynakca')).toBeVisible();
  await page.locator('.mystery-content details').first().locator('summary').click();
  await expect(page.locator('.mystery-content details').first()).toHaveAttribute('open','');await context.close();
});

for(const entry of mysteries)test(`${entry.id}: full English reader, language anchors and mobile parity`,async({page},info)=>{
  const errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:4173'))external.push(request.url());});
  const route=`/mysteries/${entry.id}/`;
  for(const width of [360,768,1440]){
    await page.setViewportSize({width,height:900});
    expect((await page.goto(route)).status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang','en');
    await expect(page.locator('h1')).toHaveText(entry.titles.en);
    const expected=sectionCounts[entry.id];
    await expect(page.locator('.mystery-content section')).toHaveCount(expected);
    await expect(page.locator('.mystery-note')).toContainText('editorial translation');
    await expect(page.locator('.mystery-note')).toContainText('verification has not been completed');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(width===360||width===1440)await page.screenshot({path:info.outputPath(`en-reader-${width}.png`)});
  }
  await page.locator('.mystery-toc summary').click();
  await page.locator('.mystery-toc a[href="#teoriler"]').click();
  await expect(page).toHaveURL(new RegExp(`${entry.id}/#teoriler$`));
  const detail=page.locator('#teoriler details').first();
  await detail.locator('summary').click();await expect(detail).toHaveAttribute('open','');
  await page.locator('[data-mystery-language=tr]').click();
  await expect(page).toHaveURL(new RegExp(`/tr/mysteries/${entry.id}/#teoriler$`));
  await expect(page.locator('html')).toHaveAttribute('lang','tr');
  await page.locator('[data-mystery-language=en]').click();
  await expect(page).toHaveURL(new RegExp(`/mysteries/${entry.id}/#teoriler$`));
  await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');
  for(const link of await page.locator('.mystery-pagination a').all()){
    await expect(link).toHaveAttribute('href',/^\/mysteries\//);
  }
  await page.locator('[data-mystery-back]').click();
  await expect(page).toHaveURL(/\/mysteries\/$/);
  expect(errors).toEqual([]);expect(external).toEqual([]);
});

test('English index and full English articles are readable without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/mysteries/');
  for(const entry of mysteries){
    await page.locator(`[data-case="${entry.id}"] [data-case-link]`).click();
    await expect(page.locator('html')).toHaveAttribute('lang','en');
    await expect(page.locator('h1')).toHaveText(entry.titles.en);
    await expect(page.locator('.mystery-content section').last()).toContainText('References');
    await page.locator('[data-mystery-back]').click();
  }
  await context.close();
});
