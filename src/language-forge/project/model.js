import {concepts,allocationOrder} from '../data/concepts.js';
import {resolveRecipe} from '../model.js';
export const format='katovia-language-forge',projectVersion=1,maxBytes=16384;
export class ProjectError extends Error{constructor(code){super(code);this.name='ProjectError';this.code=code;}}
const fail=code=>{throw new ProjectError(code);};
function keys(value,expected){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==expected.length||expected.some(k=>!Object.hasOwn(value,k)))fail('PROJECT_INVALID');}
export function normalizeRoot(value){if(typeof value!=='string')fail('WORD_INVALID');const word=value.normalize('NFKC').trim().toLowerCase();if(!/^[\p{L}]+$/u.test(word)||word.length>24)fail('WORD_INVALID');return word;}
export function normalizeName(value){if(typeof value!=='string')fail('NAME_INVALID');const name=value.normalize('NFKC').trim().replace(/\s+/g,' ');if(!name||name.length>40||! /^[\p{L}\p{N} '\-]+$/u.test(name))fail('NAME_INVALID');return name;}
export function validateProject(value){
 keys(value,['format','version','engineVersion','datasetVersion','grammarVersion','seed','config','edits']);
 if(value.format!==format||value.version!==1||value.engineVersion!=='e1'||value.datasetVersion!=='d1'||value.grammarVersion!=='g1')fail('VERSION_UNSUPPORTED');
 keys(value.config,['preset','wordLength','grammar']);keys(value.config.grammar,['wordOrder','adjectivePosition','morphologyStrategy']);keys(value.edits,['languageName','words']);
 let recipe;try{recipe=resolveRecipe({...value,edits:undefined});}catch{fail('PROJECT_INVALID');}
 const name=value.edits.languageName===null?null:normalizeName(value.edits.languageName);
 if(!Array.isArray(value.edits.words)||value.edits.words.length>64)fail('PROJECT_INVALID');
 const patches=new Map();
 for(const patch of value.edits.words){keys(patch,['semanticId','value','source','rerollCounter']);if(!allocationOrder.includes(patch.semanticId)||patches.has(patch.semanticId)||!['manual','rerolled'].includes(patch.source)||!Number.isInteger(patch.rerollCounter)||patch.rerollCounter<0||patch.rerollCounter>1000000||patch.source==='rerolled'&&patch.rerollCounter<1)fail('PATCH_INVALID');patches.set(patch.semanticId,{semanticId:patch.semanticId,value:normalizeRoot(patch.value),source:patch.source,rerollCounter:patch.rerollCounter});}
 return {format,version:1,engineVersion:'e1',datasetVersion:'d1',grammarVersion:'g1',seed:recipe.seed,config:{preset:recipe.config.preset,wordLength:recipe.config.wordLength,grammar:{...recipe.config.grammar}},edits:{languageName:name,words:allocationOrder.filter(id=>patches.has(id)).map(id=>patches.get(id))}};
}
export function projectFromPackage(pack){return validateProject({format,version:1,engineVersion:pack.engineVersion,datasetVersion:pack.datasetVersion,grammarVersion:'g1',seed:pack.seed,config:{preset:pack.config.preset,wordLength:pack.config.wordLength,grammar:pack.config.grammar},edits:{languageName:null,words:[]}});}
export function patchProject(project,{semanticId,value,source='manual',rerollCounter}){const clean=validateProject(project);if(!concepts.some(c=>c.semanticId===semanticId))fail('PATCH_INVALID');const existing=clean.edits.words.find(p=>p.semanticId===semanticId);clean.edits.words=clean.edits.words.filter(p=>p.semanticId!==semanticId);clean.edits.words.push({semanticId,value,source,rerollCounter:rerollCounter??existing?.rerollCounter??0});return validateProject(clean);}
