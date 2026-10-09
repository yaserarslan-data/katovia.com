import {test,expect} from '@playwright/test';
for(const locale of ['en','tr'])test(`curated catalogs, localization and responsive navigation (${locale})`,async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator(`[data-locale=${locale}]`).click();
 await expect(page.locator('[data-card-id]')).toHaveCount(7);
 for(const route of ['/','/create/','/tools/','/lab/']){
  await page.goto(route);await expect(page.locator('html')).toHaveAttribute('lang',locale);
  for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  if(route==='/tools/')await expect(page.locator('[data-card-id]')).toHaveCount(7);
  if(route==='/lab/')await expect(page.locator('[data-card-id]')).toHaveCount(19);
  if(route==='/create/')await expect(page.locator('[data-card-id]')).toHaveCount(3);
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:info.outputPath(`${route.replaceAll('/','')||'home'}-${locale}-mobile.png`),fullPage:true});
 }
 await page.goto('/tools/alphabet-lab/');await expect(page.locator('h1')).toHaveText(locale==='tr'?'Alfabe Laboratuvarı':'Alphabet Lab');
 await expect(page.locator('.section-intro [data-i18n="nav.lab"]')).toBeVisible();
 await page.goto('/tools/pixel-art-grid/');await expect(page.locator('.section-intro [data-i18n="nav.create"]')).toBeVisible();
 await page.goto('/tools/image-compressor/');await expect(page.locator('[data-card-id]')).toHaveCount(2);await expect(page.locator('[data-card-id=pixel-art-grid] [data-i18n="common.create"]')).toBeVisible();
 expect(errors).toEqual([]);
});
test('Forge category collision, grouped actions and locale switching preserve the generated language',async({page})=>{
 await page.goto('/create/language-forge/');await expect(page.locator('[data-forge]')).toHaveAttribute('data-ready','true');await page.locator('[data-forge-submit]').click();
 await expect(page.locator('[data-forge-form]')).toBeHidden();await expect(page.locator('[data-forge-filter] option[value=actions]')).toHaveText('Actions');
 const before=await page.locator('[data-forge-entry] dd').allTextContents();
 await expect(page.locator('[data-forge-import-slot] [data-forge-import]')).toBeVisible();
 await page.locator('[data-locale=tr]').click();await expect(page.locator('[data-forge-filter] option[value=actions]')).toHaveText('Eylemler');
 expect(await page.locator('[data-forge-entry] dd').allTextContents()).toEqual(before);
 await page.locator('[data-forge-filter]').selectOption('actions');expect(await page.locator('[data-forge-entry]').count()).toBeGreaterThan(0);
 await expect(page.locator('[data-forge-entry] summary').first()).not.toHaveAttribute('aria-label',/\{word\}/);
 await page.setViewportSize({width:360,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('Mysteries index counter, methods and visible article verification limits',async({page})=>{
 for(const prefix of ['/mysteries/','/tr/mysteries/']){
  await page.goto(prefix);await expect(page.locator('[data-mystery-count]')).toHaveCount(1);await expect(page.locator('[data-case]')).toHaveCount(14);
  await page.locator('input[name=q]').fill('Voynich');await expect(page.locator('[data-case]:visible')).toHaveCount(1);await page.locator('[data-case-link]:visible').click();
  await expect(page.locator('.mystery-about .mystery-note')).toBeVisible();await expect(page.locator('#ozet h2')).toHaveText(prefix.startsWith('/tr/')?'60 saniyede dosya':'The case in 60 seconds');
  await page.setViewportSize({width:360,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
