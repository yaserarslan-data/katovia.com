import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { concepts,allocationOrder } from '../src/language-forge/data/concepts.js';
import { presets } from '../src/language-forge/data/presets.js';
import { resolveRecipe,lengthRanges } from '../src/language-forge/model.js';
import { canonicalSeed,deriveState } from '../src/language-forge/engine/v1/seed.js';
import { createRandom,createStream,bounded,weighted } from '../src/language-forge/engine/v1/random.js';
import { validateWord } from '../src/language-forge/engine/v1/phonology.js';
import { generateWord,wordCandidate,normalizeWord,GenerationError } from '../src/language-forge/engine/v1/word.js';
import { allocateLexicon } from '../src/language-forge/engine/v1/lexicon.js';
import { generateLanguage } from '../src/language-forge/engine/v1/generate-language.js';
const fixtures=JSON.parse(await readFile(new URL('./fixtures/language-forge-e1-d1.json',import.meta.url),'utf8'));
const input=(preset='flowing',wordLength='balanced',seed='00000000000000000000000000000000')=>({engineVersion:'e1',datasetVersion:'d1',seed,config:{preset,wordLength}});
test('d1 exactly 64 unique ordered first-party concepts, category totals and bilingual labels',()=>{
  assert.equal(concepts.length,64);assert.equal(new Set(allocationOrder).size,64);
  assert.deepEqual(Object.fromEntries(['pronouns','people','nature','body','daily','actions','qualities','emotions','time','abstract'].map(c=>[c,concepts.filter(x=>x.category===c).length])),{pronouns:6,people:5,nature:10,body:5,daily:6,actions:12,qualities:8,emotions:4,time:4,abstract:4});
  for(const c of concepts){assert.ok(c.labels.tr&&c.labels.en);assert.match(c.semanticId,/^(pronoun|noun|verb|adj|adverb)\.[a-z-]+$/);assert.ok(Object.isFrozen(c));}
});
test('strict version, seed, grammar, rules and future edit contract',()=>{
  assert.equal(canonicalSeed('ABCDEF0123456789ABCDEF0123456789'),'abcdef0123456789abcdef0123456789');
  for(const seed of ['',null,1,'0'.repeat(31),'0'.repeat(33),'g'.repeat(32),' '+ '0'.repeat(32),'0'.repeat(16)+'-'+'0'.repeat(16)])assert.throws(()=>canonicalSeed(seed));
  for(const patch of [{engineVersion:'e2'},{datasetVersion:'d2'},{config:{preset:'unknown',wordLength:'short'}},{config:{preset:'flowing',wordLength:'unknown'}},{edits:{version:1,patches:[{semanticId:'noun.water',word:'ma'}]}}])assert.throws(()=>resolveRecipe({...input(),...patch}));
  assert.throws(()=>resolveRecipe({...input(),config:{...input().config,grammar:{wordOrder:'OSV'}}}));
  assert.throws(()=>resolveRecipe({...input(),config:{...input().config,rules:{}}}));
  const recipe=resolveRecipe(input());assert.deepEqual(resolveRecipe(recipe),recipe);assert.ok(Object.isFrozen(recipe.config.rules.segments));
  const reorder=value=>Array.isArray(value)?value.map(reorder):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).reverse().map(([k,v])=>[k,reorder(v)])):value;
  assert.deepEqual(resolveRecipe(reorder(recipe)),recipe);
  assert.equal(normalizeWord('I'), 'i');assert.throws(()=>normalizeWord('İ'));
});
test('unsigned xorshift arithmetic agrees with independent BigInt oracle, including high bits',()=>{
  for(const initial of [[1,2,3,4],[0xffffffff,0x80000000,0,1]]) {
    const stream=createRandom(initial);let [a,b,c,d]=initial.map(BigInt);const mask=0xffffffffn;
    for(let i=0;i<100;i++){const t=(a^(a<<11n))&mask;[a,b,c]=[b,c,d];d=(d^(d>>19n)^t^(t>>8n))&mask;assert.equal(stream.nextUint32(),Number(d));}
  }
  assert.throws(()=>createRandom([0,0,0,0]));assert.throws(()=>createRandom([-1,2,3,4]));
  assert.deepEqual(deriveState('0'.repeat(32),'e1','d1','grammar'),deriveState('0'.repeat(32),'e1','d1','grammar'));
  for(let lane=0;lane<4;lane++){const s='0'.repeat(lane*8)+'00000001'+'0'.repeat((3-lane)*8);assert.notDeepEqual(deriveState(s,'e1','d1','grammar'),deriveState('0'.repeat(32),'e1','d1','grammar'));}
});
test('bounded integer rejects bias tail and malformed/hostile streams; integer weights have exact boundaries',()=>{
  let draws=0;assert.equal(bounded({nextUint32:()=>draws++?7:0xffffffff},10),7);assert.equal(draws,2);
  assert.equal(bounded({nextUint32:()=>0xffffffff},0x100000000),0xffffffff);
  assert.throws(()=>bounded({nextUint32:()=>0xffffffff},10),/budget/);
  assert.throws(()=>bounded({nextUint32:()=>-1},10));
  for(const b of [0,-1,1.1,0x100000001])assert.throws(()=>bounded(createRandom([1,2,3,4]),b));
  for(let n=0;n<5;n++)assert.equal(weighted({nextUint32:()=>n},[{value:'a',weight:2},{value:'b',weight:3}]).value,n<2?'a':'b');
  assert.throws(()=>weighted(createRandom([1,2,3,4]),[{weight:0}]));
});
test('all four presets and all three length ranges: 64 valid unique roots + valid isolated name',()=>{
  for(const preset of presets)for(const wordLength of Object.keys(lengthRanges))for(let n=0;n<12;n++) {
    const x=generateLanguage(input(preset.id,wordLength,n.toString(16).padStart(32,'0')));
    assert.equal(x.language.lexicon.length,64);assert.equal(new Set(x.language.lexicon.map(c=>c.word)).size,64);
    assert.deepEqual(x.language.lexicon.map(c=>c.semanticId),allocationOrder);
    const [min,max]=lengthRanges[wordLength];
    for(const c of x.language.lexicon){const v=validateWord(c.word,x.config.rules);assert.ok(v.valid,`${preset.id} ${c.word}`);assert.ok(v.syllables.length>=min&&v.syllables.length<=max);}
    assert.ok(validateWord(x.language.canonicalName,x.config.rules).valid);assert.ok(x.language.canonicalName.length<=12);
    assert.ok(!x.language.lexicon.some(c=>c.word===x.language.canonicalName));
    assert.equal(x.language.displayName,x.language.canonicalName[0].toUpperCase()+x.language.canonicalName.slice(1));
  }
});
test('validator enforces segments, templates, onsets, coda, repetitions and syllable boundaries',()=>{
  const flow=resolveRecipe(input()).config.rules, crisp=resolveRecipe(input('crisp')).config.rules;
  for(const w of ['ma','ama','mari'])assert.ok(validateWord(w,flow).valid);
  for(const w of ['MA','maa','mama','mae','tra','mam','ma1','İ','mmm'])assert.equal(validateWord(w,flow).valid,false,w);
  assert.ok(validateWord('trak',crisp).valid);
  for(const w of ['plak','trbak','kag','katt','katkat'])assert.equal(validateWord(w,crisp).valid,false,w);
  assert.equal(validateWord('ma',{...flow,forbiddenSequences:['ma']}).valid,false);
});
test('64 candidate cap covers invalid and colliding roots together, without relaxation',()=>{
  const phonology=resolveRecipe(input()).config.rules;let count=0;
  const base={phonology,lengthProfile:'short',stream:createRandom([1,2,3,4]),slotId:'noun.water'};
  const result=generateWord({...base,constraints:{used:new Set(['MA'])},candidate:()=>({word:++count===64?'me':count%2?'ma':'zzz'})});
  assert.deepEqual(result,{word:'me',attempts:64});assert.equal(count,64);
  count=0;assert.throws(()=>generateWord({...base,candidate:()=>{count++;return {word:'ma'};},constraints:{reserved:['MA']}}),e=>e instanceof GenerationError&&e.slotId==='noun.water'&&e.attempts===64);assert.equal(count,64);
});
test('allocation collision only advances its own stream, never mutates prior roots',()=>{
  const recipe=resolveRecipe(input());const streams=new Map();let position=0;
  const lexicon=allocateLexicon(recipe,{streamFor:id=>{const s={id,draws:0};streams.set(id,s);return s;},generate:options=>{
    const index=position++;const candidate=()=>{options.stream.draws++;return {word:index===1&&options.stream.draws===1?'ma':index===0?'ma':`m${['a','e','i','o','u'][index%5]}n${['a','e','i','o','u'][Math.floor(index/5)%5]}r${['a','e','i','o','u'][Math.floor(index/25)%5]}`};};
    return generateWord({...options,lengthProfile:index===0?'short':'long',candidate});
  }});
  assert.equal(lexicon[0].word,'ma');assert.equal(streams.get(allocationOrder[0]).draws,1);assert.equal(streams.get(allocationOrder[1]).draws,2);assert.equal(new Set(lexicon.map(x=>x.word)).size,64);
});
test('namespace isolation, reroll isolation, UI fields/labels/render order and grammar never shift words',()=>{
  const recipe=input();const original=generateLanguage(recipe);
  const displayDataset=[...concepts].reverse().map(c=>({...c,labels:{tr:'yeni',en:'changed'}}));
  assert.equal(displayDataset.length,64);
  const rendered=[...original.language.lexicon].reverse();rendered[0]={...rendered[0],label:'UI'};
  assert.deepEqual(generateLanguage({...recipe,locale:'tr',ui:{rendered,displayDataset}}),original);
  const changed=generateLanguage({...recipe,config:{...recipe.config,grammar:{wordOrder:'VSO',adjectivePosition:'after',morphologyStrategy:'suffix'}}});
  assert.deepEqual(changed.language,original.language);
  const stream=ns=>createStream(recipe.seed,'e1','d1',ns), take=s=>Array.from({length:16},()=>s.nextUint32());
  const expected=take(stream('concept:noun.water'));take(stream('grammar'));take(stream('reroll:noun.fire:1'));
  assert.deepEqual(take(stream('concept:noun.water')),expected);
  for(const ns of ['grammar','language-name','concept:noun.fire','reroll:noun.water:1'])assert.notDeepEqual(take(stream(ns)),expected);
  assert.notDeepEqual(take(createStream(recipe.seed,'e2','d1','concept:noun.water')),expected);
  assert.notDeepEqual(take(createStream(recipe.seed,'e1','d2','concept:noun.water')),expected);
});
test('four immutable e1/d1 goldens lock names and every canonical lexicon entry',()=>{
  const roots=[];
  for(const f of fixtures){const actual=generateLanguage(f.input);assert.deepEqual(actual.language.lexicon,f.lexicon);assert.equal(actual.language.canonicalName,f.canonicalName);assert.equal(actual.language.displayName,f.displayName);assert.deepEqual(generateLanguage(f.input),actual);roots.push(actual.language.lexicon.map(x=>x.word).join(','));}
  assert.equal(new Set(roots).size,4);
});
test('goldens are identical in independent processes under EN/TR locale environments',()=>{
  const script="import {generateLanguage} from './src/language-forge/engine/v1/generate-language.js';console.log(JSON.stringify(generateLanguage("+JSON.stringify(fixtures[0].input)+")))";
  const run=locale=>execFileSync(process.execPath,['--input-type=module','-e',script],{cwd:new URL('..',import.meta.url),env:{...process.env,LANG:locale,LC_ALL:locale},encoding:'utf8'});
  assert.equal(run('en_US.UTF-8'),run('tr_TR.UTF-8'));
});
test('core source has no environment randomness, storage, network or presentation integration',async()=>{
  const files=['model.js','data/concepts.js','data/presets.js',...['seed','random','phonology','word','lexicon','language-name','generate-language'].map(x=>`engine/v1/${x}.js`)];
  for(const f of files){const source=await readFile(new URL(`../src/language-forge/${f}`,import.meta.url),'utf8');assert.doesNotMatch(source,/Math\.random|Date\.|localeCompare|toLocaleLowerCase|fetch\(|localStorage|document\.|navigator\.|https?:\/\//);}
});
