import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {tools,toolPages,discoveryCollections,creativeTools} from '../src/catalog/tools.js';
import {messages} from '../src/i18n/messages.js';
const html=route=>readFile(`dist${route}index.html`,'utf8');
test('category ownership changes preserve every public route and sitemap entry',async()=>{
 assert.equal(tools.length,7);assert.deepEqual(discoveryCollections.map(p=>p.id),['beautiful-quotes','alphabet-lab']);assert.deepEqual(creativeTools.map(p=>p.id),['pixel-art-grid']);
 const sitemap=await readFile('dist/sitemap.xml','utf8');
 for(const p of toolPages){const source=await html(p.route);assert.ok(source.includes(`href="https://katovia.com${p.route}"`));assert.ok(sitemap.includes(`https://katovia.com${p.route}`));assert.ok(source.includes(`data-i18n="nav.${p.owner}"`));}
});
test('curated home and category indexes expose one owner per product without full detail catalogs',async()=>{
 const home=await html('/');assert.equal((home.match(/data-card-id=/g)||[]).length,7);
 for(const id of ['language-forge','quiz-creator','particle-universe','pixel-piano','image-compressor','lucky-draw','beautiful-quotes'])assert.equal((home.match(new RegExp(`data-card-id="${id}"`,'g'))||[]).length,1);
 for(const id of ['koi-pond','pixel-art-grid','alphabet-lab','qr','golf'])assert.ok(!home.includes(`data-card-id="${id}"`));
 const toolIndex=await html('/tools/');for(const p of tools)assert.ok(toolIndex.includes(`data-card-id="${p.id}"`));
 for(const p of [...discoveryCollections,...creativeTools])assert.ok(!toolIndex.includes(`data-card-id="${p.id}"`));
 for(const p of toolPages)assert.equal(((await html(p.route)).match(/data-card-id=/g)||[]).length,2);
 assert.ok((await html('/create/')).includes('href="../tools/pixel-art-grid/"'));
});
test('dictionary category and word actions use independent bilingual labels',()=>{
 for(const [locale,expected] of [['tr','Eylemler'],['en','Actions']]){assert.equal(messages[locale]['forge.actions'],expected);assert.ok(messages[locale]['forge.wordActions'].includes('{word}'));}
});
