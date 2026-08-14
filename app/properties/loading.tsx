import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function PropertiesLoading() {
  return (
    <>
      {/* Header skeleton */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-5 w-96" />
          <Skeleton className="mt-6 h-28 w-full rounded-lg" />
        </div>
      </section>

      {/* Property grid skeleton */}
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden gap-0 py-0">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <CardContent className="pt-4 pb-5">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-24 mb-3" />
                  <div className="flex gap-4 border-t pt-3">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
