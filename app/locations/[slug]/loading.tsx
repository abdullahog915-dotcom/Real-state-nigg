import { Skeleton } from '@/components/ui/skeleton';

export default function LocationDetailLoading() {
  return (
    <>
      {/* Breadcrumb skeleton */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Header skeleton */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-3 h-4 w-48" />
          <Skeleton className="mt-5 h-4 w-full max-w-3xl" />
          <Skeleton className="mt-2 h-4 w-2/3 max-w-2xl" />
          <Skeleton className="mt-6 h-10 w-72 rounded-md" />
        </div>
      </section>

      {/* Properties grid skeleton */}
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="mt-2 h-4 w-40" />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
