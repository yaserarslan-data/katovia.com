import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/shell.css';
import './style.css';
import { i18n } from '../i18n/index.js';
import { mountNavigation } from '../shell/navigation.js';
import { storage } from '../core/storage.js';

const locale = document.body.dataset.contentLocale;
document.documentElement.classList.add('js');
i18n.setLocale(locale, { persist: false });
let disposeNavigation = mountNavigation();
window.addEventListener('pagehide', () => disposeNavigation());
window.addEventListener('pageshow', event => { if (event.persisted) disposeNavigation = mountNavigation(); });
document.querySelectorAll('[data-mystery-language]').forEach(link => link.addEventListener('click', () => {
  storage.set('locale', link.dataset.mysteryLanguage);
  link.search = location.search;
  link.hash = location.hash;
}));

export const normalizeSearch = (value, lang) => value.toLocaleLowerCase(lang).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');
const form = document.querySelector('[data-mystery-filters]');
if (form) {
  const rows = [...document.querySelectorAll('[data-case]')];
  const ranks = { explained: 1, partial: 2, open: 3 };
  const collator = new Intl.Collator(locale);
  const q = form.elements.q, status = form.elements.status, sort = form.elements.sort;
  const readState = () => {
    const params = new URLSearchParams(location.search);
    q.value = (params.get('q') || '').slice(0, 200);
    status.value = ['explained','partial','open'].includes(params.get('status')) ? params.get('status') : 'all';
    sort.value = ['status-asc','status-desc','title'].includes(params.get('sort')) ? params.get('sort') : 'order';
  };
  const render = (updateUrl = true) => {
    const query = normalizeSearch(q.value.trim(), locale);
    rows.sort((a,b) => (sort.value === 'title' ? collator.compare(a.dataset.title,b.dataset.title) : sort.value.startsWith('status-') ? (ranks[a.dataset.status]-ranks[b.dataset.status]) * (sort.value==='status-desc'?-1:1) : 0) || Number(a.dataset.order)-Number(b.dataset.order));
    const body=document.querySelector('[data-mystery-rows]');
    // Do not detach a clicked link when search blur emits another change event.
    rows.forEach((row,index)=>{if(body.children[index]!==row)body.insertBefore(row,body.children[index]||null);});
    let count=0;
    for (const row of rows) {
      row.hidden = (status.value !== 'all' && row.dataset.status !== status.value) || !normalizeSearch(row.dataset.search,locale).includes(query);
      if (!row.hidden) count++;
    }
    const params=new URLSearchParams();
    if(q.value.trim())params.set('q',q.value.trim());
    if(status.value!=='all')params.set('status',status.value);
    if(sort.value!=='order')params.set('sort',sort.value);
    const search=params.size?`?${params}`:'';
    if(updateUrl)history.replaceState(null,'',location.pathname+search+location.hash);
    // A validated return URL travels with the article, without indexing filter variants.
    for(const link of document.querySelectorAll('[data-case-link]'))link.search=search?`?return=${encodeURIComponent(location.pathname+search)}`:'';
    const counter=document.querySelector('[data-mystery-count]');
    counter.textContent=`${count} ${counter.dataset.suffix}`;
    document.querySelector('[data-mystery-empty]').hidden=count!==0;
  };
  form.addEventListener('submit',event=>event.preventDefault());
  form.addEventListener('input',()=>render());
  form.addEventListener('change',()=>render());
  form.addEventListener('reset',()=>{q.value='';status.value='all';sort.value='order';render();});
  window.addEventListener('popstate',()=>{readState();render(false);});
  readState();render(false);
}
const back=document.querySelector('[data-mystery-back]');
if(back){
  const value=new URLSearchParams(location.search).get('return');
  if(value){try{const url=new URL(value,location.origin);if(url.origin===location.origin&&['/mysteries/','/tr/mysteries/'].includes(url.pathname)){back.href=url.pathname+url.search;}}catch{/* Invalid return links keep the static fallback. */}}
}
const printButton=document.querySelector('[data-mystery-print]');
let closed=[];
window.addEventListener('beforeprint',()=>{closed=[...document.querySelectorAll('.mystery-content details:not([open])')];closed.forEach(node=>{node.open=true;});});
window.addEventListener('afterprint',()=>{closed.forEach(node=>{node.open=false;});closed=[];});
printButton?.addEventListener('click',()=>window.print());
