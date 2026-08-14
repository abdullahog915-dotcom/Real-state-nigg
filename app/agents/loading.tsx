import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function AgentsLoading() {
  return (
    <>
      {/* Header skeleton */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-3 h-5 w-96" />
          <Skeleton className="mt-4 h-4 w-32" />
          <Skeleton className="mt-6 h-10 w-full max-w-md rounded-md" />
        </div>
      </section>

      {/* Agent grid skeleton */}
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="gap-0 py-0">
                <CardContent className="flex flex-col items-center pt-6 pb-5">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="mt-4 h-5 w-36" />
                  <Skeleton className="mt-3 h-4 w-28" />
                  <Skeleton className="mt-3 h-4 w-40" />
                  <Skeleton className="mt-3 h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
