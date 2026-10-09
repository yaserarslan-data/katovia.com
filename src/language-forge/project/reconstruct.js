import {concepts} from '../data/concepts.js';
import {markerOrder,sentenceFrames} from '../data/grammar.js';
import {resolveRecipe} from '../model.js';
import {generateLanguage} from '../engine/v1/generate-language.js';
import {createStream,weighted} from '../engine/v1/random.js';
import {wordCandidate} from '../engine/v1/word.js';
import {validateWord} from '../engine/v1/phonology.js';
import {deriveSuffix} from '../engine/grammar/v1/morphology.js';
import {realizeSentence} from '../engine/grammar/v1/sentence.js';
import {validateProject,normalizeRoot,patchProject,ProjectError} from './model.js';
// Advisory roots are opaque, but newly introduced boundary violations are not.
export function projectSuffix(args){
 if(validateWord(args.root,args.phonology).valid)return deriveSuffix({...args,blocked:args.blocked.filter(word=>/^[A-Za-z]+$/.test(word))});
 const vowels=new Set(args.phonology.segments.filter(s=>s.class==='vowel').map(s=>s.grapheme));
 for(const linker of ['',args.linkingVowel]){
  const surface=args.root+linker+args.marker,edge=args.root.slice(-2)+linker+args.marker.slice(0,2);
  if(args.blocked.includes(surface))continue;
  if(args.root.at(-1)===(linker||args.marker[0]))continue;
  if(vowels.has(args.root.at(-1))&&vowels.has((linker||args.marker)[0]))continue;
  let run=0,bad=false;for(const c of edge){run=vowels.has(c)?0:run+1;if(run>2)bad=true;}
  if(bad||args.phonology.forbiddenSequences.some(s=>edge.includes(s)))continue;
  return {surface,analysis:[{type:'root',semanticId:args.semanticId,surface:args.root},...(linker?[{type:'linker',surface:linker}]:[]),{type:'marker',markerId:args.markerId,surface:args.marker}]};
 }
 throw new ProjectError('MORPHOLOGY_INVALID');
}
function grammarFor(base){
 const phonology=base.config.rules,stream=id=>createStream(base.seed,'e1','d1',`grammar:g1:${id}`);
 const linkingVowel=weighted(stream('linking-vowel'),phonology.segments.filter(s=>s.class==='vowel')).grapheme;
 const blocked=new Set([...base.language.lexicon.map(x=>x.word),base.language.canonicalName]);const markers={};
 for(const markerId of markerOrder){let accepted=false;const random=stream(markerId);const targets=base.language.lexicon.filter(x=>{const pos=concepts.find(c=>c.semanticId===x.semanticId).partOfSpeech;return markerId==='grammar.plural'?pos==='noun':['grammar.past','grammar.future'].includes(markerId)&&pos==='verb';});
  for(let attempt=0;attempt<64;attempt++){
   const candidate=wordCandidate({phonology,lengthProfile:'short',stream:random});const word=candidate.word,v=validateWord(word,phonology);
   if(!v.valid||v.syllables.length>2||blocked.has(word)||candidate.syllables.some((s,i)=>i&&s===candidate.syllables[i-1]))continue;
   const forms=[];
   if(base.config.grammar.morphologyStrategy==='suffix'){try{for(const target of targets)forms.push(projectSuffix({root:target.word,semanticId:target.semanticId,marker:word,markerId,phonology,linkingVowel,blocked:[...blocked,word]}));}catch(error){if(error.code==='MORPHOLOGY_INVALID')continue;throw error;}}
   markers[markerId]=word;blocked.add(word);forms.forEach(f=>blocked.add(f.surface));accepted=true;break;
  }
  if(!accepted)throw new ProjectError('GRAMMAR_MARKER_EXHAUSTED');
 }
 const grammar={version:'g1',config:{...base.config.grammar},markers,linkingVowel};
 grammar.examples=sentenceFrames.map(frame=>{
  const example=realizeSentence(frame.ast,base,{...grammar,config:{...grammar.config,morphologyStrategy:'particle'}});
  if(grammar.config.morphologyStrategy==='suffix'){
   const tokens=[];for(let i=0;i<example.tokens.length;i++){const t=example.tokens[i];if(['grammar.plural','grammar.past','grammar.future'].includes(t.markerId)){
     const root=example.tokens[++i];const form=projectSuffix({root:root.surface,semanticId:root.semanticId,marker:t.surface,markerId:t.markerId,phonology,linkingVowel,blocked:[...base.language.lexicon.map(x=>x.word),base.language.canonicalName,...Object.values(markers)]});tokens.push({...root,...form});
    }else tokens.push(t);}
   example.tokens=tokens;example.surface=tokens.map(t=>t.surface).join(' ');example.explanation.morphology.forEach(m=>{m.strategy='suffix';});
  }
  return {id:frame.id,...example};
 });return grammar;
}
export function reconstructProject(value,{base:cached}={}){
 const project=validateProject(value),recipe=resolveRecipe({...project,edits:undefined});
 const same=cached?.seed===project.seed&&cached?.config.preset===project.config.preset&&cached?.config.wordLength===project.config.wordLength;
 const base=same?{...cached,config:recipe.config}:generateLanguage(recipe);
 const lexicon=base.language.lexicon.map(x=>({...x}));const words=new Map(project.edits.words.map(p=>[p.semanticId,p.value]));
 for(const entry of lexicon)if(words.has(entry.semanticId))entry.word=words.get(entry.semanticId);
 if(new Set(lexicon.map(x=>x.word)).size!==64)throw new ProjectError('WORD_DUPLICATE');
 const name=project.edits.languageName,canonicalName=name?name.toLowerCase():base.language.canonicalName;
 if(lexicon.some(x=>x.word===canonicalName))throw new ProjectError('NAME_COLLISION');
 const pack={...base,language:{...base.language,canonicalName,displayName:name??base.language.displayName,lexicon},grammarVersion:'g1'};
 pack.grammar=grammarFor(pack);return {project,base,package:pack};
}
export function acceptWord(project,semanticId,value,current,options={}){
 const word=normalizeRoot(value);if(Object.values(current.grammar.markers).includes(word))throw new ProjectError('MARKER_COLLISION');
 return reconstructProject(patchProject(project,{semanticId,value:word,...options}),{base:options.base});
}
export function rerollProject(project,semanticId,current,options={}){
 const clean=validateProject(project),counter=(clean.edits.words.find(p=>p.semanticId===semanticId)?.rerollCounter??0)+1;
 if(counter>1000000)throw new ProjectError('REROLL_EXHAUSTED');
 const stream=createStream(clean.seed,'e1','d1',`reroll:${semanticId}:${counter}`);
 const blocked=[...current.language.lexicon.map(x=>x.word),...Object.values(current.grammar.markers),current.language.canonicalName];
 for(let attempt=0;attempt<64;attempt++){
  const candidate=wordCandidate({phonology:current.config.rules,lengthProfile:clean.config.wordLength,stream});const v=validateWord(candidate.word,current.config.rules);
  if(!v.valid||blocked.includes(candidate.word)||candidate.syllables.some((s,i)=>i&&s===candidate.syllables[i-1]))continue;
  try{return acceptWord(clean,semanticId,candidate.word,current,{source:'rerolled',rerollCounter:counter,base:options.base});}catch(error){if(!['GRAMMAR_MARKER_EXHAUSTED','MORPHOLOGY_INVALID','NAME_COLLISION'].includes(error.code))throw error;}
 }
 throw new ProjectError('REROLL_EXHAUSTED');
}
