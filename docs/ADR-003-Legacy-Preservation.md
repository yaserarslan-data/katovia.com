# ADR 003 — Parallel v2 and explicit legacy allowlist

Status: accepted for EPIC 0B · 3 October 2026

## Decision

Production source root stays intact. V2 is separate under `site/` and `src/`, visible only at `/v2/` in local preview. Build output is `dist/`; no deployment script or workflow is introduced. A feature branch isolates the foundation work; existing untracked `tanitim/` user files are untouched and excluded from output.

`scripts/legacy-manifest.json` lists 37 specific tracked baseline files, each with category, byte count and SHA-256. It includes root index + 18 standalone legacy pages (19 HTML), 3 application JS, 6 data JS, 3 vendor files, 4 app JPEGs and 2 configuration files. No glob copy of the repository or public directory.

Build validates all source hashes before copy, copies only allowlisted files, checks output hashes, required routes, local links, allowed output names and CSS/JS budgets. Publication allowlist accepts only manifest files, seven v2 entries, the new 404 document and hashed v2 JS/CSS. `docs`, `.git`, sources, dependencies, local secrets and tanitim cannot enter the artifact through this pipeline.

## Consequences / rollback

Intentionally changing a legacy source will fail preservation until a reviewed baseline update is made. This is a safety signal, not an instruction to automatically regenerate hashes. Existing storage keys, data/vendor relative paths, `CNAME`, `app-ads.txt` and fragment router remain unchanged.

No root snapshot copy is stored beside production source and no destructive Git operation is needed. Rollback now means discard only reviewed foundation changes or use the recorded baseline `4afd0a1751905558bdc0ebf05ee5a509932f9139`; user work must not be reset or cleaned. Future deploy requires a retained known-good artifact and a separate release action.

No source symlink is allowed as a manifest file. Artifact directories and content must remain controlled local output; this is not a general-purpose filesystem publisher. Development Vite server may expose source files for debugging, so it binds localhost and must never be used as public hosting.
