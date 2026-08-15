import type { Metadata } from 'next';
import type { PropertyRow } from '@/lib/supabase/queries';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { CompareBar } from '@/components/compare/CompareBar';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { Separator } from '@/components/ui/separator';
import {
  getProperties,
  getAllLocations,
  getFavoritePropertyIds,
  type PropertyListFilters,
} from '@/lib/supabase/queries';
import { getTransactionTypeLabel } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Properties in Nigeria | Buy, Rent & Short Let',
  description:
    'Browse properties for sale, rent, and short let across Lagos, Abuja, and Port Harcourt. Filter by type, location, bedrooms, and price to find your perfect Nigerian property.',
  alternates: {
    canonical: '/properties',
  },
};

interface PropertiesPageProps {
  searchParams: Promise<{
    type?: string;
    property_type?: string;
    location?: string;
    q?: string;
    bedrooms?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;

  // Parse URL params into filters
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const filters: PropertyListFilters = {
    transaction_type: params.type || undefined,
    property_type: params.property_type || undefined,
    location: params.location || undefined,
    keyword: params.q || undefined,
    bedrooms: params.bedrooms ? parseInt(params.bedrooms, 10) : undefined,
    min_price: params.min_price ? parseFloat(params.min_price) : undefined,
    max_price: params.max_price ? parseFloat(params.max_price) : undefined,
    sort: (params.sort as PropertyListFilters['sort']) || 'newest',
    page,
    per_page: 12,
  };

  // Fetch properties, locations, and the user's favorites in parallel
  const [result, locations, favoriteIds] = await Promise.all([
    getProperties(filters),
    getAllLocations(),
    getFavoritePropertyIds(),
  ]);

  const { data: properties, count, totalPages } = result;

  // Build a helper to create page URLs preserving current filters
  function buildPageUrl(targetPage: number) {
    const urlParams = new URLSearchParams();
    if (params.type) urlParams.set('type', params.type);
    if (params.property_type) urlParams.set('property_type', params.property_type);
    if (params.location) urlParams.set('location', params.location);
    if (params.q) urlParams.set('q', params.q);
    if (params.bedrooms) urlParams.set('bedrooms', params.bedrooms);
    if (params.min_price) urlParams.set('min_price', params.min_price);
    if (params.max_price) urlParams.set('max_price', params.max_price);
    if (params.sort && params.sort !== 'newest') urlParams.set('sort', params.sort);
    if (targetPage > 1) urlParams.set('page', String(targetPage));

    const qs = urlParams.toString();
    return `/properties${qs ? `?${qs}` : ''}`;
  }

  // Active filter summary chips
  const activeFilters: { key: string; label: string }[] = [];
  if (params.type) {
    activeFilters.push({ key: 'type', label: getTransactionTypeLabel(params.type) });
  }
  if (params.property_type) {
    activeFilters.push({ key: 'property_type', label: params.property_type.charAt(0).toUpperCase() + params.property_type.slice(1) });
  }
  if (params.location) {
    activeFilters.push({ key: 'location', label: params.location.charAt(0).toUpperCase() + params.location.slice(1) });
  }
  if (params.bedrooms) {
    activeFilters.push({ key: 'bedrooms', label: `${params.bedrooms}+ Beds` });
  }

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Find Your Perfect Property
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Browse properties for sale, rent, and short let across Nigeria&apos;s most desirable locations.
          </p>

          {/* Result count */}
          <div className="mt-4 flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {count > 0 ? (
                <>
                  <span className="font-semibold text-foreground">{count}</span>{' '}
                  {count === 1 ? 'property' : 'properties'} found
                  {page > 1 && (
                    <>
                      {' '}&middot; Page {page} of {totalPages}
                    </>
                  )}
                </>
              ) : (
                'No properties found'
              )}
            </p>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <Separator orientation="vertical" className="h-4" />
                {activeFilters.map((f) => (
                  <span
                    key={f.key}
                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {f.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mt-6">
            <PropertyFilters locations={locations} />
          </div>
        </div>
      </section>

      {/* Property Grid */}
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {properties.map((property: PropertyRow) => (
                  <PropertyCard
                    key={property.id}
                    property={
                      property as unknown as Parameters<typeof PropertyCard>[0]['property']
                    }
                    isFavorited={favoriteIds.includes(property.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    buildPageUrl={buildPageUrl}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No Properties Found"
              description={
                count === 0 && activeFilters.length > 0
                  ? 'No properties match your current filters. Try adjusting your search criteria or clearing all filters.'
                  : 'There are currently no properties available. New listings are added regularly — check back soon or contact us for assistance.'
              }
              icon="search"
              action={
                activeFilters.length > 0
                  ? { label: 'Clear All Filters', href: '/properties' }
                  : { label: 'Contact Us', href: '/contact' }
              }
            />
          )}
        </div>
      </section>

      {/* Floating comparison bar (visible while properties are selected) */}
      <CompareBar />
    </>
  );
}
