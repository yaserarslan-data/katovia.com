# KATOVIA 2.0 — ROOT CUTOVER RESULT

## Status

COMPLETE — root cutover published and live QA verified on 4 October 2026. Explicit user authorization replaces the old root showcase, while preserving other legacy paths and cost constraints.

## Routes and Behavior

New production entry points: `/`, `/today/`, `/play/`, `/challenge/`, `/create/`, `/tools/`, `/lab/`, each with real static HTML for direct loading and refresh. Root shows the new shell immediately, without a preview redirect. PLAY/CHALLENGE/CREATE remain honest planned-feature pages; no new feature implementation was added.

TR/EN and STOP AT 5.00 operate on root and TODAY. Existing `katovia:v2:locale` and daily ledger keys/version are unchanged, so origin-local preferences/results/streaks survive the path migration. Game version and numbering epoch `2026-10-04` remain unchanged. Share URL is `https://katovia.com/today/`; preview wording was removed from UI, titles, descriptions and share text. Active public root/TODAY/TOOLS/LAB have indexable metadata and root canonical URLs; planned pages retain noindex/follow. No locale SEO rollout.

Old `/v2/` and six section entry points now forward to root equivalents, preserving query/hash with JS and using meta refresh/link without JS. GitHub Pages cannot provide configurable server redirects here, so compatibility documents return HTTP 200 rather than 301. Existing hashed preview assets remain retained in the publication tree for already-open documents/caches.

## Legacy Preservation

The manifest is unchanged. All 37 legacy source fixtures still validate. Build explicitly replaces only artifact `index.html`; the other 36 allowlisted paths retain exact bytes, including 18 game/tool HTML pages, app JS, vendor, data, legacy assets, CNAME and app-ads.txt. Live served bytes are compared to Git blobs because Windows worktree CRLF differs from production LF. CNAME is Pages configuration and not a publicly served file; its value/source/domain are verified via API.

The release tree inherits the complete previous production tree, retaining all other tracked/direct paths rather than deleting files absent from `dist`. No legacy asset directory collision: new shell code is under `katovia-assets/`. The old showcase root is retained in source/history and the rollback artifact, not served as the production home. Legacy-return footer links now lead to LAB. `tanitim/` files remain untouched and excluded from staging/publication.

## Implementation

Updated route registry, static page generator, Vite MPA inputs/asset path, share URL/production copy, explicit root-cutover preservation exception, artifact validator, dev smoke and existing route/i18n/game tests. Added `tests/browser/cutover.spec.js` for old-link compatibility and existing locale/ledger migration. Seven root source entries are generated under `site/`; seven existing `site/v2/` entries are compatibility documents. Static branded 404 is included.

## Pre-deploy QA

`npm run qa` passed: **27 Node tests, 32 Chrome browser tests, development smoke**. Coverage includes root direct load/refresh, static 404, canonical links, all legacy HTTP/byte checks, navigation, TR/EN, storage migration, timer/state/lifecycle, share root URL, query/hash forwarding, no-JS compatibility, mobile widths 360/390/430 and tablet/desktop layouts. Mobile screenshot visually inspected. Physical Safari/device/screen-reader testing was not performed.

Current live baseline also passed before publication: 45 served files (legacy root + 35 other public legacy files + 9 existing v2 files) matched the prior production commit, with CNAME separately verified. Live Chrome opened all 18 legacy game/tool HTML URLs without runtime errors, exercised QR generation, and verified existing v2 routes/TR/EN. Retained rollback artifact passed local Chrome for old root, previous v2 and QR.

## Performance, Cost and License

JS gzip **10,202 bytes**; CSS **3,622 bytes**. Raw JS 27,615 / Brotli 8,833; raw CSS 14,318 / Brotli 3,163. Within 80 KiB JS / 25 KiB CSS budgets. No dependency/lockfile change, external media/font/translation provider, paid API/SaaS/new hosting or payment requirement. Existing public GitHub Pages/domain/source reused; no cloud/billing/Blaze/resource activation.

## Release and Rollback

Known-good production commit: `95afe999ae5190e31d8226a3f70866feb6cd06ab`, Pages built successfully, source `main` / `/`, domain `katovia.com`, HTTPS enforced. Live rollback bytes and baseline are retained in ignored `.cache/cutover/`; previous source/deploy history remains intact.

Candidate release is composed onto that production tree with only root/section/404/compatibility HTML and new shell assets allowed to change. A forward rollback commit with the exact known-good tree is prepared before push. Release runner verifies remote HEAD and artifact hashes before push, watches Pages build, then checks live artifact/legacy bytes, root browser QA and legacy browser QA. Failure triggers the prepared rollback, waits for Pages, and verifies the prior root/v2/legacy bytes. No force-push or destructive workspace reset.

Live root QA is necessarily post-deploy; the candidate build/local browser suite and existing live baseline passed before publication, then the new live routes were checked immediately with rollback armed.

## Final Production Evidence

- Source snapshot: `5953566ec7e06ee9369ad1095391bbe22e322b93` on `codex/katovia-v2-foundation`; final evidence is a separate documentation commit on that branch.
- Production commit: `3889775e5a3badb7acda263d0c231ea3dc4ea4d7` on `main`. Pages reported **built** for that exact commit. Only 17 reviewed artifact paths changed; no legacy path was deleted.
- Rollback commit: `6aa5f7dec039c717fc615c0d393567279cc41544`, retained locally and remotely as `codex/katovia-root-rollback`. Its tree equals the prior production tree exactly; local rollback artifact browser smoke passed. Rollback was **not required or applied** because deployment and live QA succeeded.
- Live bytes: all 17 candidate root/section/404/compatibility/asset files matched the tested artifact. All 35 public legacy files other than the replaced root matched the previous production bytes; CNAME/domain verified separately. Previous hashed v2 assets also matched and were retained.
- Live Chrome: all seven root routes loaded and refreshed directly; TR/EN choice/persistence, mobile navigation/overflow, canonical metadata, a real five-second START/STOP attempt, result persistence across root/TODAY and canonical share URL passed. Old preview query/hash links and real HTTP 404 also passed. Browser testing used an isolated context and did not change the user's browser profile or send a result to anyone.
- Post-deploy legacy Chrome: all 18 game/tool HTML URLs returned 200 with **zero runtime errors**, matching pre-deploy baseline; QR generation passed.
- Pages `main` / root source, `katovia.com` domain and HTTPS settings remain unchanged. No new service/dependency, billing/cloud activation or payment requirement. `tanitim/` hashes remain unchanged and the directory is neither staged nor published.

Public routes: [Home](https://katovia.com/), [TODAY](https://katovia.com/today/), [PLAY](https://katovia.com/play/), [CHALLENGE](https://katovia.com/challenge/), [CREATE](https://katovia.com/create/), [TOOLS](https://katovia.com/tools/), [LAB](https://katovia.com/lab/).

## Known Limits

Scores/preferences remain local and resettable; storage failure cannot persist them across reload. Old preview redirects are static 200 responses. PLAY/CHALLENGE/CREATE features were not expanded. Root cutover does not translate legacy internals or add analytics/backend/account sync. Existing root hash bookmarks now open the new shell; the former showcase hash sections have been intentionally retired.
