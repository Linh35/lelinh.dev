/*
 * modes/components.js — shared custom-element shells. Each shell holds a
 * per-mode renderer registry. On 'mode:change' the active renderer re-runs
 * against the same element instance.
 * Dependencies: ../kernel/event-bus.js, ../kernel/mode-manager.js
 * Invariants: renderers are (host) => void. They write to host.innerHTML and
 *             do not attach listeners outside the host. No shadow DOM —
 *             source must be inspectable in devtools. IDs (if used) live
 *             inside one component; cross-component talk goes through the bus.
 * Non-goals: no slotted projection; no two-way attribute sync.
 */

import { bus } from '../kernel/event-bus.js';
import { getMode } from '../kernel/mode-manager.js';

const registry = new Map(); // tagName -> Map<mode, renderer>

export function register(tag, mode, renderer) {
  if (!registry.has(tag)) registry.set(tag, new Map());
  registry.get(tag).set(mode, renderer);
  for (const el of document.getElementsByTagName(tag)) el.render?.();
}

class Shell extends HTMLElement {
  connectedCallback() {
    this.render();
    this._unsubs = [
      bus.on('mode:change', () => this.render()),
      bus.on('route:change', () => this.render()),
    ];
  }
  disconnectedCallback() { this._unsubs?.forEach(fn => fn()); }
  render() {
    const renderers = registry.get(this.localName);
    if (!renderers) return;
    const r = renderers.get(getMode()) || renderers.values().next().value;
    if (r) r(this);
  }
}

for (const tag of ['site-header', 'site-footer', 'project-card', 'project-list']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends Shell {});
}
