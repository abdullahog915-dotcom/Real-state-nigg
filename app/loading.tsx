import { Skeleton } from '@/components/ui/skeleton';

export default function HomePageLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <Skeleton className="mx-auto h-6 w-48" />
            <Skeleton className="mx-auto h-12 w-3/4" />
            <Skeleton className="mx-auto h-5 w-2/3" />
          </div>
          {/* Search bar skeleton */}
          <div className="mx-auto mt-8 max-w-3xl space-y-3 rounded-xl border bg-background p-4">
            <Skeleton className="h-11 w-full" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
            </div>
            <Skeleton className="h-10 w-full sm:w-48" />
          </div>
        </div>
      </section>

      {/* Categories skeleton */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 space-y-3">
            <Skeleton className="mx-auto h-4 w-32" />
            <Skeleton className="mx-auto h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center rounded-xl border p-8">
                <Skeleton className="h-14 w-14 rounded-full mb-4" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Properties skeleton */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 space-y-3">
            <Skeleton className="mx-auto h-4 w-32" />
            <Skeleton className="mx-auto h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-4 pt-3 border-t">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents skeleton */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 space-y-3">
            <Skeleton className="mx-auto h-4 w-32" />
            <Skeleton className="mx-auto h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-6 text-center">
                <Skeleton className="mx-auto h-24 w-24 rounded-full mb-4" />
                <Skeleton className="mx-auto h-5 w-32 mb-2" />
                <Skeleton className="mx-auto h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
