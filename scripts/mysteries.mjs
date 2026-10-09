import { readFile } from 'node:fs/promises';
import { mysteryVisuals } from '../src/mysteries/visuals.js';
import { mysteries, mysteryRoutes, mysteryIndexRoute, mysteryRoute, mysteryStatus } from '../src/catalog/mysteries.js';
import { sections } from '../src/catalog/registry.js';
import { translate } from '../src/i18n/index.js';

export const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const text = node => typeof node === 'string' ? node : node.children.map(text).join('');
const tags = new Set('section h2 h3 h4 p div span strong b em i ul ol li details summary table thead tbody tr th td a time br blockquote sup small'.split(' '));
const attrs = new Set(['id','class','href','colspan','rowspan','datetime']);
export function renderNode(node, locale = 'tr') {
  if (typeof node === 'string') return escape(node);
  if (!tags.has(node.tag)) throw new Error(`Unsupported content node: ${node.tag}`);
  const attributes = Object.entries(node.attrs || {}).map(([key, value]) => {
    if (!attrs.has(key) || (key === 'href' && !/^(#|https?:\/\/)/.test(value))) throw new Error('Unsafe content attribute');
    return ` ${key}="${escape(value)}"`;
  }).join('');
  const markup = `<${node.tag}${attributes}>${node.tag === 'br' ? '' : node.children.map(child => renderNode(child, locale)).join('') + `</${node.tag}>`}`;
  return node.tag === 'table' ? `<div class="mystery-table-scroll" tabindex="0" role="region" aria-label="${escape(text(node.children.find(n => n.tag === 'tr' || n.tag === 'thead') || {children:[locale === 'en' ? 'Table' : 'Tablo']}))}">${markup}</div>` : markup;
}
const copy = {
  tr: { about:'Bu dosya hakkında', method:'Durum ve yöntem', summary:'60 saniyede dosya', name:'Gizem Dosyaları', intro:'İddialar, kanıtlar ve açık sorular.', pilot:`${mysteries.length} araştırma: iddiaları, kanıtları ve açık soruları birlikte keşfet.`, search:'Dosyalarda ara', filter:'Durum', all:'Tüm durumlar', sort:'Sıralama', order:'Dosya sırası', asc:'Durum: yeşil → kırmızı', desc:'Durum: kırmızı → yeşil', alpha:'Başlık: A → Z', topic:'Konu', question:'Temel soru', result:'Kısa değerlendirme', status:'Durum', read:'Dosyayı oku', clear:'Filtreleri temizle', total:'Toplam', results:'sonuç', empty:'Bu aramaya uygun dosya bulunamadı.', notice:'Durum, ana iddianın editoryal değerlendirmesidir; bütün ayrıntıların çözüldüğü anlamına gelmez.', translation:'Bu araştırma Türkçe ve İngilizce olarak sunuluyor. İngilizce sürüm, Türkçe kaynak metnin editoryal çevirisidir.', review:'Bağımsız kaynak doğrulaması tamamlanmadı. Kanıt seviyeleri nitel editoryal değerlendirmelerdir.', toc:'Bu dosyada', print:'Yazdır', previous:'Önceki', next:'Sonraki', back:'Tüm Gizem Dosyaları', menu:'Menü', skip:'İçeriğe geç', source:'Kaynak sürümü', pagination:'Dosyalar arasında' },
  en: { about:'About this case', method:'Status and method', summary:'The case in 60 seconds', name:'Mysteries', intro:'Claims, evidence and open questions.', pilot:`${mysteries.length} research cases: explore their claims, evidence and open questions.`, search:'Search cases', filter:'Status', all:'All statuses', sort:'Sort', order:'Case order', asc:'Status: green → red', desc:'Status: red → green', alpha:'Title: A → Z', topic:'Topic', question:'Core question', result:'Brief assessment', status:'Status', read:'Read the case', clear:'Clear filters', total:'Total', results:'results', empty:'No cases match this search.', notice:'Status is an editorial assessment of the main claim; it does not mean every detail is settled.', translation:'This research is available in Turkish and English. The English version is an editorial translation of the Turkish source text.', review:'Independent scientific source verification has not been completed. Evidence levels are qualitative editorial assessments.', toc:'In this case', print:'Print', previous:'Previous', next:'Next', back:'All Mysteries', menu:'Menu', skip:'Skip to content', source:'Source revision', pagination:'Between cases' },
};
export async function loadMystery(entry, locale) {
  const content = JSON.parse(await readFile(new URL(`../src/content/mysteries/${entry.id}/${locale}.json`, import.meta.url), 'utf8'));
  if (content.id !== entry.id || content.locale !== locale || content.schemaVersion !== 1) throw new Error('Mystery identity mismatch');
  const ids = content.sections.map(section => section.attrs.id);
  if (new Set(ids).size !== ids.length || !ids.includes('ozet') || !ids.some(id => ['kaynakca','kaynaklar'].includes(id))) throw new Error('Invalid mystery sections');
  // Validate all nodes before creating pages, including broken local references.
  const markup = content.sections.map(node => renderNode(presentSection(node,locale), locale)).join('');
  const anchors = new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const match of markup.matchAll(/href="#([^"]+)"/g)) if (!anchors.has(match[1])) throw new Error(`Missing section: ${match[1]}`);
  return content;
}
function index(locale) {
  const c = copy[locale];
  return `<main id="main-content" class="container mystery-index" tabindex="-1"><header class="mystery-intro"><p class="eyebrow">KATOVIA / ${c.name}</p><h1>${c.name}</h1><p>${c.pilot}</p></header>
  <form class="mystery-controls" data-mystery-filters role="search"><label>${c.search}<input type="search" name="q" maxlength="200" autocomplete="off"></label><label>${c.filter}<select name="status"><option value="all">${c.all}</option>${Object.entries(mysteryStatus[locale]).map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label><label>${c.sort}<select name="sort">${[['order',c.order],['status-asc',c.asc],['status-desc',c.desc],['title',c.alpha]].map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label><button class="button" type="reset">${c.clear}</button></form>
  <p role="status" aria-live="polite" data-mystery-count data-suffix="${c.results}">${mysteries.length} ${c.results}</p><p data-mystery-empty hidden>${c.empty}</p>
  <details class="mystery-method"><summary>${c.method}</summary><p>${c.notice}</p><p>${c.translation}</p><p>${c.review}</p></details><table class="mystery-index-table"><caption class="sr-only">${c.name}</caption><thead><tr>${[c.topic,c.question,c.result,c.status].map(label=>`<th scope="col">${label}</th>`).join('')}</tr></thead><tbody data-mystery-rows>${mysteries.map(entry => `<tr data-case="${entry.id}" data-order="${entry.order}" data-status="${entry.status}" data-title="${escape(entry.titles[locale])}" data-search="${escape([entry.titles[locale],...entry.aliases,entry.questions[locale],entry.summaries[locale]].join(' '))}"><td data-label="${c.topic}"><a data-case-link href="${mysteryRoute(entry,entry.locales.includes(locale)?locale:'tr')}">${escape(entry.titles[locale])}</a><small>${c.read}</small></td><td data-label="${c.question}">${escape(entry.questions[locale])}</td><td data-label="${c.result}">${escape(entry.summaries[locale])}</td><td data-label="${c.status}" class="mystery-status ${entry.status}">${mysteryStatus[locale][entry.status]}</td></tr>`).join('')}</tbody></table></main>`;
}
export function presentSection(section, locale) {
  const displayed=structuredClone(section);
  const heading=displayed.children.find(node=>node.tag==='h2');
  if(heading) heading.children=[section.attrs.id==='ozet'?copy[locale].summary:text(heading).replace(/^\d+\.\s*/, '')];
  return displayed;
}
function article(entry, locale, content) {
  const c=copy[locale], position=mysteries.indexOf(entry);
  const visual=mysteryVisuals[entry.id],image=visual?`<figure class="mystery-visual"><img src="${'../'.repeat(mysteryRoute(entry,locale).split('/').filter(Boolean).length+1)}src/mysteries/visuals/${visual.file}" width="800" height="400" alt="${escape(visual.alt[locale])}" decoding="async"><figcaption>${escape(visual.caption[locale])}</figcaption></figure>`:'';
  const adjacent=(offset,label)=>{const target=mysteries[position+offset];return target?`<a class="button" href="${mysteryRoute(target,locale)}">${label}: ${escape(target.titles[locale])}</a>`:'';};
  return `<main id="main-content" class="container mystery-reader" tabindex="-1"><header class="mystery-intro"><p class="eyebrow">KATOVIA / ${c.name}</p><h1>${escape(entry.titles[locale])}</h1><p>${escape(entry.questions[locale])}</p>${image}<p class="mystery-status ${entry.status}">${mysteryStatus[locale][entry.status]}</p><aside class="mystery-about" aria-labelledby="case-about"><h2 id="case-about">${c.about}</h2><p>${c.source}: <time datetime="${content.source.revision}">${content.source.revision}</time></p><p>${c.notice}</p><p class="mystery-note">${c.review}</p><p class="mystery-translation">${c.translation}</p></aside><button type="button" class="button" data-mystery-print>${c.print}</button></header>
  <details class="mystery-toc"><summary>${c.toc}</summary><nav aria-label="${c.toc}">${content.sections.map(section=>`<a href="#${section.attrs.id}">${escape(text(presentSection(section,locale).children.find(node=>node.tag==='h2') || {children:[section.attrs.id]}))}</a>`).join('')}</nav></details>
  <article class="mystery-content">${content.sections.map(node => renderNode(presentSection(node,locale), locale)).join('')}</article><nav class="mystery-pagination" aria-label="${c.pagination}">${adjacent(-1,c.previous)}<a class="button" data-mystery-back href="${mysteryIndexRoute(locale)}">${c.back}</a>${adjacent(1,c.next)}</nav></main>`;
}
export async function mysteryPages() {
  const pages=[];
  for (const route of mysteryRoutes) {
    const locale=route.startsWith('/tr/')?'tr':'en', c=copy[locale];
    const entry=mysteries.find(item=>route===mysteryRoute(item,locale));
    const content=entry?await loadMystery(entry,locale):null;
    const title=entry?`${entry.titles[locale]} — ${c.name} | Katovia`:`${c.name} — ${c.intro} | Katovia`;
    const description=entry?entry.summaries[locale]:`${c.intro} ${c.pilot}`;
    const alternate=entry?entry.locales.map(lang=>[lang,mysteryRoute(entry,lang)]):['tr','en'].map(lang=>[lang,mysteryIndexRoute(lang)]);
    const schema=entry?{'@context':'https://schema.org','@type':'Article',headline:entry.titles[locale],description,inLanguage:locale,url:`https://katovia.com${route}`,isAccessibleForFree:true}:null;
    const script='../'.repeat(route.split('/').filter(Boolean).length+1)+'src/mysteries/main.js';
    pages.push({path:`${route.slice(1)}index.html`,html:`<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="https://katovia.com${route}"><meta name="robots" content="index, follow"><meta name="theme-color" content="#0c0e10">${alternate.length>1?alternate.map(([lang,url])=>`<link rel="alternate" hreflang="${lang}" href="https://katovia.com${url}">`).join(''):''}<meta property="og:type" content="${entry?'article':'website'}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="https://katovia.com${route}"><meta property="og:site_name" content="Katovia"><meta property="og:locale" content="${locale==='tr'?'tr_TR':'en_US'}"><meta name="twitter:card" content="summary">${schema?`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`:''}<script type="module" src="${script}"></script></head>
<body data-page="mysteries" data-content-locale="${locale}"><a class="skip-link" href="#main-content">${c.skip}</a><header class="site-header"><div class="container header-inner"><a class="wordmark" href="/">KATOVIA</a><div class="language-control" role="group" aria-label="${locale==='tr'?'Dil':'Language'}">${['tr','en'].map(lang=>{const target=alternate.find(([key])=>key===lang)?.[1];return target?`<a class="button" href="${target}" lang="${lang}" data-mystery-language="${lang}"${lang===locale?' aria-current="page"':''}>${lang.toUpperCase()}</a>`:`<span lang="${lang}" title="${c.translation}">${lang.toUpperCase()} · ${locale==='tr'?'yakında':'pending'}</span>`;}).join('')}</div><button class="menu-toggle" type="button" aria-controls="primary-navigation" aria-expanded="false" data-menu-toggle>${c.menu} ☰</button><nav id="primary-navigation" class="navigation" data-navigation aria-label="${locale==='tr'?'Ana navigasyon':'Main navigation'}">${sections.map(item=>`<a class="nav-link" href="${item.route}">${escape(translate(locale,`nav.${item.id}`))}</a>`).join('')}<a class="nav-link" href="${mysteryIndexRoute(locale)}" aria-current="${entry?'true':'page'}">${c.name}</a></nav></div></header>${entry?article(entry,locale,content):index(locale)}<footer class="site-footer"><div class="container footer-inner"><p>KATOVIA / ${c.intro}</p><a href="${mysteryIndexRoute(locale)}">${c.back}</a></div></footer></body></html>\n`});
  }
  return pages;
}
