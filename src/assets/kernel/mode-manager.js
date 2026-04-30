/*
 * mode-manager.js — owns <html data-mode>. Persists to localStorage['mode'].
 * Wraps the swap in a View Transition with reduced-motion fallback. Emits 'mode:change'.
 * Dependencies: ./event-bus.js
 * Invariants: data-mode is set inline in <head> before first paint by every
 *             page; this module reads that initial value and only writes it
 *             when setMode runs. localStorage failures are non-fatal.
 * Non-goals: no UI (mode-indicator owns that); no scheduling; no per-mode
 *            preference beyond name.
 */

import { bus } from './event-bus.js';

export const MODES = ['terminal', 'swiss'];
const KEY = 'mode';

function withTransition(fn) {
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(fn);
  else fn();
}

export function getMode() {
  const m = document.documentElement.getAttribute('data-mode');
  return MODES.includes(m) ? m : 'swiss';
}

export function setMode(name) {
  if (!MODES.includes(name) || name === getMode()) return;
  withTransition(() => {
    document.documentElement.setAttribute('data-mode', name);
    try { localStorage.setItem(KEY, name); } catch {}
    bus.emit('mode:change', name);
  });
}

export function init() { bus.emit('mode:change', getMode()); }
