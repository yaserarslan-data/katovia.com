// Local and live removal gate; no persistent user profile or user-data deletion.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {posix} from 'node:path';
import {artifactFiles} from './check-artifact.mjs';
const base=process.argv[2]||'https://katovia.com';
const retired=JSON.parse(await readFile('scripts/legacy-game-retirements.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const context=await browser.newContext({locale:'en-US',viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 for(const path of retired.paths){const response=await context.request.get(base+'/'+path);assert.equal(response.status(),404,path);assert.ok((await response.text()).includes('404 / KATOVIA'),path);}
 const routes=['/','/today/','/play/','/challenge/','/create/','/tools/','/lab/','/create/language-forge/','/tr/mysteries/','/lab/guzel-sozler/','/tools/alphabet-lab/','/tools/pixel-art-grid/','/play/particle-universe/','/play/pixel-piano/','/play/koi-pond/'];
 for(const route of routes){assert.equal((await page.goto(base+route)).status(),200,route);await page.locator('html.js').waitFor();assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://katovia.com'+route);
  if(route==='/lab/'){assert.equal(await page.locator('[data-card-id]').count(),9);assert.equal(await page.locator('#lab-games').count(),0);assert.equal(await page.locator('.catalog-group').count(),3);}
  if(!route.startsWith('/tr/')){await page.locator('[data-locale=tr]').click();assert.equal(await page.locator('html').getAttribute('lang'),'tr');await page.locator('[data-locale=en]').click();}
  await page.setViewportSize({width:360,height:800});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route);await page.setViewportSize({width:1280,height:900});
 }
 await page.goto(base+'/');
 for(const locale of ['tr','en']){
  await page.locator(`[data-locale=${locale}]`).click();
  for(const width of [360,390,430])for(const height of [640,740,800,844]){
   await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));
   const button=await page.locator('[data-game-action]').boundingBox();assert.ok(button.y>=0&&button.y+button.height<=height,`${locale} START ${width}x${height}`);assert.ok(button.height>=72);
  }
 }
 // Check all static internal link/resource targets from the exact built artifact.
 const links=new Set();for(const file of (await artifactFiles()).filter(f=>f.endsWith('.html'))){const source=await readFile('dist/'+file,'utf8');for(const m of source.matchAll(/(?:href|src)="([^"#]+)"/g)){if(/^(?:https?:|mailto:|tel:|data:)/.test(m[1]))continue;const raw=m[1].split(/[?#]/)[0];const target=raw.startsWith('/')?raw:posix.normalize('/'+posix.join(posix.dirname(file),raw));links.add(target);}}
 for(const path of retired.paths)assert.ok(!links.has('/'+path));
 const list=[...links];let cursor=0;await Promise.all(Array.from({length:6},async()=>{while(cursor<list.length){const target=list[cursor++];assert.equal((await context.request.get(base+target)).status(),200,target);}}));
 await page.goto(base+'/lab/');await page.locator('[data-locale=tr]').click();await page.setViewportSize({width:390,height:844});await page.screenshot({path:'.cache/releases/LegacyGames2/'+(base.startsWith('https:')?'production':'local')+'-lab.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Legacy games QA passed:',base,`10 real 404s; retained routes/TR-EN/mobile; ${links.size} internal targets; console/resources: 0`);await context.close();
}finally{await browser.close();}
