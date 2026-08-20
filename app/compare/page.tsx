import type { Metadata } from 'next';
import Link from 'next/link';
import { MAX_COMPARE_PROPERTIES, parseCompareIds, type ComparePropertyView } from '@/lib/compare';
import { getPropertiesForComparison } from '@/lib/supabase/queries';
import { CompareTable } from '@/components/compare/CompareTable';
import { CompareBar } from '@/components/compare/CompareBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> { return buildPageMetadata({
  title: 'Compare Properties | Side-by-Side Property Comparison',
  description:
    'Compare Nigerian properties side by side — price, bedrooms, bathrooms, area, amenities, and more. Select up to 3 properties from the listings to find your best match.',
  path: '/compare',
  noIndex: true,
}); }

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>;
}

/**
 * Map a Supabase property row to the serializable comparison view model.
 * Joined relations may arrive as arrays or objects depending on FK
 * inference — both shapes are handled defensively.
 */
function toCompareView(
  row: Awaited<ReturnType<typeof getPropertiesForComparison>>[number]
): ComparePropertyView {
  const location = Array.isArray(row.locations) ? row.locations[0] : row.locations;
  const agent = Array.isArray(row.agents) ? row.agents[0] : row.agents;
  const amenities = (row.property_amenities ?? [])
    .map((pa) => (Array.isArray(pa.amenities) ? pa.amenities[0] : pa.amenities))
    .filter((amenity): amenity is NonNullable<typeof amenity> => amenity != null);

  return {
    slug: row.slug,
    title: row.title,
    price: Number(row.price),
    currency: row.currency ?? 'NGN',
    transaction_type: row.transaction_type,
    property_type: row.property_type,
    locationLabel: location
      ? [location.name, location.city].filter(Boolean).join(', ') || null
      : null,
    bedrooms: row.bedrooms ?? null,
    bathrooms: row.bathrooms ?? null,
    toilets: row.toilets ?? null,
    area: row.area != null ? Number(row.area) : null,
    year_built: row.year_built ?? null,
    parking_spaces: row.parking_spaces ?? null,
    is_furnished: Boolean(row.is_furnished),
    featured_image: row.featured_image ?? null,
    agentName: agent?.name ?? null,
    agentSlug: agent?.slug ?? null,
    amenities: amenities.map((a) => a.name),
  };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const requested = parseCompareIds(params.ids);
  const rows = await getPropertiesForComparison(requested);
  const properties = rows.map(toCompareView);

  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Compare Properties
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            View up to {MAX_COMPARE_PROPERTIES} properties side by side to compare price,
            features, and amenities. Add properties from the listings page or any property
            detail page.
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          {requested.length === 0 ? (
            /* No properties selected */
            <EmptyState
              title="No Properties Selected"
              description={`Choose up to ${MAX_COMPARE_PROPERTIES} properties to compare by clicking the "Compare" button on any property card or detail page.`}
              icon="search"
              action={{ label: 'Browse Properties', href: '/properties' }}
            />
          ) : properties.length === 0 ? (
            /* Stale/invalid selection — requested slugs matched nothing public */
            <EmptyState
              title="Selected Properties Are No Longer Available"
              description="The properties in your comparison are no longer listed. Clear your selection and browse the latest properties."
              icon="home"
              action={{ label: 'Browse Properties', href: '/properties' }}
            />
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Comparing <span className="font-semibold text-foreground">{properties.length}</span>{' '}
                  {properties.length === 1 ? 'property' : 'properties'}
                  {properties.length === 1 && (
                    <> — add up to {MAX_COMPARE_PROPERTIES - 1} more for a full side-by-side comparison</>
                  )}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/properties">Add More Properties</Link>
                </Button>
              </div>

              <CompareTable properties={properties} />
            </>
          )}
        </div>
      </section>

      {/* Floating bar reflects localStorage selection across pages */}
      <CompareBar />
    </>
  );
}
