import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Phone,
  MessageCircle,
  ChevronRight,
  Car,
  Calendar,
  Sofa,
  Building2,
  Check,
  Waves,
  Dumbbell,
  Trees,
  Home,
  Wind,
  ChefHat,
  MoveVertical,
  Shield,
  Camera,
  DoorClosed,
  ShieldCheck,
  Zap,
  Droplet,
  Wrench,
  Wifi,
  Baby,
  Trophy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PropertyGallery } from '@/components/properties/PropertyGallery';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { ViewingRequestForm } from '@/components/forms/ViewingRequestForm';
import { CompareButton } from '@/components/compare/CompareButton';
import { CompareBar } from '@/components/compare/CompareBar';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { getPropertyBySlug, getRelatedProperties, getFavoritePropertyIds } from '@/lib/supabase/queries';
import { CONTACT_INFO } from '@/lib/constants';
import {
  formatPrice,
  formatArea,
  getPropertyTypeLabel,
  getTransactionTypeLabel,
  generateWhatsAppUrl,
  truncate,
} from '@/lib/utils';

/**
 * Maps amenity icon names stored in the database (seed.sql)
 * to lucide-react components. Falls back to Check.
 */
const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Waves,
  Dumbbell,
  Car,
  Trees,
  Home,
  Wind,
  ChefHat,
  MoveVertical,
  Shield,
  Camera,
  DoorClosed,
  ShieldCheck,
  Zap,
  Droplet,
  Wrench,
  Wifi,
  Baby,
  Building2,
  Trophy,
};

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return { title: 'Property Not Found' };
  }

  const location = Array.isArray(property.locations)
    ? property.locations[0]
    : property.locations;
  const locationLabel = location ? `${location.name}, ${location.city}` : 'Nigeria';
  const title = `${property.title} — ${getTransactionTypeLabel(property.transaction_type)} in ${locationLabel}`;
  const description = property.meta_description
    || (property.description ? truncate(property.description, 160) : `${getPropertyTypeLabel(property.property_type)} ${getTransactionTypeLabel(property.transaction_type).toLowerCase()} in ${locationLabel}.`);
  const ogImage = property.og_image || property.featured_image;

  return {
    title: truncate(title, 70),
    description,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  // Supabase may return joined single relations as arrays depending on FK inference
  const location = Array.isArray(property.locations)
    ? property.locations[0]
    : property.locations;
  const agent = Array.isArray(property.agents) ? property.agents[0] : property.agents;

  // Gallery order is controlled by display_order. The independently selected
  // cover remains in properties.featured_image for cards and metadata.
  const imageRows = (property.property_images ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order);
  const galleryImages = imageRows.map((img) => ({
    id: img.id,
    url: img.url,
    alt_text: img.alt_text,
  }));

  // Flatten amenities from the junction table
  const amenities = (property.property_amenities ?? [])
    .map((pa) => (Array.isArray(pa.amenities) ? pa.amenities[0] : pa.amenities))
    .filter((amenity): amenity is NonNullable<typeof amenity> => amenity != null);

  // Related properties (naturally empty when no other properties exist)
  // fetched alongside the signed-in user's favorite ids
  const [relatedProperties, favoriteIds] = await Promise.all([
    getRelatedProperties(
      property.id,
      { location_id: property.location_id, transaction_type: property.transaction_type },
      3
    ),
    getFavoritePropertyIds(),
  ]);

  // WhatsApp CTA — prefer the assigned agent's WhatsApp number
  const whatsappNumber = agent?.whatsapp || agent?.phone || CONTACT_INFO.whatsapp;
  const whatsappUrl = generateWhatsAppUrl(
    whatsappNumber,
    `Hello, I'm interested in "${property.title}" (${getTransactionTypeLabel(property.transaction_type)}). Please share more details.`
  );

  const locationLabel = location
    ? [location.name, location.city, location.state].filter(Boolean).join(', ')
    : property.address || 'Nigeria';

  // Feature items shown only when values exist
  const features: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }[] = [];
  if (property.bedrooms != null) {
    features.push({ icon: Bed, label: 'Bedrooms', value: String(property.bedrooms) });
  }
  if (property.bathrooms != null) {
    features.push({ icon: Bath, label: 'Bathrooms', value: String(property.bathrooms) });
  }
  if (property.toilets != null) {
    features.push({ icon: Bath, label: 'Toilets', value: String(property.toilets) });
  }
  if (property.area != null) {
    features.push({ icon: Maximize, label: 'Area', value: formatArea(Number(property.area)) });
  }
  if (property.parking_spaces != null) {
    features.push({ icon: Car, label: 'Parking Spaces', value: String(property.parking_spaces) });
  }
  if (property.year_built != null) {
    features.push({ icon: Calendar, label: 'Year Built', value: String(property.year_built) });
  }
  if (property.floors != null) {
    features.push({ icon: Building2, label: 'Floors', value: String(property.floors) });
  }
  if (property.is_furnished) {
    features.push({ icon: Sofa, label: 'Furnishing', value: 'Furnished' });
  }

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/properties" className="hover:text-foreground">
              Properties
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="line-clamp-1 text-foreground">{property.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ===================== MAIN COLUMN ===================== */}
          <div className="min-w-0">
            {/* Gallery */}
            <PropertyGallery
              images={galleryImages}
              fallbackImage={property.featured_image}
              title={property.title}
            />

            {/* Property header */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{getTransactionTypeLabel(property.transaction_type)}</Badge>
                <Badge variant="secondary">{getPropertyTypeLabel(property.property_type)}</Badge>
                {property.is_featured && <Badge variant="outline">Featured</Badge>}
                {property.property_id && (
                  <span className="text-xs text-muted-foreground">Ref: {property.property_id}</span>
                )}
              </div>

              <h1 className="mt-3 text-lg font-bold tracking-tight sm:text-xl lg:text-2xl max-w-3xl">
                {property.title}
              </h1>

              <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{locationLabel}</span>
              </div>

              <p className="mt-4 text-2xl font-bold text-primary sm:text-3xl">
                {formatPrice(
                  Number(property.price),
                  property.transaction_type as 'sale' | 'rent' | 'short-let'
                )}
              </p>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {features.map((feature) => (
                    <div
                      key={feature.label}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <feature.icon className="h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{feature.label}</p>
                        <p className="truncate text-sm font-semibold">{feature.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Description */}
            {property.description && (
              <>
                <Separator className="my-6" />
                <section>
                  <h2 className="text-xl font-semibold mb-3">About This Property</h2>
                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                    {property.description}
                  </p>
                </section>
              </>
            )}

            {/* Amenities */}
            <Separator className="my-6" />
            <section>
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              {amenities.length > 0 ? (
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {amenities.map((amenity) => {
                    const Icon = (amenity.icon && AMENITY_ICONS[amenity.icon]) || Check;
                    return (
                      <li
                        key={amenity.id}
                        className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        <span>{amenity.name}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No amenities listed.</p>
              )}
            </section>

            {/* Location */}
            <Separator className="my-6" />
            <section>
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                {location && (
                  <p>
                    <span className="font-medium text-foreground">{location.name}</span>
                    {location.city ? `, ${location.city}` : ''}
                    {location.state ? `, ${location.state}` : ''}
                  </p>
                )}
                {property.address && <p>{property.address}</p>}
              </div>

              {/* Map placeholder — no map integration yet */}
              <div className="mt-4 flex aspect-[16/6] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 text-muted-foreground">
                <MapPin className="h-8 w-8" />
                <p className="text-sm font-medium">Map preview coming soon</p>
                <p className="text-xs">{locationLabel}</p>
              </div>
            </section>
          </div>

          {/* ===================== SIDEBAR ===================== */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Add/remove this property from favorites */}
            <FavoriteButton
              variant="detail"
              propertyId={property.id}
              title={property.title}
              isFavorited={favoriteIds.includes(property.id)}
            />

            {/* Add/remove this property from comparison */}
            <CompareButton variant="detail" slug={property.slug} title={property.title} />

            {/* Mobile WhatsApp CTA */}
            <Button asChild size="lg" className="w-full lg:hidden">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat on WhatsApp
              </a>
            </Button>

            {/* Agent information */}
            {agent && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                      {agent.photo_url ? (
                        <Image
                          src={agent.photo_url}
                          alt={agent.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-xl font-bold text-muted-foreground/60">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Listed by</p>
                      <h3 className="font-semibold leading-tight">{agent.name}</h3>
                      {agent.specialization && agent.specialization.length > 0 && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {agent.specialization.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {agent.phone && (
                      <Button asChild variant="outline" className="w-full justify-start">
                        <a href={`tel:${agent.phone}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          {agent.phone}
                        </a>
                      </Button>
                    )}
                    <Button asChild className="w-full hidden lg:flex">
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat on WhatsApp
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Viewing request form */}
            <ViewingRequestForm propertyId={property.id} propertyTitle={property.title} />

            {/* Inquiry form */}
            <InquiryForm propertyId={property.id} propertyTitle={property.title} />
          </aside>
        </div>

        {/* Related properties */}
        {relatedProperties.length > 0 && (
          <section className="mt-14">
            <SectionHeading
              title="Similar Properties"
              description="More properties you may like"
              align="left"
            />
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProperties.map((related) => (
                <PropertyCard
                  key={(related as { id: string }).id}
                  property={related as unknown as Parameters<typeof PropertyCard>[0]['property']}
                  isFavorited={favoriteIds.includes((related as { id: string }).id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating comparison bar (visible while properties are selected) */}
      <CompareBar />
    </>
  );
}
