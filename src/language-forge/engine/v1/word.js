import { lengthRanges } from '../../model.js';
import { weighted, bounded } from './random.js';
import { validateWord } from './phonology.js';
export const maxAttempts=64;
export class GenerationError extends Error {
  constructor(slotId){super(`No valid unique word for ${slotId} after ${maxAttempts} candidates`);this.name='GenerationError';this.code='WORD_EXHAUSTED';this.slotId=slotId;this.attempts=maxAttempts;}
}
export function normalizeWord(word) {
  if(typeof word!=='string'||!/^[a-zA-Z]+$/.test(word))throw new TypeError('ASCII word');
  return word.toLowerCase();
}
// One candidate only; generateWord owns the single 64-candidate slot budget.
export function wordCandidate({phonology,lengthProfile,stream}) {
  const range=lengthRanges[lengthProfile];if(!range)throw new TypeError('length profile');
  const index=['short','balanced','long'].indexOf(lengthProfile);
  const count=weighted(stream,range.map((value,i)=>({value,weight:phonology.lengthWeights[index][i]}))).value;
  const chooseSegment=kind=>weighted(stream,phonology.segments.filter(s=>kind==='V'?s.class==='vowel':kind==='coda'?s.coda:s.onset)).grapheme;
  const syllables=[];
  for(let i=0;i<count;i++) {
    const pattern=weighted(stream,phonology.templates.filter(t=>t.pattern!=='V'||!phonology.initialVOnly||i===0)).pattern;
    let onset='';
    if(pattern.startsWith('CC'))onset=phonology.clusters[bounded(stream,phonology.clusters.length)];
    else if(pattern.startsWith('C'))onset=chooseSegment('onset');
    syllables.push(onset+chooseSegment('V')+(pattern.endsWith('C')?chooseSegment('coda'):''));
  }
  return {word:syllables.join(''),syllables};
}
export function generateWord({phonology,lengthProfile,stream,constraints={},slotId='word',candidate=wordCandidate}) {
  const blocked=new Set([...(constraints.used??[]),...(constraints.reserved??[])].map(normalizeWord));
  const [min,max]=lengthRanges[lengthProfile]??[];
  if(!min)throw new TypeError('length profile');
  for(let attempt=1;attempt<=maxAttempts;attempt++) {
    const value=candidate({phonology,lengthProfile,stream});
    const result=validateWord(value.word,phonology);
    // Vowel count is unambiguous for these single-vowel templates.
    if(result.valid&&result.syllables.length>=min&&result.syllables.length<=max&&!blocked.has(value.word)&&value.word.length<=(constraints.maxLength??24)&&(!value.syllables||value.syllables.every((s,i)=>!i||s!==value.syllables[i-1])))return {word:value.word,attempts:attempt};
  }
  throw new GenerationError(slotId);
}
