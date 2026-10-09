import { concepts } from '../../../data/concepts.js';
import { markerOrder } from '../../../data/grammar.js';
import { createStream,weighted } from '../../v1/random.js';
import { wordCandidate,maxAttempts } from '../../v1/word.js';
import { validateWord } from '../../v1/phonology.js';
import { deriveSuffix } from './morphology.js';
import { GrammarError } from './errors.js';
export function allocateMarkers(base,{candidate=wordCandidate,streamFor=id=>createStream(base.seed,base.engineVersion,base.datasetVersion,`grammar:g1:${id}`)}={}) {
  const phonology=base.config.rules;
  const linkingVowel=weighted(streamFor('linking-vowel'),phonology.segments.filter(s=>s.class==='vowel')).grapheme;
  const blocked=new Set([...base.language.lexicon.map(x=>x.word),base.language.canonicalName]);
  const markers={};
  for(const markerId of markerOrder) {
    const stream=streamFor(markerId);
    const targets=base.language.lexicon.filter(x=>{
      const pos=concepts.find(c=>c.semanticId===x.semanticId).partOfSpeech;
      return markerId==='grammar.plural'?pos==='noun':['grammar.past','grammar.future'].includes(markerId)&&pos==='verb';
    });
    let accepted=false;
    for(let attempt=1;attempt<=maxAttempts;attempt++) {
      const {word,syllables}=candidate({phonology,lengthProfile:'short',stream});
      const v=validateWord(word,phonology);
      if(!v.valid||v.syllables.length>2||blocked.has(word)||(syllables&&syllables.some((s,i)=>i&&s===syllables[i-1])))continue;
      const forms=[];
      if(base.config.grammar.morphologyStrategy==='suffix'&&targets.length) {
        try {
          for(const target of targets)forms.push(deriveSuffix({root:target.word,semanticId:target.semanticId,marker:word,markerId,phonology,linkingVowel,blocked:[...blocked,word]}));
        } catch(error) {if(error.code==='MORPHOLOGY_INVALID')continue;throw error;}
      }
      // A later marker must not collide with an earlier derived form either.
      markers[markerId]=word;blocked.add(word);forms.forEach(f=>blocked.add(f.surface));accepted=true;break;
    }
    if(!accepted)throw new GrammarError('GRAMMAR_MARKER_EXHAUSTED',{markerId,attempts:maxAttempts});
  }
  return {markers,linkingVowel};
}
