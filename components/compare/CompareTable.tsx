'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import type { ComparePropertyView } from '@/lib/compare';
import { buildCompareUrl } from '@/lib/compare';
import { useCompare } from '@/hooks/useCompare';
import {
  formatPrice,
  formatArea,
  getPropertyTypeLabel,
  getTransactionTypeLabel,
} from '@/lib/utils';

interface CompareTableProps {
  properties: ComparePropertyView[];
}

function dash(value: string | null | undefined): string {
  return value && value.trim() !== '' ? value : '—';
}

/**
 * Side-by-side comparison table. Horizontally scrollable on small screens
 * with a sticky label column. Removing a property updates both the
 * localStorage selection and the ?ids= URL so the server re-renders.
 */
export function CompareTable({ properties }: CompareTableProps) {
  const router = useRouter();
  const { remove } = useCompare();

  function handleRemove(slug: string) {
    remove(slug);
    const remaining = properties.filter((p) => p.slug !== slug).map((p) => p.slug);
    router.replace(buildCompareUrl(remaining));
  }

  const rows: { label: string; render: (p: ComparePropertyView) => React.ReactNode }[] = [
    {
      label: 'Price',
      render: (p) => (
        <span className="font-semibold text-primary">
          {formatPrice(p.price, p.transaction_type as 'sale' | 'rent' | 'short-let')}
        </span>
      ),
    },
    { label: 'Transaction', render: (p) => getTransactionTypeLabel(p.transaction_type) },
    { label: 'Property Type', render: (p) => getPropertyTypeLabel(p.property_type) },
    { label: 'Location', render: (p) => dash(p.locationLabel) },
    { label: 'Bedrooms', render: (p) => (p.bedrooms != null ? String(p.bedrooms) : '—') },
    { label: 'Bathrooms', render: (p) => (p.bathrooms != null ? String(p.bathrooms) : '—') },
    { label: 'Toilets', render: (p) => (p.toilets != null ? String(p.toilets) : '—') },
    { label: 'Area', render: (p) => (p.area != null ? formatArea(p.area) : '—') },
    { label: 'Year Built', render: (p) => (p.year_built != null ? String(p.year_built) : '—') },
    { label: 'Parking Spaces', render: (p) => (p.parking_spaces != null ? String(p.parking_spaces) : '—') },
    { label: 'Furnishing', render: (p) => (p.is_furnished ? 'Furnished' : 'Unfurnished') },
    {
      label: 'Amenities',
      render: (p) =>
        p.amenities.length > 0 ? (
          <ul className="list-inside list-disc space-y-0.5">
            {p.amenities.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          '—'
        ),
    },
    {
      label: 'Agent',
      render: (p) =>
        p.agentName ? (
          p.agentSlug ? (
            <Link href={`/agents/${p.agentSlug}`} className="text-primary hover:underline">
              {p.agentName}
            </Link>
          ) : (
            p.agentName
          )
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <caption className="sr-only">Side-by-side comparison of selected properties</caption>
        <thead>
          <tr className="border-b bg-muted/30 align-top">
            <th
              scope="col"
              className="sticky left-0 z-10 w-36 min-w-36 bg-muted/30 px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Property
            </th>
            {properties.map((p) => (
              <th key={p.slug} scope="col" className="min-w-56 px-4 py-4 text-left align-top">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/properties/${p.slug}`} className="group block flex-1">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                      {p.featured_image ? (
                        <Image
                          src={p.featured_image}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 70vw, 224px"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <span className="mt-2 block font-semibold leading-snug group-hover:text-primary">
                      {p.title}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(p.slug)}
                    aria-label={`Remove ${p.title} from comparison`}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b last:border-b-0">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-background px-4 py-3 text-left align-top text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {row.label}
              </th>
              {properties.map((p) => (
                <td key={p.slug} className="px-4 py-3 align-top text-muted-foreground">
                  {row.render(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
