/**
 * Prefix an internal path with the site's base URL.
 *
 * Astro's `BASE_URL` is `/atlas/` (with trailing slash) when configured for a
 * sub-path deploy. We strip the trailing slash so callers can write
 * `withBase('/paths/foo/')` without ending up with `//`.
 *
 * - Absolute (http://) and protocol-relative URLs pass through unchanged.
 * - Hashes and queries on internal paths are preserved.
 * - Empty / falsy input returns base or '/'.
 */
export function withBase(href: string | undefined): string {
  if (!href) return import.meta.env.BASE_URL ?? '/';
  if (/^[a-z]+:\/\//i.test(href) || href.startsWith('//') || href.startsWith('mailto:')) {
    return href;
  }
  if (!href.startsWith('/')) return href;
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  return base + href;
}
