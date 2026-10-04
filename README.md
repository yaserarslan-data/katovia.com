# katovia.com
Official website of Katovia.

## Katovia 2.0 foundation

Legacy production sources remain at the repository root. Parallel v2 HTML lives in `site/v2/`, modules in `src/`. No production deployment is configured by this milestone.

Node.js 22.12+ (tested with 24.14.1):

```sh
npm ci
npm run dev       # http://127.0.0.1:5173/v2/ (legacy root also served)
npm run build     # dist: byte-identical legacy + seven v2 entries + 404
npm run preview   # http://127.0.0.1:4173/v2/; plain static server, no SPA fallback
npm run qa        # build + core/artifact + browser checks
```

Browser QA uses installed Chrome by default. Set `PLAYWRIGHT_CHANNEL=msedge` to test installed Edge, or install the needed browser in your own QA environment. No browser is downloaded by `npm ci`.

Registry edits go in `src/catalog/registry.js`; `npm run build` regenerates static HTML. `npm run check` detects stale generated pages. The legacy manifest in `scripts/legacy-manifest.json` is an explicit preservation contract; source hash mismatches stop the build. Updating it requires a reviewed legacy change, not an automatic refresh.

`dist/`, dependencies, npm cache and test results are ignored. `tanitim/` is existing user work and is never copied, staged or published by the build. Development servers bind only to localhost and are not production hosts.

See [EPIC 0 analysis](docs/KATOVIA_2_EPIC_0_ANALYSIS.md) and [EPIC 0B result](docs/KATOVIA_2_EPIC_0B_RESULT.md).

## First daily experience

`/v2/` and `/v2/today/` mount the same STOP AT 5.00 game. START begins a hidden monotonic timer; STOP records the first valid attempt for the UTC day. Backgrounding interrupts the attempt without consuming it. There is no practice mode. Results and motivational streaks are local to this browser; clearing storage resets them. Storage failure still allows a session result and sharing.

Daily numbering uses the temporary preview epoch `2026-10-04`. Sharing labels the experience PREVIEW and links to the existing brand homepage because v2 has not been deployed. See [EPIC 2A result](docs/KATOVIA_2_EPIC_2A_RESULT.md) for QA and limitations.

## TR / EN foundation

UI strings live in `src/i18n/messages.js`. Use `t(key, params)` for runtime text or a `data-i18n` key for static markup; use text/attribute sinks, never translated HTML. Dictionaries require matching keys. Valid saved preference wins; `tr-*` browsers start in Turkish and others in English. Selection persists through the safe versioned storage adapter. Switching translates the active UI and metadata without reloading or resetting the game. `Intl` helpers provide locale-aware numbers and UTC dates; the game's 5.00 target and raw share timing use the stable game notation.

Future Creator templates/labels/validation and Tools titles/instructions/errors should use the same key registry. Future user content may carry `contentLocale`; user-written content is not automatically translated. Locale routes, backend migration and hreflang are outside this milestone.

The i18n task explicitly authorizes additive publication of compiled `/v2/` to existing GitHub Pages while the root stays legacy. Build alone does not deploy. Source is retained on the development branch; publication commits contain only compiled `v2/` additions. Existing root 404 behavior and Pages settings stay intact. The game share URL is now `https://katovia.com/v2/today/`. See [i18n result](docs/KATOVIA_2_I18N_FOUNDATION_RESULT.md) for publication/rollback evidence; the preceding EPIC 2A paragraph records its historical pre-deploy state.
