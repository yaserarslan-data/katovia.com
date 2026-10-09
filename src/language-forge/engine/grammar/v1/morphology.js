import { validateWord } from '../../v1/phonology.js';
import { GrammarError } from './errors.js';
import { normalizeWord } from '../../v1/word.js';
export function deriveSuffix({root,semanticId,marker,markerId,phonology,linkingVowel,blocked=[]}) {
  if(!validateWord(root,phonology).valid||!validateWord(marker,phonology).valid||!phonology.segments.some(s=>s.class==='vowel'&&s.grapheme===linkingVowel))throw new GrammarError('MORPHOLOGY_INVALID',{semanticId,markerId});
  const reserved=new Set(blocked.map(normalizeWord));
  for(const linker of ['',linkingVowel]) {
    const surface=root+linker+marker;
    if(validateWord(surface,phonology).valid&&!reserved.has(surface))return {surface,analysis:[{type:'root',semanticId,surface:root},...(linker?[{type:'linker',surface:linker}]:[]),{type:'marker',markerId,surface:marker}]};
  }
  throw new GrammarError('MORPHOLOGY_INVALID',{semanticId,markerId,root,marker});
}
