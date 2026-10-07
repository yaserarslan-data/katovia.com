import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dataset,profiles,validateDataset,findEntries,readState,stateUrl} from '../src/tools/alphabet/model.js';
import {tools} from '../src/catalog/tools.js';
test('character inventory has six profiles, 194 unique records and only minimal fields',()=>{
 assert.equal(validateDataset().records,194);assert.deepEqual(profiles.map(p=>p.entries.length),[24,33,46,36,29,26]);
 assert.deepEqual(Object.keys(dataset),['profiles']);
 assert.equal(new Set(profiles.map(p=>p.systemId)).size,5);
 const copy=structuredClone(dataset);copy.profiles[0].entries.pop();assert.throws(()=>validateDataset(copy));
 const extra=structuredClone(dataset);extra.profiles[0].entries[0].extra='metadata';assert.throws(()=>validateDataset(extra));
});
test('writing systems keep their character inventories and short labels',()=>{
 assert.equal(profiles[0].entries.map(e=>e.character).join(''),'αβγδεζηθικλμνξοπρστυφχψω');
 assert.equal(profiles[1].entries.map(e=>e.character).join(''),'абвгдеёжзийклмнопрстуфхцчшщъыьэюя');
 assert.equal(profiles[2].entries.map(e=>e.character).join(''),'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん');
 assert.equal(profiles[3].entries[0].character,'.-');
 assert.equal(profiles[4].entries[3].character,'⠡');assert.equal(profiles[5].entries[22].character,'⠺');
});
test('simple search matches characters and names without text conversion',()=>{
 assert.equal(findEntries(profiles[0],'ς')[0].character,'σ');
 assert.equal(findEntries(profiles[0],'α\u0301')[0].id,'greek-modern-03b1');
 assert.equal(findEntries(profiles[0],'Beta')[0].character,'β');
 assert.equal(findEntries(profiles[0],'µ').length,0);assert.equal(findEntries(profiles[2],'が').length,0);
 assert.equal(findEntries(profiles[3],'é').length,0);assert.equal(findEntries(profiles[3],'a').length,1);
 assert.equal(findEntries(profiles[4],'I')[0].character,'⠔');assert.equal(findEntries(profiles[4],'İ')[0].character,'⠊');
});
test('existing profile and symbol URLs remain valid and language-independent',()=>{
 const id=profiles[4].entries[0].id;assert.deepEqual(readState(stateUrl('braille-tr',id)),{profileId:'braille-tr',symbolId:id});
 assert.deepEqual(readState('/tools/alphabet-lab/?profile=bad#<script>'),{profileId:null,symbolId:null});
 assert.equal(readState('/tools/alphabet-lab/?profile=braille-ueb#'+id).symbolId,null);
});
test('static character route has 194 readable rows, clean UI and unchanged SEO',async()=>{
 const html=await readFile('dist/tools/alphabet-lab/index.html','utf8');
 assert.equal((html.match(/data-alpha-static-entry=/g)||[]).length,194);assert.equal((html.match(/data-alpha-static-profile=/g)||[]).length,6);
 assert.match(html,/rel="canonical" href="https:\/\/katovia.com\/tools\/alphabet-lab\/"/);
 assert.ok((await readFile('dist/sitemap.xml','utf8')).includes('https://katovia.com/tools/alphabet-lab/'));
 assert.equal(tools.find(t=>t.id==='alphabet-lab').module,'alphabet-lab');
 assert.doesNotMatch(html,/SHA-256|UNICODE LICENSE|sourceRefs|alphabet-provenance|Romanization|Pronunciation|unicode\.org|loc\.gov|cornell\.edu|irodori|iceb\.org|perkins\.org/i);
});
