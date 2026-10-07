import assert from 'node:assert/strict';
import {profiles} from '../src/tools/alphabet/model.js';
export async function qaAlphabet(page,base,expectRetired=false){
 const url=base+'/tools/alphabet-lab/';
 assert.equal((await page.goto(url)).status(),200);await page.waitForSelector('[data-tool][data-ready="true"]');
 assert.equal(await page.locator('h1').count(),1);
 assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://katovia.com/tools/alphabet-lab/');
 const sitemap=await (await page.request.get(base+'/sitemap.xml')).text();assert.ok(sitemap.includes('https://katovia.com/tools/alphabet-lab/'));
 for(const profile of profiles){
  if(profile.systemId==='braille')await page.locator('[data-alpha-system]').click();
  await page.locator(`[data-alpha-profile="${profile.id}"]`).click();
  assert.equal(await page.locator('[data-alpha-symbol]').count(),profile.expectedCount);
  const entry=profile.entries[0];await page.locator(`[data-alpha-symbol="${entry.id}"]`).click();
  for(const locale of ['tr','en']){
   await page.locator(`[data-locale="${locale}"]`).click();
   assert.equal(await page.locator('html').getAttribute('lang'),locale);
   assert.equal(new URL(page.url()).searchParams.get('profile'),profile.id);
   assert.equal(new URL(page.url()).hash,'#'+entry.id);
   assert.equal(await page.locator(`[data-alpha-symbol="${entry.id}"]`).getAttribute('aria-pressed'),'true');
   for(const width of [360,390,430,768,1024,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  }
  await page.reload();await page.waitForSelector('[data-tool][data-ready="true"]');assert.equal(await page.locator(`[data-alpha-symbol="${entry.id}"]`).getAttribute('aria-pressed'),'true');
 }
 const plainContext=await page.context().browser().newContext({javaScriptEnabled:false});
 try{const plain=await plainContext.newPage();assert.equal((await plain.goto(url)).status(),200);assert.equal(await plain.locator('[data-alpha-static-entry]').count(),194);assert.equal(await plain.locator('[data-alpha-static-profile]').count(),6);assert.ok(await plain.locator('[data-alpha-reference]').isVisible());await plain.setViewportSize({width:360,height:900});assert.ok(await plain.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}finally{await plainContext.close();}
 if(expectRetired)assert.equal((await page.request.get(base+'/katovia-assets/client-CT4-RKRA.js')).status(),404);
 console.log('Alphabet live/local QA passed: 194 records, 6 profiles, TR/EN state, refresh, six widths, SEO/sitemap and no-JS.');
}
