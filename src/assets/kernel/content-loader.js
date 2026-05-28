/*
 * content-loader.js - fetches /assets/content/{slug}.md, parses YAML-ish
 * frontmatter and a deliberately minimal markdown subset. Hand-written.
 * Dependencies: none.
 * Invariants: load(slug) returns { meta, html } from a process-wide cache.
 *             Frontmatter values are strings; 'tags' parses as an array from
 *             either YAML inline form (`tags: [a, b]`) or comma-separated.
 * Non-goals: not CommonMark. Supports: # h1, ## h2, ### h3; paragraphs;
 *            unordered lists (- ); fenced code (```...```); inline `code`;
 *            **bold**; *italic*; [text](href). No tables, images, footnotes,
 *            blockquotes, or nested lists.
 */

const cache = new Map();

export async function load(slug) {
  if (cache.has(slug)) return cache.get(slug);
  const res = await fetch(`/assets/content/${slug}.md`);
  if (!res.ok) throw new Error(`content ${slug}: ${res.status}`);
  const out = parse(await res.text());
  cache.set(slug, out);
  return out;
}

export function parse(src) {
  const fm = src.match(/^---\n([\s\S]*?)\n---\n?/);
  let meta = {}, body = src;
  if (fm) {
    body = src.slice(fm[0].length);
    for (const line of fm[1].split('\n')) {
      const i = line.indexOf(':');
      if (i < 0) continue;
      const k = line.slice(0, i).trim();
      let v = line.slice(i + 1).trim();
      if (k === 'tags') {
        const arr = v.match(/^\[(.*)\]$/);
        v = (arr ? arr[1] : v).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else {
        v = v.replace(/^["']|["']$/g, '');
      }
      meta[k] = v;
    }
  }
  return { meta, html: render(body) };
}

const escape = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function inline(s) {
  return escape(s)
    .replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function render(src) {
  const lines = src.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('```')) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { buf.push(escape(lines[i])); i++; }
      i++;
      out.push(`<pre><code>${buf.join('\n')}</code></pre>`);
      continue;
    }
    let m;
    if ((m = line.match(/^(#{1,3}) (.+)$/))) {
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
      i++; continue;
    }
    if (line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) { items.push(`<li>${inline(lines[i].slice(2))}</li>`); i++; }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('- ') && !lines[i].startsWith('```')) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}
