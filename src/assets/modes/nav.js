/*
 * modes/nav.js - the single source of truth for navigation links and the
 * footer's contact lines. Both mode renderers read from here, so adding a
 * page means editing one array, not two renderers.
 * Dependencies: none.
 * Invariants: pure data plus one helper; no DOM access, no imports.
 * Non-goals: no routing - the kernel router owns that.
 */

export const LINKS = [
  { href: '/', label: 'home' },
  { href: '/work/', label: 'work' },
  { href: '/about', label: 'about' },
];

export const CONTACT = [
  { href: 'mailto:linh@lelinh.dev', label: 'linh@lelinh.dev' },
  { href: '/assets/linh-le-cv.pdf', label: 'CV (PDF)' },
  { href: 'https://codeberg.org/litozor', label: 'codeberg' },
  { href: 'https://github.com/Linh35', label: 'github' },
  { href: 'https://www.linkedin.com/in/le-linh-42269082/', label: 'linkedin' },
];

/* Marks the entry matching the current path so the renderers can set
   aria-current. Trailing slashes are normalised (/work and /work/ are one),
   and a stray /about.html still matches /about - Cloudflare Pages serves the
   extensionless form and 308s the other, so both can appear in the wild. */
export function isCurrent(href) {
  const here = location.pathname.replace(/\/index\.html$/, '/');
  return href === here || (href !== '/' && here.startsWith(href.replace(/\/$/, '')));
}
