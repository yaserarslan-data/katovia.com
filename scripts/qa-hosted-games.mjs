import assert from 'node:assert/strict';
import { once } from 'node:events';
import { chromium } from '@playwright/test';
import { hostedGames } from '../src/catalog/games.js';
import { createStaticServer } from './server.mjs';
import { distRoot } from './paths.mjs';

const server=process.argv[2]==='--local'?createStaticServer(distRoot):null;
let browser;
try {
  if(server){server.listen(0,'127.0.0.1');await once(server,'listening');}
  const base=server?`http://127.0.0.1:${server.address().port}`:'https://katovia.com';
  browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true,args:['--mute-audio']});
  for(const game of hostedGames){
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    try {
      const page=await context.newPage(),errors=[],requests=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
      page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
      page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')errors.push(r.url());});
      page.on('request',r=>requests.push(r.url()));
      assert.equal((await page.goto(base+'/play/')).status(),200);
      await page.locator(`[data-card-id="${game.id}"]`).click();
      assert.equal(page.url(),base+game.route);
      await page.setViewportSize({width:360,height:800});
      await page.locator('[data-locale=tr]').click();
      assert.equal(await page.locator('[data-game-launch]').textContent(),'Oyna');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      assert.ok(!requests.some(url=>url.includes('/game-builds/')));
      await page.setViewportSize({width:1280,height:900});
      await page.locator('[data-game-launch]').click();
      assert.equal(page.url(),base+game.runtime);
      assert.match(await page.locator('meta[name=robots]').getAttribute('content'),/noindex/);
      const click=selector=>page.locator(selector).click({timeout:15000});
      const visible=selector=>page.locator(selector).waitFor({state:'visible',timeout:15000});
      switch(game.id){
        case 'approve-or-deny':
          await click('#skipIntro');await click('#start');await click('#approve');await visible('#next:not([disabled])');break;
        case 'how-fast-can-you-type':
          await click('#bootSkip');await click('#start');await page.locator('#typing').press('a');assert.equal(await page.locator('#typing').inputValue(),'a');break;
        case 'night-shift-0300':
          await click('#bootSkip');await click('#start');await visible('#report');await click('#wallView');break;
        case 'i-was-born-to-be-great':
          await click('#begin');await click('#skip');await visible('#pause');await page.keyboard.press('d');break;
        case 'sorting-error':
          await page.getByRole('button',{name:'START SHIFT',exact:true}).click({timeout:15000});await visible('#rules');assert.match(await page.locator('#notice').textContent(),/SHIFT STARTED/);break;
        case 'the-liquor-ledger':
          await visible('#app h1');await click('[data-action=settings]');await page.getByText('Crafting mode',{exact:true}).waitFor();break;
        case 'port-404-8':
          await page.getByRole('button',{name:/New Game/i}).click({timeout:15000});await page.getByRole('button',{name:/New Game/i}).waitFor({state:'hidden'});break;
      }
      await page.waitForLoadState('networkidle',{timeout:25000});
      assert.deepEqual(errors,[],game.id);
      console.log('Game launch and first interaction passed:',game.id);
    } finally {await context.close();}
  }
  const page=await browser.newPage();
  for(const route of ['/','/today/','/play/particle-universe/','/challenge/','/create/','/tools/','/lab/','/tr/mysteries/'])assert.equal((await page.goto(base+route)).status(),200,route);
  assert.equal((await page.request.get(base+'/oyunlar/yuk-ustasi.html')).status(),404);
  console.log('Hosted games and retained routes verified:',base);
} finally {await browser?.close();if(server)await new Promise(done=>server.close(done));}
