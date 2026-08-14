'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GalleryImage {
  id: string;
  url: string;
  alt_text: string | null;
}

interface PropertyGalleryProps {
  images: GalleryImage[];
  fallbackImage?: string | null;
  title: string;
}

export function PropertyGallery({ images, fallbackImage, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // No images at all — show a professional placeholder
  if (images.length === 0) {
    return (
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-muted lg:aspect-[16/9]">
        {fallbackImage ? (
          <Image
            src={fallbackImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground/60">
            <Home className="h-16 w-16" />
            <p className="text-sm font-medium">No photos available yet</p>
          </div>
        )}
      </div>
    );
  }

  const active = images[activeIndex];

  function goTo(index: number) {
    if (index < 0) setActiveIndex(images.length - 1);
    else if (index >= images.length) setActiveIndex(0);
    else setActiveIndex(index);
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted lg:aspect-[16/9]">
        <Image
          src={active.url}
          alt={active.alt_text || `${title} — photo ${activeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
          unoptimized
        />

        {/* Prev/next controls (only when multiple images) */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full shadow"
              onClick={() => goTo(activeIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full shadow"
              onClick={() => goTo(activeIndex + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Counter */}
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative aspect-[4/3] overflow-hidden rounded-md border-2 transition-colors',
                index === activeIndex
                  ? 'border-primary'
                  : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image
                src={image.url}
                alt={image.alt_text || `${title} — thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
