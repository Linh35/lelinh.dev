/*
 * deep/components.js - deep-mode renderers for the shared shells.
 * Deep is the engineer's read: the header is a path, the footer is a manifest.
 * Dependencies: ../components.js, ../nav.js
 * Invariants: renderers are pure (host) => void and write only to
 *             host.innerHTML. Link text comes from ../nav.js so brief and
 *             deep can never drift.
 * Non-goals: no page content - pages own their own markup.
 */

import { register } from '../components.js';
import { LINKS, CONTACT, isCurrent } from '../nav.js';

const nav = () => LINKS
  .map(l => `<a href="${l.href}"${isCurrent(l.href) ? ' aria-current="page"' : ''}>${l.label}</a>`)
  .join('');

register('site-header', 'deep', (host) => {
  host.innerHTML = `
    <a class="wordmark" href="/">linh</a>
    <nav aria-label="Primary">${nav()}</nav>`;
});

register('site-footer', 'deep', (host) => {
  host.innerHTML = `
    <p>Open to B2B contracts and full-time remote roles. Sofia-based (EET), comfortable across time zones.</p>
    <p class="meta">${CONTACT.map(c => `<a href="${c.href}">${c.label}</a>`).join('')}</p>
    <p class="meta">This page: no framework, no build step, no runtime dependencies.</p>`;
});
