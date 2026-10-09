// Pure reusable validator; future strict/advisory editing policy stays outside it.
export function validateWord(word, phonology) {
  const fail=reason=>({valid:false,reason,syllables:[]});
  if(typeof word!=='string'||!/^[a-z]{1,24}$/.test(word))return fail('ascii-lowercase-or-length');
  const vowels=new Set(phonology.segments.filter(s=>s.class==='vowel').map(s=>s.grapheme));
  const consonants=new Set(phonology.segments.filter(s=>s.class==='consonant').map(s=>s.grapheme));
  let run=0;
  for(let i=0;i<word.length;i++) {
    const c=word[i];
    if(!vowels.has(c)&&!consonants.has(c))return fail('segment');
    if(i&&c===word[i-1])return fail('adjacent-phoneme');
    run=consonants.has(c)?run+1:0;
    if(run>phonology.maxConsonants)return fail('consonant-run');
  }
  if(phonology.forbiddenSequences.some(s=>word.includes(s)))return fail('forbidden-sequence');
  const memo=new Set();
  function parse(offset,previous) {
    if(offset===word.length)return [];
    const key=`${offset}:${previous}`;if(memo.has(key))return null;
    for(const {pattern} of phonology.templates) {
      if(pattern==='V'&&phonology.initialVOnly&&offset!==0)continue;
      const syllable=word.slice(offset,offset+pattern.length);
      if(syllable.length!==pattern.length||syllable===previous)continue;
      if([...pattern].some((kind,i)=>!(kind==='V'?vowels:consonants).has(syllable[i])))continue;
      const onset=syllable.slice(0,pattern.indexOf('V'));
      if(onset.length===2&&!phonology.clusters.includes(onset))continue;
      if([...onset].some(c=>!phonology.segments.find(s=>s.grapheme===c)?.onset))continue;
      if(pattern.endsWith('C')&&!phonology.segments.find(s=>s.grapheme===syllable.at(-1))?.coda)continue;
      const rest=parse(offset+pattern.length,syllable);
      if(rest)return [syllable,...rest];
    }
    memo.add(key);return null;
  }
  const syllables=parse(0,'');
  return syllables?{valid:true,reason:null,syllables}:fail('syllable-or-boundary');
}
