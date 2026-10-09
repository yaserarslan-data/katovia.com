import {validateProject,maxBytes,ProjectError} from './model.js';
import {reconstructProject} from './reconstruct.js';
export const cleanUrl='https://katovia.com/create/language-forge/',urlBudget=1900;
const encoder=new TextEncoder();
export function exportProject(value){const text=JSON.stringify(validateProject(value),null,2);if(encoder.encode(text).length>maxBytes)throw new ProjectError('PROJECT_TOO_LARGE');return text;}
export function importProject(text){if(typeof text!=='string'||encoder.encode(text).length>maxBytes)throw new ProjectError('PROJECT_TOO_LARGE');let value;try{value=JSON.parse(text);}catch{throw new ProjectError('PROJECT_INVALID');}return reconstructProject(validateProject(value));}
export function shareProject(value){const p=validateProject(value);const tuple=[1,p.engineVersion,p.datasetVersion,p.grammarVersion,p.seed,p.config.preset,p.config.wordLength,[p.config.grammar.wordOrder,p.config.grammar.adjectivePosition,p.config.grammar.morphologyStrategy],p.edits.languageName,p.edits.words.map(x=>[x.semanticId,x.value,x.source,x.rerollCounter])];
 const bytes=encoder.encode(JSON.stringify(tuple));const payload=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const url=cleanUrl+'#lf1.'+payload;return {url,used:url.length,available:url.length<=urlBudget};}
export function decodeShare(fragment){if(typeof fragment!=='string'||!fragment.startsWith('#lf1.')||cleanUrl.length+fragment.length>urlBudget)throw new ProjectError('SHARE_INVALID');const payload=fragment.slice(5);if(!/^[A-Za-z0-9_-]+$/.test(payload))throw new ProjectError('SHARE_INVALID');let tuple;try{const raw=atob(payload.replace(/-/g,'+').replace(/_/g,'/'));tuple=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0))));}catch{throw new ProjectError('SHARE_INVALID');}
 if(!Array.isArray(tuple)||tuple.length!==10||tuple[0]!==1||!Array.isArray(tuple[7])||tuple[7].length!==3||!Array.isArray(tuple[9])||tuple[9].some(x=>!Array.isArray(x)||x.length!==4))throw new ProjectError('SHARE_INVALID');
 const [version,engineVersion,datasetVersion,grammarVersion,seed,preset,wordLength,g,languageName,words]=tuple;
 const project={format:'katovia-language-forge',version,engineVersion,datasetVersion,grammarVersion,seed,config:{preset,wordLength,grammar:{wordOrder:g[0],adjectivePosition:g[1],morphologyStrategy:g[2]}},edits:{languageName,words:words.map(([semanticId,value,source,rerollCounter])=>({semanticId,value,source,rerollCounter}))}};
 const result=reconstructProject(project);if(shareProject(result.project).url!==cleanUrl+fragment)throw new ProjectError('SHARE_INVALID');return result;
}
