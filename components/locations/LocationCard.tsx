import Link from 'next/link';
import { ChevronRight, Home, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { truncate } from '@/lib/utils';

interface LocationCardProps {
  location: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    description: string | null;
    is_featured: boolean | null;
    properties?: { id: string }[] | null;
  };
}

export function LocationCard({ location }: LocationCardProps) {
  const propertyCount = location.properties?.length ?? 0;

  return (
    <Link href={`/locations/${location.slug}`} className="group">
      <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col pt-6 pb-5">
          {/* Header: name + featured badge */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground">{location.name}</h3>
            {location.is_featured && (
              <Badge variant="secondary" className="shrink-0">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
          </div>

          {/* City / state */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>
              {location.city}, {location.state}
            </span>
          </div>

          {/* Description snippet */}
          {location.description && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {truncate(location.description, 120)}
            </p>
          )}

          {/* Footer: property count */}
          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Home className="h-3.5 w-3.5" />
              <span>
                {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
              </span>
            </div>
            <span className="flex items-center gap-0.5 text-sm font-medium text-primary group-hover:underline">
              View
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
