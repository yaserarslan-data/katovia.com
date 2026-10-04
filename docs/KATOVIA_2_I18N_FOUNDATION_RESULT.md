# KATOVIA 2.0 — i18n FOUNDATION RESULT

## Status

Implementation and local QA COMPLETE. Production publication is prepared; final deployment evidence will be appended after live verification. The user's explicit deploy instruction supersedes the pasted brief's no-deploy clause for this task only.

## Languages

Turkish (`tr`) and English (`en`), selected through the compact TR / EN control. Brand and URLs stay unchanged. Internal quality enums, IDs, score, UTC day, versions, analytics names and storage keys remain language independent.

## Architecture

Dependency-free `createI18n`, `t`/`translate`, validated `setLocale`, subscriptions and native Intl number/date helpers. Live text, labels, metadata and active control update without reload. Dictionary values are plain strings inserted through textContent/attribute sinks, never HTML. Missing current-language keys fall back to English; missing English keys display `[key]`. Own-property/string checks exclude inherited object members. Key parity and generated-markup resolution are tested.

Keys are grouped under common, nav, home, section, page, entry, status, game, daily, share and error. Future Creator/Tools UI can add namespaces and field/validation/template keys. User-authored content is not automatically translated; future `contentLocale` metadata can describe content language without backend migration now.

## Translation Files

`src/i18n/messages.js`: both local dictionaries. `src/i18n/index.js`: API, locale store, helpers and DOM application. No external translation provider, ICU library, locale routes or SEO canonical redesign.

## Files Added

- `src/i18n/index.js`, `src/i18n/messages.js`.
- `tests/i18n.test.mjs`, `tests/browser/i18n.spec.js`.
- `docs/KATOVIA_2_I18N_FOUNDATION_RESULT.md`.

Ignored `.cache/` holds release tooling, baseline API data, known-good live artifact and publication/rollback plan. It is excluded from source staging and publication. Existing foundation files are also included in the source snapshot because they were previously uncommitted.

## Files Modified

`scripts/generate-pages.mjs`, `scripts/check-dev.mjs`, `src/catalog/registry.js`, `src/shell/main.js`, `src/shell/navigation.js`, `src/styles/shell.css`, `src/core/errors.js`, game `config.js`, `markup.js`, `mount.js`, `share.js`, seven generated `site/v2/` entries, `playwright.config.js`, existing artifact/daily/browser tests, `PROJECT_CONTEXT.md`, `README.md`, and cost/license record. Package and lockfile versions were not changed. Historical reports remain historical.

## Language Detection

Valid stored preference first; otherwise browser `tr`/`tr-*` (case insensitive) selects TR; all other or unavailable browser language selects EN. Invalid preference is ignored. Explicit choice survives navigation/reload and cannot be overridden by browser language.

## Persistence

Uses existing safe storage adapter under `katovia:v2:locale`, versioned envelope. No raw localStorage access was spread across modules. Denied/quota storage still permits an in-memory choice; a later reload returns to browser detection. Daily ledger data is unchanged and has no translated values.

## Home Integration

Navbar, menu labels, skip link, hero, section cards, status labels, collection counts, footer, page titles and meta descriptions are translated across all seven v2 routes. Legacy page internals are preserved; their catalog descriptions are localized in v2. Static HTML defaults to English for no-JS access, then updates to the detected preference when JS runs. Canonical/robots behavior stays unchanged. Existing root 404 is not republished or redesigned.

## Daily Integration

Game title, START/STOP, instructions, quality, precision, local streak, completion/interruption/rollover/storage feedback and share controls are localized. Switching during play keeps the same monotonic attempt; completed score remains identical. Numeric target/raw elapsed time keeps the game's dot notation, while the precision helper uses locale formatting. No scoring/ledger schema change. Local-only and preview-epoch limitations from EPIC 2A remain.

## Share Integration

Share header, preview label, quality, title, units and feedback use the active locale. Raw timing opt-out stays available; native/clipboard/manual fallback behavior stays accurate. Brand, tiles, day/score data and URL remain stable. With authorized additive publication, the share URL now points to `https://katovia.com/v2/today/`. The day numbering still explicitly says PREVIEW.

## Accessibility

Real 44×44 px language buttons, `aria-pressed`, meaningful translated labels, visible keyboard focus and individual language tags. `<html lang>`, menu open/close label, nav label and textarea label update. Turkish dotted/dotless letters and other special characters remain Unicode; no ASCII transform. Live game feedback updates without resetting the attempt. Screen-reader and physical-device testing were not performed.

## Mobile QA

TR/EN at 360, 390 and 430 px passed menu, active control, touch sizing and horizontal overflow checks. TR desktop/tablet checks at 768, 1024 and 1440 px also passed. Mobile TR/EN screenshots were inspected and a duplicated Turkish game title was corrected before final QA. Responsive header wraps navigation at intermediate widths. These are Chrome emulation checks, not physical Safari/iOS QA.

## Automated Tests

Final `npm run qa` passed: **27 Node tests, 30 Chrome browser tests, development smoke**, plus build/artifact checks. Tests cover detection/defaults/stored preference, both switch directions, persistence, denied storage, fallback/inherited keys/interpolation, complete dictionary parity, generated-key resolution, Intl, html lang, metadata, nav/active controls, Unicode, game/result/share language and switching mid-attempt. Existing timing/streak/lifecycle/legacy regression remains passing.

## Performance Impact

Final gzip shared JS **10,347 bytes**, CSS **3,622 bytes**. Compared with EPIC 2A: +4,940 JS / +181 CSS bytes. Raw JS 27,921; Brotli 8,963. Raw CSS 14,318; Brotli 3,163. Both are below 80 KiB JS / 25 KiB CSS budgets. Two small dictionaries ship together; no locale network request or new runtime dependency.

## Cost & License Check

External translation services: **none**. New dependencies: **none**. Paid services/payment requirements: **none**. Existing toolchain/license notices remain. No external media or font added; no Firebase/Google Cloud resource, billing account or Blaze plan. Existing public GitHub Pages is reused without settings or hosting-plan changes.

## Known Issues

- No-JS HTML remains English and interactive controls require JS.
- Storage failure loses manual locale preference after reload.
- Game scores/streaks remain local and resettable; no trusted competitive data.
- No translated legacy internals, automatic user-content translation, locale URL/hreflang, account sync or Creator implementation.
- Physical mobile/Safari/screen-reader QA and actual OS share-menu testing remain future work.

## Production Impact

Pre-deploy verification: Pages source is `main` / `/`, legacy build type, custom domain `katovia.com`, HTTPS enforced. Last successful build: `4afd0a1751905558bdc0ebf05ee5a509932f9139`. Live 36 served legacy files match that commit exactly; CNAME is intentionally not publicly served by Pages and its domain is verified through the Pages API. Source/artifact preservation covers all 37 files. Worktree CRLF and production Git-blob LF were distinguished rather than rewriting legacy files.

Only compiled `v2/` HTML/assets will be added to the existing production tree. Root HTML, games, tools, data, vendor, assets, app-ads.txt, CNAME and original 404 behavior remain unchanged. Source/docs/dependencies/test output and `tanitim/` are excluded. Both `tanitim/` files match their pre-work hashes. Known-good live bytes are retained locally, and a rollback commit with the exact prior tree is prepared before publication. Rollback uses a forward commit, never force-push/reset/clean.

## Next Recommended Step

Review the public parallel preview, then separately decide launch numbering and perform physical mobile/Safari/screen-reader QA. Locale SEO routing and new product areas remain unimplemented recommendations.
