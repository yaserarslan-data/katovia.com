import {toolUi} from '../tool-ui.js';
import {i18n} from '../../i18n/index.js';
import {dataset,profiles,profileById,entryById,findEntries,readState,stateUrl} from './model.js';
import './style.css';
export function mount(root){
 const ui=toolUi(root),get=name=>root.querySelector(`[data-alpha-${name}]`);
 const refs=get('reference'),enhanced=root.querySelector('.alphabet-enhanced');
 refs.hidden=true;enhanced.hidden=false;
 let state=readState(location.href);
 let brailleOpen=profileById(state.profileId)?.systemId==='braille';
 const local=values=>values[i18n.locale]||values.en;
 const label=key=>ui.translate('alphabet.'+key);
 function writeUrl(){const next=stateUrl(state.profileId,state.symbolId);if(location.pathname+location.search+location.hash!==next)history.pushState(null,'',next);}
 function field(key,value){const wrap=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label(key);dd.textContent=value;wrap.append(dt,dd);return wrap;}
 function renderDetail(profile,entry){
  const host=get('detail');host.replaceChildren();
  if(!entry){const p=document.createElement('p');p.textContent=label('choose');host.append(p);return;}
  const glyph=document.createElement('p');glyph.className='alphabet-large-glyph';glyph.lang=profile.languageTag||'en';glyph.textContent=entry.pattern||entry.forms.map(form=>form.text).join(' / ');
  const heading=document.createElement('h2');heading.textContent=local(entry.symbolName);
  const dl=document.createElement('dl');
  dl.append(field('romanization',entry.romanization?`${entry.romanization.value} — ${entry.romanization.scheme}`:label('notApplicable')),field('reading',local(entry.pronunciation.text)),field('unicode',entry.forms.map(form=>`${form.codePoints.join(' ')} — ${form.unicodeNames.join('; ')}`).join('\n')));
  if(entry.dots){dl.prepend(field('dots',entry.dots.join('-')));const grid=document.createElement('div');grid.className='alphabet-braille-cell';grid.setAttribute('aria-hidden','true');for(const dot of [1,4,2,5,3,6]){const cell=document.createElement('span');cell.className=entry.dots.includes(dot)?'raised':'';cell.textContent=String(dot);grid.append(cell);}host.append(grid);}
  const sources=document.createElement('div');sources.className='alphabet-detail-sources';
  for(const id of profile.sourceRefs){const source=dataset.sources.find(item=>item.id===id),a=document.createElement('a'),p=document.createElement('p');a.href=source.url;a.textContent=source.title;p.append(a,document.createTextNode(' — '+source.version));sources.append(p);}
  host.append(glyph,heading,dl,sources);
 }
 function render(){
  root.querySelectorAll('[data-alpha-tr]').forEach(node=>{node.textContent=node.dataset['alpha'+(i18n.locale==='tr'?'Tr':'En')];});
  const profile=profileById(state.profileId),entries=profile?findEntries(profile,get('search').value):[];
  get('braille-choices').hidden=!brailleOpen;
  root.querySelector('[data-alpha-system]').setAttribute('aria-pressed',String(brailleOpen));
  get('search').disabled=!profile;
  root.querySelectorAll('[data-alpha-profile]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.alphaProfile===state.profileId)));
  const grid=get('grid');grid.replaceChildren();grid.classList.toggle('alphabet-kana-grid',profile?.systemId==='hiragana');
  const ordered=profile?.systemId==='hiragana'&&!get('search').value.trim()?profile.groups.flatMap(group=>{
   const items=group.entryIds.map(id=>entryById(profile,id));
   return group.id==='y'?[items[0],null,items[1],null,items[2]]:group.id==='w'?[items[0],null,null,null,items[1]]:group.id==='final'?[items[0]]:items;
  }):entries;
  for(const entry of ordered){
   if(!entry){const blank=document.createElement('span');blank.className='alphabet-blank';blank.setAttribute('aria-hidden','true');grid.append(blank);continue;}
   const button=document.createElement('button');button.type='button';button.className='alphabet-symbol';button.dataset.alphaSymbol=entry.id;button.setAttribute('aria-pressed',String(state.symbolId===entry.id));button.setAttribute('aria-controls','alphabet-selected');button.setAttribute('aria-label',local(entry.symbolName));
   const glyph=document.createElement('span');glyph.lang=profile.languageTag||'en';glyph.textContent=entry.pattern||entry.forms[0].text;
   const name=document.createElement('small');name.textContent=entry.inputToken||local(entry.symbolName);button.append(glyph,name);grid.append(button);
  }
  get('empty').hidden=!profile||entries.length>0;
  get('count').textContent=profile?ui.translate('alphabet.count',{shown:entries.length,total:profile.expectedCount}):label('selectProfile');
  get('detail').id='alphabet-selected';renderDetail(profile,entryById(profile,state.symbolId));
 }
 ui.listen(root,'click',event=>{
  if(event.target.closest('[data-alpha-system]')){brailleOpen=true;state={profileId:null,symbolId:null};get('search').value='';writeUrl();render();return;}
  const profileButton=event.target.closest('[data-alpha-profile]');
  if(profileButton){state={profileId:profileButton.dataset.alphaProfile,symbolId:null};brailleOpen=profileById(state.profileId).systemId==='braille';get('search').value='';writeUrl();render();return;}
  const symbol=event.target.closest('[data-alpha-symbol]');
  if(symbol){state.symbolId=symbol.dataset.alphaSymbol;writeUrl();render();const target=root.querySelector(`[data-alpha-symbol="${state.symbolId}"]`);target?.focus({preventScroll:true});if(matchMedia('(max-width:767px)').matches){get('detail').focus({preventScroll:true});get('detail').scrollIntoView({block:'start'});}}
 });
 ui.listen(get('search'),'input',render);
 const restore=()=>{state=readState(location.href);brailleOpen=profileById(state.profileId)?.systemId==='braille';get('search').value='';render();};
 ui.listen(window,'popstate',restore);ui.listen(window,'hashchange',restore);
 ui.subscribe(render);render();
 return {dispose(){ui.dispose();refs.hidden=false;enhanced.hidden=true;}};
}
