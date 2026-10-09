import { concepts,allocationOrder } from '../../../data/concepts.js';
import { grammarVersion,sentenceFrames } from '../../../data/grammar.js';
import { resolveRecipe } from '../../../model.js';
import { generateLanguage } from '../../v1/generate-language.js';
import { validateWord } from '../../v1/phonology.js';
import { allocateMarkers } from './markers.js';
import { realizeSentence } from './sentence.js';
import { GrammarError } from './errors.js';
// Public pure revalidation seam for a future patched final lexicon.
export function validateFinalLexicon(base) {
  resolveRecipe(base);
  const entries=base.language?.lexicon;
  if(!Array.isArray(entries)||entries.length!==concepts.length)throw new GrammarError('LEXICON_INVALID');
  const used=new Set();
  for(let i=0;i<entries.length;i++) {
    const {semanticId,word}=entries[i]??{};
    if(semanticId!==allocationOrder[i]||!validateWord(word,base.config.rules).valid||used.has(word))throw new GrammarError('LEXICON_INVALID',{semanticId});
    used.add(word);
  }
  if(!validateWord(base.language.canonicalName,base.config.rules).valid||used.has(base.language.canonicalName))throw new GrammarError('LEXICON_INVALID',{detail:'name'});
}
export function generateGrammar(base,version) {
  if(version!==grammarVersion)throw new GrammarError('GRAMMAR_VERSION_UNSUPPORTED',{version});
  validateFinalLexicon(base);
  const grammar={version,config:{...base.config.grammar},...allocateMarkers(base)};
  grammar.examples=sentenceFrames.map(frame=>({id:frame.id,...realizeSentence(frame.ast,base,grammar)}));
  return grammar;
}
export function generateLanguagePackage(input) {
  if(input?.grammarVersion!==grammarVersion)throw new GrammarError('GRAMMAR_VERSION_UNSUPPORTED',{version:input?.grammarVersion});
  const base=generateLanguage(input);
  return {...base,grammarVersion,grammar:generateGrammar(base,grammarVersion)};
}
