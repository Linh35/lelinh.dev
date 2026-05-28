/*
 * shortcuts.js - keyboard shortcuts. Single-key navigation:
 *   t = terminal mode, s = swiss mode.
 * Dependencies: ../kernel/mode-manager.js
 * Invariants: never preventDefault unless we handled the key.
 *             Ignored when a text input is focused or when a modifier is held.
 * Non-goals: no command palette (Season 4); no chord shortcuts; no help overlay.
 */

import { setMode } from '../kernel/mode-manager.js';

window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  if (t?.matches?.('input, textarea, [contenteditable=""], [contenteditable="true"]')) return;
  if (e.key === 't') setMode('terminal');
  else if (e.key === 's') setMode('swiss');
});
