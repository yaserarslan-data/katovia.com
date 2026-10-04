# Cost & License Guardrail Record

## Root cutover update — 4 October 2026

The user explicitly authorized replacing only the legacy production root showcase with the tested Katovia 2.0 static MPA. Existing GitHub Pages/domain/source settings are reused. No dependency, paid API/SaaS, hosting plan, external media/font, payment method, cloud resource, billing or Blaze activation was introduced. Existing legacy assets and license notices are retained; new shell assets use the separate `katovia-assets/` path to avoid overwriting legacy assets.

## i18n update — 4 October 2026

TR/EN translation is local repository data with a custom browser module and native Intl formatting. No localization dependency, package/lockfile change, external translation API, AI service or SaaS was introduced. Publishing uses the existing public GitHub Pages site and source settings; no new hosting subscription, cloud resource, payment method, billing or Blaze activation. Media/font policy remains unchanged. The explicit deploy instruction overrides only the earlier no-deploy restriction, not cost/legacy protections.

## EPIC 2A update — 4 October 2026

No dependency or lockfile change was made for STOP AT 5.00. The game uses browser APIs, existing core modules, system fonts, text glyphs and original CSS rings/gradients. No external media, font, icon, audio or haptic service was acquired. Existing dependency license findings below remain applicable. No paid API/SaaS/hosting/payment service, cloud resource, billing account or Blaze plan was added or enabled. Build, browser QA and preview ran locally; no production deployment occurred.

Date: 3 October 2026 · Scope: EPIC 0B foundation, existing dependencies

## User guardrail

No paid API, SaaS, hosting, fee-licensed asset/font/library, payment-method-required service, Firebase/Google Cloud billing, Blaze activation, payment account or cost-generating production resource. A future solution needing such a service remains an unimplemented, separately labelled recommendation. Free credits/free tier do not override payment or billing restrictions.

Before any new dependency is added, inspect its license and transitive dependency licenses. Only commercially usable open-source packages may be used, with their attribution/notice/source-distribution conditions respected. Media must come from the existing repository or original code-generated visuals; no external image/audio/icon/media acquisition.

## Existing dependency inspection

No package was added or updated for this guardrail follow-up. Checked `package-lock.json` license metadata for all 43 package entries, including optional platform packages. Inspected installed primary-package and representative license texts in `node_modules`. Metadata inventory is not a full legal audit of every bundled third-party source; package-supplied notices remain intact.

| Package/group | Version | License | Use |
|---|---|---|---|
| Vite | 8.3.2 | MIT | Development/build only |
| @playwright/test, playwright, playwright-core | 1.63.0 | Apache-2.0 | Local QA only |
| Rolldown + platform bindings | 1.2.12 | MIT | Build toolchain |
| Lightning CSS + platform bindings | 1.33.0 | MPL-2.0 | Build toolchain; no library modification |
| Other locked transitive packages | See lockfile | MIT, Apache-2.0, ISC, BSD-3-Clause | Development dependencies |
| Existing kjua | 0.10.0 | MIT | Untouched legacy QR library; vendor license retained |

Lockfile metadata totals: MIT 25, Apache-2.0 4, MPL-2.0 12, ISC 1, BSD-3-Clause 1; no missing license field. Optional platform variants inflate the count beyond the packages installed on Windows.

The MIT grant permits commercial dealing subject to notice preservation: [MIT text](https://opensource.org/license/mit). Apache includes use/distribution rights and redistribution obligations: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). MPL permits company use; distributing MPL software or modifications requires its source/notice conditions: [Mozilla FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/). Lightning CSS is unchanged and used locally as tooling; it is not copied into the website artifact as a library. Future distribution of the toolchain itself must preserve applicable licenses/notices.

## Media and cost result

V2 uses system fonts, original inline SVG wordmark, CSS orbit/gradients and text glyphs. It fetches no external media/font/icon service. Legacy repository JPEGs and kjua/license files remain unchanged. No claims about newly clearing ownership of old assets are made; they are existing assets permitted by this instruction.

No paid service was added. No cloud project/resource, billing account, Blaze plan or payment method was created/enabled. No production deployment occurred. Build and QA ran locally. This documentation-only follow-up changes no production code, package, lockfile, artifact or user file; no application tests were rerun.
