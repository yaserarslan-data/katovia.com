import { createStream } from './random.js';
import { generateWord } from './word.js';
export function generateLanguageName(recipe,lexicon,reserved=[]) {
  const {word}=generateWord({phonology:recipe.config.rules,lengthProfile:'balanced',stream:createStream(recipe.seed,recipe.engineVersion,recipe.datasetVersion,'language-name'),constraints:{used:lexicon.map(x=>x.word),reserved,maxLength:12},slotId:'language-name'});
  return {canonicalName:word,displayName:word[0].toUpperCase()+word.slice(1)};
}
