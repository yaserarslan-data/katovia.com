import {test,expect} from '@playwright/test';
import {qaAlphabet} from '../../scripts/qa-alphabet.mjs';
test('Alphabet complete V1 smoke and external-request/audio guard',async({page})=>{
 test.setTimeout(120000);const errors=[],external=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:4173'))external.push(request.url());});
 await qaAlphabet(page,'http://127.0.0.1:4173');expect(errors).toEqual([]);expect(external).toEqual([]);
});
test('profile selection, exact lookup, locale preserves search and history, safe invalid links',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/tools/alphabet-lab/');await expect(page.locator('[data-tool]')).toHaveAttribute('data-ready','true');
 await page.locator('[data-alpha-profile="greek-modern"]').click();await page.locator('[data-alpha-search]').fill('Beta');await expect(page.locator('[data-alpha-symbol]')).toHaveCount(1);await page.locator('[data-alpha-symbol]').click();
 const before=page.url();await page.locator('[data-locale=tr]').click();await expect(page.locator('[data-alpha-search]')).toHaveValue('Beta');expect(page.url()).toBe(before);await expect(page.locator('[data-alpha-detail]')).toContainText('Latin aktarımı');
 await page.screenshot({path:info.outputPath('alphabet-mobile.png')});
 await page.locator('[data-alpha-profile="hiragana-basic"]').click();await expect(page.locator('[data-alpha-symbol]')).toHaveCount(46);await page.locator('[data-alpha-search]').fill('が');await expect(page.locator('[data-alpha-empty]')).toBeVisible();
 await page.goBack();await expect(page.locator('[data-alpha-symbol][aria-pressed=true]')).toHaveCount(1);
 await page.goto('/tools/alphabet-lab/?profile=bad#%ZZ');await expect(page.locator('[data-tool]')).toHaveAttribute('data-ready','true');await expect(page.locator('[data-alpha-search]')).toBeDisabled();
});
test('dataset client stays lazy on TOOLS index and keyboard selection remains accessible',async({page},info)=>{
 const bodies=[];page.on('response',async response=>{if(response.url().endsWith('.js'))bodies.push(await response.text());});await page.goto('/tools/');await expect(page.locator('[data-card-id=alphabet-lab]')).toBeVisible();expect(bodies.some(body=>body.includes('alphabet-lab-v1.0.0'))).toBe(false);
 await page.locator('[data-card-id=alphabet-lab]').click();await expect(page.locator('[data-tool]')).toHaveAttribute('data-ready','true');await page.locator('[data-alpha-profile=greek-modern]').focus();await page.keyboard.press('Enter');await page.locator('[data-alpha-symbol]').first().focus();await page.keyboard.press('Enter');await expect(page.locator('[data-alpha-symbol][aria-pressed=true]')).toHaveCount(1);
 await page.setViewportSize({width:1440,height:900});await page.screenshot({path:info.outputPath('alphabet-desktop.png')});
});
