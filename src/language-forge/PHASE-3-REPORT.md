# Language Forge — Phase 3 local completion report

Production has not changed. No commit, push or deployment was performed.

1. **Public architecture:** A real generated static entry mounts a lazy client
   module only when `[data-forge]` exists. Engine packages remain pure. UI state
   and DOM rendering are separate from lexical/grammar generation. Listener and
   i18n subscription disposal follows the existing pagehide/pageshow lifecycle;
   an in-memory WeakMap retains a bfcache session, without persistent storage.

2. **Files:** New Phase 3 files are `src/catalog/creations.js`,
   `src/features/language-forge.js`, `src/language-forge/ui/{messages,markup,
   model,client}.js`, `src/language-forge/ui/style.css`,
   `site/create/language-forge/index.html`, `tests/language-forge-ui.test.mjs`,
   `tests/browser/language-forge.spec.js`, and this report. Modified files are
   `scripts/{generate-pages,check-artifact,check-dev}.mjs`, `vite.config.js`,
   `src/i18n/messages.js`, `src/shell/main.js`, `site/create/index.html`,
   `site/sitemap.xml`, and `tests/seo.test.mjs`.

3. **Route:** `/create/language-forge/`. The local artifact preview is
   `http://127.0.0.1:4173/create/language-forge/`. It loads directly without SPA
   fallback. Local build now generates 63 static entries.

4. **CREATE:** A card links to Forge with the requested descriptive copy and
   CTA. Existing Quiz remains on the same page and its draft, preview, share
   and friend journey browser regressions pass. No global navigation item was
   added.

5. **Hero:** TR “Kendi diline biçim ver.” / EN “Shape your own language.”
   Supporting copy uses the requested natural TR/EN text. No AI claim or long
   marketing section was added.

6. **Presets:** Four native radio cards, Flowing/Crisp/Rhythmic/Clustered, have
   descriptions and explicitly decorative sound sketches. Flowing is default.
   Selection has native checked state, border and check mark; arrow keys work.

7. **Length:** Native Short/Balanced/Long radio controls; Balanced is default.

8. **Advanced rules:** Closed native details disclosure; selects show full
   localized order examples, adjective position and morphology. Preset grammar
   recommendations update until a user changes grammar. Once customized, later
   preset choices preserve all chosen grammar values.

9. **Generation:** “DİLİMİ OLUŞTUR” / “FORGE MY LANGUAGE” produces a native
   crypto 16-byte seed, calls e1/d1/g1 and immediately presents results. There
   is no fake delay, network call, external randomness or worker.

10. **Identity:** The generated name is a large h2, followed by preset/length/
    order summary and the first example sentence plus localized meaning. Full
    seed and optional short display fingerprint are not exposed in this phase.

11. **Quick words:** Water, fire, moon, sun, see and love resolve through
    semantic IDs and current locale labels, displaying actual generated roots.

12. **Dictionary:** All 64 entries are reachable, searchable by roots or either
    TR/EN meaning, with 10 categories plus All. Search/filter state survives
    locale changes. Definition lists form compact desktop pairs and single
    mobile rows; no editing/reroll controls exist.

13. **Grammar:** Ten small cards cover order, adjective placement and eight
    markers. Text follows the resolved particle/suffix strategy. Suffix cards
    show actual root, suffix and optional linking-sound analysis from tokens.

14. **Sentences:** All 12 controlled frames display translated meaning,
    generated surface and native “Nasıl kuruldu?” / “How was it built?”
    disclosure. Tokens and decomposition come from engine analysis, not string
    parsing. Period/question mark is added only by the presentation helper.

15. **Reset/change rules:** Change rules returns to setup while retaining the
    previous package. Grammar-only regeneration preserves its seed and roots.
    Preset/length changes draw a new seed. Create another language resets
    in-memory result, defaults, filters and custom state, without confirmation.
    Refresh starts fresh; no save/share/export placeholders are shown.

16. **Errors:** Controlled engine errors map to one recoverable localized
    message, never raw codes. Tests inject all four error types through the
    client generator seam and verify localized output and usable setup.

17. **Locale:** Existing Katovia i18n translates controls, meanings, metadata
    and explanations. Seed, name, roots, marker/config, canonical sentence
    surfaces and result state stay unchanged. Tests also retain search/filter
    and open sentence disclosure in both switch directions.

18. **Accessibility:** Native fieldsets/legends/radios/selects/details,
    visible focus, comfortable labels/buttons, semantic heading hierarchy,
    definition-list dictionary/analysis, short status live region and result
    heading focus after explicit generation. Existing reduced-motion handling
    is respected; no animation or smooth-scroll dependency was introduced.

19. **Responsive QA:** 360, 390, 430, 768, 1024 and 1440 pixel widths pass
    horizontal-overflow checks. Setup and result mobile/desktop screenshots
    were inspected. A preset layout specificity problem found in visual QA
    was corrected only within Forge CSS and the responsive test rerun passed.

20. **SEO:** Canonical is `https://katovia.com/create/language-forge/`.
    Public index/follow, unique TR/EN title/description, OG metadata, truthful
    WebApplication schema and sitemap entry are present. The existing shared
    URL/client-locale architecture is retained; no separate `/tr/` Forge route
    or artificial hreflang pair was created. English static metadata changes
    to Turkish with the existing locale system. No ratings or cloud/AI claims.

21. **Bundle:** Feature client (including its private engine/data) is 26,798
    raw bytes / 10,070 gzip bytes (~9.83 KiB). Feature CSS is 4,583 raw /
    1,244 gzip bytes (~1.21 KiB). Registry/UI translation strings join the
    existing shared i18n bundle; the engine/client does not load on CREATE.
    Build aggregate gzip budgets pass (JS 72,842; CSS 11,185 bytes). These are
    artifact sizes, not measured network timings or physical-mobile performance.

22. **Verification:** 90/90 Node tests; 16/16 relevant browser tests (Forge,
    CREATE Quiz and shared i18n); build, publication allowlist, byte-for-byte
    legacy preservation and Vite dev/mobile Forge smoke passed. Following the
    CSS correction, the responsive/network test passed again on the final build.
    Runtime request test observed zero external requests. No-JS static hero
    and honest JavaScript requirement remain readable. This was local QA only.

23. **Frozen output:** Phase 1 and Phase 2 engine/data/fixtures were not
    changed. All lexical and grammar goldens pass, including Neniru, Kankik,
    Tapi and Blobredra with their original roots and full grammar analyses.

24. **Scope/decisions:** No functional deviation. Optional display ID omitted;
    canonical grammar and lexical output remain separate from presentation
    punctuation. No new dependency, backend, paid service, font, graphic or
    analytics integration. CNAME, app-ads.txt, legacy source, existing tools/
    games/Quiz and protected tanitim files were not changed; tanitim hashes
    match their initial values. Existing global locale preference persistence
    is retained; Forge itself has no storage integration.

25. **Phase 4:** Still unimplemented: save/projects, word edit/reroll, rename,
    import/export, URL codec/share/copy and receiver mode. A future authorized
    spec must define patch/replay contracts, validation/error UX, persistence
    limits and marker changes after edits before adding these actions.
