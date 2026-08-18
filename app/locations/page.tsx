import type { Metadata } from 'next';
import { LocationCard } from '@/components/locations/LocationCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { getLocations } from '@/lib/supabase/queries';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Locations | Explore Properties Across Nigeria',
  description:
    'Explore Nigerian neighborhoods and cities — Lekki, Ikoyi, Victoria Island, Maitama, Asokoro, and more. Browse available properties for sale, rent, and short let in each location.',
  path: '/locations',
});

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Explore Locations
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Discover Nigeria&apos;s most desirable neighborhoods and cities. Each location
            page shows what&apos;s available and what makes the area special.
          </p>

          <div className="mt-4 text-sm text-muted-foreground">
            {locations.length > 0 ? (
              <p>
                <span className="font-semibold text-foreground">{locations.length}</span>{' '}
                {locations.length === 1 ? 'location' : 'locations'} available
              </p>
            ) : (
              <p>No locations listed yet</p>
            )}
          </div>
        </div>
      </section>

      {/* Location grid */}
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          {locations.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {locations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Locations Listed Yet"
              description="Our location guides are being prepared. In the meantime, browse all available properties."
              icon="home"
              action={{ label: 'Browse Properties', href: '/properties' }}
            />
          )}
        </div>
      </section>
    </>
  );
}
