# Zero-headache cleanup Phase 1 and Beautiful Quotes restoration

## Product and content

- Canonical route: `/lab/guzel-sozler/`; linked from home, LAB and TOOLS.
- `/laboratuvar/guzel-sozler.html` remains a working compatibility URL, forwarding query and hash to the canonical reader.
- TR/EN interface uses the existing locale model; all 50 original Turkish quote texts and IDs remain unchanged. English UI explicitly explains that the texts are Turkish.
- The original 20 `source: user` quotes are explicitly `rightsStatus: review`. The 30 existing `source: katovia` records retain their declared first-party origin. This milestone does not clear rights or rewrite quotes.
- Single/all/favorites, category filters, previous/next/random, copy/share/manual fallback, saved favorites, and the previous five-item history storage key are supported. No backend or account. Fifty static quotes remain readable without JavaScript.

## Reference graph and removals

Baseline: `61eaacfcb2a760af2330ab34f7152b4592b1eb8e`.

- The audited old cohort comprises 84 JS and 8 CSS files. Its 257 internal reference edges form a closed cohort: no remaining baseline served file references these 92 paths. All 92 are explicitly retired in `scripts/cleanup-phase1-retirements.json`.
- Four JPEGs have no incoming production references: `assets/apps/balonlubum.jpg`, `iletisim-analizi.jpg`, `kare-savaslari.jpg`, `mental-detox.jpg`. They are removed from source and publication. The unused archived root showcase's four image values use its existing text-glyph fallback; current/legacy live routes do not depend on them.
- `laboratuvar/vendor/kjua-0.10.0.min.js`, `kjua-LICENSE.txt`, and vendor `README.md` are removed only after both QR consumers use the new encoder.
- Total explicit public retirements: 99 paths. The manifest documents every path and the authorization for changed legacy files. CNAME, app-ads, unrelated legacy pages, datasets and their checks remain protected.
- The immediately preceding release's 15 obsolete JS chunks remain available for cached HTML and already-open sessions. This is separate from the 92 older retired files. Their existing import graph remains intact. Some contain the previous Vite preload polyfill/helper; the shared runtime license notice covers this cohort too. Future retirement requires a separate cache compatibility window.
- New QR/controller script URLs use `?v=cleanup1` to avoid pairing cached old controller code with the new encoder. No force push or history rewriting. Rollback retains all previous bytes, assets and notices.

## First-party QR

`laboratuvar/js/katovia-qr.js` independently implements QR Model 2 byte mode, versions 1–40, M correction (the existing product setting), Reed–Solomon block parity/interleaving, alignment/timing/finder patterns, BCH format/version bits, eight masks and penalties, UTF-8 ECI 26, a minimum four-module quiet zone, equal integer-pixel Canvas modules and SVG rendering.

The mathematical parameters are QR format facts. No copied third-party implementation, library, PDF, table document, font or image is shipped. No dependency was added.

The two existing tools retain URL, plain text/phone payloads, Wi-Fi, WhatsApp, vCard, QR PNG and business-card PNG/VCF behavior. SVG is an encoder renderer, not a new export UI.

Verification includes all 40 versions against the previous independently implemented encoder, loaded only into test memory from Git history where its original notice remains intact. UTF-8, capacity, masks and repaired data are tested. Existing local OpenCV independently decodes actual browser PNG outputs and the complete downloaded business card; it is not a repository/runtime dependency. The older OpenCV locator misses one valid vCard mask, while its existing ArUco locator successfully finds and decodes it. ECI warnings from OpenCV are recorded despite exact decoded-text matches.

Physical phone-camera scanning was not available. These results are not claimed as complete real-device certification.

## Vite runtime result

- Vite and all build/test packages/lockfile are unchanged.
- The module-preload polyfill is disabled in the new build. The lazy dynamic-import/CSS preload helper is KEEP because it loads extracted route CSS and propagates module/style failures safely. Removing it without an equivalent CSS loader would risk behavior changes.
- A distributed MIT notice is provided at `/katovia-assets/vite-runtime-LICENSE.txt`, with a build banner referring to it. It applies only to the generated Vite code, not to first-party Katovia application code. There is no public UI source/license section.
- Native imports/lazy CSS/direct-load/refresh are tested with browser module-preload support disabled. Safari 16 remains the build target. Real Safari/WebKit is unavailable on this Windows host; no actual Safari pass is claimed.

## QA and publication

Production build and publication allowlist checks protect all unrelated legacy files. Node tests include unchanged Mysteries source/parity and explicit legacy-manifest authorization checks. Browser QA covers TR/EN state, mobile/desktop widths, quotes and storage denial, actual downloads, QR/Card decoding, no-JS, canonical/sitemap, direct routes, console errors and zero external runtime requests. Development smoke includes the restored reader and both legacy QR consumers.

Pre-deploy validation: production build passed, 61/61 Node tests passed, 83/83 Chrome browser tests passed, development smoke passed. Real-device QR and actual Safari/WebKit remain untested as stated above.

The existing Pages flow verifies the complete publication bytes, runs root/tools/Mysteries/Alphabet/cleanup/legacy live smoke, checks all 99 retired paths for 404, and automatically restores an exact-tree forward rollback on failure. Deployment identifiers and final build/live status are recorded by `.cache/releases/Cleanup1/plan.json` and reported to the user after verification.

Mysteries content/original HTML, analytics no-op, dependencies, CNAME, app-ads and Pages settings are unchanged. `tanitim/` remains untracked, hash-unchanged and excluded from publication. No API, paid service, backend, media acquisition or hosting resource is introduced.
