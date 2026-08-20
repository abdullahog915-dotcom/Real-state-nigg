import type { Metadata } from 'next';
import { Heart } from 'lucide-react';
import { redirect } from 'next/navigation';
import { FavoritesGrid } from '@/components/favorites/FavoritesGrid';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { getUser } from '@/lib/supabase/server';
import { getFavoriteProperties } from '@/lib/supabase/queries';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> { return buildPageMetadata({
  title: 'My Favorites',
  description: 'Properties you have saved to your favorites.',
  path: '/favorites',
  noIndex: true,
}); }

/**
 * Favorites page — requires authentication.
 * Anonymous visitors are redirected to /login and returned here afterwards.
 */
export default async function FavoritesPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login?next=/favorites');
  }

  const properties = await getFavoriteProperties(user.id);

  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="flex items-center gap-3">
            <Heart className="h-7 w-7 text-primary" fill="currentColor" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              My Favorites
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Properties you have saved for later. Tap the heart on any property to add
            or remove it from this list.
          </p>
        </div>
      </section>

      {/* Favorites grid */}
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <FavoritesGrid
            properties={
              properties as unknown as Parameters<typeof PropertyCard>[0]['property'][]
            }
          />
        </div>
      </section>
    </>
  );
}
