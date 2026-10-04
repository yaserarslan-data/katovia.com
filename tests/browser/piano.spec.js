import {test,expect} from '@playwright/test';
test('Piano generates sound only after gesture, keyboard notes and independent multi-touch',async({page})=>{
 await page.goto('/play/pixel-piano/');const host=page.locator('[data-experience]');await expect(host).toHaveAttribute('data-ready','true');const canvas=host.locator('canvas');await canvas.click();await expect(host).toHaveAttribute('data-notes','1');await canvas.focus();await page.keyboard.press('a');await expect(host).toHaveAttribute('data-notes','2');await host.locator('[data-sound-toggle]').click();await expect(host.locator('[data-sound-toggle]')).toHaveAttribute('aria-pressed','true');
 await canvas.evaluate(c=>{for(const id of [7,8]){c.dispatchEvent(new PointerEvent('pointerdown',{pointerId:id,button:0,clientX:100+id*10,clientY:300,bubbles:true}));}});
 await expect(host).toHaveAttribute('data-notes','4');for(const width of [360,390,430,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
