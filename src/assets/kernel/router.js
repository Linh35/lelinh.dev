/*
 * router.js - same-origin click intercept. Fetches target HTML, swaps <main>,
 * updates history, emits 'route:change'. Wraps the swap in
 * document.startViewTransition with a synchronous fallback.
 * Hover-prefetches via <link rel="prefetch">.
 * Dependencies: ./event-bus.js
 * Invariants: only intercepts plain left-clicks on same-origin links without
 *             modifier keys, target=_blank, or download attribute.
 *             popstate replays the swap so back/forward feel native.
 * Non-goals: no nested layouts; no scroll restoration beyond reset; no
 *            external links; no async route guards.
 */

import { bus } from './event-bus.js';

const prefetched = new Set();

export function init() {
  document.addEventListener('click', onClick);
  document.addEventListener('mouseover', onHover, { passive: true });
  window.addEventListener('popstate', () => navigate(location.pathname + location.search, { push: false }));
  bus.emit('route:change', location.pathname);
}

function onClick(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href]');
  if (!a) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  if (a.target === '_blank' || a.hasAttribute('download')) return;
  const href = a.getAttribute('href');
  if (href.startsWith('#') || href.startsWith('mailto:')) return;
  e.preventDefault();
  navigate(url.pathname + url.search + url.hash);
}

function onHover(e) {
  const a = e.target.closest?.('a[href]');
  if (!a) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  if (prefetched.has(url.pathname)) return;
  prefetched.add(url.pathname);
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url.pathname;
  document.head.appendChild(link);
}

async function navigate(target, { push = true } = {}) {
  let html;
  try {
    const res = await fetch(target, { headers: { Accept: 'text/html' } });
    if (!res.ok) throw new Error(res.status);
    html = await res.text();
  } catch {
    location.assign(target); return;
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const nextMain = doc.querySelector('main');
  const nextTitle = doc.querySelector('title')?.textContent;
  if (!nextMain) { location.assign(target); return; }

  const swap = () => {
    document.querySelector('main')?.replaceWith(nextMain);
    if (nextTitle) document.title = nextTitle;
    if (push) history.pushState({}, '', target);
    window.scrollTo(0, 0);
    bus.emit('route:change', location.pathname);
  };

  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.startViewTransition(swap);
  } else {
    swap();
  }
}
