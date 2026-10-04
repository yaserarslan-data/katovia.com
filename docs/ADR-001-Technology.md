# ADR 001 — Vite + vanilla static MPA

Status: accepted for EPIC 0B · 3 October 2026

## Context

Legacy Katovia is standalone HTML/CSS/JS. The v2 product needs reusable modules, multiple real SEO pages and later lazy Canvas/Web Audio experiences. User approved Vite but excluded UI frameworks, TypeScript and premature engine abstractions.

## Decision

Use pinned Vite 8.3.2 as a development/build dependency; browser runtime is vanilla ES modules. Seven real HTML entries live under `site/v2/`. Minimal `src/shell`, `ui`, `styles`, `catalog`, `features`, `core` modules keep UI separate from future engines. Registry feeds generated static HTML, so navigation and available content remain readable without JavaScript.

No runtime npm dependency. Storage/error/share/analytics contracts are provider-independent. Unused contracts are not imported into the shell. Playwright 1.63.0 is a development-only browser QA dependency. Lockfile pins transitive packages. Node 22.12+; this environment uses 24.14.1.

Vite supports multi-page HTML builds: [official guide](https://vite.dev/guide/build). Its published Node requirements support the chosen runtime: [getting started](https://vite.dev/guide/).

## Consequences

Build and artifact verification now exist but do not change production publishing. Creative dependencies will be added only to a specific lazy experience, never shell by default. React could be reconsidered for a demonstrably complex editor in a future ADR; it is not a prerequisite for Canvas or template Creator.

The shell has design tokens and intentional placeholders, not game/duel/creator functionality. Build verifies initial CSS ≤25 KiB gzip and JS ≤80 KiB gzip; actual shell is substantially smaller. Asset byte budgets are not Web Vitals measurements.
