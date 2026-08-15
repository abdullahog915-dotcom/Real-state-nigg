'use client';

import { useState } from 'react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { EmptyState } from '@/components/shared/EmptyState';

type CardProperty = Parameters<typeof PropertyCard>[0]['property'];

interface FavoritesGridProps {
  properties: CardProperty[];
}

/**
 * Client-side favorites grid. Cards are removed immediately when the user
 * un-favorites a property, without waiting for a page refresh.
 */
export function FavoritesGrid({ properties }: FavoritesGridProps) {
  const [items, setItems] = useState(properties);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No Favorites Yet"
        description="Properties you save will appear here. Tap the heart on any property to add it to your favorites."
        icon="home"
        action={{ label: 'Browse Properties', href: '/properties' }}
      />
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        {items.length} saved {items.length === 1 ? 'property' : 'properties'}
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isFavorited
            onFavoriteToggle={(favorited) => {
              if (!favorited) {
                setItems((current) => current.filter((item) => item.id !== property.id));
              }
            }}
          />
        ))}
      </div>
    </>
  );
}
