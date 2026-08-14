'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  COMPARE_EVENT,
  COMPARE_STORAGE_KEY,
  MAX_COMPARE_PROPERTIES,
  readCompareSlugs,
  writeCompareSlugs,
} from '@/lib/compare';

const SERVER_SNAPSHOT: string[] = [];

// Cache the snapshot so repeated getSnapshot calls return a stable
// reference (required by useSyncExternalStore) unless storage changed.
let cachedRaw: string | null = null;
let cachedSlugs: string[] = SERVER_SNAPSHOT;

function subscribe(callback: () => void): () => void {
  window.addEventListener(COMPARE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(COMPARE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): string[] {
  const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSlugs = readCompareSlugs();
  }
  return cachedSlugs;
}

function getServerSnapshot(): string[] {
  return SERVER_SNAPSHOT;
}

/**
 * Shared client-side comparison selection state.
 *
 * State lives in localStorage and is kept in sync across all components
 * on the page via a custom window event, and across browser tabs via the
 * native storage event. Renders an empty selection on the server / first
 * paint to avoid hydration mismatches, then hydrates from localStorage.
 */
export function useCompare() {
  const slugs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = slugs !== SERVER_SNAPSHOT;

  const update = useCallback((next: string[]) => {
    const capped = next.slice(0, MAX_COMPARE_PROPERTIES);
    writeCompareSlugs(capped);
    window.dispatchEvent(new Event(COMPARE_EVENT));
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      const current = readCompareSlugs();
      if (current.includes(slug)) {
        update(current.filter((s) => s !== slug));
      } else if (current.length < MAX_COMPARE_PROPERTIES) {
        update([...current, slug]);
      }
    },
    [update]
  );

  const remove = useCallback(
    (slug: string) => {
      update(readCompareSlugs().filter((s) => s !== slug));
    },
    [update]
  );

  const clear = useCallback(() => {
    update([]);
  }, [update]);

  return {
    slugs,
    ready,
    max: MAX_COMPARE_PROPERTIES,
    isFull: slugs.length >= MAX_COMPARE_PROPERTIES,
    isInCompare: (slug: string) => slugs.includes(slug),
    toggle,
    remove,
    clear,
  };
}
