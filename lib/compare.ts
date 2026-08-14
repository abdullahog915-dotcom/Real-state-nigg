/**
 * Client-side property comparison state helpers.
 *
 * Comparison selections are stored in localStorage as property slugs and
 * mirrored into the /compare URL (?ids=slug1,slug2) so the comparison page
 * can be server-rendered. No database table backs this feature.
 */

export const COMPARE_STORAGE_KEY = 'compare:property-slugs';
export const MAX_COMPARE_PROPERTIES = 3;
export const COMPARE_EVENT = 'property-compare-update';

/**
 * Read the current comparison selection from localStorage.
 * Invalid/corrupt data is ignored safely (returns an empty list).
 * Duplicates are removed and the list is capped at the maximum.
 */
export function readCompareSlugs(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of parsed) {
      if (typeof item !== 'string') continue;
      const slug = item.trim();
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      result.push(slug);
      if (result.length >= MAX_COMPARE_PROPERTIES) break;
    }
    return result;
  } catch {
    return [];
  }
}

/**
 * Persist the comparison selection to localStorage.
 * Storage failures (private mode, quota) are swallowed — comparison
 * simply degrades to in-memory state for the current page.
 */
export function writeCompareSlugs(slugs: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Ignore storage errors — state stays in memory for this session
  }
}

/**
 * Build the comparison page URL for a set of slugs.
 */
export function buildCompareUrl(slugs: string[]): string {
  if (slugs.length === 0) return '/compare';
  return `/compare?ids=${slugs.join(',')}`;
}

/**
 * Parse the ?ids= search param into a clean, capped slug list.
 * Non-string/empty/duplicate entries are ignored safely.
 */
export function parseCompareIds(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const joined = Array.isArray(raw) ? raw.join(',') : raw;

  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of joined.split(',')) {
    const slug = part.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    result.push(slug);
    if (result.length >= MAX_COMPARE_PROPERTIES) break;
  }
  return result;
}

/**
 * Serializable view model passed from the /compare server page
 * to the client comparison table. Every field maps to a real
 * column or join in the properties schema.
 */
export interface ComparePropertyView {
  slug: string;
  title: string;
  price: number;
  currency: string;
  transaction_type: string;
  property_type: string;
  locationLabel: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  area: number | null;
  year_built: number | null;
  parking_spaces: number | null;
  is_furnished: boolean;
  featured_image: string | null;
  agentName: string | null;
  agentSlug: string | null;
  amenities: string[];
}
