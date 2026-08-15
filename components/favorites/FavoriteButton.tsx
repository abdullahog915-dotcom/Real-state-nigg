'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  propertyId: string;
  title: string;
  /** card = compact circular overlay; detail = full-width sidebar button */
  variant?: 'card' | 'detail';
  /** Server-resolved initial state (defaults to not favorited) */
  isFavorited?: boolean;
  className?: string;
  /** Called after a successful toggle with the new favorited state */
  onToggle?: (favorited: boolean) => void;
}

/**
 * Favorite toggle backed by /api/favorites.
 * Unauthenticated users are redirected to /login with a `next` param so they
 * land back on the page they were viewing after signing in.
 */
export function FavoriteButton({
  propertyId,
  title,
  variant = 'card',
  isFavorited = false,
  className,
  onToggle,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    // Prevent the surrounding property link from navigating
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;

    setPending(true);
    try {
      const response = await fetch('/api/favorites', {
        method: favorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId }),
      });

      // Not signed in — send the user to login and back to this page
      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!response.ok) {
        console.error('Failed to update favorite');
        return;
      }

      const next = !favorited;
      setFavorited(next);
      onToggle?.(next);
    } catch {
      console.error('Failed to update favorite');
    } finally {
      setPending(false);
    }
  }

  const ariaLabel = favorited
    ? `Remove ${title} from favorites`
    : `Add ${title} to favorites`;

  if (variant === 'detail') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={favorited}
        aria-label={ariaLabel}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors',
          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          favorited && 'border-primary text-primary',
          pending && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Heart
            className="h-4 w-4"
            fill={favorited ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        )}
        {favorited ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        favorited
          ? 'bg-background/95 text-rose-500 hover:bg-background'
          : 'bg-background/95 text-foreground hover:bg-background',
        pending && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Heart
          className="h-4 w-4"
          fill={favorited ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
