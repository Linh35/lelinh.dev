/*
 * brief/components.js - brief-mode renderers for the shared shells.
 * Brief is the hiring read: the header carries the ask, the footer closes it.
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

register('site-header', 'brief', (host) => {
  host.innerHTML = `
    <a class="wordmark" href="/">Linh Le</a>
    <nav aria-label="Primary">${nav()}</nav>`;
});

register('site-footer', 'brief', (host) => {
  host.innerHTML = `
    <p><b>Open to B2B contracts and full-time remote roles.</b> Sofia-based, comfortable across time zones.</p>
    <p class="meta">${CONTACT.map(c => `<a href="${c.href}">${c.label}</a>`).join('')}</p>`;
});
