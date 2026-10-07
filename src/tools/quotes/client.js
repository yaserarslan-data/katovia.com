import {quotes,favoritesKey,historyKey,validFavorites,selectQuotes} from './model.js';
import {toolUi} from '../tool-ui.js';
import {copyText,shareText} from '../../core/share.js';
import {t} from '../../i18n/index.js';
import './style.css';
export function mount(root){
 const ui=toolUi(root),get=id=>root.querySelector(`[data-quote-${id}]`);let favorites=[],recent=[];
 try{favorites=validFavorites(JSON.parse(localStorage.getItem(favoritesKey)||'[]'));}catch{}
 try{recent=validFavorites(JSON.parse(localStorage.getItem(historyKey)||'[]')).slice(-5);}catch{}
 let mode='single',category='all',currentId=location.hash.slice(1);
 if(!quotes.some(q=>q.id===currentId))currentId=quotes[0].id;
 function pool(){return selectQuotes(category,mode==='favorites'?favorites:null);}
 function save(){try{localStorage.setItem(favoritesKey,JSON.stringify(favorites));return true;}catch{return false;}}
 function toggle(id){favorites=favorites.includes(id)?favorites.filter(value=>value!==id):[...favorites,id];ui.status(save()?'quotes.saved':'quotes.memoryOnly');render();}
 function choose(id){currentId=id;recent=[...recent.filter(value=>value!==id),id].slice(-5);try{localStorage.setItem(historyKey,JSON.stringify(recent));}catch{}history.replaceState(history.state,'','#'+id);render();}
 function current(){return pool().find(q=>q.id===currentId);}
 function render(){
  const items=pool();if(!items.some(q=>q.id===currentId))currentId=items[0]?.id||'';
  root.querySelectorAll('[data-quote-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.quoteMode===mode)));
  get('count').textContent=t('quotes.count',{count:items.length,favorites:favorites.length});get('single').hidden=mode!=='single'||!items.length;get('grid').hidden=mode==='single'||!items.length;get('empty').hidden=!!items.length;
  get('text').textContent=current()?.text||'';get('favorite').setAttribute('aria-pressed',String(favorites.includes(currentId)));
  get('grid').replaceChildren();
  if(mode!=='single')for(const quote of items){const article=document.createElement('article');article.className='quote-static';article.dataset.quoteId=quote.id;const p=document.createElement('p');p.lang='tr';p.textContent=quote.text;article.append(p);for(const action of ['open','favorite']){const button=document.createElement('button');button.className='button';button.type='button';button.dataset.quoteCardAction=action;button.dataset.id=quote.id;button.textContent=t('quotes.'+action);if(action==='favorite')button.setAttribute('aria-pressed',String(favorites.includes(quote.id)));article.append(button);}get('grid').append(article);}
 }
 root.querySelectorAll('[data-quote-mode]').forEach(button=>ui.listen(button,'click',()=>{mode=button.dataset.quoteMode;render();}));
 ui.listen(get('category'),'change',()=>{category=get('category').value;render();});
 for(const [action,direction]of [['previous',-1],['next',1]])ui.listen(get(action),'click',()=>{const items=pool();if(items.length)choose(items[(items.findIndex(q=>q.id===currentId)+direction+items.length)%items.length].id);});
 ui.listen(get('random'),'click',()=>{const all=pool(),fresh=all.filter(q=>q.id!==currentId&&!recent.includes(q.id)),items=fresh.length?fresh:all.filter(q=>q.id!==currentId);if(items.length){const value=new Uint32Array(1),limit=4294967296-4294967296%items.length;do{crypto.getRandomValues(value);}while(value[0]>=limit);choose(items[value[0]%items.length].id);}});
 ui.listen(get('favorite'),'click',()=>{if(currentId)toggle(currentId);});
 ui.listen(get('grid'),'click',event=>{const button=event.target.closest('[data-quote-card-action]');if(!button)return;if(button.dataset.quoteCardAction==='favorite')toggle(button.dataset.id);else{mode='single';choose(button.dataset.id);get('single').scrollIntoView({block:'nearest'});}});
 async function output(share){const quote=current();if(!quote)return;const result=share?await shareText({title:'Katovia',text:quote.text,url:'https://katovia.com/lab/guzel-sozler/#'+quote.id}):await copyText(quote.text);if(ui.dead)return;get('manual').hidden=result.status!=='manual';if(result.status==='manual')get('manual-text').value=result.text;ui.status(result.status==='cancelled'?'quotes.cancelled':result.status==='manual'?'quotes.manual':share?'quotes.shared':'quotes.copied');}
 ui.listen(get('copy'),'click',()=>void output(false));ui.listen(get('share'),'click',()=>void output(true));
 ui.listen(window,'hashchange',()=>{const id=location.hash.slice(1);if(quotes.some(q=>q.id===id)){category='all';get('category').value='all';mode='single';currentId=id;render();}});
 get('static').hidden=true;get('enhanced').hidden=false;ui.subscribe(render);render();
 return {dispose(){ui.dispose();}};
}
