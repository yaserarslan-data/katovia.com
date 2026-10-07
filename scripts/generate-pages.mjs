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
import { tools } from '../src/catalog/tools.js';
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
  return `<a class="section-card" data-card-id="${entry.id}" href="${hrefFrom(route, entry.route)}">
        ${entry.visual?`<svg class="tool-visual" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="5" y="5" width="38" height="38" rx="8" stroke="currentColor" stroke-width="2"/><path d="${entry.id==='image-compressor'?'M12 32l8-10 7 6 5-8 5 12M16 15h4':entry.id==='lucky-draw'?'M24 12v24M12 24h24M16 16l16 16M32 16L16 32':'M16 8v32M24 8v32M32 8v32M8 16h32M8 24h32M8 32h32'}" stroke="currentColor" stroke-width="2"/></svg>`:''}
        ${entry.activity?`<div class="code-art code-art-${entry.id}" aria-hidden="true"></div>`:''}
        <div class="section-card-top">${txt(`common.${entry.type}`, 'span', 'class="eyebrow"')}<span class="card-arrow" aria-hidden="true">↗</span></div>
        ${txt(entry.titleKey || `entry.${entry.id}.title`, heading)}${txt(entry.descriptionKey || `entry.${entry.id}.description`, 'p')}
        <div class="section-card-bottom"><span class="pill">${statusLabel(entry.status)}</span></div>
      </a>`;
}

function daily(route, isHome = false) {
  return gameMarkup();
}

function home(route) {
  return `<main id="main-content" class="container has-daily" tabindex="-1">
    <section class="hero" aria-labelledby="home-title"><div class="hero-top">${txt('home.eyebrow', 'p', 'class="eyebrow"')}<span class="pill"><span class="status-dot" aria-hidden="true"></span>${txt('home.preview')}</span></div>
      <h1 id="home-title">${txt('home.play')}<br>${txt('home.something')}</h1>
      <div class="hero-bottom">${txt('home.description', 'p')}${txt('common.motto', 'span', 'class="index-label"')}</div>
    </section>
    <section aria-labelledby="home-daily"><div class="section-heading">${txt('nav.today','h2','id="home-daily"')}${txt('home.dailyHint','span','class="eyebrow"')}</div>${daily(route,true)}<div class="daily-links"><a class="button" href="/today/#memory-grid" data-i18n="memory.title">MEMORY GRID</a><a class="button" href="/today/#reaction" data-i18n="reaction.title">REACTION</a><a class="button" href="/today/" data-i18n="home.allDaily">ALL DAILY GAMES</a></div></section>
    <section aria-labelledby="home-play"><div class="section-heading">${txt('home.playNow','h2','id="home-play"')}${txt('home.now','span','class="eyebrow"')}</div><div class="section-grid">${experiences.map(entry=>card(entry,route)).join('\n')}</div></section>
    <section class="home-cta" aria-labelledby="home-create">${txt('home.create','h2','id="home-create"')}${txt('home.createCopy','p')}<a class="button button-accent" href="/create/" data-i18n="creator.own">CREATE YOUR OWN</a></section>
    <section class="home-cta" aria-labelledby="home-challenge">${txt('home.challenge','h2','id="home-challenge"')}${txt('home.challengeCopy','p')}<a class="button" href="/challenge/" data-i18n="duel.own">CREATE A CHALLENGE</a></section>
    <section aria-labelledby="home-tools"><div class="section-heading">${txt('home.tools','h2','id="home-tools"')}${txt('home.browserOnly','span','class="eyebrow"')}</div><div class="section-grid">${tools.map(entry=>card(entry,route)).join('\n')}</div></section>
    <section class="home-cta"><h2 data-i18n="nav.mysteries">Mysteries</h2><p data-i18n="mysteries.discovery">Claims, evidence and open questions.</p><a class="button" data-mystery-entry data-i18n="mysteries.explore" href="/mysteries/">Explore the research cases</a></section>
    <section id="laboratuvar" aria-labelledby="home-lab"><div class="section-heading">${txt('lab.collection','h2','id="home-lab"')}<a class="button" href="/lab/" data-i18n="common.return">Explore the lab</a></div><div class="section-grid">${entries.filter(entry=>['qr','golf','yuk-ustasi'].includes(entry.id)).map(entry=>card(entry,route)).join('\n')}</div></section>
  </main>`;
}

function sectionPage(section) {
  const available = section.tool || section.id==='tools' ? tools.filter((entry)=>entry.id!==section.id) : section.id === 'play' || section.activity ? experiences.filter((entry)=>entry.id!==section.id) : section.id==='lab'?entries:entries.filter((entry) => entry.type === section.type);
  return `<main id="main-content" class="container section-page${section.id === 'today' ? ' daily-page' : ''}" tabindex="-1">
    <header class="section-intro"><p class="eyebrow">KATOVIA / ${txt(`nav.${section.id==='d' ? 'challenge' : section.personal ? 'create' : section.tool ? 'tools' : section.activity ? 'play' : section.id}`)}</p>${txt(section.activity || section.tool || section.personal ? section.titleKey : `section.${section.id}.label`, 'h1')}${txt(section.activity || section.tool || section.personal ? section.descriptionKey : `section.${section.id}.description`, 'p')}</header>
    ${section.id==='d' ? duelMarkup('play') : section.personal ? creationMarkup() : section.id==='create' ? creatorMarkup()+txt('section.create.note','p') : section.id==='challenge' ? `${duelMarkup()}<section class="activity-panel">${txt('challenge.heading','h2')}${txt('challenge.guide','p')}<a class="button" href="/today/#reaction" data-i18n="challenge.train">Try Reaction Daily</a><p>${txt('challenge.future')}</p></section>` : section.tool ? toolMarkup(section)+txt(`tool.${section.id}.about`,'p','class="experience-guide"') : section.activity ? experienceMarkup(section) + txt(`play.${section.id}.about`, 'p', 'class="experience-guide"') : section.id === 'today' ? daily(section.route) + `<div id="memory-grid">${memoryMarkup()}</div><div id="reaction">${reactionMarkup()}</div>` : ['play','tools'].includes(section.id) ? '' : `<div class="placeholder"><span class="pill">${statusLabel(section.status)}</span>${txt(`section.${section.id}.note`, 'p')}</div>`}
    ${available.length ? `<section aria-labelledby="collection-title"><div class="section-heading">${txt(section.id === 'tools' || section.tool ? 'tools.collection' : section.id === 'play' || section.activity ? 'play.collection' : 'lab.collection', 'h2', 'id="collection-title"')}<span class="eyebrow"><span>${available.length}</span> ${txt('common.projects')}</span></div><div class="section-grid">${available.map((entry) => card(entry, section.route)).join('\n')}</div></section>` : ''}

    ${section.id === 'lab' ? `<p class="legacy-note">${txt('lab.legacyIntro')} <a href="${hrefFrom(section.route, '/lab/')}" data-i18n="lab.legacyLink">${escape(translate('en', 'lab.legacyLink'))}</a>.</p>` : ''}
  </main>`;
}

function documentPage(section) {
  const route = section?.route || '/';
  const titleKey = section?.activity || section?.tool || section?.personal ? section.seoTitleKey || section.titleKey : section ? `page.${section.id}.title` : 'home.title';
  const descriptionKey = section?.activity || section?.tool || section?.personal ? section.descriptionKey : section ? `section.${section.id}.description` : 'home.meta';
  // Paths below are relative to the source HTML, so Vite can resolve out-of-root modules.
  const sourceScript = '../'.repeat(route.split('/').filter(Boolean).length + 1) + 'src/shell/main.js';
  const schema=section?.tool||section?.activity?JSON.stringify({'@context':'https://schema.org','@type':section.tool?'WebApplication':'SoftwareApplication',name:translate('en',section.titleKey),description:translate('en',descriptionKey),url:`https://katovia.com${route}`,applicationCategory:section.tool?'UtilitiesApplication':'EntertainmentApplication',operatingSystem:'Web browser',isAccessibleForFree:true,inLanguage:['en','tr']}).replace(/</g,'\\u003c'):null;
  return `<!doctype html>
<!-- Generated from src/catalog/registry.js by scripts/generate-pages.mjs. -->
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title data-i18n="${titleKey}">${escape(translate('en', titleKey))}</title><meta name="description" data-i18n-content="${descriptionKey}" content="${escape(translate('en', descriptionKey))}">
  <link rel="canonical" href="https://katovia.com${route}"><meta name="robots" content="${section?.personal ? 'noindex, follow' : 'index, follow'}"><meta name="theme-color" content="#0c0e10">
  <meta property="og:type" content="website"><meta property="og:title" data-i18n-content="${titleKey}" content="${escape(translate('en', titleKey))}"><meta property="og:description" data-i18n-content="${descriptionKey}" content="${escape(translate('en', descriptionKey))}"><meta property="og:url" content="https://katovia.com${route}"><meta property="og:site_name" content="Katovia"><meta property="og:locale" data-i18n-content="seo.locale" content="en_US"><meta name="twitter:card" content="summary">
  ${schema?`<script type="application/ld+json">${schema}</script>`:''}
  <script type="module" src="${sourceScript}"></script>
</head>
<body data-page="${section?.id || 'home'}">
  ${txt('common.skip', 'a', 'class="skip-link" href="#main-content"')}
  <header class="site-header"><div class="container header-inner">
    <a class="wordmark" href="${hrefFrom(route, '/')}" data-i18n-label="common.homeLabel" aria-label="Katovia homepage"><svg class="brand-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 3v18M8 12l11-9M8 12l11 9" stroke="currentColor" stroke-width="3.5"/></svg>KATOVIA</a>
    <div class="language-control" role="group" data-i18n-label="common.language" aria-label="Language selection"><button type="button" data-locale="tr" data-i18n-label="common.tr" aria-label="Switch language to Turkish" aria-pressed="false" lang="tr">TR</button><button type="button" data-locale="en" data-i18n-label="common.en" aria-label="Switch language to English" aria-pressed="true" lang="en">EN</button></div>
    <button class="menu-toggle" type="button" aria-label="Open menu" aria-controls="primary-navigation" aria-expanded="false" data-menu-toggle>${txt('common.menu')} <span aria-hidden="true">☰</span></button>
    <nav id="primary-navigation" class="navigation" data-i18n-label="common.navigation" aria-label="Main navigation" data-navigation>${sections.map((item) => `<a class="nav-link" data-i18n="nav.${item.id}" href="${hrefFrom(route, item.route)}"${section?.id === item.id ? ' aria-current="page"' : ''}>${escape(translate('en', `nav.${item.id}`))}</a>`).join('')}<a class="nav-link" data-mystery-entry data-i18n="nav.mysteries" href="/mysteries/">Mysteries</a></nav>
  </div></header>
  ${section ? sectionPage(section) : home(route)}
  <footer class="site-footer"><div class="container footer-inner"><p class="eyebrow">KATOVIA / ${txt('common.motto')}</p><a class="footer-link" href="${hrefFrom(route, '/lab/')}">${txt('common.return')} <span aria-hidden="true">&nbsp;↗</span></a></div></footer>
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
const indexable = [...mysteryRoutes, '/', ...sections.map(entry=>entry.route), ...experiences.map(entry=>entry.route),...tools.map(entry=>entry.route)];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map(route=>`  <url><loc>https://katovia.com${route}</loc></url>`).join('\n')}\n</urlset>\n`;
const robots='User-agent: *\nAllow: /\nDisallow: /v2/\n# Personal player pages use HTML noindex and are excluded from the sitemap.\nSitemap: https://katovia.com/sitemap.xml\n';
const pages = [...await mysteryPages(), {path:'sitemap.xml',html:sitemap},{path:'robots.txt',html:robots},{ path: 'index.html', html: documentPage() }, ...sections.map((section) => ({ path: `${section.id}/index.html`, html: documentPage(section) })), ...[...experiences,...tools,...personalPages].map((entry) => ({ path:`${entry.route.slice(1)}index.html`, html:documentPage(entry) })), { path: '404.html', html: notFound }, ...compatibilityPages];
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
