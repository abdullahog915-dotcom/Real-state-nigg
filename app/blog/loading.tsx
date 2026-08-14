import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function BlogLoading() {
  return (
    <>
      {/* Header skeleton */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="mt-3 h-5 w-96" />
          <Skeleton className="mt-4 h-4 w-32" />
          <div className="mt-6 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Post grid skeleton */}
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="gap-0 overflow-hidden py-0">
                <Skeleton className="aspect-[16/9] w-full rounded-none" />
                <CardContent className="pt-5 pb-5">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="mt-3 h-5 w-4/5" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-1.5 h-4 w-2/3" />
                  <Skeleton className="mt-4 h-4 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
