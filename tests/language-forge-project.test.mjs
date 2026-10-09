import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {generateLanguagePackage} from '../src/language-forge/engine/grammar/v1/generate-grammar.js';
import {validateProject,projectFromPackage,patchProject} from '../src/language-forge/project/model.js';
import {reconstructProject,acceptWord,rerollProject} from '../src/language-forge/project/reconstruct.js';
import {exportProject,importProject,shareProject,decodeShare,cleanUrl} from '../src/language-forge/project/codec.js';
import {projectStorage} from '../src/language-forge/project/storage.js';
const fixtures=JSON.parse(await readFile(new URL('./fixtures/language-forge-e1-d1-g1.json',import.meta.url),'utf8'));
const start=(i=0)=>{const pack=generateLanguagePackage(fixtures[i].input);return {project:projectFromPackage(pack),package:pack};};
const clone=x=>structuredClone(x);
test('versioned recipe wrapper has full clean g1 parity for all four goldens, without computed/UI data',()=>{
 for(let i=0;i<4;i++){const s=start(i),r=reconstructProject(s.project);assert.deepEqual(r.package.language,s.package.language);assert.deepEqual(r.package.grammar,fixtures[i].grammar);assert.deepEqual(Object.keys(s.project),['format','version','engineVersion','datasetVersion','grammarVersion','seed','config','edits']);assert.equal(s.project.locale,undefined);assert.equal(s.project.language,undefined);}
});
test('accepted edits/rename are explicit patches and do not mutate unrelated roots, seed or base name',()=>{
 const s=start(),before=clone(s);const r=acceptWord(s.project,'noun.water','  malori  ',s.package);assert.equal(r.project.edits.words[0].value,'malori');assert.equal(r.project.edits.words[0].source,'manual');assert.equal(r.package.grammar.examples[1].surface,'same veni malori');
 for(const entry of r.package.language.lexicon)if(entry.semanticId!=='noun.water')assert.deepEqual(entry,s.package.language.lexicon.find(x=>x.semanticId===entry.semanticId));
 const name=reconstructProject({...r.project,edits:{...r.project.edits,languageName:'  My   Realm  '}});assert.equal(name.package.language.displayName,'My Realm');assert.equal(name.project.seed,s.project.seed);assert.deepEqual(s,before);
 const grammar=clone(name.project);grammar.config.grammar.wordOrder='SOV';const changed=reconstructProject(grammar,{base:name.base});assert.equal(changed.package.language.displayName,'My Realm');assert.deepEqual(changed.package.language.lexicon,name.package.language.lexicon);
});
test('advisory opaque words survive particle and suffix reconstruction; derived pieces remain explicit',()=>{
 for(const i of [0,1,2,3]){const s=start(i);const r=acceptWord(s.project,'noun.child','xava',s.package);assert.equal(r.package.language.lexicon.find(x=>x.semanticId==='noun.child').word,'xava');const tokens=r.package.grammar.examples[5].tokens;assert.ok(tokens.some(t=>t.analysis.some(a=>a.surface==='xava')));}
});
test('duplicates, grammar marker collisions, malformed text and morphology failure are atomic',()=>{
 const s=start(),before=clone(s);
 assert.throws(()=>acceptWord(s.project,'noun.water','rima',s.package),e=>e.code==='WORD_DUPLICATE');assert.throws(()=>acceptWord(s.project,'noun.water',s.package.grammar.markers['grammar.plural'],s.package),e=>e.code==='MARKER_COLLISION');
 for(const value of ['', 'two words','<img>','x'.repeat(25)])assert.throws(()=>acceptWord(s.project,'noun.water',value,s.package));
 const suffix=start(1);assert.throws(()=>acceptWord(suffix.project,'noun.child','kapoti'.repeat(4),suffix.package));assert.deepEqual(s,before);
});
test('deterministic per-word reroll retains other 63 words, name, seed, grammar config and explicit counter/value',()=>{
 const s=start();const a=rerollProject(s.project,'noun.water',s.package),b=rerollProject(s.project,'noun.water',s.package);assert.deepEqual(a,b);assert.equal(a.project.edits.words[0].rerollCounter,1);assert.equal(a.project.edits.words[0].source,'rerolled');assert.notEqual(a.project.edits.words[0].value,'nera');
 for(const x of a.package.language.lexicon)if(x.semanticId!=='noun.water')assert.deepEqual(x,s.package.language.lexicon.find(y=>y.semanticId===x.semanticId));assert.equal(a.package.language.displayName,'Neniru');assert.deepEqual(a.project.config,s.project.config);assert.equal(a.project.seed,s.project.seed);
 const second=rerollProject(a.project,'noun.water',a.package);assert.equal(second.project.edits.words[0].rerollCounter,2);
});
test('strict JSON import validates 16 KiB, all versions/enums/patch IDs/lengths, duplicates and unknown fields',()=>{
 const s=start();assert.deepEqual(importProject(exportProject(s.project)).project,s.project);
 for(const value of ['bad',' ', 'a'.repeat(16385),'ş'.repeat(8193)])assert.throws(()=>importProject(value));
 const mutations=[p=>{p.format='other';},p=>{p.version=2;},p=>{p.engineVersion='e2';},p=>{p.datasetVersion='d2';},p=>{p.grammarVersion='g2';},p=>{p.seed='no';},p=>{p.config.preset='bad';},p=>{p.config.wordLength='bad';},p=>{p.config.grammar.wordOrder='OSV';},p=>{p.locale='tr';},p=>{p.edits.words=[{semanticId:'__proto__',value:'ma',source:'manual',rerollCounter:0}];},p=>{p.edits.words=[{semanticId:'noun.water',value:'x'.repeat(25),source:'manual',rerollCounter:0}];},p=>{p.edits.words=[{semanticId:'noun.water',value:'rima',source:'manual',rerollCounter:0}];}];
 for(const mutate of mutations){const p=clone(s.project);mutate(p);assert.throws(()=>importProject(JSON.stringify(p)));}
 assert.throws(()=>importProject(exportProject(s.project).replace('"format":','"__proto__":{},"format":')));assert.equal({}.polluted,undefined);
});
test('UTF-8 canonical share round trips generated, manual, name, reroll and suffix snapshots',()=>{
 for(let i=0;i<4;i++){const s=start(i);let r=acceptWord(s.project,'noun.water','xava',s.package);r=rerollProject(r.project,'noun.fire',r.package);r=reconstructProject({...r.project,edits:{...r.project.edits,languageName:'Şafak'}});const share=shareProject(r.project);assert.equal(share.available,true);assert.ok(share.used<=1900);assert.deepEqual(decodeShare(new URL(share.url).hash).project,r.project);assert.deepEqual(importProject(exportProject(r.project)).package,r.package);
  const reverse=clone(r.project);reverse.edits.words.reverse();assert.equal(shareProject(reverse).url,share.url);const original=share.url;const modified=acceptWord(r.project,'noun.water','xavi',r.package);assert.notEqual(shareProject(modified.project).url,original);assert.equal(decodeShare(new URL(original).hash).package.language.displayName,'Şafak');}
 const clean=start();assert.deepEqual(decodeShare(new URL(shareProject(clean.project).url).hash).project,clean.project);
});
test('malformed/unknown share formats reject without latest fallback; URL over budget keeps all edits/export',()=>{
 for(const fragment of ['#lf2.abc','#lf1.bad%','#lf1.%%%','#lf1.'+'a'.repeat(2000),'#other'])assert.throws(()=>decodeShare(fragment));
 const s=start();const p=clone(s.project);p.edits.words=s.package.language.lexicon.map((x,i)=>({semanticId:x.semanticId,value:'z'+String.fromCharCode(97+Math.floor(i/26))+String.fromCharCode(97+i%26)+'a'.repeat(21),source:'manual',rerollCounter:0}));
 const r=reconstructProject(p),share=shareProject(r.project);assert.equal(share.available,false);assert.ok(share.used>1900);assert.equal(r.project.edits.words.length,64);assert.equal(importProject(exportProject(r.project)).project.edits.words.length,64);
 const bad=[1,'e9','d1','g1',s.project.seed,'flowing','balanced',['SVO','before','particle'],null,[]];const fragment='#lf1.'+Buffer.from(JSON.stringify(bad)).toString('base64url');assert.throws(()=>decodeShare(fragment),e=>e.code==='VERSION_UNSUPPORTED');
});
test('safe single-project storage restores recipes, preserves other namespaces, fails gently and ignores corruption',()=>{
 const map=new Map([['other','keep'],['katovia:v2:locale','keep']]);const backend={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const store=projectStorage(()=>backend),s=start();assert.equal(store.save(s.project),true);assert.deepEqual(store.load().project,s.project);assert.equal(store.clear(),true);assert.equal(map.get('other'),'keep');assert.equal(map.get('katovia:v2:locale'),'keep');
 map.set('katovia:language-forge:active','{bad');assert.equal(store.load(),null);assert.equal(map.get('katovia:language-forge:active'),'{bad');
 for(const get of [()=>null,()=>{throw new Error('privacy');},()=>({...backend,setItem(){throw new Error('quota');}})]){const denied=projectStorage(get);assert.equal(denied.save(s.project),false);assert.equal(denied.load(),null);}
});
