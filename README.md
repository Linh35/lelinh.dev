# lelinh.dev — portfolio

Personal portfolio of Linh Le. Plain HTML, CSS, and ES modules — no build step, no framework, no runtime dependencies.

The site has **two reads of the same pages**, and the reader picks:

- **Brief** — the short read. Claims, numbers, and how to reach me, in one screen. Warm pastel, light, generous. This is the default.
- **Deep** — the long read. The architecture, the tradeoffs, and the operating detail restored inline. Dracula, monospace, dense.

Both reads live in the same HTML at once. `.deep-only` and `.brief-only` blocks are shown or hidden by CSS keyed on `<html data-mode>`, which means a visitor with JavaScript disabled gets *everything* rather than a broken page. Switch with the control bottom-right, or press <kbd>b</kbd> / <kbd>d</kbd>.

## Run it

```bash
node serve.js   # :3000
```

`./check.sh` runs the static verifier from the repo root.

## Architecture

Three rings. Each ring may depend on the ones inside it, never the ones outside.

1. **Kernel** (`src/assets/kernel/`)
   - `event-bus.js` — signal-style pub/sub. Topics remember their last value and replay it to new subscribers in a microtask.
   - `router.js` — same-origin click intercept. Fetches HTML, swaps `<main>`, updates history, wraps the swap in `document.startViewTransition`. Hover-prefetches via `<link rel="prefetch">`.
   - `mode-manager.js` — owner of `<html data-mode>`. Persists to `localStorage['mode']`. `setMode(name)` runs through a View Transition.

2. **Renderers** (`src/assets/modes/`) — shared custom-element shells (`<site-header>`, `<site-footer>`) with a per-mode renderer registry. Switching mode re-runs the active renderer against the same element. `nav.js` holds the link data both modes read, so the two renderers cannot drift.

3. **Features** (`src/assets/features/`) — optional, deletable without breaking the kernel.
   - `mode-indicator.js` — the always-visible depth switch, bottom-right.
   - `shortcuts.js`, `key-hint.js` — <kbd>b</kbd>/<kbd>d</kbd> switching and the hint chip.
   - `console-banner.js` — devtools welcome.

## Palette

Defined once in `src/assets/tokens/base.css` as two raw scales; mode sheets bind them to semantic roles (`--bg`, `--fg`, `--accent`, …) and introduce no hex values of their own.

- **Deep** — Dracula. Background `#282a36`, cyan `#8be9fd` leading, Monokai yellow `#e6db74` as the echo. Dracula's comment blue is lifted to `#8b98c9` so quiet labels still clear 4.5:1.
- **Brief** — warm pastel. Paper `#f6f2ec`, ink `#2b2733`, violet/teal/clay inks for text and lilac/mint/peach/sky tints for fills. Tints rotate by `:nth-child`, so a grid reads as a set without per-card classes.

## Constraints

- Vanilla HTML, CSS, ES modules. No React/Vue/Svelte/Alpine/jQuery/lit-html.
- No build step. No bundler, transpiler, minifier, preprocessor.
- Every `.js`/`.css` ≤ 150 lines, and every file opens with a header saying what it does and what it must not do.
- All imports inside `src/assets/` are relative.
- `<html data-mode>` set inline in every page's `<head>` before any stylesheet — no FOUC.
- The site is readable with JavaScript disabled.
- `prefers-reduced-motion: reduce` skips the View Transition wrap.

`./check.sh` enforces all of the above mechanically.

## Deploy

Hosted on Cloudflare Pages (project `lelinh`, custom domain `lelinh.dev`). Deploys are manual, direct-upload from the working tree — a push to GitHub does not deploy:

```bash
./deploy.sh
```

Auth is via `CLOUDFLARE_API_TOKEN` in the environment (needs Account → Cloudflare Pages → Edit), or `npx wrangler login` on a machine with a browser.
