import { allocationOrder } from '../../data/concepts.js';
import { createStream } from './random.js';
import { generateWord,normalizeWord } from './word.js';
export function allocateLexicon(recipe,{reserved=[],streamFor=id=>createStream(recipe.seed,recipe.engineVersion,recipe.datasetVersion,`concept:${id}`),generate=generateWord}={}) {
  const used=new Set(reserved.map(normalizeWord));
  return allocationOrder.map(semanticId=>{
    const {word}=generate({phonology:recipe.config.rules,lengthProfile:recipe.config.wordLength,stream:streamFor(semanticId),constraints:{used},slotId:semanticId});
    used.add(word);return {semanticId,word};
  });
}
