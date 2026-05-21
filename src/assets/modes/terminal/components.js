/*
 * terminal/components.js — terminal-mode renderers. ls -la layout for project
 * cards, shell prompt for site header, dotfile motif for footer.
 * Dependencies: ../components.js, ../../kernel/content-loader.js
 * Invariants: every renderer is (host) => void and writes only host.innerHTML.
 *             Card data is loaded lazily from /assets/content/{slug}.md.
 * Non-goals: no boot animation; no terminal emulator behaviour.
 */

import { register } from '../components.js';
import { load } from '../../kernel/content-loader.js';

const NAV = [
  { href: '/', label: 'home' },
  { href: '/work/', label: 'work' },
  { href: '/about.html', label: 'about' },
];

const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

register('site-header', 'terminal', host => {
  const links = NAV.map(n => `<a href="${n.href}"${location.pathname === n.href ? ' aria-current="page"' : ''}>${n.label}</a>`).join('');
  host.innerHTML = `<span class="prompt">cd ~/lelinh.dev && ls</span><br><nav aria-label="primary">${links}</nav>`;
});

register('site-footer', 'terminal', host => {
  host.innerHTML = `<span># </span>linh le · <a href="mailto:linh@lelinh.dev">linh@lelinh.dev</a> · <a rel="me" href="https://github.com/Linh35">github</a> · <a rel="me" href="https://www.linkedin.com/in/le-linh-42269082/">linkedin</a> · <span class="hint"># tip: Ctrl+U on any page</span> · ${new Date().getFullYear()}`;
});

register('project-card', 'terminal', async host => {
  const slug = host.getAttribute('slug');
  if (!slug) return;
  try {
    const { meta } = await load(slug);
    const tags = Array.isArray(meta.tags) ? meta.tags.join(' ') : (meta.tags || '');
    host.innerHTML = `
      <div class="row">
        <span class="perm">-rw-r--r--</span>
        <span class="size">${escape(meta.size || '— kB')}</span>
        <span class="date">${escape(meta.date || '')}</span>
        <a class="name" href="/work/${escape(slug)}.html">${escape(meta.title || slug)}</a>
      </div>
      <div class="summary">${escape(meta.summary || '')}</div>
      ${tags ? `<div class="tags"># ${escape(tags)}</div>` : ''}
    `;
  } catch {
    host.innerHTML = `<div class="row"><span class="perm">??</span> <a class="name" href="/work/${escape(slug)}.html">${escape(slug)}</a></div>`;
  }
});

register('project-list', 'terminal', host => {
  const slugs = (host.getAttribute('slugs') || '').split(',').map(s => s.trim()).filter(Boolean);
  host.innerHTML = `<div class="total">total ${slugs.length}</div>` +
    slugs.map(s => `<project-card slug="${escape(s)}"></project-card>`).join('');
});
