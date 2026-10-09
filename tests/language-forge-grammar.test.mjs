import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generateLanguage } from '../src/language-forge/engine/v1/generate-language.js';
import { generateLanguagePackage,generateGrammar,validateFinalLexicon } from '../src/language-forge/engine/grammar/v1/generate-grammar.js';
import { allocateMarkers } from '../src/language-forge/engine/grammar/v1/markers.js';
import { deriveSuffix } from '../src/language-forge/engine/grammar/v1/morphology.js';
import { realizeSentence } from '../src/language-forge/engine/grammar/v1/sentence.js';
import { validateWord } from '../src/language-forge/engine/v1/phonology.js';
import { markerOrder,sentenceFrames,verbValency,pronounFeatures } from '../src/language-forge/data/grammar.js';
import { concepts } from '../src/language-forge/data/concepts.js';
import { presentSentence } from '../src/language-forge/presentation/grammar.js';
const lexicalGoldens=JSON.parse(await readFile(new URL('./fixtures/language-forge-e1-d1.json',import.meta.url),'utf8'));
const goldens=JSON.parse(await readFile(new URL('./fixtures/language-forge-e1-d1-g1.json',import.meta.url),'utf8'));
const recipe=(index=0,grammar={})=>({...lexicalGoldens[index].input,grammarVersion:'g1',config:{...lexicalGoldens[index].input.config,grammar}});
const frame=id=>sentenceFrames.find(f=>f.id===`sentence.${id}`);
const sample=(pack,id)=>pack.grammar.examples.find(f=>f.id===`sentence.${id}`);
const roots=pack=>Object.fromEntries(pack.language.lexicon.map(x=>[x.semanticId,x.word]));
test('g1 metadata defines exactly 8 markers, 12 frames, 12 valencies and existing six pronouns',()=>{
  assert.equal(markerOrder.length,8);assert.equal(new Set(markerOrder).size,8);
  assert.equal(sentenceFrames.length,12);assert.equal(new Set(sentenceFrames.map(f=>f.id)).size,12);
  assert.equal(Object.keys(verbValency).length,12);assert.equal(Object.keys(pronounFeatures).length,6);
  for(const [id,{valency}] of Object.entries(verbValency)){assert.ok(concepts.some(c=>c.semanticId===id));assert.ok(['intransitive','transitive'].includes(valency));}
  assert.equal(verbValency['verb.speak'].valency,'intransitive');
  for(const f of sentenceFrames)assert.ok(f.meaning.tr&&f.meaning.en);
});
test('g1 package is an additive versioned extension with untouched Phase 1 full output',()=>{
  for(const f of lexicalGoldens){const pack=generateLanguagePackage({...f.input,grammarVersion:'g1'});const {grammarVersion,grammar,...base}=pack;
    assert.equal(grammarVersion,'g1');assert.equal(grammar.version,'g1');assert.deepEqual(base,generateLanguage(f.input));
    assert.deepEqual(base.language.lexicon,f.lexicon);assert.equal(base.language.canonicalName,f.canonicalName);
  }
  for(const version of [undefined,'g2',1])assert.throws(()=>generateLanguagePackage({...recipe(),grammarVersion:version}),e=>e.code==='GRAMMAR_VERSION_UNSUPPORTED');
});
test('4 presets × 12 grammar configurations preserve roots and correctly realize every constituent order',()=>{
  for(let i=0;i<4;i++)for(const wordOrder of ['SVO','SOV','VSO'])for(const adjectivePosition of ['before','after'])for(const morphologyStrategy of ['particle','suffix']) {
    const pack=generateLanguagePackage(recipe(i,{wordOrder,adjectivePosition,morphologyStrategy}));
    assert.deepEqual(pack.language.lexicon,lexicalGoldens[i].lexicon);assert.equal(pack.language.canonicalName,lexicalGoldens[i].canonicalName);
    const markers=Object.values(pack.grammar.markers);assert.equal(markers.length,8);assert.equal(new Set(markers).size,8);
    for(const word of markers){assert.ok(validateWord(word,pack.config.rules).valid);assert.ok(!pack.language.lexicon.some(x=>x.word===word));assert.notEqual(word,pack.language.canonicalName);}
    const expected=wordOrder==='SVO'?['subject','verb','object']:wordOrder==='SOV'?['subject','object','verb']:['verb','subject','object'];
    for(const e of pack.grammar.examples){
      const roles=[...new Set(e.tokens.filter(t=>t.role!=='question').map(t=>t.role==='complement'?'object':t.role))];
      assert.deepEqual(roles,expected.filter(r=>roles.includes(r)),`${i} ${wordOrder} ${e.id}`);
      assert.equal(e.explanation.wordOrder,wordOrder);
      assert.equal(e.surface,e.tokens.map(t=>t.surface).join(' '));
      for(const token of e.tokens){assert.equal(token.surface,token.analysis.map(a=>a.surface).join(''));assert.ok(validateWord(token.surface,pack.config.rules).valid);
        for(const a of token.analysis){if(a.type==='root')assert.ok(concepts.some(c=>c.semanticId===a.semanticId));else if(a.type==='marker')assert.ok(markerOrder.includes(a.markerId));else assert.equal(a.type,'linker');}
      }
    }
    const good=sample(pack,'good-person').tokens.filter(t=>t.role==='subject').map(t=>t.semanticId);
    assert.deepEqual(good,adjectivePosition==='before'?['adj.good','noun.person']:['noun.person','adj.good']);
    assert.equal(sample(pack,'good-person').explanation.adjectivePosition,adjectivePosition);
    assert.equal(sample(pack,'love-city').explanation.pronouns[0].number,'plural');
    assert.equal(sample(pack,'love-city').explanation.plural,false);
    assert.equal(sample(pack,'future-go').explanation.pronouns[0].person,3);
  }
});
test('particle and suffix forms apply plural/past/future, present remains unmarked',()=>{
  for(const morphologyStrategy of ['particle','suffix']){
    const pack=generateLanguagePackage(recipe(0,{morphologyStrategy}));
    for(const [id,markerId,semanticId] of [['children-moon','grammar.plural','noun.child'],['past-go','grammar.past','verb.go'],['future-go','grammar.future','verb.go']]) {
      const example=sample(pack,id), root=roots(pack)[semanticId],marker=pack.grammar.markers[markerId];
      if(morphologyStrategy==='particle'){
        const index=example.tokens.findIndex(t=>t.markerId===markerId);assert.ok(index>=0);assert.equal(example.tokens[index].surface,marker);assert.equal(example.tokens[index+1].surface,root);
      } else {
        const token=example.tokens.find(t=>t.semanticId===semanticId);assert.equal(token.analysis[0].surface,root);assert.equal(token.analysis.at(-1).surface,marker);assert.ok(!example.tokens.some(t=>t.markerId===markerId));
      }
      assert.ok(example.explanation.morphology.some(m=>m.markerId===markerId&&m.strategy===morphologyStrategy));
    }
    assert.equal(sample(pack,'children-moon').explanation.plural,true);
    assert.deepEqual(sample(pack,'see-moon').explanation.morphology,[]);assert.equal(sample(pack,'see-moon').explanation.tense,'present');
  }
});
test('negation precedes the entire verbal block; questions are final across strategy/order',()=>{
  for(const wordOrder of ['SVO','SOV','VSO'])for(const morphologyStrategy of ['particle','suffix']) {
    const pack=generateLanguagePackage(recipe(0,{wordOrder,morphologyStrategy}));
    const ast=structuredClone(frame('not-drink').ast);ast.predicate.tense='past';
    const e=realizeSentence(ast,pack,pack.grammar);const verbal=e.tokens.filter(t=>t.role==='verb');
    assert.equal(verbal[0].markerId,'grammar.negation');
    if(morphologyStrategy==='particle')assert.equal(verbal[1].markerId,'grammar.past');else assert.equal(verbal[1].analysis.at(-1).markerId,'grammar.past');
    const q=sample(pack,'question-moon');assert.equal(q.tokens.at(-1).markerId,'grammar.question');assert.equal(q.explanation.question,true);assert.ok(!q.surface.includes('?'));
  }
});
test('possession forms a constituent; copula and above use generated markers',()=>{
  const pack=generateLanguagePackage(recipe());const r=roots(pack),m=pack.grammar.markers;
  assert.deepEqual(sample(pack,'your-house').tokens.filter(t=>t.role==='subject').map(t=>t.surface),[r['pronoun.you-singular'],m['grammar.possession'],r['noun.house']]);
  assert.equal(sample(pack,'your-house').explanation.possession,true);
  assert.equal(sample(pack,'your-house').tokens.find(t=>t.role==='verb').markerId,'grammar.copula');
  assert.deepEqual(sample(pack,'sun-above').tokens.filter(t=>t.role==='complement').map(t=>t.surface),[m['grammar.above'],r['noun.mountain']]);
  assert.equal(sample(pack,'sun-above').explanation.locativeRelation,'above');
  assert.equal(sample(pack,'sun-above').explanation.copula,true);
});
test('linker repairs illegal boundary or exact collision; root/marker never change',()=>{
  const pack=generateLanguagePackage(recipe(1));const args={root:'tar',semanticId:'noun.child',markerId:'grammar.plural',phonology:pack.config.rules,linkingVowel:'i'};
  const repaired=deriveSuffix({...args,marker:'tra'});assert.equal(repaired.surface,'taritra');assert.deepEqual(repaired.analysis.map(a=>a.type),['root','linker','marker']);assert.ok(validateWord(repaired.surface,args.phonology).valid);
  assert.equal(deriveSuffix({...args,marker:'na'}).surface,'tarna');
  assert.equal(deriveSuffix({...args,marker:'na',blocked:['tarna']}).surface,'tarina');
  assert.equal(deriveSuffix({...args,marker:'na',blocked:['TARNA']}).surface,'tarina');
  assert.throws(()=>deriveSuffix({...args,marker:'na',blocked:['tarna','tarina']}),e=>e.code==='MORPHOLOGY_INVALID');
  assert.throws(()=>deriveSuffix({...args,root:'ka',marker:'ti',blocked:['kati']}),e=>e.code==='MORPHOLOGY_INVALID');
  assert.throws(()=>deriveSuffix({...args,marker:'na',linkingVowel:'z'}),e=>e.code==='MORPHOLOGY_INVALID');
});
test('marker candidates retry collisions/invalid forms with 64 total attempts and controlled exhaustion',()=>{
  const base=generateLanguage(recipe());let attempts=0;
  assert.throws(()=>allocateMarkers(base,{candidate:()=>{attempts++;return {word:'zzz'};}}),e=>e.code==='GRAMMAR_MARKER_EXHAUSTED'&&e.details.attempts===64);assert.equal(attempts,64);
  attempts=0;assert.throws(()=>allocateMarkers(base,{candidate:()=>{attempts++;return {word:base.language.canonicalName};}}),e=>e.code==='GRAMMAR_MARKER_EXHAUSTED');assert.equal(attempts,64);
  const before=structuredClone(base);
  const actual=allocateMarkers(base);assert.deepEqual(base,before);assert.deepEqual(allocateMarkers(base),actual);
  const suffixBase=generateLanguage(recipe(0,{morphologyStrategy:'suffix'}));let calls=0;
  // Initial V-only candidate is legal alone but cannot suffix a vowel-final root.
  const retried=allocateMarkers(suffixBase,{candidate:options=>{
    calls++;if(calls===1)return {word:'a',syllables:['a']};
    // Afterwards use the unmodified namespace's normal candidate generator.
    return candidate(options);
  }});
  assert.notEqual(retried.markers['grammar.plural'],'a');
});
import { wordCandidate as candidate } from '../src/language-forge/engine/v1/word.js';
test('future final-lexicon seam revalidates edits and grammar without regenerating roots',()=>{
  const base=generateLanguage(recipe());validateFinalLexicon(base);
  const duplicate=structuredClone(base);duplicate.language.lexicon[1].word=duplicate.language.lexicon[0].word;assert.throws(()=>validateFinalLexicon(duplicate),e=>e.code==='LEXICON_INVALID');
  const malformed=structuredClone(base);malformed.language.lexicon[0].word='BAD';assert.throws(()=>generateGrammar(malformed,'g1'),e=>e.code==='LEXICON_INVALID');
  const reorder=structuredClone(base);reorder.language.lexicon.reverse();assert.throws(()=>validateFinalLexicon(reorder),e=>e.code==='LEXICON_INVALID');
  const patched=structuredClone(base);patched.language.lexicon[0].word='mayori';validateFinalLexicon(patched);
  const grammar=generateGrammar(patched,'g1');assert.equal(grammar.examples[0].tokens[0].surface,'mayori');assert.equal(patched.language.lexicon[0].word,'mayori');
});
test('invalid ASTs, unsupported valency and modifiers produce controlled realization errors',()=>{
  const pack=generateLanguagePackage(recipe());
  const cases=[null,{...frame('see-moon').ast,mood:'unknown'},{...frame('see-moon').ast,object:null},{...frame('past-go').ast,object:frame('see-moon').ast.object},{...frame('see-moon').ast,predicate:{type:'verb',semanticId:'verb.missing',tense:'present',negated:false}},{...frame('your-house').ast,predicate:{type:'copula',tense:'past'}},{...frame('see-moon').ast,subject:{...frame('see-moon').ast.subject,semanticId:'noun.missing'}}];
  for(const ast of cases)assert.throws(()=>realizeSentence(ast,pack,pack.grammar),e=>e.code==='SENTENCE_REALIZATION_FAILED');
});
test('TR/EN presentation changes explanations only, no marker/token/surface or mutation',()=>{
  const tr=generateLanguagePackage({...recipe(),locale:'tr'}),en=generateLanguagePackage({...recipe(),locale:'en'});assert.deepEqual(tr,en);
  const before=structuredClone(tr);
  for(const e of tr.grammar.examples){const a=presentSentence(e,'tr'),b=presentSentence(e,'en');assert.notEqual(a.meaning,b.meaning);assert.notDeepEqual(a.explanation,b.explanation);}
  assert.deepEqual(tr,before);
});
test('all four g1 goldens lock markers, resolved config, linker, 12 surfaces and complete analysis',()=>{
  for(const f of goldens){const actual=generateLanguagePackage(f.input);assert.deepEqual(actual.grammar,f.grammar);assert.deepEqual(generateLanguagePackage(f.input),actual);}
});
