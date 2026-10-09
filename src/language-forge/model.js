import { presets, freeze } from './data/presets.js';
import { canonicalSeed } from './engine/v1/seed.js';
export const engineVersion='e1';
export const datasetVersion='d1';
export const lengthRanges=freeze({short:[1,2],balanced:[2,3],long:[3,4]});
// Structural equality: caller property insertion order is not part of the ABI.
function matchesContract(expected,actual) {
  if(expected===null||typeof expected!=='object')return expected===actual;
  if(!actual||typeof actual!=='object'||Array.isArray(expected)!==Array.isArray(actual))return false;
  const keys=Object.keys(expected);
  return keys.length===Object.keys(actual).length&&keys.every(key=>Object.hasOwn(actual,key)&&matchesContract(expected[key],actual[key]));
}
export function resolveRecipe(input) {
  if(!input||input.engineVersion!==engineVersion||input.datasetVersion!==datasetVersion) throw new TypeError('unsupported engine/dataset version');
  const preset=presets.find(p=>p.id===input.config?.preset);
  const wordLength=input.config?.wordLength;
  if(!preset||!Object.hasOwn(lengthRanges,wordLength)) throw new TypeError('preset/wordLength');
  const grammar={};
  for(const [field,allowed] of [['wordOrder',['SVO','SOV','VSO']],['adjectivePosition',['before','after']],['morphologyStrategy',['particle','suffix']]]) {
    grammar[field]=input.config.grammar?.[field]??preset.grammar[field];
    if(!allowed.includes(grammar[field]))throw new TypeError(`grammar.${field}`);
  }
  const edits=input.edits??{version:1,patches:[]};
  if(edits.version!==1||!Array.isArray(edits.patches)||edits.patches.length)throw new TypeError('edit patches not supported in e1 Phase 1');
  const rules=resolveRules(preset);
  if(input.config.rules!==undefined&&!matchesContract(rules,input.config.rules))throw new TypeError('unsupported resolved rules');
  return freeze({engineVersion,datasetVersion,seed:canonicalSeed(input.seed),config:{preset:preset.id,wordLength,grammar,rules},edits:{version:1,patches:[]}});
}
export function resolveRules(preset) {
  return {segments:preset.segments.map(s=>({...s})),templates:preset.templates.map(t=>({...t})),clusters:[...preset.clusters],forbiddenSequences:[...preset.forbiddenSequences],stress:preset.stress,maxConsonants:2,initialVOnly:true,lengthWeights:preset.lengths.map(x=>[...x])};
}
