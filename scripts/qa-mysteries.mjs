import assert from 'node:assert/strict';
import { mysteries, mysteryIndexRoute, mysteryRoute, mysteryStatus } from '../src/catalog/mysteries.js';

// Shared by local and live QA; no services, uploads, or content mutations.
export async function qaMysteries(page, base) {
  const sitemapResponse=await page.request.get(base+'/sitemap.xml');
  assert.equal(sitemapResponse.status(),200);
  const sitemap=await sitemapResponse.text();
  for(const locale of ['en','tr']){
    const index=mysteryIndexRoute(locale);
    assert.equal((await page.goto(base+index)).status(),200);
    await page.waitForSelector('html.js');
    assert.equal(await page.locator('[data-case]').count(),14);
    assert.equal(await page.locator('[data-case]:visible').count(),14);
    for(const entry of mysteries){
      await page.locator('input[name=q]').fill(entry.aliases[0]);
      assert.ok(await page.locator(`[data-case="${entry.id}"]`).isVisible(),`${entry.id}: alias search`);
    }
    await page.getByRole('button',{name:locale==='tr'?'Filtreleri temizle':'Clear filters'}).click();
    for(const [status,count] of [['explained',4],['partial',5],['open',5]]){
      await page.locator('select[name=status]').selectOption(status);
      assert.equal(await page.locator('[data-case]:visible').count(),count);
    }
    await page.locator('select[name=status]').selectOption('all');
    for(const [sort,status] of [['status-asc','explained'],['status-desc','open']]){
      await page.locator('select[name=sort]').selectOption(sort);
      assert.equal(await page.locator('[data-case]').first().getAttribute('data-status'),status);
    }
    await page.locator('select[name=sort]').selectOption('order');
    assert.deepEqual(await page.locator('[data-case]').evaluateAll(nodes=>nodes.map(node=>Number(node.dataset.order))),mysteries.map(entry=>entry.order));
    for(const width of [360,768,1440]){
      await page.setViewportSize({width,height:900});
      assert.equal(await page.locator('[data-case]:visible').count(),14);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const display=await page.locator('[data-case]').first().evaluate(node=>getComputedStyle(node).display);
      assert.equal(display,width<768?'block':'table-row');
    }
    for(let position=0;position<mysteries.length;position++){
      const entry=mysteries[position],route=mysteryRoute(entry,locale);
      assert.ok(sitemap.includes(`<loc>${'https://katovia.com'+route}</loc>`));
      assert.equal((await page.goto(base+route)).status(),200);
      await page.waitForSelector('html.js');
      assert.equal(await page.locator('html').getAttribute('lang'),locale);
      assert.equal(await page.locator('h1').textContent(),entry.titles[locale]);
      assert.equal(await page.locator('.mystery-intro .mystery-status').textContent(),mysteryStatus[locale][entry.status]);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://katovia.com'+route);
      const expected=[position?mysteryRoute(mysteries[position-1],locale):null,index,position<mysteries.length-1?mysteryRoute(mysteries[position+1],locale):null].filter(Boolean);
      assert.deepEqual(await page.locator('.mystery-pagination a').evaluateAll(nodes=>nodes.map(node=>new URL(node.href).pathname)),expected);
      for(const lang of ['tr','en']){
        assert.equal(await page.locator(`link[hreflang="${lang}"]`).getAttribute('href'),'https://katovia.com'+mysteryRoute(entry,lang));
        assert.equal(await page.locator(`[data-mystery-language="${lang}"]`).getAttribute('href'),mysteryRoute(entry,lang));
      }
      for(const width of [360,1440]){
        await page.setViewportSize({width,height:900});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' overflow');
      }
      // Every research page retains printable native theory disclosures.
      const initial=await page.locator('.mystery-content details[open]').count();
      assert.ok(await page.locator('.mystery-content details').count());
      await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
      assert.equal(await page.locator('.mystery-content details:not([open])').count(),0);
      await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
      assert.equal(await page.locator('.mystery-content details[open]').count(),initial);
      await page.locator('.mystery-toc summary').click();
      await page.locator('.mystery-toc a[href="#ozet"]').click();
      const opposite=locale==='en'?'tr':'en';
      await page.locator(`[data-mystery-language="${opposite}"]`).click();
      assert.equal(new URL(page.url()).pathname,mysteryRoute(entry,opposite));
      assert.equal(new URL(page.url()).hash,'#ozet');
      await page.locator(`[data-mystery-language="${locale}"]`).click();
      assert.equal(new URL(page.url()).pathname,route);
    }
  }
  const context=await page.context().browser().newContext({javaScriptEnabled:false});
  try{
    const plain=await context.newPage();
    for(const locale of ['tr','en']){
      await plain.goto(base+mysteryIndexRoute(locale));
      assert.equal(await plain.locator('[data-case-link]').count(),14);
      for(const entry of mysteries){
        assert.equal((await plain.goto(base+mysteryRoute(entry,locale))).status(),200);
        assert.ok(await plain.locator('.mystery-content section').count()>=9);
        await plain.locator('.mystery-content details').first().locator('summary').click();
        assert.ok(await plain.locator('.mystery-content details').first().getAttribute('open')!==null);
      }
    }
  }finally{await context.close();}
  console.log('Mysteries QA passed: two indexes with 14 cases, all 28 TR/EN routes, aliases, filters, sorting, cards/table, curated navigation, SEO, language anchors, print and no-JS.');
}
