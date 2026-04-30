/*
 * console-banner.js — greets visitors who open devtools. Also rebinds the
 * event bus and setMode onto window so console-exploration actually works.
 * Dependencies: ../kernel/event-bus.js, ../kernel/mode-manager.js
 * Invariants: prints exactly once per page load (browsers preserve console
 *             across soft navigations, so this script is import-once safe).
 *             Window globals are explicit; nothing else exposes them.
 * Non-goals: no analytics, no fingerprinting, no auto-running examples.
 */

import { bus } from '../kernel/event-bus.js';
import { setMode, getMode, MODES } from '../kernel/mode-manager.js';

// Expose for visitors who want to poke. Convention: console-only debug surface.
window.bus = bus;
window.setMode = setMode;
window.getMode = getMode;
window.MODES = MODES;

const lines = [
  '',
  '  hi. you opened the console.',
  '  that is appropriate.',
  '',
  '  source:  github.com/Linh35',
  '  files:   11 · lines: ~800 · deps: 0',
  '',
  '  try:     bus.on("mode:change", console.log)',
  '  or:      setMode("swiss")',
  '  also:    press t or s anywhere on the page',
  '',
].join('\n');

console.log(`%c${lines}`, 'color: #8be9fd; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; line-height: 1.5;');
