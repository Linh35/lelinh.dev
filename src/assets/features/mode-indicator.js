/*
 * mode-indicator.js - fixed bottom-right mode toggle. Collapsed shows current
 * mode (~40px). Expanded shows both modes with one-line pitches. Renders
 * differently per mode - styling lives in each mode's tokens.css.
 * Dependencies: ../kernel/event-bus.js, ../kernel/mode-manager.js
 * Invariants: only one element per page; aria-expanded tracks panel state.
 * Non-goals: no keyboard shortcut binding; no drag; no auto-collapse.
 */

import { bus } from '../kernel/event-bus.js';
import { getMode, setMode, MODES } from '../kernel/mode-manager.js';

const PITCHES = {
  terminal: 'CLI fluency. Source as artifact.',
  swiss: 'Typography first. Whitespace as argument.',
};
const LABELS = { terminal: '$ terminal', swiss: 'Aa  Swiss' };

class ModeIndicator extends HTMLElement {
  connectedCallback() {
    this._open = false;
    this.render();
    this._unsub = bus.on('mode:change', () => this.render());
    this.addEventListener('click', this.onClick);
  }
  disconnectedCallback() { this._unsub?.(); }
  onClick = (e) => {
    const choice = e.target.closest('[data-mode-choice]');
    if (choice) { setMode(choice.dataset.modeChoice); this._open = false; this.render(); return; }
    if (e.target.closest('[data-toggle]')) { this._open = !this._open; this.render(); }
  };
  render() {
    const cur = getMode();
    if (!this._open) {
      this.innerHTML = `<button data-toggle aria-expanded="false" aria-label="open mode picker">${LABELS[cur]}</button>`;
      return;
    }
    const items = MODES.map(m => `
      <li><button data-mode-choice="${m}" aria-current="${m === cur ? 'true' : 'false'}">
        <span class="lbl">${LABELS[m]}</span>
        <span class="pitch">${PITCHES[m]}</span>
      </button></li>`).join('');
    this.innerHTML = `<button data-toggle aria-expanded="true" aria-label="close mode picker">${LABELS[cur]} ▾</button><ul role="list">${items}</ul>`;
  }
}
customElements.define('mode-indicator', ModeIndicator);
