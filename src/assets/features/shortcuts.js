/*
 * shortcuts.js - keyboard shortcuts. Single-key mode switching:
 *   b = brief (the short read), d = deep (the long one).
 * Dependencies: ../kernel/mode-manager.js
 * Invariants: never preventDefault unless we handled the key.
 *             Ignored when a text input is focused or when a modifier is held.
 * Non-goals: no command palette; no chord shortcuts; no help overlay.
 */

import { setMode } from '../kernel/mode-manager.js';

const KEYS = { b: 'brief', d: 'deep' };

window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  if (t instanceof HTMLElement && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
  const mode = KEYS[e.key.toLowerCase()];
  if (!mode) return;
  e.preventDefault();
  setMode(mode);
});
