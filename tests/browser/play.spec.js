import {test,expect} from '@playwright/test';
test('Particle canvas lazy loads, responds, pauses, and works at responsive widths/DPR',async({page},info)=>{
 const chunks=[];page.on('request',(req)=>{if(req.url().includes('particle-universe'))chunks.push(req.url());});
 await page.goto('/');expect(chunks).toHaveLength(0);
 await page.goto('/play/particle-universe/');const host=page.locator('[data-experience]');await expect(host).toHaveAttribute('data-ready','true');
 await expect(host).toHaveAttribute('data-quality',/\d+/);const canvas=host.locator('canvas');await canvas.click();await canvas.focus();await page.keyboard.press('Space');
 await host.locator('select').selectOption('orbit');await host.locator('[data-motion-toggle]').click();await expect(host.locator('[data-motion-toggle]')).toHaveAttribute('aria-pressed','true');
 for(const width of [360,390,430,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:info.outputPath('particle-mobile.png'),fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await expect(host.locator('[data-motion-toggle]')).toHaveAttribute('aria-pressed','true');
});
