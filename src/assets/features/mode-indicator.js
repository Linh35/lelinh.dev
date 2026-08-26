/*
 * mode-indicator.js - fixed bottom-right depth switch. Always shows both
 * choices: the whole point of the site is that the reader picks the depth,
 * and a collapsed control hides that from the person most likely to want it.
 * Dependencies: ../kernel/event-bus.js, ../kernel/mode-manager.js
 * Invariants: only one element per page; exactly one button carries
 *             aria-pressed="true"; re-renders on every mode:change so the
 *             current button stays correct after a keyboard switch too.
 *             render() rebuilds innerHTML, which destroys the focused
 *             button - focus is restored afterwards or a keyboard user is
 *             dumped back to <body> mid-interaction.
 * Non-goals: no open/close state; no keyboard binding (shortcuts.js owns
 *            that); no drag; no persistence (mode-manager owns that).
 */

import { bus } from '../kernel/event-bus.js';
import { getMode, setMode, MODES } from '../kernel/mode-manager.js';

const PITCHES = {
  brief: 'The short read: claims, numbers, and how to reach me.',
  deep: 'The long read: architecture, tradeoffs, operating detail.',
};

class ModeIndicator extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'group');
    this.setAttribute('aria-label', 'Reading depth');
    this.render();
    this._unsub = bus.on('mode:change', () => this.render());
    this.addEventListener('click', this.onClick);
  }
  disconnectedCallback() { this._unsub?.(); }
  onClick = (e) => {
    const btn = e.target.closest('[data-mode-choice]');
    if (btn) setMode(btn.dataset.modeChoice);
  };
  render() {
    const cur = getMode();
    const hadFocus = this.contains(document.activeElement);
    this.innerHTML = MODES.map(m => `
      <button data-mode-choice="${m}"
              aria-pressed="${m === cur ? 'true' : 'false'}"
              aria-label="${m} read - ${PITCHES[m]}">${m}</button>`).join('');
    if (hadFocus) this.querySelector(`[data-mode-choice="${cur}"]`)?.focus();
  }
}

customElements.define('mode-indicator', ModeIndicator);
