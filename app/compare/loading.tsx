import { Skeleton } from '@/components/ui/skeleton';

export default function CompareLoading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-4 w-2/3 max-w-2xl" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="container mx-auto px-4 py-10 lg:py-14">
        <Skeleton className="mb-6 h-4 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="hidden aspect-[4/3] w-full rounded-lg sm:block" />
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </>
  );
}
