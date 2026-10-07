import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dataset,profiles,validateDataset,findEntries,readState,stateUrl} from '../src/tools/alphabet/model.js';
import {tools} from '../src/catalog/tools.js';
test('Alphabet V1 has exactly six profiles and 194 ordered source-backed records',()=>{
 assert.deepEqual(validateDataset().counts,{'greek-modern':24,'cyrillic-russian':33,'hiragana-basic':46,'morse-international':36,'braille-tr':29,'braille-ueb':26});
 assert.equal(dataset.audioEnabled,false);
 assert.equal(profiles.map(profile=>profile.entries.length).reduce((a,b)=>a+b),194);
 assert.equal(new Set(profiles.map(profile=>profile.systemId)).size,5);
 const copy=structuredClone(dataset);copy.profiles[0].entries.pop();assert.throws(()=>validateDataset(copy));
 const bad=structuredClone(dataset);bad.profiles[4].entries[0].dots=[7];assert.throws(()=>validateDataset(bad));
});
test('glyph inventories and standardized maps match approved V1 boundaries',()=>{
 assert.equal(profiles[0].entries.map(entry=>entry.forms.find(form=>form.role==='lower').text).join(''),'αβγδεζηθικλμνξοπρστυφχψω');
 assert.equal(profiles[1].entries.map(entry=>entry.forms.find(form=>form.role==='lower').text).join(''),'абвгдеёжзийклмнопрстуфхцчшщъыьэюя');
 assert.equal(profiles[2].entries.map(entry=>entry.forms[0].text).join(''),'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん');
 const expected={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.'};
 for(const entry of profiles[3].entries)assert.equal(entry.pattern,expected[entry.forms[0].text]);
 const tr=profiles[4];assert.equal(tr.entries.map(entry=>entry.inputToken).join(''),'abcçdefgğhıijklmnoöprsştuüvyz');
 for(const [letter,dots] of Object.entries({'ç':[1,6],'ğ':[1,2,6],'ı':[3,5],'ö':[2,4,6],'ş':[1,4,6],'ü':[1,2,5,6]}))assert.deepEqual(tr.entries.find(entry=>entry.inputToken===letter).dots,dots);
 assert.equal(profiles[5].entries.map(entry=>entry.inputToken).join(''),'abcdefghijklmnopqrstuvwxyz');
});
test('search respects actual glyph identity and never converts unsupported input',()=>{
 assert.equal(findEntries(profiles[0],'ς')[0].forms.at(-1).text,'ς');
 assert.equal(findEntries(profiles[0],'α\u0301')[0].id,'greek-modern-03b1');
 assert.equal(findEntries(profiles[0],'µ').length,0);
 assert.equal(findEntries(profiles[2],'が').length,0);
 assert.equal(findEntries(profiles[3],'é').length,0);
 assert.equal(findEntries(profiles[3],'ş').length,0);
 assert.equal(findEntries(profiles[3],'a')[0].pattern,'.-');
 assert.equal(findEntries(profiles[3],'a').length,1);
 assert.equal(findEntries(profiles[4],'ı')[0].inputToken,'ı');
 assert.equal(findEntries(profiles[4],'I')[0].inputToken,'ı');
 assert.equal(findEntries(profiles[4],'İ')[0].inputToken,'i');
 assert.equal(findEntries(profiles[1],'ë')[0].id,'cyrillic-russian-0451');
 assert.equal(findEntries(profiles[1],'ĭ')[0].id,'cyrillic-russian-0439');
});
test('URL state is allowlisted and language-independent',()=>{
 const id=profiles[4].entries[0].id;
 assert.deepEqual(readState(stateUrl('braille-tr',id)),{profileId:'braille-tr',symbolId:id});
 assert.deepEqual(readState('/tools/alphabet-lab/?profile=bad#<script>'),{profileId:null,symbolId:null});
 assert.equal(readState('/tools/alphabet-lab/?profile=braille-ueb#'+id).symbolId,null);
});
test('static route contains all 194 no-JS rows, SEO and no audio or dependencies',async()=>{
 const html=await readFile('dist/tools/alphabet-lab/index.html','utf8');
 assert.equal((html.match(/data-alpha-static-entry=/g)||[]).length,194);
 assert.equal((html.match(/data-alpha-static-profile=/g)||[]).length,6);
 assert.match(html,/rel="canonical" href="https:\/\/katovia.com\/tools\/alphabet-lab\/"/);
 assert.ok((await readFile('dist/sitemap.xml','utf8')).includes('https://katovia.com/tools/alphabet-lab/'));
 assert.equal(tools.find(tool=>tool.id==='alphabet-lab').module,'alphabet-lab');
 assert.doesNotMatch(html,/<audio|speechSynthesis|data-alpha-listen|data-alpha-score/);
});
