import { i18n } from '../../i18n/index.js';
import { concepts } from '../data/concepts.js';
import { markerOrder } from '../data/grammar.js';
import { generateLanguagePackage } from '../engine/grammar/v1/generate-grammar.js';
import { presentSentence } from '../presentation/grammar.js';
import { setupState,choosePreset,createSeed,generationInput,dictionaryRows,punctuate } from './model.js';
import './style.css';
import {projectFromPackage,normalizeRoot,normalizeName,ProjectError} from '../project/model.js';
import {reconstructProject,acceptWord,rerollProject} from '../project/reconstruct.js';
import {projectStorage} from '../project/storage.js';
import {exportProject,importProject,shareProject,decodeShare} from '../project/codec.js';
import {validateWord} from '../engine/v1/phonology.js';
import {shareText} from '../../core/share.js';
const sessions=new WeakMap();
const quickIds=['noun.water','noun.fire','noun.moon','noun.sun','verb.see','verb.love'];
export function mount(root,{generate=generateLanguagePackage,seedFactory=createSeed}={}) {
  let state=sessions.get(root)||setupState(),dead=false,statusKey='';
  const store=projectStorage();let saved=null,pending=null,confirmKey='',editor=null,editorDraft='',editorWarning=false,editorError='',storageFailed=false;
  state.receiver??=false;state.invalidShare??=false;
  const removers=[],get=name=>root.querySelector(`[data-forge-${name}]`);
  const label=(id,params)=>i18n.t(`forge.${id}`,params);
  const listen=(node,event,fn)=>{node.addEventListener(event,fn);removers.push(()=>node.removeEventListener(event,fn));};
  const element=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
  const meaning=id=>concepts.find(c=>c.semanticId===id)?.labels[i18n.locale]||label(id.replace('grammar.',''));
  function status(key){statusKey=key;get('status').textContent=key?label(key):'';}
  function persist(){storageFailed=!store.save(state.project);get('storage-warning').hidden=!storageFailed;get('storage-warning').textContent=storageFailed?label('saveWarning'):'';}
  function removeFragment(){history.replaceState(null,'',location.pathname+location.search);}
  function activate(result,receiver=false){if(!receiver)state.localSession=result;state.project=result.project;state.base=result.base;state.generatedPackage=result.package;state.receiver=receiver;state.invalidShare=false;state.status='generated';state.selectedPreset=result.project.config.preset;state.wordLength=result.project.config.wordLength;state.grammarConfig={...result.project.config.grammar};state.grammarCustomized=true;saved=null;editor=null;get('link-area').hidden=true;get('link').value='';get('sentences').replaceChildren();if(!receiver)persist();controls();results();}
  function ask(key,action){pending=action;confirmKey=key;get('confirm-text').textContent=label(key);get('confirm').hidden=false;get('confirm-yes').focus();get('confirm').scrollIntoView({block:'center'});}
  function error(error){status(({WORD_INVALID:'wordInvalid',NAME_INVALID:'nameInvalid',WORD_DUPLICATE:'duplicate',MARKER_COLLISION:'markerCollision',NAME_COLLISION:'nameCollision'})[error.code]||'editFailed');}
  function controls(){
    root.querySelectorAll('[name="forge-preset"]').forEach(n=>{n.checked=n.value===state.selectedPreset;});
    root.querySelectorAll('[name="forge-length"]').forEach(n=>{n.checked=n.value===state.wordLength;});
    for(const [name,key] of [['order','wordOrder'],['adjective','adjectivePosition'],['morphology','morphologyStrategy']])get(name).value=state.grammarConfig[key];
    get('search').value=state.search;get('filter').value=state.activeDictionaryFilter;
    get('submit').querySelector('span').textContent=label(state.generatedPackage?'regenerate':'forge');
    get('policy').hidden=!state.generatedPackage;
    get('form').hidden=state.status==='generated'||Boolean(saved)||state.receiver||state.invalidShare;get('result').hidden=state.status!=='generated';
    get('restore').hidden=!saved;get('invalid').hidden=!state.invalidShare;get('receiver').hidden=!state.receiver;get('copy-project').hidden=!state.receiver;
    for(const name of ['rename','change','new'])get(name).hidden=state.receiver;
    get('import-area').hidden=state.receiver;get('storage-warning').hidden=!storageFailed||state.receiver;get('storage-warning').textContent=storageFailed?label('saveWarning'):'';
    if(confirmKey)get('confirm-text').textContent=label(confirmKey);
    status(statusKey);
  }
  function dictionary(){
    if(!state.generatedPackage)return;
    const rows=dictionaryRows(state.generatedPackage,state.search,state.activeDictionaryFilter);
    const host=get('dictionary');host.replaceChildren();
    for(const row of rows){const pair=element('div');pair.dataset.forgeEntry=row.semanticId;pair.append(element('dt',row.labels[i18n.locale]),element('dd',row.word));
      if(!state.receiver){const actions=element('details',undefined,'forge-word-actions'),summary=element('summary','⋯');summary.setAttribute('aria-label',label('actions',{word:row.labels[i18n.locale]}));actions.append(summary);for(const type of ['edit','reroll']){const b=element('button',label(type));b.type='button';b.dataset.forgeWordAction=type;b.dataset.semanticId=row.semanticId;b.setAttribute('aria-label',label(type==='edit'?'editLabel':'rerollLabel',{word:row.labels[i18n.locale]}));actions.append(b);}pair.append(actions);if(editor===row.semanticId)pair.append(editorForm());}
      host.append(pair);}
    get('empty').hidden=rows.length>0;get('count').textContent=label('count',{shown:rows.length,total:64});
  }
  function results(){
    const pack=state.generatedPackage;if(!pack)return;
    get('name').textContent=pack.language.displayName;
    get('name-editor').replaceChildren();if(editor==='name')get('name-editor').append(editorForm());
    get('summary').textContent=`${label(pack.config.preset)} · ${label(pack.config.wordLength)} · ${pack.grammar.config.wordOrder}`;
    get('first').textContent=punctuate(pack.grammar.examples[0]);get('first-meaning').textContent=presentSentence(pack.grammar.examples[0],i18n.locale).meaning;
    const words=new Map(pack.language.lexicon.map(x=>[x.semanticId,x.word]));
    get('quick').replaceChildren(...quickIds.map(id=>{const pair=element('div');pair.append(element('dt',meaning(id)),element('dd',words.get(id)));return pair;}));
    dictionary();
    const grammarHost=get('grammar');grammarHost.replaceChildren();
    const card=(title,value,hint)=>{const host=element('article',undefined,'forge-grammar-card');host.append(element('h4',title),element('p',value,'forge-rule-value'));if(hint)host.append(element('p',hint));grammarHost.append(host);return host;};
    card(label('wordOrder'),label(pack.grammar.config.wordOrder));card(label('adjective'),label(pack.grammar.config.adjectivePosition));
    const suffix=pack.grammar.config.morphologyStrategy==='suffix';
    for(const id of markerOrder){const short=id.slice(8);const hint=short==='plural'?label(suffix?'pluralSuffix':'pluralParticle'):['past','future'].includes(short)?label(suffix?'tenseSuffix':'tenseParticle'):label(short+'Hint');
      const host=card(label(short),pack.grammar.markers[id],hint);
      if(suffix&&['plural','past','future'].includes(short)){
        const example=pack.grammar.examples.find(e=>e.tokens.some(t=>t.analysis.some(a=>a.markerId===id)&&t.semanticId));
        const token=example?.tokens.find(t=>t.semanticId&&t.analysis.some(a=>a.markerId===id));
        if(token){host.append(element('p',`${meaning(token.semanticId)} → ${token.surface}`));host.append(element('p',token.analysis.map(a=>`${a.surface} (${a.type==='root'?label('root'):a.type==='linker'?label('linker'):label(short)})`).join(' + '),'forge-decomposition'));}
      }
    }
    const sentencesHost=get('sentences');
    const expanded=new Set([...sentencesHost.querySelectorAll('details[open]')].map(d=>d.dataset.forgeExplanation));
    sentencesHost.replaceChildren();
    for(const example of pack.grammar.examples){
      const presentation=presentSentence(example,i18n.locale),article=element('article',undefined,'forge-sentence');article.dataset.forgeSentence=example.id;
      article.append(element('h4',presentation.meaning),element('p',punctuate(example),'forge-surface'));
      const details=element('details');details.dataset.forgeExplanation=example.id;details.open=expanded.has(example.id);details.append(element('summary',label('built')));
      const tokens=element('dl',undefined,'forge-token-analysis');
      for(const token of example.tokens){const pair=element('div');pair.append(element('dt',token.surface));const gloss=element('dd');
        for(const part of token.analysis){const value=part.type==='root'?meaning(part.semanticId):part.type==='linker'?label('linker'):meaning(part.markerId);gloss.append(element('span',`${part.surface} → ${value}`));}
        pair.append(gloss);tokens.append(pair);
      }
      details.append(tokens);for(const fact of presentation.explanation)details.append(element('p',fact));article.append(details);sentencesHost.append(article);
    }
    const share=shareProject(state.project);get('share-budget').textContent=share.available?'':label('shareLarge');
  }
  function editorForm(){const form=element('form',undefined,'forge-editor');form.dataset.forgeEditor=editor;
    const field=element('label');field.append(element('span',editor==='name'?label('rename'):meaning(editor)));const input=element('input');input.name='value';input.value=editorDraft;input.maxLength=editor==='name'?40:24;input.required=true;field.append(input);form.append(field);
    const message=element('div');message.id='forge-edit-message';if(editorWarning)message.append(element('p',label(editor==='name'?'nameWarning':'wordWarning')));if(editorError)message.append(element('p',label(editorError)));form.append(message);input.setAttribute('aria-describedby',message.id);if(editorError)input.setAttribute('aria-invalid','true');
    const submit=element('button',label(editorWarning?'override':'apply'),'button');submit.type='submit';submit.dataset.forgeEditApply='';submit.setAttribute('aria-describedby',message.id);const cancel=element('button',label('cancel'),'button');cancel.type='button';cancel.dataset.forgeEditCancel='';form.append(submit,cancel);return form;
  }
  function finishEdit(result,id){activate(result);status('changed');if(id==='name')get('rename').focus({preventScroll:true});else (root.querySelector(`[data-forge-entry="${id}"] summary`)||get('search')).focus({preventScroll:true});}
  listen(root,'input',event=>{if(event.target.closest('[data-forge-editor]')){editorDraft=event.target.value;editorWarning=false;editorError='';}});
  listen(root,'submit',event=>{
    if(!event.target.matches('[data-forge-editor]'))return;event.preventDefault();event.stopPropagation();if(state.receiver)return;const id=editor;
    try{const value=id==='name'?normalizeName(editorDraft):normalizeRoot(editorDraft);
      const candidate=id==='name'?reconstructProject({...state.project,edits:{...state.project.edits,languageName:value}},{base:state.base}):acceptWord(state.project,id,value,state.generatedPackage,{base:state.base});
      if(!editorWarning&&!validateWord(value.toLowerCase(),state.generatedPackage.config.rules).valid){editorDraft=value;editorWarning=true;editorError='';results();root.querySelector('[data-forge-edit-apply]')?.focus({preventScroll:true});return;}
      finishEdit(candidate,id);
    }catch(e){editorError=({WORD_INVALID:'wordInvalid',NAME_INVALID:'nameInvalid',WORD_DUPLICATE:'duplicate',MARKER_COLLISION:'markerCollision',NAME_COLLISION:'nameCollision'})[e.code]||'editFailed';results();root.querySelector('[data-forge-editor] input')?.focus({preventScroll:true});}
  });
  listen(root,'click',event=>{
    const button=event.target.closest('[data-forge-word-action]');if(button&&!state.receiver){const id=button.dataset.semanticId;if(button.dataset.forgeWordAction==='reroll'){try{finishEdit(rerollProject(state.project,id,state.generatedPackage,{base:state.base}),id);}catch(e){error(e);}return;}editor=id;editorDraft=state.generatedPackage.language.lexicon.find(x=>x.semanticId===id).word;editorWarning=false;editorError='';results();root.querySelector('[data-forge-editor] input').focus({preventScroll:true});}
    if(event.target.closest('[data-forge-edit-cancel]')){const id=editor;editor=null;results();if(id==='name')get('rename').focus({preventScroll:true});else root.querySelector(`[data-forge-entry="${id}"] summary`)?.focus({preventScroll:true});}
  });
  listen(get('rename'),'click',()=>{if(state.receiver)return;editor='name';editorDraft=state.generatedPackage.language.displayName;editorWarning=false;editorError='';results();get('name-editor').querySelector('input').focus({preventScroll:true});});
  const showSetup=()=>{if(state.receiver)return;state.status='setup';controls();root.querySelector('[name="forge-preset"]:checked').focus({preventScroll:true});get('form').scrollIntoView({block:'start'});};
  listen(get('form'),'change',event=>{
    if(event.target.name==='forge-preset')choosePreset(state,event.target.value);
    else if(event.target.name==='forge-length')state.wordLength=event.target.value;
    else for(const [name,key] of [['order','wordOrder'],['adjective','adjectivePosition'],['morphology','morphologyStrategy']])if(event.target===get(name)){state.grammarConfig[key]=event.target.value;state.grammarCustomized=true;}
    controls();
  });
  listen(get('form'),'submit',event=>{
    event.preventDefault();
    if(state.receiver)return;
    const apply=()=>{try{const same=state.project?.config.preset===state.selectedPreset&&state.project?.config.wordLength===state.wordLength;
      let result;if(same)result=reconstructProject({...state.project,config:{...state.project.config,grammar:{...state.grammarConfig}}},{base:state.base});else{const next=generate(generationInput(state,seedFactory));result={project:projectFromPackage(next),base:next,package:next};}
      state.search='';state.activeDictionaryFilter='all';activate(result);status('ready');get('name').focus({preventScroll:true});get('name').scrollIntoView({block:'start'});
    }catch{status('error');}};
    if(state.project&&(state.project.config.preset!==state.selectedPreset||state.project.config.wordLength!==state.wordLength))ask('soundWarning',apply);else apply();
  });
  listen(get('search'),'input',()=>{state.search=get('search').value;dictionary();});
  listen(get('filter'),'change',()=>{state.activeDictionaryFilter=get('filter').value;dictionary();});
  listen(get('change'),'click',showSetup);
  function fresh(){if(state.receiver)return;const apply=()=>{storageFailed=!store.clear();saved=null;state=setupState();state.receiver=false;state.invalidShare=false;editor=null;removeFragment();sessions.set(root,state);get('result').querySelectorAll('[data-forge-quick],[data-forge-dictionary],[data-forge-grammar],[data-forge-sentences]').forEach(n=>n.replaceChildren());root.querySelector('.forge-advanced').open=false;status('');showSetup();};if(state.project||state.localSession||store.load())ask('newWarning',apply);else apply();}
  for(const id of ['new','fresh','invalid-new'])listen(get(id),'click',fresh);
  listen(get('confirm-yes'),'click',()=>{const action=pending;pending=null;confirmKey='';get('confirm').hidden=true;action?.();});
  listen(get('confirm-no'),'click',()=>{pending=null;confirmKey='';get('confirm').hidden=true;if(state.status==='generated')get('name').focus({preventScroll:true});else (saved?get('resume'):get('submit')).focus({preventScroll:true});});
  listen(get('resume'),'click',()=>{if(saved)activate(saved);status('ready');});
  listen(get('copy-project'),'click',()=>{const candidate=reconstructProject(state.project);const copy=()=>{removeFragment();activate(candidate);status('copyReady');};if(state.localSession||store.load())ask('copyWarning',copy);else copy();});
  listen(get('import'),'click',()=>get('file').click());
  listen(get('file'),'change',async()=>{const file=get('file').files[0];get('file').value='';if(!file)return;try{if(file.size>16384)throw new ProjectError('PROJECT_TOO_LARGE');const candidate=importProject(await file.text());if(dead)return;const apply=()=>{removeFragment();state.search='';state.activeDictionaryFilter='all';activate(candidate);status('importReady');};if(state.project||store.load())ask('importWarning',apply);else apply();}catch{status('importFailed');}});
  listen(get('export'),'click',()=>{try{const blob=new Blob([exportProject(state.project)],{type:'application/json'}),url=URL.createObjectURL(blob),a=element('a');a.href=url;a.download='language-forge.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{status('importFailed');}});
  listen(get('share'),'click',async()=>{const snapshot=shareProject(state.project);if(!snapshot.available){status('shareLarge');return;}const feedback=await shareText({title:'Language Forge',url:snapshot.url});if(dead)return;if(feedback.status==='manual'){get('link-area').hidden=false;get('link').value=snapshot.url;get('link').focus();get('link').select();status('copyFailed');}else if(feedback.status==='copied')status('copied');else if(feedback.status==='handoff')status('shareReady');});
  function loadLocation(){const wasReceiver=state.receiver;editor=null;state.invalidShare=false;state.receiver=false;if(location.hash){try{activate(decodeShare(location.hash),true);status('');}catch{state.status='setup';state.invalidShare=true;state.generatedPackage=null;state.project=null;status('');controls();}}else{if(wasReceiver||!state.project){if(state.localSession){activate(state.localSession);return;}state.project=null;state.generatedPackage=null;state.base=null;saved=store.load();state.status='setup';controls();}}}
  listen(window,'hashchange',loadLocation);listen(window,'popstate',loadLocation);
  // Section/skip navigation must not replace a share snapshot fragment.
  listen(document,'click',event=>{const link=event.target.closest('a[href^="#"]');const id=link?.getAttribute('href').slice(1);if(!['main-content','forge-dictionary','forge-grammar','forge-sentences'].includes(id))return;const target=document.getElementById(id);if(target){event.preventDefault();target.focus({preventScroll:true});target.scrollIntoView({block:'start'});}});
  const unsubscribe=i18n.subscribe(()=>{if(dead)return;controls();results();});
  get('fallback').hidden=true;root.dataset.ready='true';controls();results();
  loadLocation();
  sessions.set(root,state);
  return {dispose(){dead=true;unsubscribe();removers.forEach(fn=>fn());root.dataset.ready='false';}};
}
