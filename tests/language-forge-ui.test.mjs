import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {setupState,choosePreset,generationInput,createSeed,dictionaryRows,punctuate} from '../src/language-forge/ui/model.js';
import {generateLanguagePackage} from '../src/language-forge/engine/grammar/v1/generate-grammar.js';
import {forgeMessages} from '../src/language-forge/ui/messages.js';
import {creations} from '../src/catalog/creations.js';
const seed='0123456789abcdef0123456789abcdef';
test('UI recommendations respect explicit custom grammar, generation recipe preserves grammar-only seed',()=>{
 const state=setupState();assert.equal(state.wordLength,'balanced');choosePreset(state,'crisp');assert.deepEqual(state.grammarConfig,{wordOrder:'SOV',adjectivePosition:'after',morphologyStrategy:'suffix'});
 state.grammarCustomized=true;state.grammarConfig.wordOrder='SVO';choosePreset(state,'clustered');assert.equal(state.grammarConfig.wordOrder,'SVO');assert.equal(state.grammarConfig.morphologyStrategy,'suffix');
 state.generatedPackage=generateLanguagePackage(generationInput(state,()=>seed));state.grammarConfig.wordOrder='VSO';
 assert.equal(generationInput(state,()=>{throw new Error('must not draw seed');}).seed,seed);
 state.wordLength='long';assert.equal(generationInput(state,()=> 'f'.repeat(32)).seed,'f'.repeat(32));
 assert.equal(setupState().generatedPackage,null);assert.equal(setupState().grammarCustomized,false);
});
test('native seed adapter writes 16 bytes, emits canonical hex, and never falls back to Math.random',()=>{
 assert.equal(createSeed({getRandomValues:array=>{assert.equal(array.length,16);for(let i=0;i<16;i++)array[i]=i;}}),'000102030405060708090a0b0c0d0e0f');
 assert.throws(()=>createSeed({getRandomValues(){throw new Error('blocked');}}));
});
test('dictionary searches both meanings and roots, filters categories; punctuation never mutates canonical examples',()=>{
 const pack=generateLanguagePackage(generationInput(setupState(),()=>seed));
 assert.equal(dictionaryRows(pack,'','all').length,64);assert.equal(dictionaryRows(pack,'nera','all')[0].semanticId,'noun.water');assert.equal(dictionaryRows(pack,'water','nature')[0].word,'nera');
 assert.ok(dictionaryRows(pack,'su','nature').some(x=>x.semanticId==='noun.water'));assert.equal(dictionaryRows(pack,'water','actions').length,0);
 const before=structuredClone(pack);assert.equal(punctuate(pack.grammar.examples[0]),'rima ralo mesa.');assert.ok(punctuate(pack.grammar.examples[9]).endsWith('?'));assert.deepEqual(pack,before);
 assert.deepEqual(Object.keys(forgeMessages.tr).sort(),Object.keys(forgeMessages.en).sort());
});
test('public static route, CREATE discoverability, canonical/schema/sitemap follow shared locale architecture',async()=>{
 const entry=creations[0];assert.equal(entry.route,'/create/language-forge/');
 const html=await readFile('dist/create/language-forge/index.html','utf8');assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.match(html,/<link rel="canonical" href="https:\/\/katovia.com\/create\/language-forge\/">/);assert.match(html,/content="index, follow"/);
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)/)[1]);assert.equal(schema['@type'],'WebApplication');assert.equal(schema.name,'Language Forge');assert.equal(schema.isAccessibleForFree,true);assert.deepEqual(schema.inLanguage,['en','tr']);assert.equal(schema.aggregateRating,undefined);
 assert.ok((await readFile('dist/create/index.html','utf8')).includes('data-forge-card'));assert.ok((await readFile('dist/create/index.html','utf8')).includes('data-creator'));
 assert.ok((await readFile('dist/sitemap.xml','utf8')).includes('<loc>https://katovia.com/create/language-forge/</loc>'));
 assert.match(html,/data-forge-fallback/);assert.match(html,/<form data-forge-form hidden>/);
 for(const text of [forgeMessages.en['forge.hero'],forgeMessages.en['forge.meta']])assert.ok(html.includes(text));
});
