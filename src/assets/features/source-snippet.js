/*
 * source-snippet.js — embed a source file inline as <pre><code>.
 * Usage: <source-snippet src="/assets/kernel/event-bus.js"
 *                        caption="assets/kernel/event-bus.js"
 *                        lines="14-30"></source-snippet>
 * Dependencies: none.
 * Invariants: fetches each src once (process-wide cache); escapes HTML;
 *             always renders a "raw ↗" link to the actual file.
 * Non-goals: no syntax highlighting (Season 2 /source viewer does that);
 *            no language detection; no copy button.
 */

const cache = new Map();

async function load(url) {
  if (!cache.has(url)) cache.set(url, fetch(url).then(r => r.ok ? r.text() : Promise.reject(r.status)));
  return cache.get(url);
}

const escape = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function clip(text, range) {
  if (!range) return text;
  const m = range.match(/^(\d+)-(\d+)$/);
  if (!m) return text;
  return text.split('\n').slice(+m[1] - 1, +m[2]).join('\n');
}

class SourceSnippet extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute('src');
    const range = this.getAttribute('lines');
    const caption = this.getAttribute('caption') || src;
    if (!src) return;
    try {
      const body = clip(await load(src), range);
      this.innerHTML = `
        <figure class="source">
          <figcaption><span class="path">${escape(caption)}</span><a class="raw" href="${escape(src)}" target="_blank" rel="noopener">raw ↗</a></figcaption>
          <pre><code>${escape(body)}</code></pre>
        </figure>`;
    } catch {
      this.innerHTML = `<p>Couldn't load <code>${escape(src)}</code>.</p>`;
    }
  }
}
customElements.define('source-snippet', SourceSnippet);
