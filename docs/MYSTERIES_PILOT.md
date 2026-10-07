# Mysteries foundation and three pilots

Local implementation only; no deployment or commit is part of this milestone.

## Scope

- `/mysteries/`: English discovery index, explicitly links to Turkish full text.
- `/tr/mysteries/`: Turkish discovery index.
- `/tr/mysteries/voynich-manuscript/`
- `/tr/mysteries/antikythera-mechanism/`
- `/tr/mysteries/saksaywaman-puma-punku/`

The other eleven studies have no catalog entries, content copies or generated
routes. All original HTML files remain untouched. No dependency, external media,
paid service or production resource was added.

## Content and publication

`src/catalog/mysteries.js` owns stable IDs, curated order, scope summaries,
aliases, qualitative editorial statuses and published locale availability.
Only approved entries belong here. Research prose is not in the UI dictionary.

`src/content/mysteries/<id>/<locale>.json` contains a versioned semantic tree
organized into source sections. Native theory disclosures, lists, comparisons,
source links and special sections survive conversion. The renderer allowlists
elements and attributes and escapes all text. No raw HTML execution, inline
styles, inline events, external CSS/fonts or numeric confidence bars survive.
Citation prose and URLs are preserved in their source sections; a normalized
claim-to-source ID model is a future editorial task, not silently invented here.

`scripts/import-mysteries.py` is an intentional, one-time standard-library
importer restricted to the three approved filenames. Normal builds use the JSON,
not workspace attachments. Its SHA-256 source revisions are checked by tests.
Do not run it to overwrite reviewed edits without an explicit source update.

`scripts/mysteries.mjs` validates and renders complete static pages. Build inputs,
artifact allowlist and sitemap consume the same route registry. A dedicated
reader entry shares Katovia tokens, shell styles and navigation, without mounting
daily games or tools. The original six app sections remain their own collection.

## Language

Index labels and summaries exist in TR/EN. Full research articles currently exist
only in TR: an English wrapper is not treated as an English translation. No EN
article URL or hreflang counterpart is fabricated. Explicit URL locale takes
priority without replacing the saved global preference; explicit language-link
selection saves the preference and retains index filters.

To add a reviewed translation: provide a complete locale JSON with the same
stable section anchors, source revision and editorial translation state; add the
locale to that case's `locales`; generator/build/sitemap/alternates then follow.
Publication dates and authors must be supplied truthfully after editorial review.
The source's 2026-10-06 revision is not claimed to be a new publication date.

## UX and checks

The index is static HTML and works without JS. JS adds localized alias search,
status filters, curated/title/status sorting, validated URL state and empty results.
Desktop comparison rows become mobile cards. Filtered return links are limited
to same-origin index routes. Article previous/next uses the curated pilot order.
Print expands theory disclosures and restores the reader's state afterwards.

Required checks: build (including legacy/artifact/budget), Node checks, full browser
regression suite and dev-route check. Dedicated tests cover pilots-only scope,
source integrity, preserved sections, safe rendering, SEO, locale preference,
mobile widths, filtering/return state, printing and no-JS reading.

Before a future production release, editorial review must independently verify
sources and recent/contested claims. The pilot reader states that this verification
has not been completed. All eleven remaining files are outside this milestone.

## Verification results

- Production build: passed; 35 static entries, legacy bytes and artifact allowlist
  verified; total gzip asset sizes ~46.8 KB JS and ~8.4 KB CSS, within budgets.
- Generated-page consistency and Node tests: 47 passed.
- Browser regression: all 61 cases passed across the full run and the targeted
  rerun of cutover after updating its expected navigation for the new section.
- Vite development smoke: passed, including all five mystery routes and a
  filtered index-to-article journey.
- Mobile and desktop reader screenshots inspected; no horizontal page overflow,
  external asset requests or reader runtime errors at 360/768/1440 pixels.
- No dependency/lockfile or protected legacy file changes; no commit/deploy.
