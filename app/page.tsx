import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Home,
  Key,
  MapPin,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SearchBar } from '@/components/shared/SearchBar';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { EmptyState } from '@/components/shared/EmptyState';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { AgentCard } from '@/components/agents/AgentCard';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  getFeaturedProperties,
  getFeaturedLocations,
  getActiveAgents,
  getTotalPropertyCount,
  getFavoritePropertyIds,
} from '@/lib/supabase/queries';
import {
  TRANSACTION_TYPES,
  PROPERTY_TYPES,
} from '@/lib/constants';
import { buildPageMetadata, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Find Your Dream Property in Nigeria',
  description:
    'Browse premium properties for sale, rent, and short let across Lagos, Abuja, and Port Harcourt. Find apartments, duplexes, villas, and commercial spaces with trusted local agents.',
  path: '/',
});

export default async function HomePage() {
  // Fetch all data in parallel
  const [properties, locations, agents, totalProperties, favoriteIds] = await Promise.all([
    getFeaturedProperties(6),
    getFeaturedLocations(),
    getActiveAgents(6),
    getTotalPropertyCount(),
    getFavoritePropertyIds(),
  ]);

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              {totalProperties > 0
                ? `${totalProperties}+ Properties Available`
                : 'Premium Nigerian Real Estate'}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Find Your Perfect Property{' '}
              <span className="text-primary">in Nigeria</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover premium homes, apartments, and commercial properties across
              Lagos, Abuja, and Port Harcourt. Your dream property is just a search away.
            </p>
          </div>

          {/* Search bar */}
          <div className="mx-auto mt-8 max-w-3xl">
            <SearchBar variant="hero" />
          </div>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>{totalProperties}+ Properties</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>{agents.length}+ Expert Agents</span>
            </div>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <div className="flex items-center gap-2 hidden sm:flex">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{locations.length}+ Locations</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Transaction Type Categories ── */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="What Are You Looking For?"
            subtitle="Browse by Category"
            description="Whether you want to buy, rent, or find a short let, we have properties that match your needs."
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TRANSACTION_TYPES.map((type) => {
              const icons = {
                sale: Key,
                rent: Home,
                'short-let': Star,
              };
              const Icon = icons[type.value as keyof typeof icons];
              return (
                <Link
                  key={type.value}
                  href={`/properties?type=${type.value}`}
                  className="group flex flex-col items-center rounded-xl border bg-card p-8 text-center transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse {type.label.toLowerCase()} properties across Nigeria
                  </p>
                  <ArrowRight className="h-4 w-4 text-primary mt-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Featured Properties"
            subtitle="Handpicked for You"
            description="Explore our curated selection of premium properties across Nigeria."
          >
            <Button asChild variant="outline" className="mt-4">
              <Link href="/properties">
                View All Properties
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </SectionHeading>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property as unknown as Parameters<typeof PropertyCard>[0]['property']}
                  isFavorited={favoriteIds.includes(property.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Properties Available Yet"
              description="We're adding premium properties to our platform. Check back soon or contact us to find your ideal property."
              icon="home"
              action={{
                label: 'Contact Us',
                href: '/contact',
              }}
            />
          )}
        </div>
      </section>

      {/* ── Property Types ── */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Property Types"
            subtitle="Find Your Perfect Match"
            description="From luxury apartments to commercial spaces, we cover all property types."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {PROPERTY_TYPES.slice(0, 7).map((type) => (
              <Link
                key={type.value}
                href={`/properties?property_type=${type.value}`}
                className="group flex flex-col items-center rounded-lg border p-4 text-center transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <Building2 className="h-8 w-8 text-muted-foreground mb-2 transition-colors group-hover:text-primary" />
                <span className="text-sm font-medium">{type.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Locations ── */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Popular Locations"
            subtitle="Explore Nigeria"
            description="Find properties in the most sought-after neighborhoods across Nigeria."
          />

          {locations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <Link
                  key={location.id}
                  href={`/locations/${location.slug}`}
                  className="group relative flex h-40 items-end overflow-hidden rounded-xl border bg-gradient-to-t from-black/60 to-transparent p-5 transition-all hover:shadow-md"
                >
                  {/* Background placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white">
                      {location.name}
                    </h3>
                    <p className="text-sm text-white/80">
                      {location.city}, {location.state}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Locations Coming Soon"
              description="We're setting up property listings across Nigerian cities. Stay tuned!"
              icon="home"
            />
          )}
        </div>
      </section>

      {/* ── Featured Agents ── */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Meet Our Agents"
            subtitle="Expert Guidance"
            description="Our experienced agents are ready to help you find the perfect property."
          >
            <Button asChild variant="outline" className="mt-4">
              <Link href="/agents">
                View All Agents
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </SectionHeading>

          {agents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent as unknown as Parameters<typeof AgentCard>[0]['agent']} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Agents Coming Soon"
              description="Our team of expert agents is being assembled. Contact us directly for assistance."
              icon="home"
              action={{
                label: 'Contact Us',
                href: '/contact',
              }}
            />
          )}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Why Choose Us"
            subtitle="Trusted Partner"
            description="We provide a seamless experience from property search to closing the deal."
          />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: 'Verified Listings',
                description: 'Every property is verified by our team before listing.',
              },
              {
                icon: Users,
                title: 'Expert Agents',
                description: 'Experienced local agents who know the Nigerian market.',
              },
              {
                icon: MapPin,
                title: 'Prime Locations',
                description: 'Properties in the most desirable neighborhoods across Nigeria.',
              },
              {
                icon: Star,
                title: 'Premium Service',
                description: 'End-to-end support from search to move-in.',
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-16 lg:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold lg:text-3xl mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Whether you&apos;re buying your first home, looking for an investment property,
            or need a short-term rental, we&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/properties">
                Browse Properties
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link href="/contact">
                Contact Us Today
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
