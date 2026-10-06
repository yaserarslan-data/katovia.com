# Katovia 2.0 — Growth Priorities, 6 October 2026

Status: QA PASSED, publication pending.

## Changes

- Short portrait viewports: compact home hero/game layout at height ≤760 px; START remains ≥72 px high and fully inside 640/740/844 px viewports at widths 360/390/430 in TR/EN. At 390×740 EN, its bottom moved from ~807 to ~517 px.
- Daily results: STOP → Memory, Memory → Reaction, Reaction → Particle Universe. Completed Reaction can share a casual duel target from the saved rounded score, without another attempt or ledger write. First official result/day/streak storage and schema remain intact.
- PLAY: SHARE is next to PAUSE/mode/sound in the experience control bar, before Canvas/guide/related cards. Native/clipboard/manual and cancellation behavior retained; touch targets remain ≥44 px.
- Creator: first question precedes collapsed theme/content-language settings. The single-question remove control is hidden. UTF-8/base64url payload budget is computed during editing and on locale changes; over-limit links disable share-link creation with a clear warning while preview remains available. Deleting/shortening content restores publishing. Existing v1 draft/link compatibility and safe text rendering retained. At 390×740 EN, first question bottom is ~658 px.
- Related polish: TODAY copy/description now describes all three games; shared Daily singular streak fixed; root `#laboratuvar` alias restores existing legacy return links without editing protected legacy files.

## Verification

Full build, **40 Node / 50 Chrome tests**, development smoke passed. New tests cover 18 short-screen TR/EN combinations, share placement on all three PLAY routes, immediate Creator budget warning/recovery and preview, Unicode budget correctness, and sharing a saved Reaction target without changing the ledger. Existing tests retain first-result integrity, midnight/blur/visibility, quota/denied storage, locale, personal player journeys, real reaction signal, responsive widths, worker timeout, SEO/schema/404 and legacy preservation.

Initial UTF-8 text-generation regression was caught by the 404 browser test and corrected before the successful full QA. Final source has preserved Turkish/emoji text. No failure was published.

Visual checks: local screenshots in `.cache/growth1-qa/` confirm short home, first Creator question and Piano share bar. Physical mobile/Safari/screen-reader/OS-share tests not performed; Chrome touch/DPR emulation is described as emulation.

Performance: initial shared JS 69,972 raw / 24,671 gzip bytes; CSS 17,500 raw / 4,412 gzip. All emitted chunks combined: JS 34,590 gzip / CSS 5,691 gzip. Home estimated gzip transfer ~32.9 KB; PLAY ~34.1–34.4 KB; Creator ~34.2 KB. These are local gzip estimates, not network or field CWV guarantees. No heavy runtime dependency.

## Cost, license and preservation

No new dependency/package/lockfile change, external media/font/audio, paid API/SaaS/hosting, payment method, cloud resource, Firebase/Google Cloud billing or Blaze activation. Original CSS/DOM and existing share/model/motor APIs reused. 37 source legacy fixture hashes and 36 artifact fixtures preserved with the already-authorized root exception; CNAME/app-ads/vendor/data/assets intact. `tanitim/` remains excluded and untouched.

## Production and rollback

Release label: `Growth1`. Verified baseline production `9ffd39567ac0243be653a1276551adc1f64ac4f8`, 106 served files and known-good archive retained. `scripts/release-pages.py` prepares an artifact-only forward commit and exact-tree rollback, publishes the rollback branch before main, verifies Pages SHA/served bytes and runs live functional QA. Any build/live failure rolls forward to the known-good tree and verifies it. Publication hashes/results will be recorded after verification.

Existing casual/local limitations remain: client scores are non-authoritative; quiz links carry readable answers and are bounded; privacy/private server publication and personal dynamic OG are not implied by these UI improvements.
