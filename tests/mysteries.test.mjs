import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { mysteries, mysteryRoutes, mysteryRoute } from '../src/catalog/mysteries.js';
import { loadMystery, renderNode } from '../scripts/mysteries.mjs';
import { checkMysteries } from '../scripts/check-mysteries.mjs';
import { createI18n } from '../src/i18n/index.js';

test('only approved pilots have content and public routes; original sources are unchanged', async () => {
  assert.deepEqual(mysteries.map(entry=>entry.order), Array.from({length:14},(_,index)=>index+1));
  assert.equal(mysteries.length,14);
  assert.equal(mysteryRoutes.length,30);
  for(const entry of mysteries){
    const content=await loadMystery(entry,'tr');
    const source=await readFile(`Yeni klasör/Çözülemeyen Dosyalar/${content.source.filename}`);
    assert.equal(createHash('sha256').update(source).digest('hex'),content.source.sha256);
    const original=source.toString('utf8');
    const originalIds=[...original.matchAll(/<section\s+id="([^"]+)"/g)].map(match=>match[1]);
    assert.deepEqual(content.sections.map(section=>section.attrs.id),originalIds);
    const markup=content.sections.map(renderNode).join('');
    assert.doesNotMatch(markup,/<script|\bonclick=|\bstyle=|class="track"/);
    const html=await readFile(`dist${mysteryRoute(entry,'tr')}index.html`,'utf8');
    assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);
    assert.match(html,/<html lang="tr">/);
    assert.ok(html.includes(markup.replace(/[ \t]+$/gm,'')));
    assert.doesNotMatch(html,/SoftwareApplication/);
    assert.match(html,/hreflang="en"/);
    const schema=JSON.parse(html.match(/application\/ld\+json">([^<]+)/)[1]);
    assert.equal(schema['@type'],'Article');assert.equal(schema.inLanguage,'tr');
  }
});
test('both index languages have static article links and reciprocal alternates',async()=>{
  for(const route of ['/mysteries/','/tr/mysteries/']){
    const html=await readFile(`dist${route}index.html`,'utf8');
    assert.equal((html.match(/data-case="/g)||[]).length,14);
    assert.match(html,/hreflang="tr"/);assert.match(html,/hreflang="en"/);
    for(const entry of mysteries)assert.ok(html.includes(`href="${mysteryRoute(entry,route.startsWith('/tr/')?'tr':'en')}"`));
  }
  const sitemap=await readFile('dist/sitemap.xml','utf8');
  for(const route of mysteryRoutes)assert.ok(sitemap.includes(`https://katovia.com${route}`));
  assert.ok(sitemap.includes('/mysteries/nazca-lines/'));
  assert.ok(sitemap.includes('/tr/mysteries/phaistos-disc/'));
  assert.ok(sitemap.includes('/mysteries/turin-shroud/'));
});
test('complete editorial EN translations preserve every semantic node, anchor, attribute, URL and DOI',async()=>{
  const plain=node=>typeof node==='string'?node:node.children.map(plain).join('');
  const compare=(tr,en)=>{
    if(typeof tr==='string'){
      assert.equal(typeof en,'string');
      if(tr.trim())assert.ok(en.trim(),'A source text slot cannot be omitted');
      else assert.equal(en,tr,'Formatting-only nodes stay intact');
      return;
    }
    assert.equal(en.tag,tr.tag);assert.deepEqual(en.attrs,tr.attrs);assert.equal(en.children.length,tr.children.length);
    tr.children.forEach((child,index)=>compare(child,en.children[index]));
  };
  for(const entry of mysteries){
    const trRaw=await readFile(`src/content/mysteries/${entry.id}/tr.json`);
    const tr=await loadMystery(entry,'tr'),en=await loadMystery(entry,'en');
    assert.equal(en.sections.length,tr.sections.length);
    tr.sections.forEach((section,index)=>compare(section,en.sections[index]));
    assert.deepEqual(en.source,tr.source);
    assert.equal(en.editorial.translationState,'editorial-translation');
    assert.equal(en.editorial.independentlyReviewed,false);
    assert.equal(en.editorial.sourceLocale,'tr');
    assert.equal(en.editorial.sourceRevision,tr.source.revision);
    assert.equal(en.editorial.sourceContentSha256,createHash('sha256').update(trRaw).digest('hex'));
    const trText=tr.sections.map(plain).join('\n'),enText=en.sections.map(plain).join('\n');
    assert.deepEqual(enText.match(/10\.\d{4,9}\/[^\s]+/g),trText.match(/10\.\d{4,9}\/[^\s]+/g));
    const refs=tr.sections.find(section=>['kaynakca','kaynaklar'].includes(section.attrs.id));
    const referenceText=plain(refs);
    // Original English titles are bibliographic identifiers, not translation targets.
    for(const match of referenceText.matchAll(/“([^”]+)”/g)){
      if(/^(?:Decoding|Calendars|A Model|The Mysteries|An improved|Inca Quarrying|Reconstructing|Who Taught|City of Cuzco|Ancient organo|Volcanic stone|Probing|Keywords|The Voynich|The Linguistics|An Elegant|How Many|The Application|Singulion|The Language|Deciphering|A medieval)/.test(match[1]))assert.ok(enText.includes(match[1]),`Citation title changed: ${match[1]}`);
    }
    for(const locale of ['tr','en']){
      const route=mysteryRoute(entry,locale),html=await readFile(`dist${route}index.html`,'utf8');
      assert.ok(html.includes(`<html lang="${locale}">`));
      assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);
      assert.ok(html.includes(`rel="canonical" href="https://katovia.com${route}"`));
      for(const lang of ['tr','en'])assert.ok(html.includes(`hreflang="${lang}" href="https://katovia.com${mysteryRoute(entry,lang)}"`));
      const schema=JSON.parse(html.match(/application\/ld\+json">([^<]+)/)[1]);
      assert.equal(schema.inLanguage,locale);assert.equal(schema.url,`https://katovia.com${route}`);
      assert.doesNotMatch(html,/verified scientific review|English translations have not been published|İngilizce çeviri henüz yayınlanmadı/);
    }
    const enHtml=await readFile(`dist${mysteryRoute(entry,'en')}index.html`,'utf8');
    assert.ok(enHtml.includes(en.sections.map(node=>renderNode(node,'en')).join('').replace(/[ \t]+$/gm,'')));
  }
});
test('content renderer rejects executable tags and dangerous links',()=>{
  assert.throws(()=>renderNode({tag:'script',attrs:{},children:[]}));
  assert.throws(()=>renderNode({tag:'a',attrs:{href:'javascript:alert(1)'},children:['link']}));
  assert.throws(()=>renderNode({tag:'p',attrs:{onclick:'alert(1)'},children:[]}));
  assert.equal(renderNode('<script>'),'&lt;script&gt;');
});
test('explicit URL locale does not overwrite saved global language preference',()=>{
  const writes=[];const instance=createI18n({backend:{get:()=> 'en',set:(...args)=>writes.push(args)}});
  instance.setLocale('tr',{persist:false});assert.equal(instance.locale,'tr');assert.deepEqual(writes,[]);
  instance.setLocale('en');assert.equal(writes.length,1);
});

test('all fourteen translations pass publication parity and retain curated statuses',async()=>{const result=await checkMysteries();assert.equal(result.length,14);assert.deepEqual(['explained','partial','open'].map(status=>mysteries.filter(entry=>entry.status===status).length),[4,5,5]);});
