import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
}

export function PropertyCard({ property }: PropertyCardProps) {
  const locationLabel = property.locations
    ? `${property.locations.name}, ${property.locations.city}`
    : property.address || 'Nigeria';

  return (
    <Link href={`/properties/${property.slug}`} className="group">
      <Card className="overflow-hidden gap-0 py-0 transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {property.featured_image ? (
            <Image
              src={property.featured_image}
              alt={property.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Maximize className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}

          {/* Transaction type badge */}
          <Badge className="absolute top-3 left-3">
            {getTransactionTypeLabel(property.transaction_type)}
          </Badge>

          {/* Property type badge */}
          <Badge variant="secondary" className="absolute top-3 right-3">
            {getPropertyTypeLabel(property.property_type)}
          </Badge>
        </div>

        {/* Content */}
        <CardContent className="pt-4 pb-5">
          {/* Price */}
          <p className="text-xl font-bold text-primary mb-1">
            {formatPrice(property.price, property.transaction_type as 'sale' | 'rent' | 'short-let')}
          </p>

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-1 mb-2">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{locationLabel}</span>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 border-t pt-3 text-sm text-muted-foreground">
            {property.bedrooms != null && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
              </div>
            )}
            {property.area != null && (
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" />
                <span>{property.area} sqm</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
