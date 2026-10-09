import {test,expect} from '@playwright/test';
import {readFile,readdir} from 'node:fs/promises';
const featureFile=(await Promise.all((await readdir('dist/katovia-assets')).filter(f=>f.endsWith('.js')).map(async f=>({f,text:await readFile('dist/katovia-assets/'+f,'utf8')})))).find(x=>x.text.includes('GRAMMAR_MARKER_EXHAUSTED')).f;
const route='/create/language-forge/';
const seed='0123456789abcdef0123456789abcdef';
async function prepare(page){await page.addInitScript(seed=>{Object.defineProperty(crypto,'getRandomValues',{value:array=>{for(let i=0;i<array.length;i++)array[i]=parseInt(seed.slice((i%16)*2,(i%16)*2+2),16);return array;}});},seed);await page.goto(route);await expect(page.locator('[data-forge]')).toHaveAttribute('data-ready','true');}
const generate=async page=>{await page.locator('[data-forge-submit]').click();if(await page.locator('[data-forge-confirm]').isVisible())await page.locator('[data-forge-confirm-yes]').click();await expect(page.locator('[data-forge-result]')).toBeVisible();};
test('static route, native controls, presets/defaults and custom grammar preservation',async({page})=>{
 await prepare(page);await expect(page).toHaveTitle('Language Forge — Constructed Language Builder | Katovia');
 await expect(page.locator('input[name=forge-preset]')).toHaveCount(4);await expect(page.locator('input[value=flowing]')).toBeChecked();await expect(page.locator('input[name=forge-length][value=balanced]')).toBeChecked();
 await expect(page.locator('[data-forge-order]')).not.toBeVisible();await page.locator('input[value=flowing]').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('input[value=crisp]')).toBeChecked();
 await page.locator('.forge-advanced summary').click();await expect(page.locator('[data-forge-order]')).toHaveValue('SOV');await expect(page.locator('[data-forge-morphology]')).toHaveValue('suffix');
 await page.locator('[data-forge-order]').selectOption('SVO');await page.locator('input[value=clustered]').check();await expect(page.locator('[data-forge-order]')).toHaveValue('SVO');await expect(page.locator('[data-forge-morphology]')).toHaveValue('suffix');
 await page.locator('input[name=forge-length][value=short]').check();await generate(page);await expect(page.locator('[data-forge-summary]')).toContainText('Short');await expect(page.locator('[data-forge-name]')).toBeFocused();
});
test('generated identity, six words, 64 dictionary rows, filters, grammar and 12 explanations',async({page})=>{
 await prepare(page);await generate(page);await expect(page.locator('[data-forge-name]')).toHaveText('Neniru');await expect(page.locator('[data-forge-first]')).toHaveText('rima ralo mesa.');
 await expect(page.locator('[data-forge-quick]>div')).toHaveCount(6);await expect(page.locator('[data-forge-entry]')).toHaveCount(64);
 await page.locator('[data-forge-search]').fill('water');await expect(page.locator('[data-forge-entry]')).toHaveCount(1);await expect(page.locator('[data-forge-entry] dd')).toHaveText('nera');
 await page.locator('[data-forge-filter]').selectOption('actions');await expect(page.locator('[data-forge-empty]')).toBeVisible();await page.locator('[data-forge-search]').fill('');await expect(page.locator('[data-forge-entry]')).toHaveCount(12);
 await page.locator('[data-forge-filter]').selectOption('all');await expect(page.locator('[data-forge-entry]')).toHaveCount(64);
 await expect(page.locator('.forge-grammar-card')).toHaveCount(10);await expect(page.locator('[data-forge-sentence]')).toHaveCount(12);
 await expect(page.locator('[data-forge-sentence="sentence.question-moon"] .forge-surface')).toHaveText('same ralo mesa yale?');
 await page.locator('.forge-result-nav a[href="#forge-grammar"]').click();await expect(page.locator('[data-forge-result]')).toBeVisible();expect(new URL(page.url()).hash).toBe('');
 const details=page.locator('[data-forge-explanation="sentence.see-moon"]');await details.locator('summary').click();await expect(details.locator('dl')).toContainText('rima → I');await expect(details).toContainText('Constituent order: SVO');
});
for(const firstLocale of ['tr','en'])test(`locale ${firstLocale} switch preserves language/search/filter/disclosure/config`,async({page})=>{
 await prepare(page);await page.locator(`[data-locale="${firstLocale}"]`).click();await generate(page);
 const snapshot=()=>page.locator('[data-forge-name],[data-forge-first],.forge-surface').allTextContents();const before=await snapshot();
 await page.locator('[data-forge-search]').fill('water');await page.locator('[data-forge-filter]').selectOption('nature');await page.locator('[data-forge-explanation="sentence.see-moon"] summary').click();
 await page.locator(`[data-locale="${firstLocale==='tr'?'en':'tr'}"]`).click();expect(await snapshot()).toEqual(before);await expect(page.locator('[data-forge-search]')).toHaveValue('water');await expect(page.locator('[data-forge-filter]')).toHaveValue('nature');await expect(page.locator('[data-forge-explanation="sentence.see-moon"]')).toHaveAttribute('open','');
 await expect(page.locator('[data-forge-entry]')).toHaveCount(1);await expect(page.locator('[data-forge-entry] dt')).toHaveText(firstLocale==='tr'?'water':'su');await expect(page.locator('[data-forge-status]')).toHaveText(firstLocale==='tr'?'Your language is ready.':'Dilin hazır.');
});
test('change rules preserves roots; preset change rebuilds; reset clears in-memory state and refresh starts fresh',async({page})=>{
 await prepare(page);await generate(page);const first=await page.locator('[data-forge-entry] dd').allTextContents();
 await page.locator('[data-forge-change]').click();await expect(page.locator('[data-forge-form]')).toBeVisible();await page.locator('.forge-advanced summary').click();await page.locator('[data-forge-order]').selectOption('SOV');await generate(page);
 expect(await page.locator('[data-forge-entry] dd').allTextContents()).toEqual(first);await expect(page.locator('[data-forge-first]')).toHaveText('rima mesa ralo.');
 await page.locator('[data-forge-change]').click();await page.locator('input[value=crisp]').check();await generate(page);expect(await page.locator('[data-forge-entry] dd').allTextContents()).not.toEqual(first);
 await page.locator('[data-forge-new]').click();await page.locator('[data-forge-confirm-yes]').click();await expect(page.locator('[data-forge-result]')).not.toBeVisible();await expect(page.locator('input[value=flowing]')).toBeChecked();await expect(page.locator('[data-forge-order]')).toHaveValue('SVO');
 await generate(page);await page.reload();await expect(page.locator('[data-forge]')).toHaveAttribute('data-ready','true');await expect(page.locator('[data-forge-restore]')).toBeVisible();await page.locator('[data-forge-resume]').click();await expect(page.locator('[data-forge-result]')).toBeVisible();expect(new URL(page.url()).hash).toBe('');
});
test('friendly errors, denied storage and keyboard recovery without exposing raw error codes',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}});Object.defineProperty(crypto,'getRandomValues',{value:()=>{throw new Error('WORD_EXHAUSTED');}});});
 await page.goto(route);await expect(page.locator('[data-forge]')).toHaveAttribute('data-ready','true');await page.locator('[data-forge-submit]').focus();await page.keyboard.press('Enter');await expect(page.locator('[data-forge-status]')).toHaveText('A valid language could not be created with these rules. Try again.');await expect(page.locator('[data-forge-status]')).not.toContainText('WORD_EXHAUSTED');await expect(page.locator('[data-forge-form]')).toBeVisible();
});
test('all controlled engine failures reach the same localized recoverable error UI',async({page})=>{
 await prepare(page);
 await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide')));
 for(const code of ['WORD_EXHAUSTED','GRAMMAR_MARKER_EXHAUSTED','MORPHOLOGY_INVALID','SENTENCE_REALIZATION_FAILED']){
   await page.evaluate(async({featureFile,code,seed})=>{
     window.forgeTestDispose?.();
     const {mount}=await import('/katovia-assets/'+featureFile);
     const app=mount(document.querySelector('[data-forge]'),{seedFactory:()=>seed,generate:()=>{const error=new Error(code);error.code=code;throw error;}});
     window.forgeTestDispose=()=>app.dispose();
   },{featureFile,code,seed});
   await page.locator('[data-forge-submit]').click();await expect(page.locator('[data-forge-status]')).toHaveText('A valid language could not be created with these rules. Try again.');await expect(page.locator('[data-forge-form]')).toBeVisible();await expect(page.locator('[data-forge-status]')).not.toContainText(code);
 }
 await page.locator('[data-locale="tr"]').click();await expect(page.locator('[data-forge-status]')).toHaveText('Bu kurallarla geçerli bir dil oluşturulamadı. Tekrar deneyebilirsin.');
});
test('mobile/desktop/reduced motion, zero external requests and same-origin assets',async({page},info)=>{
 const external=[],errors=[];page.on('request',r=>{if(new URL(r.url()).hostname!=='127.0.0.1')external.push(r.url());});page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});await prepare(page);await page.screenshot({path:info.outputPath('forge-setup-mobile.png'),fullPage:true});await page.setViewportSize({width:1440,height:900});await page.screenshot({path:info.outputPath('forge-setup-desktop.png'),fullPage:true});await generate(page);
 for(const width of [360,390,430,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.setViewportSize({width:390,height:844});await page.locator('[data-forge-explanation="sentence.see-moon"] summary').click();await page.screenshot({path:info.outputPath('forge-mobile.png'),fullPage:true});await page.setViewportSize({width:1440,height:900});await page.screenshot({path:info.outputPath('forge-desktop.png'),fullPage:true});
 expect(external).toEqual([]);expect(errors).toEqual([]);await expect(page.locator('[data-forge-share]')).toBeVisible();await expect(page.locator('[data-forge-export]')).toBeVisible();
});
test('CREATE card preserves Quiz and unrelated routes do not load the engine; static fallback without JS',async({page,browser})=>{
 const requests=[];page.on('request',r=>requests.push(r.url()));await page.goto('/create/');await expect(page.locator('[data-creator]')).toHaveAttribute('data-ready','true');expect(requests.some(r=>r.endsWith(featureFile))).toBe(false);await expect(page.locator('[data-forge-card]')).toBeVisible();await page.locator('[data-forge-card]').click();await expect(page).toHaveURL(/\/create\/language-forge\/$/);await expect(page.locator('[data-forge]')).toHaveAttribute('data-ready','true');expect(requests.some(r=>r.endsWith(featureFile))).toBe(true);
 const context=await browser.newContext({javaScriptEnabled:false});const noJS=await context.newPage();const response=await noJS.goto('http://127.0.0.1:4173'+route);expect(response.status()).toBe(200);await expect(noJS.getByRole('heading',{level:1})).toHaveText('Shape your own language.');await expect(noJS.locator('[data-forge-fallback]')).toBeVisible();await context.close();
});
