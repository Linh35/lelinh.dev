/*
 * swiss/components.js — swiss-mode renderers. Editorial typography,
 * numbered project cards, brand-on-left header.
 * Dependencies: ../components.js, ../../kernel/content-loader.js
 * Invariants: pure renderers — write only host.innerHTML.
 * Non-goals: no animations beyond the View Transition wrap.
 */

import { register } from '../components.js';
import { load } from '../../kernel/content-loader.js';

const NAV = [
  { href: '/', label: 'Index' },
  { href: '/work/', label: 'Work' },
  { href: '/about.html', label: 'About' },
];

const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

register('site-header', 'swiss', host => {
  const links = NAV.map(n => `<a href="${n.href}"${location.pathname === n.href ? ' aria-current="page"' : ''}>${n.label}</a>`).join('');
  host.innerHTML = `<span class="brand">Linh Le · Engineer</span><nav aria-label="primary">${links}</nav>`;
});

register('site-footer', 'swiss', host => {
  host.innerHTML = `<span>© ${new Date().getFullYear()} Linh Le</span><a href="mailto:linh@lelinh.dev">linh@lelinh.dev</a><a rel="me" href="https://github.com/Linh35">GitHub</a><a rel="me" href="https://www.linkedin.com/in/le-linh-42269082/">LinkedIn</a><span class="hint">view-source friendly · Ctrl+U</span>`;
});

register('project-card', 'swiss', async host => {
  const slug = host.getAttribute('slug');
  const num = host.getAttribute('num') || '01';
  if (!slug) return;
  try {
    const { meta } = await load(slug);
    const tags = Array.isArray(meta.tags) ? meta.tags.join(' / ') : (meta.tags || '');
    host.innerHTML = `
      <a href="/work/${escape(slug)}.html">
        <span class="num">№ ${escape(num)} — ${escape(meta.date || '')}</span>
        <h3 class="title">${escape(meta.title || slug)}</h3>
        <p class="summary">${escape(meta.summary || '')}</p>
        ${tags ? `<div class="tags">${escape(tags)}</div>` : ''}
      </a>`;
  } catch {
    host.innerHTML = `<a href="/work/${escape(slug)}.html"><h3 class="title">${escape(slug)}</h3></a>`;
  }
});

register('project-list', 'swiss', host => {
  const slugs = (host.getAttribute('slugs') || '').split(',').map(s => s.trim()).filter(Boolean);
  host.innerHTML = slugs.map((s, i) => `<project-card slug="${escape(s)}" num="${String(i + 1).padStart(2, '0')}"></project-card>`).join('');
});
