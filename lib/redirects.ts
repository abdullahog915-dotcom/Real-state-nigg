/**
 * Client-safe redirect validation helper.
 *
 * This module must stay free of server-only imports (next/headers,
 * Supabase server client) because it is used by client components
 * such as LoginForm and SignupForm.
 */

/**
 * Validates a `?next=` redirect target.
 *
 * Only internal relative paths are accepted. This blocks open redirects:
 * - protocol-relative URLs (`//evil.com`)
 * - backslash variants (`/\evil.com`, normalized by some browsers)
 * - absolute URLs and anything resolving to a foreign origin
 * - control characters / whitespace that could confuse URL parsers
 */
export function getSafeRedirectPath(
  value: string | string[] | null | undefined
): string | null {
  if (typeof value !== 'string') return null;

  const path = value.trim();

  if (!path.startsWith('/')) return null;
  if (path.startsWith('//')) return null;
  if (path.charAt(1) === '\\') return null;
  if (/[\s\u0000-\u001f]/.test(path)) return null;

  // Resolve against a fixed dummy origin; reject anything that escapes it.
  try {
    const resolved = new URL(path, 'http://internal');
    if (resolved.origin !== 'http://internal') return null;
  } catch {
    return null;
  }

  return path;
}
