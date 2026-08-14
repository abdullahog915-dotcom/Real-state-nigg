'use client';

import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildCompareUrl } from '@/lib/compare';
import { useCompare } from '@/hooks/useCompare';

/**
 * Floating bar shown while at least one property is selected for
 * comparison. Lets the user open /compare with the current selection
 * or clear it. Hidden until client state has hydrated.
 */
export function CompareBar() {
  const { slugs, ready, max, clear } = useCompare();

  if (!ready || slugs.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
        <p className="text-sm" aria-live="polite">
          <span className="font-semibold">{slugs.length}</span> of {max} selected for comparison
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            aria-label="Clear comparison selection"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
          <Button asChild size="sm">
            <Link href={buildCompareUrl(slugs)}>
              Compare
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
