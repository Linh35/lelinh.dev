# lelinh.dev — portfolio

Personal portfolio of Linh Le. Plain HTML, CSS, and ES modules — no build step, no framework, no runtime dependencies. Source is the product: every file opens with a header comment, every file is short, and the same content reads two different ways depending on the active mode.

## Run it

The site is in `src/`. Any static file server works:

```bash
node serve.js                            # included dev server, :3000
(cd src && python3 -m http.server 8000)  # or stdlib python
```

Then open `http://localhost:3000/` (or `:8000` for the python server).

`./check.sh` runs the static verifier from repo root.

## Three-ring architecture

1. **Kernel** (`src/assets/kernel/`) — pages depend on these directly.
   - `event-bus.js` — signal-style pub/sub. Topics remember their last value and replay it to new subscribers in a microtask.
   - `router.js` — same-origin click intercept. Fetches HTML, swaps `<main>`, updates history, wraps swap in `document.startViewTransition`. Hover-prefetches via `<link rel="prefetch">`.
   - `mode-manager.js` — owner of `<html data-mode>`. Persists to `localStorage['mode']`. `setMode(name)` runs through a View Transition.
   - `content-loader.js` — fetches `src/assets/content/{slug}.md`, parses frontmatter and a small markdown subset. Hand-written; no library.

2. **Renderers** (`src/assets/modes/`) — shared custom-element shells (`<site-header>`, `<site-footer>`) with per-mode renderer registrations. Switching mode re-runs the active renderer against the same elements.
   - **Terminal** — monospace, dark, cyan headers, yellow accents.
   - **Swiss** — editorial sans + serif, 12-column grid, large display type.

3. **Features** (`src/assets/features/`) — fully optional, deletable without breaking the kernel.
   - `mode-indicator.js` — fixed bottom-right toggle.
   - `source-snippet.js` — pulls live source excerpts into the page so claims are checkable.
   - `shortcuts.js`, `key-hint.js` — keyboard mode-toggle and the hint chip.
   - `console-banner.js` — devtools welcome.
   - `gray-scott.js`, `rd-shaders.js` — Gray-Scott reaction-diffusion sim on the landing page (idle-deferred WebGL).

## Palette

Dracula background `#282a36`. Dracula cyan `#8be9fd` and Monokai yellow `#e6db74` paired as the lead/echo accents — cyan leads in Swiss, yellow leads in Terminal. Defined once in `src/assets/tokens/base.css`; mode sheets only re-bind `--accent` and the font stack.

## Constraints

- Vanilla HTML, CSS, ES modules. No React/Vue/Svelte/Alpine/jQuery/lit-html.
- No build step. No bundler, transpiler, minifier, preprocessor.
- Every `.js`/`.css` ≤ 150 lines.
- All imports inside `src/assets/` are relative.
- `<html data-mode>` set inline in every page's `<head>` before any stylesheet — no FOUC.
- Site is readable with JavaScript disabled.
- `prefers-reduced-motion: reduce` skips the View Transition wrap.

`./check.sh` enforces all of the above mechanically.

## Deploy

Primary: served from a static host at `lelinh.dev`.
Backup: a GitHub Actions workflow (`.github/workflows/pages.yml`) publishes `src/` to GitHub Pages on every push to `master`. The `src/CNAME` file binds Pages to the same custom domain.
