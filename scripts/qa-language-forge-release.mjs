// Targeted release/live smoke only. No full regression, no persistent user profile.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.argv[2]||'https://katovia.com';
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});
try {
 const context=await browser.newContext({locale:'en-US',viewport:{width:1280,height:900}});
 await context.addInitScript(()=>{Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__forgeReleaseLink=text;}}});});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(`${m.text()} [${m.location().url}]`);});
 page.on('requestfailed',r=>errors.push(`${r.url()}: ${r.failure()?.errorText}`));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 const response=await page.goto(base+'/create/language-forge/');assert.equal(response.status(),200);
 await page.locator('[data-forge][data-ready="true"]').waitFor();
 assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://katovia.com/create/language-forge/');
 await page.locator('[data-forge-submit]').click();await page.locator('[data-forge-result]').waitFor({state:'visible'});
 assert.equal(await page.locator('[data-forge-entry]').count(),64);assert.equal(await page.locator('.forge-grammar-card').count(),10);assert.equal(await page.locator('[data-forge-sentence]').count(),12);
 await page.locator('[data-forge-rename]').click();await page.locator('[data-forge-name-editor] input').fill('Katovia Language');await page.locator('[data-forge-edit-apply]').click();await page.locator('[data-forge-edit-apply]').click();
 assert.equal(await page.locator('[data-forge-name]').textContent(),'Katovia Language');
 const water=page.locator('[data-forge-entry="noun.water"]');await water.locator('summary').click();await water.locator('[data-forge-word-action=edit]').click();await water.locator('input').fill('xavari');await water.locator('[data-forge-edit-apply]').click();await water.locator('[data-forge-edit-apply]').click();assert.equal(await water.locator('dd').textContent(),'xavari');
 const before=await page.locator('[data-forge-entry] dd').allTextContents(),fire=page.locator('[data-forge-entry="noun.fire"]');await fire.locator('summary').click();await fire.locator('[data-forge-word-action=reroll]').click();const after=await page.locator('[data-forge-entry] dd').allTextContents();assert.equal(after.filter((x,i)=>x!==before[i]).length,1);
 const surfaces=await page.locator('.forge-surface').allTextContents();
 await page.locator('[data-locale="tr"]').click();assert.deepEqual(await page.locator('.forge-surface').allTextContents(),surfaces);assert.deepEqual(await page.locator('[data-forge-entry] dd').allTextContents(),after);
 await page.locator('[data-locale="en"]').click();
 await page.reload();await page.locator('[data-forge-resume]').waitFor({state:'visible'});await page.locator('[data-forge-resume]').click();assert.equal(await page.locator('[data-forge-name]').textContent(),'Katovia Language');assert.deepEqual(await page.locator('[data-forge-entry] dd').allTextContents(),after);
 const saved=await page.evaluate(()=>localStorage.getItem('katovia:language-forge:active'));
 await page.locator('[data-forge-share]').click();await page.waitForFunction(()=>Boolean(window.__forgeReleaseLink));const link=await page.evaluate(()=>window.__forgeReleaseLink);assert.ok(link.length<=1900);
 await page.goto(link.replace('https://katovia.com',base));await page.locator('[data-forge-receiver]').waitFor({state:'visible'});assert.equal(await page.locator('[data-forge-rename]').isVisible(),false);assert.equal(await page.locator('[data-forge-word-action]').count(),0);assert.equal(await page.evaluate(()=>localStorage.getItem('katovia:language-forge:active')),saved);
 const hash=new URL(page.url()).hash;await page.locator('.forge-result-nav a[href="#forge-dictionary"]').click();assert.equal(new URL(page.url()).hash,hash);await page.locator('[data-forge-copy-project]').click();await page.locator('[data-forge-confirm-yes]').click();await page.locator('[data-forge-rename]').waitFor({state:'visible'});assert.equal(new URL(page.url()).hash,'');assert.equal(await page.locator('[data-forge-name]').textContent(),'Katovia Language');
 await page.setViewportSize({width:360,height:800});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);await context.close();
 console.log('Targeted Forge release smoke passed:',base,'generation/64 words/grammar/12 sentences/rename/edit/reroll/restore/share/readonly/copy/TR-EN/mobile/console/resources');
} finally {await browser.close();}
