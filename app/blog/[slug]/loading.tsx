import { Skeleton } from '@/components/ui/skeleton';

export default function BlogDetailLoading() {
  return (
    <>
      {/* Breadcrumb skeleton */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8 lg:py-12">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="mt-4 h-9 w-3/4" />
        <Skeleton className="mt-4 h-5 w-full" />
        <Skeleton className="mt-2 h-5 w-2/3" />

        {/* Featured image skeleton */}
        <Skeleton className="mt-8 aspect-[16/9] w-full rounded-lg" />

        {/* Content skeleton */}
        <Skeleton className="mt-8 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/6" />
        <Skeleton className="mt-8 h-10 w-32 rounded-md" />
      </div>
    </>
  );
}
