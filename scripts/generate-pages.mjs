import {alphabetMarkup} from '../src/tools/alphabet/markup.js';
import {creations} from '../src/catalog/creations.js';
import {forgeMarkup,forgeCard} from '../src/language-forge/ui/markup.js';
import {quoteMarkup} from '../src/tools/quotes/markup.js';
import { mysteryPages } from './mysteries.mjs';
import { mysteryRoutes } from '../src/catalog/mysteries.js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, posix } from 'node:path';
import { sections, entries } from '../src/catalog/registry.js';
import { siteRoot } from './paths.mjs';
import { gameMarkup } from '../src/games/stop-at-five/markup.js';
import { markup as memoryMarkup } from '../src/games/memory-grid/mount.js';
import { markup as reactionMarkup } from '../src/games/reaction/mount.js';
import { translate } from '../src/i18n/index.js';
import { personalPages } from '../src/catalog/personal.js';
import { duelMarkup } from '../src/features/duel.js';
import { creatorMarkup, creationMarkup } from '../src/features/creator.js';
import { tools, toolPages, discoveryCollections, creativeTools, toolGroups, relatedProducts } from '../src/catalog/tools.js';
import { toolMarkup } from '../src/features/tools.js';
import { experiences } from '../src/catalog/experiences.js';
import { experienceMarkup } from '../src/features/activities.js';

const escape = (text) => String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const hrefFrom = (from, to) => {
  const relative = posix.relative(from, to);
  return relative ? relative + (to.endsWith('/') ? '/' : '') : './';
};
const txt = (key, tag = 'span', attrs = '') => `<${tag} data-i18n="${key}" ${attrs}>${escape(translate('en', key))}</${tag}>`;
const statusLabel = (status) => txt(`status.${status}`);

function card(entry, route, heading = 'h3') {
  return `<a class="section-card" data-card-id="${entry.id}"${entry.id==='language-forge'?' data-forge-card':''} href="${hrefFrom(route, entry.route)}">
        ${entry.visual?`<svg class="tool-visual" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="5" y="5" width="38" height="38" rx="8" stroke="currentColor" stroke-width="2"/><path d="${entry.id==='image-compressor'?'M12 32l8-10 7 6 5-8 5 12M16 15h4':entry.id==='lucky-draw'?'M24 12v24M12 24h24M16 16l16 16M32 16L16 32':'M16 8v32M24 8v32M32 8v32M8 16h32M8 24h32M8 32h32'}" stroke="currentColor" stroke-width="2"/></svg>`:''}
        ${entry.activity?`<div class="code-art code-art-${entry.id}" aria-hidden="true"></div>`:''}
        <div class="section-card-top">${txt(`common.${entry.type}`, 'span', 'class="eyebrow"')}<span class="card-arrow" aria-hidden="true">↗</span></div>
        ${txt(entry.titleKey || `entry.${entry.id}.title`, heading)}${txt(entry.descriptionKey || `entry.${entry.id}.description`, 'p')}
        ${entry.status==='legacy'?txt('lab.turkish','small','class="catalog-note"'):''}
      </a>`;
}

function daily(route, isHome = false) {
  return gameMarkup();
}

const quizProduct = {id:'quiz-creator', type:'create', route:'/create/#quiz-creator', titleKey:'creator.product', descriptionKey:'creator.productDescription'};
const forgeProduct = {...creations[0], titleKey:'forge.title'};
const products = [...toolPages, forgeProduct, quizProduct];
const selectProducts = ids => ids.map(id => products.find(entry => entry.id===id));
function continuation(key, href, attrs='') {return txt(key,'a',`class="button collection-link" href="${href}" ${attrs}`);}
function collection(id, key, list, route, link='') {
  return `<section class="catalog-group" aria-labelledby="${id}"><div class="section-heading">${txt(key,'h2',`id="${id}"`)}</div><div class="section-grid">${list.map(entry=>card(entry,route)).join('\n')}</div>${link}</section>`;
}
function home(route) {
  return `<main id="main-content" class="container has-daily" tabindex="-1">
    <section class="hero" aria-labelledby="home-title"><div class="hero-top">${txt('home.eyebrow','p','class="eyebrow"')}<span class="pill">${txt('home.preview')}</span></div>
      <h1 id="home-title">${txt('home.play')}<br>${txt('home.something')}</h1>
      <div class="hero-bottom">${txt('home.description','p')}${txt('common.motto','span','class="index-label"')}</div>${continuation('home.start','#home-daily')}
    </section>
    <section aria-labelledby="home-daily"><div class="section-heading">${txt('nav.today','h2','id="home-daily"')}${txt('home.dailyHint','span','class="eyebrow"')}</div>${daily(route,true)}<div class="daily-links">${continuation('memory.title','/today/#memory-grid')}${continuation('reaction.title','/today/#reaction')}${continuation('home.allDaily','/today/')}</div></section>
    <section aria-labelledby="home-create"><div class="section-heading">${txt('home.create','h2','id="home-create"')}</div>${txt('home.createCopy','p')}<div class="section-grid home-create-grid">${card(forgeProduct,route)}${card(quizProduct,route)}</div>${continuation('home.allCreate','/create/')}</section>
    ${collection('home-play','home.playNow',experiences.filter(entry=>entry.id!=='koi-pond'),route,continuation('home.allPlay','/play/'))}
    <section class="home-cta" aria-labelledby="home-challenge">${txt('home.challenge','h2','id="home-challenge"')}${txt('home.challengeCopy','p')}${continuation('duel.own','/challenge/')}</section>
    ${collection('home-tools','home.tools',selectProducts(['image-compressor','lucky-draw']),route,continuation('home.allTools','/tools/'))}
    <section class="home-cta">${txt('nav.mysteries','h2')}${txt('mysteries.discovery','p')}${continuation('mysteries.explore','/mysteries/','data-mystery-entry')}</section>
    <section id="laboratuvar">${collection('home-lab','lab.collection',selectProducts(['beautiful-quotes']),route,continuation('common.return','/lab/'))}</section>
  </main>`;
}
function sectionPage(section) {
  const owner=section.id==='d'?'challenge':section.personal?'create':section.owner || (section.activity?'play':section.id);
  const detail=section.activity || section.tool || section.personal || section.creation;
  let body='';
  if(section.creation) body=forgeMarkup();
  else if(section.id==='d') body=duelMarkup('play');
  else if(section.personal) body=creationMarkup();
  else if(section.id==='create') body=collection('create-products','nav.create',[forgeProduct,quizProduct,...creativeTools],section.route)+`<section id="quiz-creator" aria-labelledby="quiz-product-title">${txt('creator.product','h2','id="quiz-product-title"')}${creatorMarkup()}</section>`;
  else if(section.id==='challenge') body=duelMarkup()+`<details class="experience-help"><summary>${txt('challenge.heading')}</summary>${txt('challenge.guide','p')}</details>${continuation('challenge.train','/today/#reaction')}`;
  else if(section.tool) body=(section.id==='alphabet-lab'?alphabetMarkup():section.id==='beautiful-quotes'?quoteMarkup():toolMarkup(section))+`<details class="experience-help"><summary>${txt('common.howItWorks')}</summary>${txt(`tool.${section.id}.about`,'p','class="experience-guide"')}</details>`;
  else if(section.activity) body=experienceMarkup(section)+txt(`play.${section.id}.about`,'p','class="experience-guide"');
  else if(section.id==='today') body=daily(section.route)+`<div id="memory-grid">${memoryMarkup()}</div><div id="reaction">${reactionMarkup()}</div>`;
  else if(section.id==='tools') body=toolGroups.map(group=>collection(`tools-${group.id}`,`catalog.${group.id}`,selectProducts(group.ids),section.route)).join('');
  else if(section.id==='lab') body=collection('lab-discovery','lab.discovery',discoveryCollections,section.route)+collection('lab-games','lab.games',entries.filter(entry=>entry.route.startsWith('/oyunlar/')),section.route)+collection('lab-tools','lab.tools',entries.filter(entry=>['qr','business-card','karar'].includes(entry.id)),section.route)+collection('lab-messages','lab.messages',entries.filter(entry=>['cuma','kandil','dogum-gunu','bayram'].includes(entry.id)),section.route);
  else if(section.id==='play') body=collection('collection-title','play.collection',experiences,section.route);
  if(section.tool) body+=collection('related-products','related.heading',selectProducts(relatedProducts[section.id] || []).map(entry=>({...entry,visual:false,activity:false})),section.route,continuation(owner==='lab'?'common.return':owner==='create'?'home.allCreate':'home.allTools',`/${owner}/`));
  if(section.activity) body+=collection('collection-title','play.collection',experiences.filter(entry=>entry.id!==section.id),section.route,continuation('home.allPlay','/play/'));
  return `<main id="main-content" class="container section-page${section.id==='today'?' daily-page':''}" tabindex="-1"><header class="section-intro"><p class="eyebrow">${section.creation?'LANGUAGE FORGE':`KATOVIA / ${txt(`nav.${owner}`)}`}</p>${txt(detail?section.titleKey:`section.${section.id}.label`,'h1')}${txt(detail?section.descriptionKey:`section.${section.id}.description`,'p')}</header>${body}</main>`;
}

function documentPage(section) {
  const route = section?.route || '/';
  const titleKey = section?.activity || section?.tool || section?.personal || section?.creation ? section.seoTitleKey || section.titleKey : section ? `page.${section.id}.title` : 'home.title';
  const descriptionKey = section?.activity || section?.tool || section?.personal || section?.creation ? section.metaKey || section.descriptionKey : section ? `section.${section.id}.description` : 'home.meta';
  // Paths below are relative to the source HTML, so Vite can resolve out-of-root modules.
  const sourceScript = '../'.repeat(route.split('/').filter(Boolean).length + 1) + 'src/shell/main.js';
  const schema=section?.tool||section?.activity||section?.creation?JSON.stringify({'@context':'https://schema.org','@type':section.tool||section.creation?'WebApplication':'SoftwareApplication',name:translate('en',section.creation?'forge.title':section.titleKey),description:translate('en',descriptionKey),url:`https://katovia.com${route}`,applicationCategory:section.owner==='create'?'DesignApplication':section.owner==='lab'?'EducationalApplication':section.tool?'UtilitiesApplication':'EntertainmentApplication',operatingSystem:'Web browser',isAccessibleForFree:true,inLanguage:['en','tr']}).replace(/</g,'\\u003c'):null;
  return `<!doctype html>
<!-- Generated from src/catalog/registry.js by scripts/generate-pages.mjs. -->
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title data-i18n="${titleKey}">${escape(translate('en', titleKey))}</title><meta name="description" data-i18n-content="${descriptionKey}" content="${escape(translate('en', descriptionKey))}">
  <link rel="canonical" href="https://katovia.com${route}"><meta name="robots" content="${section?.personal ? 'noindex, follow' : 'index, follow'}"><meta name="theme-color" content="#0c0e10">
  <meta property="og:type" content="website"><meta property="og:title" data-i18n-content="${titleKey}" content="${escape(translate('en', titleKey))}"><meta property="og:description" data-i18n-content="${descriptionKey}" content="${escape(translate('en', descriptionKey))}"><meta property="og:url" content="https://katovia.com${route}"><meta property="og:site_name" content="Katovia"><meta property="og:locale" data-i18n-content="seo.locale" content="en_US"><meta name="twitter:card" content="summary">
  ${schema?`<script type="application/ld+json">${schema}</script>`:''}
  ${section?.id==='beautiful-quotes'?`<link rel="stylesheet" href="${sourceScript.replace('shell/main.js','tools/quotes/style.css')}">`:''}
  ${section?.id==='alphabet-lab'?`<link rel="stylesheet" href="${sourceScript.replace('shell/main.js','tools/alphabet/style.css')}">`:''}
  <script type="module" src="${sourceScript}"></script>
</head>
<body data-page="${section?.id || 'home'}">
  ${txt('common.skip', 'a', 'class="skip-link" href="#main-content"')}
  <header class="site-header"><div class="container header-inner">
    <a class="wordmark" href="${hrefFrom(route, '/')}" data-i18n-label="common.homeLabel" aria-label="Katovia homepage"><svg class="brand-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 3v18M8 12l11-9M8 12l11 9" stroke="currentColor" stroke-width="3.5"/></svg>KATOVIA</a>
    <div class="language-control" role="group" data-i18n-label="common.language" aria-label="Language selection"><button type="button" data-locale="tr" data-i18n-label="common.tr" aria-label="Switch language to Turkish" aria-pressed="false" lang="tr">TR</button><button type="button" data-locale="en" data-i18n-label="common.en" aria-label="Switch language to English" aria-pressed="true" lang="en">EN</button></div>
    <button class="menu-toggle" type="button" aria-label="Open menu" aria-controls="primary-navigation" aria-expanded="false" data-menu-toggle>${txt('common.menu')} <span aria-hidden="true">☰</span></button>
    <nav id="primary-navigation" class="navigation" data-i18n-label="common.navigation" aria-label="Main navigation" data-navigation>${sections.map((item) => `<a class="nav-link" data-i18n="nav.${item.id}" href="${hrefFrom(route, item.route)}"${(section?.owner || (section?.activity?'play':section?.creation?'create':section?.id)) === item.id ? ' aria-current="page"' : ''}>${escape(translate('en', `nav.${item.id}`))}</a>`).join('')}<a class="nav-link" data-mystery-entry data-i18n="nav.mysteries" href="/mysteries/">Mysteries</a></nav>
  </div></header>
  ${section ? sectionPage(section) : home(route)}
  <footer class="site-footer"><div class="container footer-inner"><p class="eyebrow">KATOVIA / ${txt('common.motto')}</p><a class="footer-link" href="${hrefFrom(route, section?.id==='lab'?'/':'/lab/')}">${txt(section?.id==='lab'?'common.homeLabel':'common.return')} <span aria-hidden="true">&nbsp;↗</span></a></div></footer>
</body>
</html>
`;
}

const notFound = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>404 — Katovia</title><style>html{color-scheme:dark;background:#0c0e10;color:#f0f2ec;font:18px/1.6 system-ui}body{max-width:40rem;margin:12vh auto;padding:24px}p{color:#acb4b4}a{display:inline-flex;align-items:center;min-height:44px;color:#cdfc7b}a:focus-visible{outline:3px solid #cdfc7b;outline-offset:5px}h1{font-size:3rem}</style></head><body><main><p>404 / KATOVIA</p><h1>Bu köşe henüz yok.</h1><p>Bağlantıyı kontrol et veya ana sayfaya dön.</p><a href="/">Katovia ana sayfa</a></main></body></html>
`;
// Keep previously shared preview URLs usable without duplicating the production UI.
// Pages has no configurable HTTP redirects: meta refresh plus a query/hash-preserving JS replace.
const compatibilityPages = [{ id: '', route: '/' }, ...sections].map(({ id, route }) => ({
  path: `v2/${id ? id + '/' : ''}index.html`,
  html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Katovia — Moved</title><link rel="canonical" href="https://katovia.com${route}"><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0;url=${route}"><script>location.replace(${JSON.stringify(route)} + location.search + location.hash);</script></head><body><a href="${route}">Katovia / Devam et / Continue</a></body></html>
`
}));
const indexable = [...mysteryRoutes, '/', ...sections.map(entry=>entry.route), ...experiences.map(entry=>entry.route),...toolPages.map(entry=>entry.route),...creations.map(entry=>entry.route)];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map(route=>`  <url><loc>https://katovia.com${route}</loc></url>`).join('\n')}\n</urlset>\n`;
const robots='User-agent: *\nAllow: /\nDisallow: /v2/\n# Personal player pages use HTML noindex and are excluded from the sitemap.\nSitemap: https://katovia.com/sitemap.xml\n';
const pages = [...await mysteryPages(), {path:'sitemap.xml',html:sitemap},{path:'robots.txt',html:robots},{ path: 'index.html', html: documentPage() }, ...sections.map((section) => ({ path: `${section.id}/index.html`, html: documentPage(section) })), ...[...experiences,...toolPages,...personalPages,...creations].map((entry) => ({ path:`${entry.route.slice(1)}index.html`, html:documentPage(entry) })), { path: '404.html', html: notFound }, ...compatibilityPages];
for (const page of pages) {
  const path = `${siteRoot}/${page.path}`;
  const html=page.html.replace(/[ \t]+$/gm,'');
  if (process.argv.includes('--check')) {
    if (await readFile(path, 'utf8') !== html) throw new Error(`Generated page out of date: ${page.path}`);
  } else {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, html);
  }
}
console.log(`${process.argv.includes('--check') ? 'Checked' : 'Generated'} ${pages.length} static HTML entries.`);
