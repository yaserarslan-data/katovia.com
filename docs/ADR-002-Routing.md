# ADR 002 — Static routes and future dynamic query entries

Status: accepted for EPIC 0B · 3 October 2026

## Decision

Use static MPA entries: `/v2/`, `/v2/today/`, `/v2/play/`, `/v2/challenge/`, `/v2/create/`, `/v2/tools/`, `/v2/lab/`. Every route has an actual `index.html`; no history SPA router. Relative links and Vite `base: './'` preserve section navigation at nested preview paths. Preview is a plain localhost static server, not Vite's history fallback. Unknown routes return HTTP 404 with a useful error document.

All v2 preview pages have static `noindex, nofollow`. No canonical to a nonexistent production v2 page; no personal OG promises. Root `/index.html` remains legacy. Do not add redirects or dynamic `/d/{id}` and `/p/{id}` at this milestone.

## GitHub Pages boundary

GitHub Pages can serve real files and a custom [404 page](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site); it does not provide arbitrary application rewrites. A client 404 workaround still begins with a 404 response and cannot guarantee personal Open Graph cards. Future Pages-based dynamic links should use real `/d/?id=...` and `/p/?id=...` entries with client data loading. Neither entry is implemented now. Exact clean dynamic URLs or server-rendered personal cards require a separate hosting/edge decision before DUEL.

Pages publishing settings are not verified by this change. No Actions workflow or deploy source switch was added. [Publishing source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Legacy fragments

Keep existing root fragment router byte-for-byte. `#ana-sayfa`, `#uygulamalar`, `#laboratuvar`, `#oyunlar`, `#kodlar`, `#gizlilik` retain their existing views. Runtime QA confirmed `#iletisim` is not in legacy `validRoutes` and already normalizes to `#ana-sayfa`, despite a placeholder in `routeContent`. Preserve that behavior; do not silently fix it in foundation. This refines the EPIC 0 inventory without modifying its approved report.

At a future root cutover, a documented fragment adapter can map tools to TOOLS and previous projects to LAB. Fragments are not sent to the server; static hosting cannot independently HTTP-redirect them.
