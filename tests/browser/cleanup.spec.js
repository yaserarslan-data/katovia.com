import {test,expect} from '@playwright/test';
import {qaCleanup} from '../../scripts/qa-cleanup.mjs';
test('Phase 1 quotes restoration and independently decoded first-party QR/Card exports',async({page})=>{test.setTimeout(120000);await qaCleanup(page,'http://127.0.0.1:4173');});
test('quotes support denied storage, clipboard fallback, keyboard and malformed links',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError');}});Object.defineProperty(navigator,'clipboard',{value:undefined});Object.defineProperty(navigator,'share',{value:undefined});});
 await page.goto('/lab/guzel-sozler/#%ZZ');await expect(page.locator('[data-tool]')).toHaveAttribute('data-ready','true');const before=await page.locator('[data-quote-text]').innerText();await page.locator('[data-quote-copy]').click();await expect(page.locator('[data-quote-manual-text]')).toHaveValue(before);await page.locator('[data-quote-favorite]').focus();await page.keyboard.press('Enter');await expect(page.locator('[data-tool-status]')).toContainText('could not be saved');await page.locator('[data-locale=tr]').click();await expect(page.locator('[data-quote-text]')).toHaveText(before);
});
test('native dynamic imports and lazy CSS still work without module-preload browser support',async({page})=>{
 await page.addInitScript(()=>{const supports=DOMTokenList.prototype.supports;DOMTokenList.prototype.supports=function(token){return token==='modulepreload'?false:supports.call(this,token);};});
 for(const route of ['/tools/alphabet-lab/','/lab/guzel-sozler/','/tools/image-compressor/','/play/koi-pond/']){await page.goto(route);await expect(page.locator('[data-tool],[data-experience]')).toHaveAttribute('data-ready','true');expect(await page.evaluate(()=>getComputedStyle(document.querySelector('[data-tool],[data-experience]')).display)).not.toBe('none');await page.reload();await expect(page.locator('[data-tool],[data-experience]')).toHaveAttribute('data-ready','true');}
});
