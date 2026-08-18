import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CompareButton } from '@/components/compare/CompareButton';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { formatPrice, getPropertyTypeLabel, getTransactionTypeLabel } from '@/lib/utils';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    slug: string;
    property_type: string;
    transaction_type: string;
    price: number;
    currency: string;
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
    featured_image: string | null;
    address: string | null;
    locations?: {
      name: string;
      city: string;
      state: string;
    } | null;
    agents?: {
      name: string;
      photo_url: string | null;
    } | null;
  };
  /** Whether the signed-in user has favorited this property */
  isFavorited?: boolean;
  /** Called after a successful favorite toggle with the new state */
  onFavoriteToggle?: (favorited: boolean) => void;
}

export function PropertyCard({ property, isFavorited, onFavoriteToggle }: PropertyCardProps) {
  const locationLabel = property.locations
    ? `${property.locations.name}, ${property.locations.city}`
    : property.address || 'Nigeria';

  return (
    <Card className="group relative h-full min-w-0 gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {property.featured_image ? (
          <Image
            src={property.featured_image}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Maximize className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}

        {/* Transaction type badge */}
        <Badge className="absolute top-3 left-3 max-w-[calc(50%-1rem)] truncate">
          {getTransactionTypeLabel(property.transaction_type)}
        </Badge>

        {/* Property type badge */}
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 max-w-[calc(50%-1rem)] truncate"
        >
          {getPropertyTypeLabel(property.property_type)}
        </Badge>

        {/* Card actions sit above the stretched link without covering property details. */}
        <CompareButton
          slug={property.slug}
          title={property.title}
          className="absolute bottom-3 left-3 z-10"
        />
        <FavoriteButton
          propertyId={property.id}
          title={property.title}
          isFavorited={isFavorited}
          onToggle={onFavoriteToggle}
          className="absolute right-3 bottom-3 z-10"
        />
      </div>

      {/* Content */}
      <CardContent className="flex min-w-0 flex-1 flex-col px-4 pt-4 pb-5 sm:px-5">
        {/* Price */}
        <p className="mb-1 truncate text-xl font-bold text-primary">
          {formatPrice(property.price, property.transaction_type as 'sale' | 'rent' | 'short-let')}
        </p>

        {/* Title */}
        <h3 className="mb-2 line-clamp-1 font-semibold text-foreground">
          {property.title}
        </h3>

        {/* Location */}
        <div className="mb-3 flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 truncate">{locationLabel}</span>
        </div>

        {/* Features */}
        <div className="mt-auto grid min-h-7 min-w-0 grid-cols-3 gap-2 border-t pt-3 text-xs text-muted-foreground sm:text-sm">
          {property.bedrooms != null && (
            <div className="flex min-w-0 items-center gap-1.5">
              <Bed className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
              </span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex min-w-0 items-center gap-1.5">
              <Bath className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
              </span>
            </div>
          )}
          {property.area != null && (
            <div className="flex min-w-0 items-center gap-1.5">
              <Maximize className="h-4 w-4 shrink-0" />
              <span className="truncate">{property.area} sqm</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Stretched link makes the whole card clickable */}
      <Link
        href={`/properties/${property.slug}`}
        className="absolute inset-0 z-[1]"
        aria-label={`View details for ${property.title}`}
      />
    </Card>
  );
}
