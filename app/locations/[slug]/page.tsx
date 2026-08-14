import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Globe, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { getLocationBySlug, getLocationProperties } from '@/lib/supabase/queries';
import { truncate } from '@/lib/utils';

interface LocationDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LocationDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) {
    return { title: 'Location Not Found' };
  }

  const description = location.description
    ? truncate(location.description, 160)
    : `Browse properties for sale, rent, and short let in ${location.name}, ${location.city}, ${location.state}.`;

  return {
    title: `${location.name} Properties | ${location.city}, ${location.state}`,
    description,
    alternates: {
      canonical: `/locations/${location.slug}`,
    },
    openGraph: {
      title: `${location.name} Properties | ${location.city}, ${location.state}`,
      description,
    },
  };
}

export default async function LocationDetailPage({ params }: LocationDetailPageProps) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  const properties = await getLocationProperties(location.id);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/locations" className="hover:text-foreground transition-colors">
              Locations
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{location.name}</span>
          </nav>
        </div>
      </div>

      {/* Location header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          {location.is_featured && (
            <Badge variant="secondary" className="mb-3">
              <Star className="mr-1 h-3 w-3" />
              Featured Location
            </Badge>
          )}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {location.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {location.city}, {location.state}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              {location.country}
            </span>
          </div>

          {location.description && (
            <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground">
              {location.description}
            </p>
          )}

          <div className="mt-6">
            <Button asChild size="lg">
              <Link href={`/properties?location=${location.slug}`}>
                Browse All {location.name} Properties
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Location's properties */}
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold mb-1">
            Properties in {location.name}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {properties.length > 0
              ? `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} currently available`
              : 'No properties currently available'}
          </p>

          <Separator className="mb-8" />

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={
                    property as unknown as Parameters<typeof PropertyCard>[0]['property']
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Properties Listed Yet"
              description={`There are no publicly listed properties in ${location.name} at the moment. Check back soon or browse properties across all locations.`}
              icon="home"
              action={{ label: 'Browse All Properties', href: '/properties' }}
            />
          )}
        </div>
      </section>
    </>
  );
}
