/*
 * key-hint.js - mode-aware keyboard hint. Renders the *non-current* mode
 * key first, since that's the one that actually does something useful.
 * Dependencies: ../kernel/event-bus.js, ../kernel/mode-manager.js
 * Invariants: re-renders on mode:change so the order updates live.
 *             Two variants via attribute: default (sentence) or
 *             variant="compact" (just the keys).
 * Non-goals: no styling - relies on host context's <kbd> styling.
 */

import { bus } from '../kernel/event-bus.js';
import { getMode } from '../kernel/mode-manager.js';

const NAME = { brief: 'brief', deep: 'deep' };
const KEY = { brief: 'b', deep: 'd' };

class KeyHint extends HTMLElement {
  connectedCallback() {
    this.render();
    this._unsub = bus.on('mode:change', () => this.render());
  }
  disconnectedCallback() { this._unsub?.(); }
  render() {
    const cur = getMode();
    const other = cur === 'brief' ? 'deep' : 'brief';
    const variant = this.getAttribute('variant') || 'sentence';
    if (variant === 'compact') {
      this.innerHTML = `press <kbd>${KEY[other]}</kbd> · <kbd>${KEY[cur]}</kbd>`;
    } else {
      this.innerHTML = `Tap <kbd>${KEY[other]}</kbd> for ${NAME[other]}, <kbd>${KEY[cur]}</kbd> for ${NAME[cur]} - anywhere on the site.`;
    }
  }
}
customElements.define('key-hint', KeyHint);
