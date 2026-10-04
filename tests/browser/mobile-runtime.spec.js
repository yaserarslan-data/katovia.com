import {test,expect} from '@playwright/test';
test('PLAY touch, orientation, DPR cap, hidden pause and lifecycle disposal/remount',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const slug of ['particle-universe','pixel-piano','koi-pond']){await page.goto('http://127.0.0.1:4173/play/'+slug+'/');await page.waitForSelector('[data-ready="true"]');const canvas=page.locator('canvas');await canvas.tap();await page.setViewportSize({width:844,height:390});await expect.poll(()=>canvas.evaluate(c=>Math.abs(c.width-c.getBoundingClientRect().width*2)<1.1)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const controls=page.locator('[data-experience] button');for(let i=0;i<await controls.count();i++){const box=await controls.nth(i).boundingBox();expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);}await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pagehide')));await expect.poll(()=>canvas.evaluate(c=>c.width)).toBe(1);await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await expect.poll(()=>canvas.evaluate(c=>c.width>1)).toBe(true);await page.setViewportSize({width:390,height:844});
 }
 expect(errors).toEqual([]);await context.close();
});
